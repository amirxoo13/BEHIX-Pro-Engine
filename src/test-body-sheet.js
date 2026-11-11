/**
 * تست برش تصویر کامل بدن به قطعات ریگ
 * اجرا: node src/test-body-sheet.js
 *
 * یک شکل T-pose مصنوعی ساخته می‌شود که هر ناحیهٔ بدن رنگ متمایز خودش را دارد، سپس بررسی
 * می‌شود که هر قطعهٔ بریده‌شده واقعاً همان ناحیه است. نشانگر قرمز در سر شانهٔ هر دست گذاشته
 * می‌شود تا تایید شود دست‌ها بعد از چرخش، مفصل بالایی‌شان بالای تصویر است — همان چیزی که
 * ریگ انتظار دارد و در روش قبلی رعایت نمی‌شد.
 */

import { sliceBodySheet, measureFigure, rotate90, deriveWorldLayout, TARGET_FIGURE_HEIGHT } from './body-sheet.js';

const BG = [255, 0, 255];
const C = {
  head:     [255, 220, 180],
  neck:     [240, 205, 165],
  torso:    [30, 80, 200],
  pelvis:   [20, 60, 160],
  thigh:    [250, 215, 175],
  shinL:    [250, 250, 250],
  shinR:    [170, 190, 230],
  foot:     [20, 20, 30],
  upperarm: [40, 100, 220],
  forearm:  [245, 210, 170],
  hand:     [255, 198, 158],
  marker:   [230, 20, 20]
};

function canvas(w, h, fill) {
  const pixels = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    pixels[i * 4] = fill[0]; pixels[i * 4 + 1] = fill[1];
    pixels[i * 4 + 2] = fill[2]; pixels[i * 4 + 3] = 255;
  }
  return { width: w, height: h, pixels };
}

function rect(img, x0, y0, x1, y1, color) {
  const { width: w, pixels } = img;
  for (let y = Math.round(y0); y < Math.round(y1); y++) {
    for (let x = Math.round(x0); x < Math.round(x1); x++) {
      if (x < 0 || y < 0 || x >= w || y >= img.height) continue;
      const p = (y * w + x) * 4;
      pixels[p] = color[0]; pixels[p + 1] = color[1]; pixels[p + 2] = color[2]; pixels[p + 3] = 255;
    }
  }
}

/** رنگ غالب پیکسل‌های مات یک قطعه */
function dominantColor(img) {
  const counts = new Map();
  for (let i = 0; i < img.width * img.height; i++) {
    if (img.pixels[i * 4 + 3] < 200) continue;
    const key = `${img.pixels[i * 4] >> 4},${img.pixels[i * 4 + 1] >> 4},${img.pixels[i * 4 + 2] >> 4}`;
    const prev = counts.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    prev.n++; prev.r += img.pixels[i * 4]; prev.g += img.pixels[i * 4 + 1]; prev.b += img.pixels[i * 4 + 2];
    counts.set(key, prev);
  }
  let best = null;
  for (const c of counts.values()) if (!best || c.n > best.n) best = c;
  if (!best) return null;
  return [best.r / best.n, best.g / best.n, best.b / best.n];
}

function near(a, b, tol = 26) {
  if (!a) return false;
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) <= tol;
}

function assert(cond, msg) { if (!cond) throw new Error(msg); }

/** نسبت پیکسل‌های نشانگر در نیمهٔ بالایی یک قطعه */
function markerTopFraction(img) {
  let top = 0, bottom = 0;
  const mid = img.height / 2;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const p = (y * img.width + x) * 4;
      if (img.pixels[p + 3] < 200) continue;
      if (near([img.pixels[p], img.pixels[p + 1], img.pixels[p + 2]], C.marker, 40)) {
        if (y < mid) top++; else bottom++;
      }
    }
  }
  return top + bottom === 0 ? null : top / (top + bottom);
}

