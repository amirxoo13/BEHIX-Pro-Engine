/**
 * اولویت ۴: رندر نرم‌افزاری CPU
 * pose ریگبی را به فریم تصویر تبدیل می‌کند (بدون Canvas و بدون GPU).
 *
 * نسخهٔ اولیه: خروجی PPM (متن ساده) که بدون هیچ کتابخانهٔ خارجی کار می‌کند.
 * می‌توان بعداً به PNG تبدیل کرد.
 */

import { writeFileSync } from 'fs';

export function createFrame(width = 640, height = 360) {
  const pixels = new Uint8Array(width * height * 3);
  // پس‌زمینه خاکستری روشن
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = 240;
    pixels[i + 1] = 240;
    pixels[i + 2] = 245;
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

function fillRect(frame, x0, y0, x1, y1, color) {
  const [r, g, b] = color;
  const left = Math.max(0, Math.floor(Math.min(x0, x1)));
  const right = Math.min(frame.width - 1, Math.floor(Math.max(x0, x1)));
  const top = Math.max(0, Math.floor(Math.min(y0, y1)));
  const bottom = Math.min(frame.height - 1, Math.floor(Math.max(y0, y1)));
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      setPixel(frame, x, y, r, g, b);
    }
  }
}

/**
 * رندر pose به فریم
 * @param {object} poseResult
 * @param {object} options
 */
export function renderPose(poseResult, options = {}) {
  const width = options.width || 640;
  const height = options.height || 360;
  const frame = createFrame(width, height);

  // placeholder بصری بر اساس تعداد quad
  const cx = width / 2;
  const cy = height / 2;
  const size = 60 + Math.min(100, (poseResult.quadCount || 0) * 1.2);
  fillRect(frame, cx - size, cy - size, cx + size, cy + size, [80, 140, 220]);

  // نوار وضعیت
  fillRect(frame, 0, height - 24, width, height, [50, 50, 60]);

  return frame;
}

/** ذخیره به‌صورت PPM (P6) */
export function savePpm(frame, filePath) {
  const header = `P6\n${frame.width} ${frame.height}\n255\n`;
  const body = Buffer.from(frame.pixels);
  writeFileSync(filePath, Buffer.concat([Buffer.from(header), body]));
  return filePath;
}
