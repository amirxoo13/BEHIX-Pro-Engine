/**
 * تست آماده‌سازی لایهٔ تولیدشده: حذف پس‌زمینه و برش تنگ به کادر محتوا
 * اجرا: node src/test-layer-prep.js
 *
 * این تست دقیقاً همان دو حالتی را می‌سازد که مدل تصویر در عمل تولید می‌کند و باعث خرابی فیلم شده بود:
 *   الف) بوم بزرگ مات با «الگوی شطرنجیِ نقاشی‌شده» و محتوای کوچک وسط آن
 *   ب) بوم بزرگ مات با پس‌زمینهٔ تختِ سرخابی (کروما) و محتوای کوچک وسط آن
 * و بررسی می‌کند که خروجی آلفای واقعی دارد، به کادر محتوا بریده شده، و نسبت ابعاد حفظ شده است.
 */

import {
  keyOutBackgroundToAlpha,
  cropToContentBbox,
  prepareGeneratedLayer
} from './character-factory.js';

/** ساخت بوم RGBA کاملاً مات */
function makeCanvas(w, h, fill) {
  const pixels = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    pixels[i * 4] = fill[0];
    pixels[i * 4 + 1] = fill[1];
    pixels[i * 4 + 2] = fill[2];
    pixels[i * 4 + 3] = 255;
  }
  return { width: w, height: h, pixels };
}

/** نقاشی الگوی شطرنجی شفافیت روی کل بوم، همان کاری که مدل تصویر انجام می‌دهد */
function paintCheckerboard(img, cell = 32) {
  const { width: w, height: h, pixels } = img;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const light = (((x / cell) | 0) + ((y / cell) | 0)) % 2 === 0;
      const v = light ? 255 : 204;
      const p = (y * w + x) * 4;
      pixels[p] = v; pixels[p + 1] = v; pixels[p + 2] = v; pixels[p + 3] = 255;
    }
  }
  return img;
}

