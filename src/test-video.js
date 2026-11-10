/**
 * تست اولویت ۵: تولید ویدیو با FFmpeg
 * اجرا: node src/test-video.js
 */

import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline, mockDirecting } from './timeline.js';
import { renderVideo } from './video-encoder.js';

async function main() {
  console.log('=== اولویت ۵: کدگذاری ویدیو با FFmpeg ===');

  const skeleton = loadSkeletonFromFile('examples/nila.skel.json');
  const directing = mockDirecting();
  const tl = new Timeline(directing, skeleton);

  const output = await renderVideo(tl, {
    duration: 3,
    fps: 8,
    width: 640,
    height: 360,
    outputPath: 'out/test_film.mp4'
  });

  console.log('ویدیو ساخته شد:', output);
  console.log('=== پایان تست اولویت ۵ ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
