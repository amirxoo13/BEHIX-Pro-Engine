/**
 * رندر نرم‌افزاری CPU — نسخهٔ حرفه‌ای
 * هندسهٔ واقعی pose.quads (region و mesh) را با rasterizer مثلثی رسم می‌کند.
 * بدون Canvas و بدون GPU.
 */

import { writeFileSync } from 'fs';

export function createFrame(width = 1280, height = 720) {
  const pixels = new Uint8Array(width * height * 3);
  // پس‌زمینهٔ سینمایی تیره
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = 28;
    pixels[i + 1] = 32;
    pixels[i + 2] = 40;
  }
  return { width, height, pixels };
}

function setPixel(frame, x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= frame.width || y >= frame.height) return;
  const idx = (frame.width * y + x) * 3;
  frame.pixels[idx] = r;
  frame.pixels[idx + 1] = g;
  frame.pixels[idx + 2] = b;
}

/** تبدیل مختصات جهان به صفحه با دوربین ساده */
function worldToScreen(wx, wy, cam) {
  const sx = cam.cx + (wx - cam.worldX) * cam.scale;
  const sy = cam.cy - (wy - cam.worldY) * cam.scale; // Y بالا در جهان
  return [sx, sy];
}

/** rasterizer مثلث (barycentric) */
function rasterTriangle(frame, p0, p1, p2, color) {
  const [r, g, b] = color;
  let minX = Math.max(0, Math.floor(Math.min(p0[0], p1[0], p2[0])));
  let maxX = Math.min(frame.width - 1, Math.ceil(Math.max(p0[0], p1[0], p2[0])));
  let minY = Math.max(0, Math.floor(Math.min(p0[1], p1[1], p2[1])));
  let maxY = Math.min(frame.height - 1, Math.ceil(Math.max(p0[1], p1[1], p2[1])));
  if (minX > maxX || minY > maxY) return;

  const area = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1]);
  if (Math.abs(area) < 0.5) return;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const w0 = (p1[0] - x) * (p2[1] - y) - (p2[0] - x) * (p1[1] - y);
      const w1 = (p2[0] - x) * (p0[1] - y) - (p0[0] - x) * (p2[1] - y);
      const w2 = (p0[0] - x) * (p1[1] - y) - (p1[0] - x) * (p0[1] - y);
      if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) {
        setPixel(frame, x, y, r, g, b);
      }
    }
  }
}

function colorForAttachment(att, index) {
  // رنگ بر اساس نام یا اندیس برای تمایز بخش‌ها (تا وقتی بافت کامل وصل شود)
  const name = (att?.name || att?.image || '').toLowerCase();
  if (name.includes('hair')) return [60, 40, 30];
  if (name.includes('skin') || name.includes('face') || name.includes('head') || name.includes('body')) return [240, 200, 170];
  if (name.includes('eye')) return [40, 80, 140];
  if (name.includes('cloth') || name.includes('dress') || name.includes('shirt') || name.includes('top')) return [180, 60, 90];
  if (name.includes('leg') || name.includes('pant')) return [70, 90, 130];
  // رنگ چرخشی برای بقیه
  const hue = (index * 47) % 360;
  const [rr, gg, bb] = hslToRgb(hue, 0.45, 0.55);
  return [rr, gg, bb];
}

function hslToRgb(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/**
 * رندر یک یا چند کاراکتر به فریم
 * @param {Array<{poseResult, offsetX?, offsetY?}>} characters
 * @param {object} options
 */
export function renderCharacters(characters, options = {}) {
  const width = options.width || 1280;
  const height = options.height || 720;
  const frame = createFrame(width, height);

  const cam = {
    worldX: options.worldX ?? 0,
    worldY: options.worldY ?? 1400,
    scale: options.scale ?? 0.28,
    cx: width / 2,
    cy: height / 2
  };

  let drawn = 0;
  for (const ch of characters) {
    const pose = ch.pose;
    if (!pose || !pose.quads) continue;
    const ox = ch.offsetX || 0;
    const oy = ch.offsetY || 0;

    pose.quads.forEach((q, qi) => {
      const color = colorForAttachment(q.attachment, qi);
      const pts = q.positions;
      if (!pts || pts.length < 3) return;

      // دو مثلث برای هر region (۴ نقطه) یا مثلث‌های mesh
      if (q.kind === 'region' && pts.length >= 4) {
        const s = pts.map(p => worldToScreen(p[0] + ox, p[1] + oy, cam));
        rasterTriangle(frame, s[0], s[1], s[2], color);
        rasterTriangle(frame, s[0], s[2], s[3], color);
        drawn++;
      } else if (q.triangles && pts.length >= 3) {
        const s = pts.map(p => worldToScreen(p[0] + ox, p[1] + oy, cam));
        for (let t = 0; t + 2 < q.triangles.length; t += 3) {
          const i0 = q.triangles[t];
          const i1 = q.triangles[t + 1];
          const i2 = q.triangles[t + 2];
          if (s[i0] && s[i1] && s[i2]) {
            rasterTriangle(frame, s[i0], s[i1], s[i2], color);
          }
        }
        drawn++;
      }
    });
  }

  frame.meta = { drawn };
  return frame;
}

/** سازگاری با API قبلی */
export function renderPose(poseResult, options = {}) {
  // poseResult از computePose فقط آمار دارد؛ برای رندر واقعی باید quads داشته باشیم
  // این تابع فقط وقتی quads تزریق شده باشد کار می‌کند
  if (poseResult && poseResult.quads) {
    return renderCharacters([{ pose: poseResult }], options);
  }
  // اگر فقط آمار بود، فریم خالی با پس‌زمینه برگردان
  return createFrame(options.width || 1280, options.height || 720);
}

export function savePpm(frame, filePath) {
  const header = `P6\n${frame.width} ${frame.height}\n255\n`;
  const body = Buffer.from(frame.pixels);
  writeFileSync(filePath, Buffer.concat([Buffer.from(header), body]));
  return filePath;
}
