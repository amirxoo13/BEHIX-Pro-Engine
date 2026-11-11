/**
 * ساخت دارایی کاراکتر از «یک تصویر کامل بدن» و برش آن به قطعات در کد.
 *
 * چرا این روش: تولید جداگانهٔ هر عضو (۱۶ تصویر مستقل) قابل اتکا نبود. هر تصویر بدون خبر از
 * بقیه ساخته می‌شد، پس اعضا هم‌دیگر را تکرار می‌کردند (شورت هم در لگن و هم در ران)، بعضی
 * اصلاً عضو اشتباهی بودند (بازو یک تکهٔ پیراهن با شمارهٔ بازیکن)، و رنگ و سبک و مقیاسشان با هم
 * نمی‌خواند. نتیجه بدنی بود از قطعات ناهمخوان با فاصله‌های دیده‌شدنی.
 *
 * در این روش یک نقاشی از کل بدن در حالت T-pose ساخته می‌شود و قطعات از همان یک نقاشی بریده
 * می‌شوند. پس سبک و رنگ و مقیاس ذاتاً یکی است، قطعات طبق ساختشان به هم می‌چسبند، و به‌جای
 * ۱۶ فراخوانی مدل فقط یک فراخوانی لازم است.
 */

import { keyOutBackgroundToAlpha, cropToContentBbox } from './character-factory.js';

/** نسبت‌های آناتومیک برش عمودی، به‌صورت کسری از قد شکل */
const VERTICAL_LANDMARKS = {
  chinRatio: 0.135,   // پایین سر
  neckRatio: 0.170,   // پایین گردن / بالای شانه
  waistRatio: 0.470,  // پایین تنه
  hipRatio: 0.570,    // پایین لگن
  kneeRatio: 0.730,
  ankleRatio: 0.920
};

/** تقسیم طول دست از شانه تا نوک انگشت */
const ARM_SEGMENTS = { upperarm: 0.38, forearm: 0.34, hand: 0.28 };

/** هم‌پوشانی برش‌ها به‌صورت کسری از قد، تا درزِ بین قطعات دیده نشود */
const OVERLAP_RATIO = 0.012;

/**
 * پرامپت ساخت تصویر کامل بدن.
 *
 * T-pose انتخاب شده چون برش را قطعی می‌کند: پاها عمودی و کنار هم‌اند و دست‌ها افقی و کاملاً
 * باز، پس مرز هر عضو با یک خط صاف مشخص می‌شود. در A-pose دست‌ها مورب‌اند و برش مستطیلی
 * تمیز ممکن نیست.
 */
export function buildBodySheetPrompt(charName, appearance) {
  return [
    `Full body character sheet of "${charName}" (${appearance || 'stylized 2D animation character'}).`,
    'The character stands in a strict T-POSE: facing the viewer straight on, both arms stretched out perfectly straight and HORIZONTAL to the left and right at shoulder height, palms forward, fingers together.',
    'Both legs are straight, vertical, and slightly apart with a clear visible gap between them. Feet flat, pointing forward.',
    'Head upright and centered, mouth closed, neutral expression.',
    'Flat 2D cartoon animation style with crisp clean outlines and flat colors, even lighting, no cast shadows.',
    'The whole body from the top of the head to the soles of the feet must be fully inside the frame, centered, filling the frame.',
    'The background MUST be a completely flat, uniform, solid magenta (#FF00FF) fill.',
    'Do NOT draw a checkerboard or transparency grid. No shadow, gradient, texture, border, frame, text, label or watermark anywhere.',
    'Exactly one character, nothing else in the image.'
  ].join(' ');
}

/** محتوای هر سطر: کمینه و بیشینهٔ x و تعداد پیکسل مات */
function rowProfile(img, alphaThreshold = 24) {
  const { width: w, height: h, pixels } = img;
  const rows = new Array(h);
  for (let y = 0; y < h; y++) {
    let min = -1, max = -1, count = 0;
    for (let x = 0; x < w; x++) {
      if (pixels[(y * w + x) * 4 + 3] > alphaThreshold) {
        if (min < 0) min = x;
        max = x;
        count++;
      }
    }
    rows[y] = { min, max, count, width: max >= min && min >= 0 ? max - min + 1 : 0 };
  }
  return rows;
}

/**
 * یافتن نشانه‌های بدن از روی خودِ تصویر، نه حدس.
 *
 * نوار دست‌ها پهن‌ترین بخش تصویر است (T-pose)، تنه ستون میانی زیر آن، و فاصلهٔ بین دو پا
 * در یک‌سوم پایینی به‌صورت یک ستون خالی دیده می‌شود. اتکا به این اندازه‌گیری‌ها باعث می‌شود
 * برش به موقعیت دقیق شکل در قاب وابسته نباشد.
 */