function buildTPose() {
  const W = 620, H = 620;
  const img = canvas(W, H, BG);
  const top = 55, figH = 500, cx = 310;
  const y = f => top + figH * f;

  rect(img, cx - 42, top, cx + 42, y(0.135), C.head);          // سر
  rect(img, cx - 16, y(0.130), cx + 16, y(0.170), C.neck);     // گردن
  rect(img, cx - 62, y(0.165), cx + 62, y(0.470), C.torso);    // تنه
  rect(img, cx - 60, y(0.465), cx + 60, y(0.570), C.pelvis);   // لگن

  // پاها با فاصلهٔ واضح بین آن‌ها
  const gap = 13;
  for (const s of [-1, 1]) {
    const inner = cx + s * gap, outer = cx + s * 58;
    const x0 = Math.min(inner, outer), x1 = Math.max(inner, outer);
    rect(img, x0, y(0.565), x1, y(0.730), C.thigh);
    rect(img, x0, y(0.725), x1, y(0.920), s < 0 ? C.shinL : C.shinR);
    rect(img, x0, y(0.915), x1, y(1.0), C.foot);
  }

  // دست‌های افقی کاملاً باز، با نشانگر قرمز در سر شانه
  const ay0 = y(0.175), ay1 = y(0.280);
  const armLen = 185;
  for (const s of [-1, 1]) {
    const inner = cx + s * 62;
    const segs = [[0, 0.38, C.upperarm], [0.38, 0.72, C.forearm], [0.72, 1, C.hand]];
    for (const [a, b, col] of segs) {
      const xa = inner + s * armLen * a, xb = inner + s * armLen * b;
      rect(img, Math.min(xa, xb), ay0, Math.max(xa, xb), ay1, col);
    }
    // نشانگر شانه: نزدیک‌ترین نقطه به بدن
    const mx = inner + s * 8;
    rect(img, Math.min(inner, mx), ay0 + 6, Math.max(inner, mx), ay1 - 6, C.marker);
  }
  return img;
}

