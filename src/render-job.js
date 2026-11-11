/**
 * ماژول مدیریت وضعیت Job در Cloud Storage (GCS) و اجرای رندر تکهتکه (Chunked CPU Render) برای فیلم‌های بلند ۳ تا ۵ دقیقه‌ای (فاز ۲):
 *  - وضعیت کارها (jobs) فقط در Map حافظهٔ پروسه نمی‌ماند تا با ری‌استارت Cloud Run گم نشود؛
 *    هر تغییر وضعیت در `gs://<OUTPUT_BUCKET>/jobs/<jobId>/status.json` (و یک کپی محلی روی دیسک) ذخیره می‌شود.
 *  - رندر فیلم‌های بلند (۱۸۰ تا ۳۰۰ ثانیه) به صورت قطعه به قطعه (chunk-by-chunk، مثلاً قطعات ۲۰ ثانیه‌ای) روی CPU انجام می‌شود،
 *    هر قطعه در GCS آپلود می‌گردد و در پایان FFmpeg قطعات را concat و با صدای TTS mux می‌کند.
 *  - اگر CLOUD_RUN_JOB_NAME تنظیم شده باشد و تریگر کردن Cloud Run Job شکست بخورد، وضعیت کار failed ثبت شده و خطا برگردانده می‌شود (بدون بلعیدن خطا و بدون رندر پنهانی داخل سرویس HTTP).
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline } from './timeline.js';
import { renderVideo, concatMp4Segments, sanitizeRenderOptions, cleanupJobDir } from './video-encoder.js';
import { buildAllDirectingAssets } from './character-factory.js';
import { buildAudioTrackAndLipSync } from './audio-track.js';
import { validateDirecting } from './gemini-directing.js';

const LOCAL_JOBS_DIR = join(tmpdir(), 'behix-jobs-store');
mkdirSync(LOCAL_JOBS_DIR, { recursive: true });

/** کش درون‌حافظه‌ای فقط به عنوان لایهٔ اول سرعت؛ منبع پایدار دیسک/GCS است */
const memoryJobCache = new Map();

