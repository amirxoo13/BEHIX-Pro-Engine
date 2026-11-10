/**
 * تست اولویت ۴: رندر نرم‌افزاری
 * اجرا: node src/test-renderer.js
 */

import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline, mockDirecting } from './timeline.js';
import { renderCharacters, savePpm } from './software-renderer.js';
import { mkdirSync } from 'fs';

function main() {
  console.log('=== اولویت ۴: رندر نرم‌افزاری CPU ===');

  const skeleton = loadSkeletonFromFile('examples/nila.skel.json');
  const tl = new Timeline(mockDirecting(), skeleton);

  mkdirSync('out', { recursive: true });

  const fps = 8;
  const times = [0, 2, 4, 6];
  for (const t of times) {
    const cam = tl.cameraAt(t);
    const characters = tl.charactersAt(t, 1 / fps);
    const frame = renderCharacters(characters, { width: 320, height: 180, skeleton, ...cam });
    const path = `out/frame_${t.toFixed(1)}.ppm`;
    savePpm(frame, path);
    console.log(`ذخیره شد: ${path} (drawn=${frame.meta.drawn})`);
    if (!frame.meta.drawn) throw new Error('هیچ چیزی رسم نشد');
  }

  console.log('=== پایان تست اولویت ۴ ===');
  console.log('فایل‌های PPM در پوشهٔ out/ ساخته شدند.');
}

main();