function main() {
  console.log('=== تست برش تصویر کامل بدن ===');

  const sheet = buildTPose();
  const res = sliceBodySheet(sheet);
  assert(res.ok, `برش ناموفق بود: ${res.error}`);
  for (const w of res.warnings) console.log('  هشدار:', w);

  const m = res.landmarks;
  console.log(`نشانه‌ها: نوار دست ${m.armTop}..${m.armBottom} | ستون بدن ${m.bodyLeft}..${m.bodyRight} | مرز پاها x=${m.legSplitX}`);

  const expected = ['head', 'neck', 'torso', 'pelvis',
    'thigh_l', 'thigh_r', 'shin_l', 'shin_r', 'foot_l', 'foot_r',
    'upperarm_l', 'upperarm_r', 'forearm_l', 'forearm_r', 'hand_l', 'hand_r'];
  for (const name of expected) {
    assert(res.parts.has(name), `قطعهٔ "${name}" بریده نشد. قطعات: ${[...res.parts.keys()].join(', ')}`);
  }
  console.log(`هر ۱۶ قطعهٔ هستهٔ بدن بریده شد.`);

  // هر قطعه باید واقعاً همان ناحیهٔ بدن باشد
  const checks = [
    ['head', C.head], ['torso', C.torso], ['pelvis', C.pelvis],
    ['thigh_l', C.thigh], ['thigh_r', C.thigh],
    ['foot_l', C.foot], ['foot_r', C.foot],
    ['upperarm_l', C.upperarm], ['upperarm_r', C.upperarm],
    ['forearm_l', C.forearm], ['forearm_r', C.forearm],
    ['hand_l', C.hand], ['hand_r', C.hand]
  ];
  for (const [name, color] of checks) {
    const dom = dominantColor(res.parts.get(name));
    assert(near(dom, color), `قطعهٔ "${name}" رنگ ناحیهٔ خودش را ندارد: ${dom && dom.map(v => v.toFixed(0))} در برابر ${color}`);
  }
  console.log('رنگ غالب هر قطعه با ناحیهٔ بدنی خودش می‌خواند (هیچ قطعه‌ای ناحیهٔ اشتباه نگرفته).');

  // چپ و راست نباید جابه‌جا شوند: ساق سمت چپِ تصویر = سمت راست کاراکتر
  assert(near(dominantColor(res.parts.get('shin_r')), C.shinL),
    'ساق سمت راست کاراکتر باید از نیمهٔ چپِ تصویر بریده شود');
  assert(near(dominantColor(res.parts.get('shin_l')), C.shinR),
    'ساق سمت چپ کاراکتر باید از نیمهٔ راستِ تصویر بریده شود');
  console.log('تفکیک چپ و راست پاها درست است.');

  // دست‌ها بعد از چرخش باید عمودی باشند و شانه بالای تصویر
  for (const side of ['l', 'r']) {
    const up = res.parts.get(`upperarm_${side}`);
    assert(up.height > up.width, `بازوی "${side}" بعد از چرخش باید بلندتر از پهنا باشد (${up.width}x${up.height})`);
    const frac = markerTopFraction(up);
    assert(frac !== null, `نشانگر شانه در بازوی "${side}" پیدا نشد`);
    assert(frac > 0.8, `شانه باید بالای تصویر بازوی "${side}" باشد، اما ${(frac * 100).toFixed(0)}٪ نشانگر بالا بود`);
  }
  console.log('دست‌ها عمودی شده‌اند و مفصل شانه بالای تصویر است.');

  // چرخش باید برگشت‌پذیر باشد
  const probe = { width: 3, height: 2, pixels: new Uint8Array(24) };
  for (let i = 0; i < 6; i++) { probe.pixels[i * 4] = i * 10; probe.pixels[i * 4 + 3] = 255; }
  const back = rotate90(rotate90(probe, 'cw'), 'ccw');
  assert(back.width === probe.width && back.height === probe.height, 'چرخش رفت و برگشت ابعاد را حفظ نکرد');
  for (let i = 0; i < 24; i++) assert(back.pixels[i] === probe.pixels[i], 'چرخش رفت و برگشت پیکسل‌ها را تغییر داد');
  console.log('چرخش ۹۰ درجه برگشت‌پذیر است.');

  // چیدمان جهانی باید از خودِ نقاشی ساخته شود و آناتومی درستی بدهد
  const layout = deriveWorldLayout(res);
  const need = ['head', 'torso', 'pelvis', 'thigh_l', 'shin_l', 'foot_l', 'upperarm_l', 'forearm_l', 'hand_l'];
  for (const n of need) assert(layout[n], `چیدمان "${n}" ساخته نشد`);

  // ترتیب عمودی بدن از بالا به پایین
  const order = ['head', 'torso', 'pelvis', 'thigh_l', 'shin_l', 'foot_l'];
  for (let i = 1; i < order.length; i++) {
    assert(layout[order[i]].y < layout[order[i - 1]].y,
      `"${order[i]}" باید پایین‌تر از "${order[i - 1]}" باشد (${layout[order[i]].y} در برابر ${layout[order[i - 1]].y})`);
  }
  console.log('ترتیب عمودی اعضا از سر تا پا درست است.');

  // زنجیرهٔ دست باید از شانه به پایین و بدون فاصله چیده شود
  const armChain = ['upperarm_l', 'forearm_l', 'hand_l'];
  for (let i = 1; i < armChain.length; i++) {
    const prev = layout[armChain[i - 1]], cur = layout[armChain[i]];
    assert(cur.y < prev.y, `"${armChain[i]}" باید پایین‌تر از "${armChain[i - 1]}" باشد`);
    const gap = (prev.y - prev.h / 2) - (cur.y + cur.h / 2);
    assert(Math.abs(gap) < TARGET_FIGURE_HEIGHT * 0.02,
      `بین "${armChain[i - 1]}" و "${armChain[i]}" فاصله افتاده (${gap.toFixed(0)} واحد)`);
  }
  console.log('زنجیرهٔ دست از شانه به پایین و بدون فاصله چیده شده است.');

  // دست چپ و راست باید دو طرف بدن باشند و روی تنه هم‌پوشانی کنند، نه معلق در هوا
  assert(layout.upperarm_l.x > 0 && layout.upperarm_r.x < 0, 'بازوها دو طرف بدن نیستند');
  assert(Math.abs(layout.upperarm_l.x) < layout.torso.w,
    `بازو خیلی دور از تنه است (x=${layout.upperarm_l.x}، عرض تنه ${layout.torso.w})`);
  console.log('بازوها کنار تنه‌اند و از بدن جدا نیفتاده‌اند.');

  // هیچ قطعه‌ای نباید بی‌تناسب کشیده شود؛ نسبت ابعاد چیدمان باید به نسبت خود برش نزدیک بماند
  for (const [name, rect] of res.rects) {
    if (!layout[name]) continue;
    const srcRatio = (rect.x1 - rect.x0) / (rect.y1 - rect.y0);
    const outRatio = layout[name].w / layout[name].h;
    assert(Math.abs(srcRatio - outRatio) / srcRatio < 0.05,
      `قطعهٔ "${name}" بدشکل کشیده شده: نسبت ${srcRatio.toFixed(2)} به ${outRatio.toFixed(2)}`);
  }
  console.log('هیچ قطعه‌ای بی‌تناسب کشیده نشده (شورت دیگر دامن نمی‌شود).');

  console.log('=== پایان تست برش تصویر بدن ===');
}

main();