export function measureFigure(img) {
  const { width: w, height: h } = img;
  const rows = rowProfile(img);
  const warnings = [];

  const maxWidth = rows.reduce((m, r) => Math.max(m, r.width), 0);
  if (maxWidth <= 0) return { ok: false, error: 'تصویر بدن خالی است' };

  // نوار افقی دست‌ها: سطرهایی که پهنایشان نزدیک بیشینه است
  let armTop = -1, armBottom = -1;
  for (let y = 0; y < h; y++) {
    if (rows[y].width >= maxWidth * 0.72) {
      if (armTop < 0) armTop = y;
      armBottom = y;
    }
  }
  if (armTop < 0 || armBottom <= armTop) {
    warnings.push('نوار افقی دست‌ها پیدا نشد؛ احتمالاً شکل در حالت T-pose نیست');
    armTop = Math.round(h * 0.17);
    armBottom = Math.round(h * 0.27);
  }

  // ستون تنه: پهنای محتوا در میانهٔ تنه، جایی که دست‌ها دیگر حضور ندارند
  const torsoProbeY = Math.min(h - 1, Math.round(armBottom + h * 0.08));
  let bodyLeft = rows[torsoProbeY].min;
  let bodyRight = rows[torsoProbeY].max;
  if (bodyLeft < 0 || bodyRight <= bodyLeft) {
    warnings.push('ستون تنه اندازه‌گیری نشد؛ از نسبت پیش‌فرض استفاده می‌شود');
    bodyLeft = Math.round(w * 0.40);
    bodyRight = Math.round(w * 0.60);
  }

  // فاصلهٔ بین دو پا: ستون خالی نزدیک مرکز در یک‌سوم پایینی
  const legProbeY = Math.min(h - 1, Math.round(h * 0.86));
  const { pixels } = img;
  let gapStart = -1, gapEnd = -1, bestGap = 0, legSplitX = Math.round((bodyLeft + bodyRight) / 2);
  let run = -1;
  for (let x = bodyLeft; x <= bodyRight; x++) {
    const solid = pixels[(legProbeY * w + x) * 4 + 3] > 24;
    if (!solid) {
      if (run < 0) run = x;
    } else if (run >= 0) {
      if (x - run > bestGap) { bestGap = x - run; gapStart = run; gapEnd = x; }
      run = -1;
    }
  }
  if (bestGap > 0) legSplitX = Math.round((gapStart + gapEnd) / 2);
  else warnings.push('فاصلهٔ بین دو پا دیده نشد؛ خط وسط بدن به‌عنوان مرز پاها استفاده می‌شود');

  return {
    ok: true, warnings,
    width: w, height: h,
    armTop, armBottom, bodyLeft, bodyRight, legSplitX,
    armSpanLeft: rows[Math.round((armTop + armBottom) / 2)].min,
    armSpanRight: rows[Math.round((armTop + armBottom) / 2)].max
  };
}

/** برش یک مستطیل از تصویر، با محدود کردن به مرزها */
function cutRect(img, x0, y0, x1, y1) {
  const { width: w, height: h, pixels } = img;
  const ax = Math.max(0, Math.min(w - 1, Math.round(x0)));
  const ay = Math.max(0, Math.min(h - 1, Math.round(y0)));
  const bx = Math.max(ax + 1, Math.min(w, Math.round(x1)));
  const by = Math.max(ay + 1, Math.min(h, Math.round(y1)));
  const cw = bx - ax, ch = by - ay;
  const out = new Uint8Array(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    const src = ((ay + y) * w + ax) * 4;
    out.set(pixels.subarray(src, src + cw * 4), y * cw * 4);
  }
  return { width: cw, height: ch, pixels: out };
}

/** چرخش ۹۰ درجه. dir='ccw' پادساعتگرد، dir='cw' ساعتگرد */
export function rotate90(img, dir) {
  const { width: w, height: h, pixels } = img;
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4;
      // خروجی ابعاد h×w دارد
      const nx = dir === 'cw' ? h - 1 - y : y;
      const ny = dir === 'cw' ? x : w - 1 - x;
      const d = (ny * h + nx) * 4;
      out[d] = pixels[s]; out[d + 1] = pixels[s + 1];
      out[d + 2] = pixels[s + 2]; out[d + 3] = pixels[s + 3];
    }
  }
  return { width: h, height: w, pixels: out };
}

/**
 * برش تصویر کامل بدن به قطعات ریگ.
 *
 * دست‌ها در T-pose افقی کشیده شده‌اند، پس بعد از برش ۹۰ درجه می‌چرخند تا مثل بقیهٔ اعضا
 * مفصل بالایی بالای تصویر و مفصل پایینی پایین آن باشد — همان چیزی که ریگ انتظار دارد.
 */
