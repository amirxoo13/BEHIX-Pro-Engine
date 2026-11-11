/**
 * اولویت ۵: کدگذاری ویدیو با FFmpeg
 * فریم‌های تولیدشده توسط رندر نرم‌افزاری را به MP4 تبدیل می‌کند.
 *
 * رفع باگ‌ها و بهبودهای فاز ۱ و ۲:
 *  - #1:  outputPath دیگر از کلاینت پذیرفته نمی‌شود؛ خروجی فقط داخل پوشهٔ یکتای کار است
 *  - #2:  duration/fps/width/height اعتبارسنجی و سقف‌دار می‌شوند؛ ابعاد زوج (yuv420p)
 *         HTTP کوتاه حداکثر ۶۰ ثانیه می‌ماند؛ فیلم بلند ۱۸۰ تا ۳۰۰ ثانیه فقط در حالت job/chunked مجاز است.
 *  - #3:  شنوندهٔ error روی پروسس ffmpeg + settle فقط یک بار (spawn شکست‌خورده سرور را نمی‌کشد)
 *  - #4:  هر کار پوشهٔ موقت یکتا os.tmpdir()/behix-<uuid> دارد؛ مسابقهٔ فریم بین درخواست‌ها رفع شد
 *  - #11: پاک‌سازی فریم‌های PPM در finally، حتی بعد از شکست encode
 *  - فاز ۱/۲: پشتیبانی از تصویر پس‌زمینهٔ صحنه (backgroundImageAt)، mux کردن ترک صوتی (audioPath) با FFmpeg،
 *             و concat قطعات ویدیویی تکهتکه برای فیلم‌های بلند ۳ تا ۵ دقیقه.
 */

