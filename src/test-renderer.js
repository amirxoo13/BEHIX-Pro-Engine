/**
 * تست اولویت ۴: رندر نرم‌افزاری CPU (به‌روزرسانی‌شده برای فاز ۱ و ۲)
 * اجرا: node src/test-renderer.js
 *
 * بررسی‌ها:
 *  - رندر کاراکترها با اطلس اختصاصی و اسکلت اختصاصی تولیدشده با autoRig
 *  - رندر تصویر ثابت پس‌زمینهٔ صحنه (backgroundImage) پشت کاراکترها روی CPU با حفظ fallback رنگ تخت
 *  - بررسی پرتاب خطای صریح در صورت خراب یا ناموجود بودن اطلس اختصاصی کاراکتر (بدون بازگشت پنهانی به اطلس nila)
 */

import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline, mockDirecting } from './timeline.js';
import { renderCharacters, savePpm } from './software-renderer.js';
import { buildSceneBackgroundImage } from './character-factory.js';
import { mkdirSync } from 'fs';

async function main() {
  console.log('=== اولویت ۴: رندر نرم‌افزاری CPU ===');

  const skeleton = loadSkeletonFromFile('examples/nila.skel.json');
  const directing = mockDirecting();

  // ساخت تصویر پس‌زمینهٔ ثابت برای صحنهٔ اول جهت تست رندر تصویری پشت کاراکترها
  const bgBuilt = await buildSceneBackgroundImage({
    id: 's1',
    description: 'پارک سرسبز در غروب',
    background: '#224433',
    backgroundImage: 'assets/backgrounds/s1.png'
  }, { uploadToGcs: false });
  directing.scenes[0].backgroundImage = bgBuilt.backgroundImage;

  const tl = new Timeline(directing, skeleton);

  mkdirSync('out', { recursive: true });

  const fps = 8;
  const times = [0, 2, 4, 6];
  for (const t of times) {
    const cam = tl.cameraAt(t);
    const characters = tl.charactersAt(t, 1 / fps);
    const frame = renderCharacters(characters, {
      width: 320,
      height: 180,
      skeleton,
      background: tl.backgroundAt(t),
      backgroundImage: tl.backgroundImageAt(t),
      ...cam
    });
    const path = `out/frame_${t.toFixed(1)}.ppm`;
    savePpm(frame, path);
    console.log(`ذخیره شد: ${path} (drawn=${frame.meta.drawn}, bgImage=${frame.meta.backgroundDrawn})`);
    if (!frame.meta.drawn) throw new Error('هیچ چیزی رسم نشد');
    if (t === 0 && !frame.meta.backgroundDrawn) {
      throw new Error('تصویر ثابت پس‌زمینه در صحنهٔ اول رسم نشد');
    }
  }

  // بررسی خطای صریح روی اطلس اختصاصی ناموجود/خراب بدون بازگشت پنهانی به nila (ب7)
  let brokenAtlasThrew = false;
  try {
    const pose = tl.poseAt(0, 'boy', 1 / fps);
    renderCharacters([{ pose, skeleton, atlasPath: 'assets/nonexistent_char/broken.atlas' }], {
      width: 160,
      height: 90
    });
  } catch {
    brokenAtlasThrew = true;
  }
  if (!brokenAtlasThrew) {
    throw new Error('اطلس اختصاصی خراب خطا نداد و به nila برگشت!');
  }
  console.log('تایید شد: اطلس اختصاصی خراب خطای صریح می‌دهد و به nila برنمی‌گردد.');

  console.log('=== پایان تست اولویت ۴ ===');
  console.log('فایل‌های PPM در پوشهٔ out/ ساخته شدند.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