export function sliceBodySheet(sheet, options = {}) {
  const keyed = keyOutBackgroundToAlpha(sheet);
  const withAlpha = keyed
    ? { width: sheet.width, height: sheet.height, pixels: keyed.pixels }
    : sheet;
  const body = cropToContentBbox(withAlpha);
  if (!body) return { ok: false, error: 'پس از حذف پس‌زمینه، بدنی در تصویر باقی نماند' };

  const m = measureFigure(body);
  if (!m.ok) return { ok: false, error: m.error };

  const H = body.height;
  const ov = Math.round(H * (Number.isFinite(options.overlapRatio) ? options.overlapRatio : OVERLAP_RATIO));
  const L = VERTICAL_LANDMARKS;
  const yChin = H * L.chinRatio;
  const yNeck = H * L.neckRatio;
  const yWaist = H * L.waistRatio;
  const yHip = H * L.hipRatio;
  const yKnee = H * L.kneeRatio;
  const yAnkle = H * L.ankleRatio;

  const parts = new Map();
  const put = (name, img) => { if (img && img.width > 1 && img.height > 1) parts.set(name, img); };

  // تنه و سر: نوارهای افقی از ستون بدن، با کمی هم‌پوشانی
  const bodyPad = Math.round((m.bodyRight - m.bodyLeft) * 0.18);
  const bx0 = m.bodyLeft - bodyPad;
  const bx1 = m.bodyRight + bodyPad;

  put('head', cutRect(body, bx0, 0, bx1, yChin + ov));
  put('neck', cutRect(body, (m.bodyLeft + m.bodyRight) / 2 - (m.bodyRight - m.bodyLeft) * 0.22,
                      yChin - ov, (m.bodyLeft + m.bodyRight) / 2 + (m.bodyRight - m.bodyLeft) * 0.22, yNeck + ov));
  put('torso', cutRect(body, bx0, yNeck - ov, bx1, yWaist + ov));
  put('pelvis', cutRect(body, bx0, yWaist - ov, bx1, yHip + ov));

  // پاها: ستون چپ و راست جدا شده با فاصلهٔ اندازه‌گیری‌شدهٔ بین دو پا
  const legPad = Math.round((m.bodyRight - m.bodyLeft) * 0.10);
  const legs = [
    { side: 'r', x0: m.bodyLeft - legPad, x1: m.legSplitX + legPad },
    { side: 'l', x0: m.legSplitX - legPad, x1: m.bodyRight + legPad }
  ];
  for (const leg of legs) {
    put(`thigh_${leg.side}`, cutRect(body, leg.x0, yHip - ov, leg.x1, yKnee + ov));
    put(`shin_${leg.side}`, cutRect(body, leg.x0, yKnee - ov, leg.x1, yAnkle + ov));
    put(`foot_${leg.side}`, cutRect(body, leg.x0, yAnkle - ov, leg.x1, H));
  }

  // دست‌ها: نوار افقی شانه، از بدن به سمت بیرون تقسیم می‌شود و بعد عمودی می‌شود
  const armPadY = Math.round((m.armBottom - m.armTop) * 0.22);
  const ay0 = m.armTop - armPadY;
  const ay1 = m.armBottom + armPadY;

  const arms = [
    // دست سمت چپِ تصویر = سمت راست کاراکتر؛ شانه در لبهٔ راستِ نوار است
    { side: 'r', outer: m.armSpanLeft, inner: m.bodyLeft, dir: 'ccw' },
    { side: 'l', outer: m.armSpanRight, inner: m.bodyRight, dir: 'cw' }
  ];
  for (const arm of arms) {
    const len = Math.abs(arm.inner - arm.outer);
    if (len < 8) continue;
    const sign = arm.outer < arm.inner ? -1 : 1; // جهت حرکت از بدن به بیرون
    const seg = (fromFrac, toFrac) => {
      const a = arm.inner + sign * len * fromFrac;
      const b = arm.inner + sign * len * toFrac;
      const pad = len * 0.03;
      return cutRect(body, Math.min(a, b) - pad, ay0, Math.max(a, b) + pad, ay1);
    };
    const u = ARM_SEGMENTS.upperarm;
    const f = u + ARM_SEGMENTS.forearm;
    put(`upperarm_${arm.side}`, rotate90(seg(0, u), arm.dir));
    put(`forearm_${arm.side}`, rotate90(seg(u, f), arm.dir));
    put(`hand_${arm.side}`, rotate90(seg(f, 1), arm.dir));
  }

  return { ok: true, parts, landmarks: m, warnings: m.warnings, body };
}
