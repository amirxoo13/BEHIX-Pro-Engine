/**
 * رندر نرم‌افزاری CPU با بافت واقعی اطلس — بدون Canvas، بدون GPU.
 *
 * رفع باگ‌ها:
 *  - #8:  پارسر اطلس دست‌ساز حذف شد؛ از parseAtlas و atlasLookup/drawSkeletonGeometry
 *         خود موتور استفاده می‌شود (rotate/offsets/trim درست)، رنگ اسلات (tint)،
 *         dark tint و blend (normal/additive/multiply/screen) اعمال می‌شوند،
 *         و چون فیلتر اطلس Linear است نمونه‌برداری bilinear شد.
 *  - #16: طول بافر RGBA با ابعاد هدر مقایسه می‌شود.
 *  - #6:  دوربین (worldX/worldY/scale) یکجا از options می‌آید؛ مقدار ثابت دوگانه حذف شد.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseAtlas, atlasLookup, drawSkeletonGeometry, geometryCache } from '../engine/rigby-core/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let atlasCache = null;

/** لود صفحهٔ اطلس: پیکسل‌های خام RGBA + توصیف ناحیه‌ها با پارسر رسمی موتور */
export function loadAtlas() {
  if (atlasCache) return atlasCache;

  const base = join(__dirname, '..', 'examples', 'atlas');
  const rgbaPath = join(base, 'scene.nila.rgba');
  const atlasPath = join(base, 'scene.nila.atlas');

  const buf = readFileSync(rgbaPath);
  if (buf.length < 8) throw new Error('فایل RGBA اطلس کوتاه‌تر از هدر است');
  const width = buf.readUInt32LE(0);
  const height = buf.readUInt32LE(4);
  const expected = 8 + width * height * 4;
  if (buf.length !== expected) {
    // باگ #16: ناسازگاری هدر و طول واقعی ⇒ خواندن از offset غلط ممنوع
    throw new Error(`طول فایل RGBA (${buf.length}) با هدر ${width}x${height} نمی‌خواند (انتظار ${expected})`);
  }
  const pixels = buf.subarray(8);

  const atlas = parseAtlas(readFileSync(atlasPath, 'utf8'));
  // بافت هر صفحه: همان پیکسل‌های خام. (یک صفحه داریم: scene.nila.png)
  const texture = { width, height, pixels };
  const lookup = atlasLookup(atlas, (page) => {
    if (!page.width) page.width = width;
    if (!page.height) page.height = height;
    return texture;
  });

  atlasCache = { width, height, pixels, atlas, lookup, texture };
  return atlasCache;
}

/** نمونه‌برداری bilinear از UV صفحه (۰..۱ روی کل صفحه) — مطابق filter: Linear اطلس */
function samplePage(tex, u, v, out) {
  const fx = Math.min(tex.width - 1, Math.max(0, u * tex.width - 0.5));
  const fy = Math.min(tex.height - 1, Math.max(0, v * tex.height - 0.5));
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(tex.width - 1, x0 + 1);
  const y1 = Math.min(tex.height - 1, y0 + 1);
  const tx = fx - x0;
  const ty = fy - y0;
  const p = tex.pixels;
  const i00 = (y0 * tex.width + x0) * 4;
  const i10 = (y0 * tex.width + x1) * 4;
  const i01 = (y1 * tex.width + x0) * 4;
  const i11 = (y1 * tex.width + x1) * 4;
  const w00 = (1 - tx) * (1 - ty);
  const w10 = tx * (1 - ty);
  const w01 = (1 - tx) * ty;
  const w11 = tx * ty;
  out[0] = p[i00] * w00 + p[i10] * w10 + p[i01] * w01 + p[i11] * w11;
  out[1] = p[i00 + 1] * w00 + p[i10 + 1] * w10 + p[i01 + 1] * w01 + p[i11 + 1] * w11;
  out[2] = p[i00 + 2] * w00 + p[i10 + 2] * w10 + p[i01 + 2] * w01 + p[i11 + 2] * w11;
  out[3] = p[i00 + 3] * w00 + p[i10 + 3] * w10 + p[i01 + 3] * w01 + p[i11 + 3] * w11;
  return out;
}

