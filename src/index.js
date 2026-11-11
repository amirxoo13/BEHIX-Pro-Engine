/**
 * نقطهٔ ورود عمومی موتور
 * همهٔ توابع واقعی و قابل استفاده از بیرون.
 */

export {
  loadSkeletonFromFile,
  loadSkeleton,
  computePose,
  CharacterInstance,
  animationDuration,
  safeSkeletonPath,
  resolveSafeAssetPath,
  clearSkeletonCache,
  PROJECT_ROOT,
  ALLOWED_ASSET_ROOTS
} from './rigby-adapter.js';
export { Timeline, mockDirecting, pickAnimation, ACTION_TO_ANIM, timedWordsFromLine } from './timeline.js';
export {
  renderCharacters,
  renderPose,
  savePpm,
  loadAtlas,
  createFrame,
  decodePngBuffer,
  encodePngBuffer,
  clearAtlasCache
} from './software-renderer.js';
export {
  renderVideo,
  sanitizeRenderOptions,
  cleanupJobDir,
  encodeFramesToMp4,
  muxAudioWithMp4,
  concatMp4Segments,
  LIMITS
} from './video-encoder.js';
export {
  generateDirecting,
  buildDirectingPrompt,
  validateDirecting,
  parseModelJson,
  resolveTextModel,
  DEFAULT_GEMINI_MODEL,
  ALLOWED_TEXT_MODELS,
  MODEL,
  MAX_CHARACTERS,
  LONGFORM_MIN_SEC,
  LONGFORM_MAX_SEC
} from './gemini-directing.js';
export {
  buildCharacterRig,
  buildSceneBackgroundImage,
  buildAllDirectingAssets,
  generateCharacterSheetsFromScenario,
  resolveLayerRoleAndSide,
  defaultCharacterLayers,
  packImagesIntoAtlas,
  resolveImageModel,
  DEFAULT_IMAGE_MODEL,
  ALLOWED_IMAGE_MODELS
} from './character-factory.js';
export {
  synthesizeLineWithGoogleTts,
  synthesizeFallbackSpeechPcm,
  buildAudioTrackAndLipSync,
  writeWavFile,
  resolveTtsModel,
  DEFAULT_TTS_MODEL,
  ALLOWED_TTS_MODELS
} from './audio-track.js';
export {
  saveJobStatus,
  loadJobStatus,
  executeChunkedRenderJob,
  enqueueLongformRenderJob,
  ensureLocalOutputFromGcs
} from './render-job.js';
export {
  normalizeScenarioDirecting,
  prepareScenarioDirecting
} from './scenario-pipeline.js';

import { existsSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { loadSkeletonFromFile, safeSkeletonPath, resolveSafeAssetPath } from './rigby-adapter.js';
import { Timeline } from './timeline.js';
import { renderVideo } from './video-encoder.js';
import { validateDirecting } from './gemini-directing.js';
import { buildAllDirectingAssets } from './character-factory.js';
import { buildAudioTrackAndLipSync } from './audio-track.js';

/**
 * آپلود خروجی به Cloud Storage وقتی OUTPUT_BUCKET تنظیم شده.
 * بدون bucket هیچ کاری نمی‌کند (رندر محلی همچنان کار می‌کند).
 */
export async function maybeUploadToGcs(localPath, jobId) {
  const bucketName = process.env.OUTPUT_BUCKET;
  if (!bucketName) return null;
  const { Storage } = await import('@google-cloud/storage');
  const storage = new Storage();
  const dest = `renders/${jobId}/film.mp4`;
  await storage.bucket(bucketName).upload(localPath, {
    destination: dest,
    metadata: { contentType: 'video/mp4' }
  });
  return `gs://${bucketName}/${dest}`;
}

/**
 * مسیر کامل: کارگردانی JSON → (در صورت نیاز ساخت ریگ کاراکترها با autoRig و پس‌زمینهٔ ثابت)
 * → Timeline → تولید صدای TTS (gemini-3.8-flash-tts) و لب‌خوانی (visemeCues + keyLipSync روی انیمیشن فعال) → رستر CPU → FFmpeg (همراه با mux صدا) → MP4
 */
export async function renderFromDirecting(directing, options = {}) {
  validateDirecting(directing, {
    longform: Boolean(options.longform),
    requireContiguous: Boolean(options.requireContiguous || options.longform)
  });

  const warnings = [];

  const needsAssetBuild = Boolean(options.buildAssets) || (directing.characters || []).some(c => {
    if (!c?.skeletonPath) return false;
    try {
      const full = resolveSafeAssetPath(c.skeletonPath);
      return !existsSync(full);
    } catch {
      return false;
    }
  });

  if (needsAssetBuild) {
    const assetRes = await buildAllDirectingAssets(directing, options);
    if (assetRes.warnings.length) warnings.push(...assetRes.warnings);
  }

  const relSkelPath = (typeof options.skeletonPath === 'string' && options.skeletonPath.trim()) ? options.skeletonPath.trim() : 'examples/nila.skel.json';
  safeSkeletonPath(relSkelPath, options.allowedRoot || null);
  const skeleton = loadSkeletonFromFile(relSkelPath, { allowedRoot: options.allowedRoot || null });
  const timeline = new Timeline(directing, skeleton, options);

  const jobId = options.jobId || randomUUID();
  const jobDir = options.jobDir || mkdtempSync(join(tmpdir(), `behix-${jobId.slice(0, 8)}-`));

  const hasDialogueLines = (directing.scenes || []).some(s => Array.isArray(s.lines) && s.lines.length > 0);
  let audioPath = options.audioPath || null;
  let audioReport = null;

  if (hasDialogueLines && options.enableAudio !== false) {
    const targetDur = Number(options.duration) || timeline.duration || 4;
    audioReport = await buildAudioTrackAndLipSync(directing, timeline, jobDir, {
      ...options,
      duration: targetDur,
      startSec: 0,
      endSec: targetDur
    });
    audioPath = audioReport.audioPath;
    if (audioReport.warnings.length) warnings.push(...audioReport.warnings);
  }

  const result = await renderVideo(timeline, {
    ...options,
    jobId,
    jobDir,
    audioPath
  });

  if (result.warnings?.length) warnings.push(...result.warnings);

  let gcsUri = null;
  try {
    gcsUri = await maybeUploadToGcs(result.outputPath, result.jobId);
  } catch (err) {
    warnings.push(`[gcs] آپلود شکست خورد: ${err.message}`);
    console.error(`[gcs] آپلود شکست خورد: ${err.message}`);
  }

  return {
    jobId: result.jobId,
    outputPath: result.outputPath,
    jobDir: result.jobDir,
    gcsUri,
    title: directing.title,
    duration: result.duration,
    fps: result.fps,
    width: result.width,
    height: result.height,
    frameCount: result.frameCount,
    sceneCount: (directing.scenes || []).length,
    characterCount: (directing.characters || []).length,
    audio: audioReport ? { ttsModel: audioReport.ttsModel, lineCount: audioReport.lineCount, lines: audioReport.lines } : null,
    warnings: [...new Set(warnings)]
  };
}