/** رسم یک مستطیل مات (نمایندهٔ خود عضو بدن) در مختصات مشخص */
function paintRect(img, x0, y0, rw, rh, color) {
  const { width: w, pixels } = img;
  for (let y = y0; y < y0 + rh; y++) {
    for (let x = x0; x < x0 + rw; x++) {
      const p = (y * w + x) * 4;
      pixels[p] = color[0]; pixels[p + 1] = color[1]; pixels[p + 2] = color[2]; pixels[p + 3] = 255;
    }
  }
  return img;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function main() {
  console.log('=== تست آماده‌سازی لایه: حذف پس‌زمینه + برش تنگ ===');

  const CANVAS = 512;
  const RECT = { x: 190, y: 140, w: 120, h: 220 }; // محتوای کوچک وسط بوم، نسبت ۱۲۰:۲۲۰
  const SHIRT = [30, 90, 200];
  const layout = { x: 0, y: 1710, w: 470, h: 505 };

  // ---------- حالت الف: شطرنجیِ نقاشی‌شده ----------
  const checker = paintRect(
    paintCheckerboard(makeCanvas(CANVAS, CANVAS, [0, 0, 0])),
    RECT.x, RECT.y, RECT.w, RECT.h, SHIRT
  );

  const keyed = keyOutBackgroundToAlpha(checker);
  assert(keyed, 'حذف پس‌زمینه روی تصویر شطرنجیِ مات باید اجرا می‌شد ولی null برگشت');
  const bgFraction = keyed.removed / keyed.total;
  const expectedBg = 1 - (RECT.w * RECT.h) / (CANVAS * CANVAS);
  console.log(`شطرنجی: ${(bgFraction * 100).toFixed(1)}٪ پس‌زمینه حذف شد (انتظار ≈ ${(expectedBg * 100).toFixed(1)}٪)`);
  assert(Math.abs(bgFraction - expectedBg) < 0.02, `نسبت حذف پس‌زمینه خارج از انتظار: ${bgFraction}`);

  // محتوای خود عضو نباید شفاف شده باشد
  const centerIdx = ((RECT.y + (RECT.h >> 1)) * CANVAS + (RECT.x + (RECT.w >> 1))) * 4;
  assert(keyed.pixels[centerIdx + 3] === 255, 'مرکز عضو بدن نباید شفاف می‌شد');
  // گوشهٔ بوم باید کاملاً شفاف شده باشد
  assert(keyed.pixels[3] === 0, 'گوشهٔ بوم باید شفاف می‌شد');

  const prepChecker = prepareGeneratedLayer(checker, layout, 'torso');
  assert(!prepChecker.error, `آماده‌سازی شطرنجی نباید خطا می‌داد: ${prepChecker.error}`);
  assert(
    prepChecker.img.width === RECT.w && prepChecker.img.height === RECT.h,
    `برش باید دقیقاً ${RECT.w}×${RECT.h} می‌شد ولی ${prepChecker.img.width}×${prepChecker.img.height} شد`
  );
  console.log(`برش شطرنجی: ${CANVAS}×${CANVAS} → ${prepChecker.img.width}×${prepChecker.img.height}`);

  // نسبت ابعاد اتصال باید با نسبت محتوا یکی باشد و داخل کادر چیدمان جا شود
  const srcRatio = RECT.w / RECT.h;
  const attRatio = prepChecker.attW / prepChecker.attH;
  assert(Math.abs(srcRatio - attRatio) < 0.02, `نسبت ابعاد حفظ نشد: ${srcRatio} در برابر ${attRatio}`);
  assert(
    prepChecker.attW <= layout.w && prepChecker.attH <= layout.h,
    `اندازهٔ اتصال از کادر چیدمان بیرون زد: ${prepChecker.attW}×${prepChecker.attH}`
  );
  console.log(`اندازهٔ اتصال: ${prepChecker.attW}×${prepChecker.attH} (کادر چیدمان ${layout.w}×${layout.h}، نسبت حفظ شد)`);

  // ---------- حالت ب: پس‌زمینهٔ تختِ سرخابی (کروما) ----------
  const magenta = paintRect(makeCanvas(CANVAS, CANVAS, [255, 0, 255]), RECT.x, RECT.y, RECT.w, RECT.h, SHIRT);
  const prepMagenta = prepareGeneratedLayer(magenta, layout, 'torso');
  assert(!prepMagenta.error, `آماده‌سازی کروما نباید خطا می‌داد: ${prepMagenta.error}`);
  assert(
    prepMagenta.img.width === RECT.w && prepMagenta.img.height === RECT.h,
    `برش کروما باید ${RECT.w}×${RECT.h} می‌شد ولی ${prepMagenta.img.width}×${prepMagenta.img.height} شد`
  );
  console.log(`برش کروما: ${CANVAS}×${CANVAS} → ${prepMagenta.img.width}×${prepMagenta.img.height}`);

  // ---------- حالت ج: رنگ مشابه پس‌زمینه در دل محتوا نباید پاک شود ----------
  // یک لکهٔ سرخابی داخل خود پیراهن (مثل لوگو) که به لبه وصل نیست
  const withLogo = paintRect(
    paintRect(makeCanvas(CANVAS, CANVAS, [255, 0, 255]), RECT.x, RECT.y, RECT.w, RECT.h, SHIRT),
    RECT.x + 40, RECT.y + 80, 24, 24, [255, 0, 255]
  );
  const keyedLogo = keyOutBackgroundToAlpha(withLogo);
  const logoIdx = ((RECT.y + 90) * CANVAS + (RECT.x + 50)) * 4;
  assert(keyedLogo.pixels[logoIdx + 3] === 255, 'لکهٔ هم‌رنگِ پس‌زمینه در دل کاراکتر نباید پاک می‌شد (flood-fill باید از لبه باشد)');
  console.log('لوگوی هم‌رنگِ پس‌زمینه داخل کاراکتر حفظ شد (پاک‌سازی فقط از لبه انجام می‌شود).');

  // ---------- حالت د: تصویری که از قبل آلفای سالم دارد نباید دستکاری شود ----------
  const alreadyAlpha = { width: 8, height: 8, pixels: new Uint8Array(8 * 8 * 4) };
  for (let i = 0; i < 64; i++) alreadyAlpha.pixels[i * 4 + 3] = i < 20 ? 0 : 255;
  assert(keyOutBackgroundToAlpha(alreadyAlpha) === null, 'تصویر دارای آلفای سالم نباید دوباره کلیدزنی می‌شد');
  console.log('تصویر دارای آلفای واقعی دست‌نخورده ماند.');

  // ---------- حالت ه: تصویر کاملاً مات و بدون پس‌زمینهٔ قابل‌تشخیص باید رد شود ----------
  const noise = makeCanvas(64, 64, [0, 0, 0]);
  for (let i = 0; i < 64 * 64; i++) {
    noise.pixels[i * 4] = (i * 37) % 256;
    noise.pixels[i * 4 + 1] = (i * 91) % 256;
    noise.pixels[i * 4 + 2] = (i * 13) % 256;
  }
  const prepNoise = prepareGeneratedLayer(noise, layout, 'torso');
  assert(prepNoise.error, 'تصویر مات بدون پس‌زمینهٔ قابل‌تشخیص باید رد می‌شد تا fallback اجرا شود');
  console.log(`تصویر غیرقابل‌استفاده درست رد شد: ${prepNoise.error}`);

  console.log('=== همهٔ بررسی‌ها موفق ===');
}

main();