import { spawn } from 'child_process';
import { rmSync, mkdtempSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { renderCharacters, savePpm } from './software-renderer.js';

export const LIMITS = Object.freeze({
  maxDuration: 60, // سقف درخواست HTTP هم‌زمان (ثانیه)
  maxLongformDuration: Number(process.env.BEHIX_LONGFORM_MAX_SEC) || 300, // سقف فیلم بلند در Job (ثانیه)
  minLongformDuration: 180,
  maxCharacters: Number(process.env.BEHIX_MAX_CHARACTERS) || 20,
  maxFps: 30,
  maxWidth: 1920,
  maxHeight: 1080,
  minDimension: 16
});

function clampInt(value, def, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function clampNumber(value, def, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

/**
 * اعتبارسنجی و سقف‌گذاری پارامترهای رندر (باگ #2):
 *  - برای درخواست‌های HTTP هم‌زمان سقف مدت همان ۶۰ ثانیه (LIMITS.maxDuration) است.
 *  - برای رندرهای Job تکهتکه (options.allowLongform === true)، سقف تا LIMITS.maxLongformDuration (۳۰۰ ثانیه) باز است.
 */
export function sanitizeRenderOptions(options = {}, timelineDuration = 4) {
  const maxDur = options.allowLongform ? LIMITS.maxLongformDuration : LIMITS.maxDuration;
  const duration = clampNumber(options.duration, Math.min(timelineDuration, maxDur), 0.1, maxDur);
  const fps = clampInt(options.fps, 12, 1, LIMITS.maxFps);
  let width = clampInt(options.width, 1280, LIMITS.minDimension, LIMITS.maxWidth);
  let height = clampInt(options.height, 720, LIMITS.minDimension, LIMITS.maxHeight);
  // yuv420p بعد فرد را رد می‌کند ⇒ زوج‌سازی
  width -= width % 2;
  height -= height % 2;
  return {
    duration,
    fps,
    width,
    height,
    scale: options.scale,
    worldX: options.worldX,
    worldY: options.worldY,
    audioPath: typeof options.audioPath === 'string' ? options.audioPath : null,
    allowedRoot: options.allowedRoot || null
  };
}

/**
 * یک ویدیو (یا یک قطعه از ویدیو) را از روی Timeline می‌سازد و در صورت وجود صدا، آن را با FFmpeg mux می‌کند.
 * @param {object} timeline - نمونهٔ Timeline
 * @param {object} options  - duration, fps, width, height, startSec?, endSec?, audioPath?
 * @returns {Promise<{outputPath: string, jobId: string, jobDir: string, frameCount: number, warnings: string[]}>}
 */
export async function renderVideo(timeline, options = {}) {
  const { duration, fps, width, height, scale, worldX, worldY, audioPath, allowedRoot } =
    sanitizeRenderOptions(options, timeline?.duration || 4);

  const startSec = Number.isFinite(Number(options.startSec)) ? Math.max(0, Number(options.startSec)) : 0;
  const endSec = Number.isFinite(Number(options.endSec))
    ? Math.max(startSec + 0.1, Number(options.endSec))
    : startSec + duration;
  const effectiveDuration = endSec - startSec;

  const jobId = options.jobId || randomUUID();
  const jobDir = options.jobDir || mkdtempSync(join(tmpdir(), `behix-${jobId.slice(0, 8)}-`));
  const outputPath = options.internalOutputPath || join(jobDir, 'film.mp4');

  const frameCount = Math.max(1, Math.ceil(effectiveDuration * fps));
  const dt = 1 / fps;
  const skeleton = timeline?.skeleton;

  try {
    for (let i = 0; i < frameCount; i++) {
      const t = startSec + i / fps;
      const cam = timeline?.cameraAt ? timeline.cameraAt(t) : {};
      const resScale = height / 540;
      const characters = timeline.charactersAt
        ? timeline.charactersAt(t, dt)
        : [{ pose: timeline.poseAt(t, 'main', dt), offsetX: 0 }];
      const frame = renderCharacters(characters, {
        width,
        height,
        skeleton,
        background: timeline?.backgroundAt ? timeline.backgroundAt(t) : null,
        backgroundImage: timeline?.backgroundImageAt ? timeline.backgroundImageAt(t) : null,
        allowedRoot,
        worldX: worldX ?? cam.worldX,
        worldY: worldY ?? cam.worldY,
        scale: scale ?? (cam.scale != null ? cam.scale * resScale : undefined)
      });
      savePpm(frame, join(jobDir, `frame_${String(i).padStart(6, '0')}.ppm`));
    }

    await encodeFramesToMp4(jobDir, outputPath, fps, {
      audioPath,
      pattern: 'frame_%06d.ppm'
    });
    return {
      outputPath,
      jobId,
      jobDir,
      frameCount,
      duration: effectiveDuration,
      fps,
      width,
      height,
      warnings: timeline?.warnings ? [...timeline.warnings] : []
    };
  } finally {
    // باگ #11: فریم‌های PPM همیشه پاک می‌شوند، موفق یا ناموفق
    cleanupFrames(jobDir);
  }
}

function cleanupFrames(jobDir) {
  try {
    for (const f of readdirSync(jobDir)) {
      if (f.endsWith('.ppm')) {
        try { rmSync(join(jobDir, f), { force: true }); } catch {}
      }
    }
  } catch {}
}

/** حذف کامل پوشهٔ یک کار (بعد از آپلود/دانلود خروجی) */
export function cleanupJobDir(jobDir) {
  const base = tmpdir();
  const full = resolve(jobDir || '');
  if (!full.startsWith(resolve(base) + '/')) return; // فقط زیر tmp
  try { rmSync(full, { recursive: true, force: true }); } catch {}
}

/** اجرای امن یک دستور FFmpeg با شنوندهٔ error و settle یک‌باره */
export function runFfmpeg(args) {
  return new Promise((resolvePromise, rejectPromise) => {
    let settled = false;
    const settle = (fn, arg) => {
      if (settled) return;
      settled = true;
      fn(arg);
    };

    let proc;
    try {
      proc = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch (err) {
      return settle(rejectPromise, new Error(`اجرای ffmpeg ممکن نشد: ${err.message}`));
    }

    let stderr = '';
    proc.stderr.on('data', d => {
      stderr += d.toString();
      if (stderr.length > 8192) stderr = stderr.slice(-8192);
    });
    proc.on('error', err => {
      settle(rejectPromise, new Error(`ffmpeg در دسترس نیست یا اجرا نشد: ${err.message}`));
    });
    proc.on('close', code => {
      if (code === 0) settle(resolvePromise, true);
      else settle(rejectPromise, new Error(`ffmpeg failed (${code}): ${stderr.slice(-400)}`));
    });
  });
}

/**
 * کدگذاری فریم‌های شماره‌دار با demuxer image2 (زمان‌بندی قطعی با -framerate)
 * و mux کردن صدای اختیاری (audioPath) در همان پاس یا پاس نهایی.
 */
export async function encodeFramesToMp4(framesDir, outputPath, fps, options = {}) {
  const files = readdirSync(framesDir).filter(f => f.endsWith('.ppm'));
  let pattern = options.pattern || 'frame_%04d.ppm';
  if (!options.pattern && files.some(f => /^frame_\d{6}\.ppm$/.test(f))) {
    pattern = 'frame_%06d.ppm';
  }

  const hasAudio = options.audioPath && existsSync(options.audioPath);
  const args = [
    '-y',
    '-framerate', String(fps),
    '-i', join(framesDir, pattern)
  ];

  if (hasAudio) {
    args.push('-i', options.audioPath);
  }

  args.push(
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '23',
    '-preset', 'veryfast'
  );

  if (hasAudio) {
    args.push(
      '-c:a', 'aac',
      '-b:a', '128k',
      '-shortest'
    );
  }

  args.push('-movflags', '+faststart', outputPath);
  await runFfmpeg(args);
  return outputPath;
}

/**
 * چسباندن (mux) یک فایل صوتی WAV/MP3 به یک ویدیوی MP4 موجود با FFmpeg
 */
export async function muxAudioWithMp4(videoPath, audioPath, outputPath) {
  const args = [
    '-y',
    '-i', videoPath,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    '-movflags', '+faststart',
    outputPath
  ];
  await runFfmpeg(args);
  return outputPath;
}

/**
 * چسباندن قطعات ویدیویی تکهتکه (chunked MP4 segments) با demuxer concat در FFmpeg
 * و در صورت وجود ترک صوتی سراسری، mux کردن هم‌زمان آن.
 */
export async function concatMp4Segments(segmentPaths, outputPath, audioPath = null) {
  if (!Array.isArray(segmentPaths) || segmentPaths.length === 0) {
    throw new Error('هیچ قطعهٔ ویدیویی برای concat وجود ندارد');
  }
  const listDir = dirname(outputPath);
  const listPath = join(listDir, `concat_${Date.now()}.txt`);
  const listContent = segmentPaths
    .map(p => `file '${String(resolve(p)).replace(/'/g, "'\\''")}'`)
    .join('\n') + '\n';
  writeFileSync(listPath, listContent, 'utf8');

  try {
    const hasAudio = audioPath && existsSync(audioPath);
    const args = [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listPath
    ];
    if (hasAudio) {
      args.push('-i', audioPath);
    }
    args.push('-c:v', 'copy');
    if (hasAudio) {
      args.push('-c:a', 'aac', '-b:a', '128k', '-map', '0:v:0', '-map', '1:a:0', '-shortest');
    }
    args.push('-movflags', '+faststart', outputPath);
    await runFfmpeg(args);
    return outputPath;
  } finally {
    try { rmSync(listPath, { force: true }); } catch {}
  }
}
