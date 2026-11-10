/**
 * نقطهٔ ورود عمومی موتور
 * همهٔ توابع واقعی و قابل استفاده از بیرون.
 */

export { loadSkeletonFromFile, loadSkeleton, computePose } from './rigby-adapter.js';
export { Timeline } from './timeline.js';
export { renderCharacters, renderPose, savePpm } from './software-renderer.js';
export { renderVideo } from './video-encoder.js';
export { generateDirecting, buildDirectingPrompt } from './gemini-directing.js';

import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline } from './timeline.js';
import { renderVideo } from './video-encoder.js';

/**
 * مسیر کامل: کارگردانی JSON → ویدیو
 * (وقتی Gemini متصل شود، خروجی generateDirecting را اینجا می‌دهد)
 */
export async function renderFromDirecting(directing, options = {}) {
  const skeletonPath = options.skeletonPath || 'examples/nila.skel.json';
  const skeleton = loadSkeletonFromFile(skeletonPath);
  const timeline = new Timeline(directing, skeleton);
  const outputPath = await renderVideo(timeline, options);
  return {
    outputPath,
    title: directing.title,
    duration: directing.durationSec,
    sceneCount: (directing.scenes || []).length
  };
}