function localJobFilePath(jobId) {
  const safeId = String(jobId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  return join(LOCAL_JOBS_DIR, `${safeId}.json`);
}

/** دریافت توکن ADC با GoogleAuth و اسکوپ cloud-platform */
async function getCloudPlatformToken() {
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const res = await client.getAccessToken();
  const token = typeof res === 'string' ? res : res?.token;
  if (!token) throw new Error('دریافت توکن ADC از GoogleAuth برای Cloud Run Jobs ممکن نشد');
  return token;
}

/**
 * ذخیرهٔ پایدار وضعیت Job در Google Cloud Storage (`gs://<OUTPUT_BUCKET>/jobs/<jobId>/status.json`)
 * به‌همراه ذخیرهٔ محلی برای محیط‌های بدون باکت.
 */
export async function saveJobStatus(jobId, state) {
  const updated = {
    ...state,
    jobId,
    updatedAt: new Date().toISOString()
  };
  memoryJobCache.set(jobId, updated);

  try {
    writeFileSync(localJobFilePath(jobId), JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.error(`[job-store] خطای ذخیرهٔ محلی وضعیت ${jobId}: ${err.message}`);
  }

  const bucketName = process.env.OUTPUT_BUCKET;
  if (bucketName) {
    try {
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage();
      const dest = `jobs/${jobId}/status.json`;
      const file = storage.bucket(bucketName).file(dest);
      await file.save(JSON.stringify(updated, null, 2), {
        contentType: 'application/json',
        resumable: false
      });
      updated.statusGcsUri = `gs://${bucketName}/${dest}`;
    } catch (err) {
      updated.warnings = [...(updated.warnings || []), `ذخیرهٔ وضعیت در GCS ناموفق بود: ${err.message}`];
    }
  }

  return updated;
}

/**
 * خواندن وضعیت Job: ابتدا بررسی GCS (در صورت تنظیم بودن OUTPUT_BUCKET) یا دیسک محلی،
 * تا حتی بعد از ری‌استارت کامل پروسهٔ Cloud Run وضعیت کار بازیابی شود.
 */
export async function loadJobStatus(jobId) {
  const localFile = localJobFilePath(jobId);
  const bucketName = process.env.OUTPUT_BUCKET;

  if (bucketName) {
    try {
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage();
      const file = storage.bucket(bucketName).file(`jobs/${jobId}/status.json`);
      const [buf] = await file.download();
      const parsed = JSON.parse(buf.toString('utf8'));
      memoryJobCache.set(jobId, parsed);
      return parsed;
    } catch {
      // اگر در GCS نبود یا دسترسی موقت قطع بود، از دیسک/حافظه بررسی کن
    }
  }

  if (existsSync(localFile)) {
    try {
      const parsed = JSON.parse(readFileSync(localFile, 'utf8'));
      memoryJobCache.set(jobId, parsed);
      return parsed;
    } catch {}
  }

  return memoryJobCache.get(jobId) || null;
}

/** آپلود یک فایل (قطعهٔ میانی، کارگردانی، صدا یا ویدیوی نهایی) به Cloud Storage */
export async function uploadArtifactToGcs(localPath, destinationKey, contentType = 'application/octet-stream') {
  const bucketName = process.env.OUTPUT_BUCKET;
  if (!bucketName) return null;
  const { Storage } = await import('@google-cloud/storage');
  const storage = new Storage();
  await storage.bucket(bucketName).upload(localPath, {
    destination: destinationKey,
    metadata: { contentType }
  });
  return `gs://${bucketName}/${destinationKey}`;
}

/** دانلود فایل نهایی MP4 از GCS به مسیر موقت در صورت ری‌استارت شدن نمونهٔ Cloud Run */
export async function ensureLocalOutputFromGcs(jobState) {
  if (jobState?.outputPath && existsSync(jobState.outputPath)) {
    return jobState.outputPath;
  }
  const bucketName = process.env.OUTPUT_BUCKET;
  if (!bucketName || !jobState?.jobId) return null;

  try {
    const { Storage } = await import('@google-cloud/storage');
    const storage = new Storage();
    const remoteKey = `renders/${jobState.jobId}/film.mp4`;
    const tempDir = join(tmpdir(), `behix-dl-${jobState.jobId.slice(0, 8)}`);
    mkdirSync(tempDir, { recursive: true });
    const localDest = join(tempDir, 'film.mp4');
    await storage.bucket(bucketName).file(remoteKey).download({ destination: localDest });
    jobState.outputPath = localDest;
    return localDest;
  } catch {
    return null;
  }
}

/**
 * اجرای تکهتکه (Chunked) یک کار رندر (مناسب برای فیلم‌های ۳ تا ۵ دقیقه‌ای با ۲۰ کاراکتر):
 *  ۱. اعتبارسنجی کارگردانی.
 *  ۲. ساخت دارایی‌های کاراکتر (لایه‌های PNG + autoRig روی CPU + اطلس) و تصویر ثابت پس‌زمینهٔ هر صحنه.
 *  ۳. ساخت ترک صوتی دیالوگ‌ها (gemini-3.8-flash-tts) و کلیدهای لب‌خوانی (visemeCues + keyLipSync روی انیمیشن فعال).
 *  ۴. تقسیم کل بازهٔ زمانی به قطعات (chunks) مجزا، رندر فریم‌های هر قطعه با renderCharacters روی CPU،
 *     ذخیرهٔ قطعهٔ MP4 در GCS و به‌روزرسانی پیشرفت Job در GCS.
 *  ۵. چسباندن (concat) تمام قطعات و mux کردن صدای سراسری با FFmpeg و آپلود MP4 نهایی به GCS.
 */
export async function executeChunkedRenderJob(jobId, directing, options = {}) {
  const jobWorkDir = join(tmpdir(), `behix-job-${jobId}`);
  mkdirSync(jobWorkDir, { recursive: true });

  const warnings = [];
  let state = await saveJobStatus(jobId, {
    jobId,
    status: 'running',
    phase: 'validating',
    title: directing?.title || 'Untitled',
    createdAt: new Date().toISOString(),
    progress: 0,
    chunksCompleted: 0,
    totalChunks: 0,
    downloadUrl: null,
    warnings: []
  });

  try {
    const isLongform = Boolean(options.longform || Number(directing?.durationSec) >= 180);
    validateDirecting(directing, {
      longform: isLongform && Boolean(options.strictLongform),
      requireContiguous: Boolean(options.requireContiguous)
    });

    const directingPath = join(jobWorkDir, 'directing.json');
    writeFileSync(directingPath, JSON.stringify(directing, null, 2), 'utf8');
    if (process.env.OUTPUT_BUCKET) {
      try {
        await uploadArtifactToGcs(directingPath, `jobs/${jobId}/directing.json`, 'application/json');
      } catch (err) {
        warnings.push(`آپلود directing.json به GCS ناموفق بود: ${err.message}`);
      }
    }

    // گام ۲: ساخت کاراکترها با autoRig و پس‌زمینه‌های ثابت صحنه
    state = await saveJobStatus(jobId, { ...state, phase: 'building_assets', progress: 10 });
    if (options.buildAssets !== false && Array.isArray(directing.characters) && directing.characters.length > 0) {
      const assetRes = await buildAllDirectingAssets(directing, {
        ...options,
        uploadToGcs: Boolean(process.env.OUTPUT_BUCKET)
      });
      if (assetRes.warnings.length) warnings.push(...assetRes.warnings);
    }

    const defaultSkeleton = loadSkeletonFromFile(options.skeletonPath || 'examples/nila.skel.json');
    const timeline = new Timeline(directing, defaultSkeleton, options);

    // گام ۳: ساخت ترک صوتی دیالوگ‌ها (TTS) و لب‌خوانی (lipsync)
    state = await saveJobStatus(jobId, { ...state, phase: 'synthesizing_audio', progress: 25 });
    const sanitized = sanitizeRenderOptions(
      { ...options, allowLongform: true, duration: options.duration ?? directing.durationSec },
      timeline.duration
    );
    const totalDuration = sanitized.duration;
    const fps = sanitized.fps;
    const width = sanitized.width;
    const height = sanitized.height;

    const audioRes = await buildAudioTrackAndLipSync(directing, timeline, jobWorkDir, {
      ...options,
      fps,
      duration: totalDuration,
      startSec: 0,
      endSec: totalDuration
    });
    if (audioRes.warnings.length) warnings.push(...audioRes.warnings);

    if (process.env.OUTPUT_BUCKET && existsSync(audioRes.audioPath)) {
      try {
        await uploadArtifactToGcs(audioRes.audioPath, `renders/${jobId}/audio.wav`, 'audio/wav');
      } catch (err) {
        warnings.push(`آپلود فایل صوتی به GCS ناموفق بود: ${err.message}`);
      }
    }

    // گام ۴: رندر تکهتکه (Chunked CPU Rendering)
    const chunkSec = Math.max(0.5, Number(options.chunkDurationSec) || 20);
    const totalChunks = Math.max(1, Math.ceil(totalDuration / chunkSec));
    const segmentPaths = [];
    const segmentGcsUris = [];
    let totalFramesRendered = 0;

    state = await saveJobStatus(jobId, {
      ...state,
      phase: 'rendering_chunks',
      totalChunks,
      chunksCompleted: 0,
      progress: 30,
      warnings: [...warnings, ...timeline.warnings]
    });

    for (let c = 0; c < totalChunks; c++) {
      const chunkStart = c * chunkSec;
      const chunkEnd = Math.min(totalDuration, (c + 1) * chunkSec);
      const chunkDir = join(jobWorkDir, `chunk_${String(c).padStart(3, '0')}`);
      mkdirSync(chunkDir, { recursive: true });
      const segMp4Path = join(jobWorkDir, `segment_${String(c).padStart(3, '0')}.mp4`);

      const segRes = await renderVideo(timeline, {
        ...options,
        allowLongform: true,
        jobId: `${jobId}-c${c}`,
        jobDir: chunkDir,
        internalOutputPath: segMp4Path,
        startSec: chunkStart,
        endSec: chunkEnd,
        duration: chunkEnd - chunkStart,
        fps,
        width,
        height,
        audioPath: null
      });

      try { rmSync(chunkDir, { recursive: true, force: true }); } catch {}

      totalFramesRendered += segRes.frameCount;
      segmentPaths.push(segMp4Path);

      if (process.env.OUTPUT_BUCKET) {
        try {
          const segUri = await uploadArtifactToGcs(
            segMp4Path,
            `renders/${jobId}/chunks/segment_${String(c).padStart(3, '0')}.mp4`,
            'video/mp4'
          );
          if (segUri) segmentGcsUris.push(segUri);
        } catch (err) {
          warnings.push(`آپلود قطعهٔ ${c} به GCS ناموفق بود: ${err.message}`);
        }
      }

      const chunksCompleted = c + 1;
      const progress = 30 + Math.round((chunksCompleted / totalChunks) * 55);
      state = await saveJobStatus(jobId, {
        ...state,
        chunksCompleted,
        totalChunks,
        frameCount: totalFramesRendered,
        progress,
        warnings: [...new Set([...warnings, ...timeline.warnings])]
      });
    }

    // گام ۵: چسباندن قطعات (concat) و mux کردن ترک صوتی با FFmpeg
    state = await saveJobStatus(jobId, { ...state, phase: 'concatenating_and_muxing', progress: 90 });
    const finalOutputPath = join(jobWorkDir, 'film.mp4');
    await concatMp4Segments(segmentPaths, finalOutputPath, audioRes.audioPath);

    for (const seg of segmentPaths) {
      try { rmSync(seg, { force: true }); } catch {}
    }

    let gcsUri = null;
    if (process.env.OUTPUT_BUCKET) {
      try {
        gcsUri = await uploadArtifactToGcs(finalOutputPath, `renders/${jobId}/film.mp4`, 'video/mp4');
      } catch (err) {
        warnings.push(`آپلود ویدیوی نهایی به GCS ناموفق بود: ${err.message}`);
      }
    }

    const finalWarnings = [...new Set([...warnings, ...timeline.warnings])];
    const completedState = await saveJobStatus(jobId, {
      jobId,
      status: 'completed',
      phase: 'done',
      progress: 100,
      title: directing.title,
      duration: totalDuration,
      fps,
      width,
      height,
      frameCount: totalFramesRendered,
      sceneCount: (directing.scenes || []).length,
      characterCount: (directing.characters || []).length,
      chunksCompleted: totalChunks,
      totalChunks,
      segmentGcsUris,
      outputPath: finalOutputPath,
      jobDir: jobWorkDir,
      gcsUri,
      downloadUrl: `/renders/${jobId}`,
      audio: {
        ttsModel: audioRes.ttsModel,
        lineCount: audioRes.lineCount,
        lines: audioRes.lines
      },
      warnings: finalWarnings,
      completedAt: new Date().toISOString()
    });

    return completedState;
  } catch (err) {
    const failedState = await saveJobStatus(jobId, {
      ...state,
      status: 'failed',
      phase: 'error',
      error: String(err?.message || err),
      downloadUrl: null,
      warnings: [...new Set(warnings)],
      failedAt: new Date().toISOString()
    });
    throw Object.assign(err, { jobState: failedState });
  }
}

/**
 * اجرای ناهمزمان Job برای فیلم‌های بلند:
 * اگر متغیر CLOUD_RUN_JOB_NAME تنظیم شده باشد، کار به Cloud Run Jobs API فرستاده می‌شود و در صورت شکست تریگر،
 * وضعیت کار failed ثبت شده و خطا پرتاب می‌شود (هرگز خطای Cloud Run Job بلعیده نمی‌شود و رندر ۵ دقیقه‌ای داخل سرویس HTTP نمی‌افتد).
 */
export async function enqueueLongformRenderJob(directing, options = {}) {
  const jobId = options.jobId || randomUUID();
  const initial = await saveJobStatus(jobId, {
    jobId,
    status: 'queued',
    phase: 'queued',
    title: directing?.title || 'Untitled',
    durationSec: directing?.durationSec || options.duration || 180,
    createdAt: new Date().toISOString(),
    progress: 0,
    downloadUrl: null,
    warnings: []
  });

  const cloudRunJobName = process.env.CLOUD_RUN_JOB_NAME;
  const project = process.env.VERTEX_AI_PROJECT;
  const region = (process.env.VERTEX_AI_LOCATION && process.env.VERTEX_AI_LOCATION !== 'global')
    ? process.env.VERTEX_AI_LOCATION
    : 'us-central1';

  if (cloudRunJobName) {
    try {
      if (!project || !process.env.OUTPUT_BUCKET) {
        throw new Error('برای اجرای CLOUD_RUN_JOB_NAME، متغیرهای VERTEX_AI_PROJECT و OUTPUT_BUCKET الزامی هستند');
      }
      const tempDir = join(tmpdir(), `behix-enqueue-${jobId.slice(0, 8)}`);
      mkdirSync(tempDir, { recursive: true });
      const dirPath = join(tempDir, 'directing.json');
      writeFileSync(dirPath, JSON.stringify(directing, null, 2), 'utf8');
      await uploadArtifactToGcs(dirPath, `jobs/${jobId}/directing.json`, 'application/json');
      cleanupJobDir(tempDir);

      const token = await getCloudPlatformToken();
      const runUrl = `https://run.googleapis.com/v2/projects/${project}/locations/${region}/jobs/${cloudRunJobName}:run`;
      const res = await fetch(runUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          overrides: {
            containerOverrides: [{
              env: [
                { name: 'BEHIX_JOB_ID', value: jobId },
                { name: 'BEHIX_DIRECTING_GCS', value: `gs://${process.env.OUTPUT_BUCKET}/jobs/${jobId}/directing.json` }
              ]
            }]
          }
        })
      });
      if (!res.ok) {
        const rawErr = await res.text().catch(() => '');
        throw new Error(`خطا در تریگر Cloud Run Job "${cloudRunJobName}" (کد ${res.status}): ${rawErr.slice(0, 250)}`);
      }
      return initial;
    } catch (err) {
      const failedState = await saveJobStatus(jobId, {
        ...initial,
        status: 'failed',
        phase: 'error',
        error: String(err?.message || err),
        downloadUrl: null,
        failedAt: new Date().toISOString()
      });
      throw Object.assign(err, { jobState: failedState });
    }
  }

  setImmediate(() => {
    executeChunkedRenderJob(jobId, directing, options).catch(err => {
      console.error(`[render-job] شکست کار ${jobId}:`, err.message);
    });
  });

  return initial;
}
