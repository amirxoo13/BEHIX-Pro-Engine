/**
 * تست اولویت ۴: رندر نرم‌افزاری
 * اجرا: node src/test-renderer.js
 */

import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline, mockDirecting } from './timeline.js';
import { renderPose, savePpm } from './software-renderer.js';
import { mkdirSync } from 'fs';

function main() {
  console.log('=== اولویت ۴: رندر نرم‌افزاری CPU ===');

  const skeleton = loadSkeletonFromFile('examples/nila.skel.json');
  const tl = new Timeline(mockDirecting(), skeleton);

  mkdirSync('out', { recursive: true });

  const times = [0, 2, 4, 6];
  for (const t of times) {
    const pose = tl.poseAt(t, 'boy');
    const frame = renderPose(pose, { width: 320, height: 180 });
    const path = `out/frame_${t.toFixed(1)}.ppm`;
    savePpm(frame, path);
    console.log(`ذخیره شد: ${path} (quads=${pose.quadCount})`);
  }

  console.log('=== پایان تست اولویت ۴ ===');
  console.log('فایل‌های PPM در پوشهٔ out/ ساخته شدند.');
}

main();