export function createFrame(width = 1280, height = 720, background = null) {
  const [br, bg, bb] = background || [28, 32, 40];
  const pixels = new Uint8Array(width * height * 3);
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = br;
    pixels[i + 1] = bg;
    pixels[i + 2] = bb;
  }
  return { width, height, pixels };
}

/** ترکیب یک پیکسل روی بافر RGB با blend mode (باگ #8: blend دور ریخته نمی‌شود) */
function blendPixel(frame, x, y, r, g, b, a, blend) {
  if (x < 0 || y < 0 || x >= frame.width || y >= frame.height || a <= 0.003) return;
  const idx = (frame.width * y + x) * 3;
  const px = frame.pixels;
  const dr = px[idx];
  const dg = px[idx + 1];
  const db = px[idx + 2];
  let or_, og, ob;
  switch (blend) {
    case 'additive':
      or_ = dr + r * a;
      og = dg + g * a;
      ob = db + b * a;
      break;
    case 'multiply': {
      const mr = (dr * r) / 255;
      const mg = (dg * g) / 255;
      const mb = (db * b) / 255;
      or_ = mr * a + dr * (1 - a);
      og = mg * a + dg * (1 - a);
      ob = mb * a + db * (1 - a);
      break;
    }
    case 'screen': {
      const sr = 255 - ((255 - dr) * (255 - r)) / 255;
      const sg = 255 - ((255 - dg) * (255 - g)) / 255;
      const sb = 255 - ((255 - db) * (255 - b)) / 255;
      or_ = sr * a + dr * (1 - a);
      og = sg * a + dg * (1 - a);
      ob = sb * a + db * (1 - a);
      break;
    }
    default: // normal (src-over)
      or_ = r * a + dr * (1 - a);
      og = g * a + dg * (1 - a);
      ob = b * a + db * (1 - a);
  }
  px[idx] = Math.min(255, Math.max(0, Math.round(or_)));
  px[idx + 1] = Math.min(255, Math.max(0, Math.round(og)));
  px[idx + 2] = Math.min(255, Math.max(0, Math.round(ob)));
}

function worldToScreen(wx, wy, cam, out) {
  out[0] = cam.cx + (wx - cam.worldX) * cam.scale;
  out[1] = cam.cy - (wy - cam.worldY) * cam.scale;
  return out;
}

const _sample = [0, 0, 0, 0];

/**
 * رستر یک مثلث با UV صفحه، tint روشن، dark tint دو-رنگ و blend.
 * فرمول دو-رنگ: out.rgb = tex.rgb * light.rgb + (1 - tex.rgb) * dark.rgb
 */
