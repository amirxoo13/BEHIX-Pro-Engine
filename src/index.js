/**
 * نقطهٔ ورود عمومی موتور
 * همهٔ توابع واقعی و قابل استفاده از بیرون.
 */

export { loadSkeletonFromFile, loadSkeleton, computePose, CharacterInstance, animationDuration } from './rigby-adapter.js';
export { Timeline, mockDirecting } from './timeline.js';
export { renderCharacters, renderPose, savePpm, loadAtlas, createFrame } from './software-renderer.js';
export { renderVideo, sanitizeRenderOptions, cleanupJobDir, LIMITS } from './video-encoder.js';
export { generateDirecting, buildDirectingPrompt, validateDirecting } from './gemini-directing.js';

import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline } from './timeline.js';
import { renderVideo } from './video-encoder.js';
import { basename } from 'path';

/** فقط اسکلت‌های داخل examples/ قابل انتخاب‌اند (باگ #10) */
function safeSkeletonPath(p) {
  if (!p) return 'examples/nila.skel.json';
  return `examples/${basename(String(p))}`;
}

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
 * مسیر کامل: کارگردانی JSON → ویدیو
 * (خروجی generateDirecting را اینجا می‌دهید)
 */
export async function renderFromDirecting(directing, options = {}) {
  const skeletonPath = safeSkeletonPath(options.skeletonPath);
  const skeleton = loadSkeletonFromFile(skeletonPath);
  const timeline = new Timeline(directing, skeleton);
  const result = await renderVideo(timeline, options);

  let gcsUri = null;
  try {
    gcsUri = await maybeUploadToGcs(result.outputPath, result.jobId);
  } catch (err) {
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
    sceneCount: (directing.scenes || []).length
  };
}
