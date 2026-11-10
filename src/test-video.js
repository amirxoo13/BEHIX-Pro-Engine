/**
 * تست اولویت ۵: تولید ویدیو با FFmpeg
 * اجرا: node src/test-video.js
 */

import { statSync } from 'fs';
import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline, mockDirecting } from './timeline.js';
import { renderVideo, cleanupJobDir } from './video-encoder.js';

async function main() {
  console.log('=== اولویت ۵: کدگذاری ویدیو با FFmpeg ===');

  const skeleton = loadSkeletonFromFile('examples/nila.skel.json');
  const directing = mockDirecting();
  const tl = new Timeline(directing, skeleton);

  const result = await renderVideo(tl, {
    duration: 3,
    fps: 8,
    width: 640,
    height: 360
  });

  const size = statSync(result.outputPath).size;
  console.log('ویدیو ساخته شد:', result.outputPath, `(${size} بایت، ${result.frameCount} فریم)`);
  if (size < 1000) throw new Error('فایل MP4 مشکوک به خالی بودن است');

  cleanupJobDir(result.jobDir);
  console.log('=== پایان تست اولویت ۵ ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