function rasterTriangle(frame, tex, p0x, p0y, p1x, p1y, p2x, p2y, uv, i0, i1, i2, light, dark, blend) {
  const minX = Math.max(0, Math.floor(Math.min(p0x, p1x, p2x)));
  const maxX = Math.min(frame.width - 1, Math.ceil(Math.max(p0x, p1x, p2x)));
  const minY = Math.max(0, Math.floor(Math.min(p0y, p1y, p2y)));
  const maxY = Math.min(frame.height - 1, Math.ceil(Math.max(p0y, p1y, p2y)));
  if (minX > maxX || minY > maxY) return;

  const area = (p1x - p0x) * (p2y - p0y) - (p2x - p0x) * (p1y - p0y);
  if (Math.abs(area) < 1e-6) return;
  const inv = 1 / area;

  const u0 = uv[2 * i0], v0 = uv[2 * i0 + 1];
  const u1 = uv[2 * i1], v1 = uv[2 * i1 + 1];
  const u2 = uv[2 * i2], v2 = uv[2 * i2 + 1];

  const lr = light[0], lg = light[1], lb = light[2], la = light[3];
  const hasDark = dark != null;
  const dr = hasDark ? dark[0] * 255 : 0;
  const dg = hasDark ? dark[1] * 255 : 0;
  const db = hasDark ? dark[2] * 255 : 0;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const w0 = ((p1x - x) * (p2y - y) - (p2x - x) * (p1y - y)) * inv;
      const w1 = ((p2x - x) * (p0y - y) - (p0x - x) * (p2y - y)) * inv;
      const w2 = 1 - w0 - w1;
      if (w0 >= -0.001 && w1 >= -0.001 && w2 >= -0.001) {
        const u = w0 * u0 + w1 * u1 + w2 * u2;
        const v = w0 * v0 + w1 * v1 + w2 * v2;
        samplePage(tex, u, v, _sample);
        const a = (_sample[3] / 255) * la;
        if (a <= 0.003) continue;
        let r, g, b;
        if (hasDark) {
          r = _sample[0] * lr + (1 - _sample[0] / 255) * dr;
          g = _sample[1] * lg + (1 - _sample[1] / 255) * dg;
          b = _sample[2] * lb + (1 - _sample[2] / 255) * db;
        } else {
          r = _sample[0] * lr;
          g = _sample[1] * lg;
          b = _sample[2] * lb;
        }
        blendPixel(frame, x, y, r, g, b, a, blend);
      }
    }
  }
}

/**
 * رندر کاراکترها با هندسهٔ رسمی موتور (drawSkeletonGeometry):
 * ترتیب رسم، clipping، UV صفحه، tint و blend همه از خود runtime می‌آیند.
 * @param {Array<{pose, skeleton?, offsetX?, offsetY?}>} characters - pose نمونهٔ Pose موتور است
 * @param {object} options - width, height, worldX, worldY, scale, skeleton (پیش‌فرض برای همه)
 */
export function renderCharacters(characters, options = {}) {
  const width = options.width || 1280;
  const height = options.height || 720;
  const frame = createFrame(width, height, options.background || null);
  const { lookup } = loadAtlas();

  const cam = {
    worldX: options.worldX ?? 0,
    worldY: options.worldY ?? 1400,
    scale: options.scale ?? 0.28,
    cx: width / 2,
    cy: height / 2
  };

  const cache = geometryCache();
  const s0 = [0, 0], s1 = [0, 0], s2 = [0, 0];
  let drawn = 0;

  for (const ch of characters) {
    const pose = ch.pose;
    const skeleton = ch.skeleton || options.skeleton;
    if (!pose || !skeleton) continue;
    const ox = ch.offsetX || 0;
    const oy = ch.offsetY || 0;

    drawSkeletonGeometry(skeleton, pose, lookup, (tex, blend, positions, uvs, triangles, light, dark) => {
      for (let t = 0; t + 2 < triangles.length; t += 3) {
        const i0 = triangles[t], i1 = triangles[t + 1], i2 = triangles[t + 2];
        worldToScreen(positions[2 * i0] + ox, positions[2 * i0 + 1] + oy, cam, s0);
        worldToScreen(positions[2 * i1] + ox, positions[2 * i1 + 1] + oy, cam, s1);
        worldToScreen(positions[2 * i2] + ox, positions[2 * i2 + 1] + oy, cam, s2);
        rasterTriangle(frame, tex, s0[0], s0[1], s1[0], s1[1], s2[0], s2[1], uvs, i0, i1, i2, light, dark, blend);
      }
      drawn++;
    }, { cache });
  }

  frame.meta = { drawn };
  return frame;
}

/** رندر یک pose تکی (خروجی computePose) */
export function renderPose(poseResult, options = {}) {
  const pose = poseResult?.pose;
  const skeleton = options.skeleton;
  if (pose && skeleton) return renderCharacters([{ pose, skeleton }], options);
  return createFrame(options.width || 1280, options.height || 720);
}

export function savePpm(frame, filePath) {
  const header = `P6\n${frame.width} ${frame.height}\n255\n`;
  writeFileSync(filePath, Buffer.concat([Buffer.from(header), Buffer.from(frame.pixels)]));
  return filePath;
}
