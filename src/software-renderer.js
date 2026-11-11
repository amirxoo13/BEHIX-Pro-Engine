/**
 * رندر نرم‌افزاری CPU با بافت واقعی اطلس — بدون Canvas، بدون GPU.
 *
 * رفع باگ‌ها و بهبودهای فاز ۱ و ۲:
 *  - #8:  پارسر اطلس دست‌ساز حذف شد؛ از parseAtlas و atlasLookup/drawSkeletonGeometry
 *         خود موتور استفاده می‌شود (rotate/offsets/trim درست)، رنگ اسلات (tint)،
 *         dark tint دو-رنگ و blend (normal/additive/multiply/screen) اعمال می‌شوند،
 *         و چون فیلتر اطلس Linear است نمونه‌برداری bilinear شد.
 *  - #16: طول بافر RGBA با ابعاد هدر مقایسه می‌شود.
 *  - #6:  دوربین (worldX/worldY/scale) یکجا از options می‌آید؛ مقدار ثابت دوگانه حذف شد.
 *  - فاز ۱/۲: پشتیبانی از اطلس مستقل برای هر کاراکتر (loadAtlas با مسیر نسبی مجاز + کش چندگانه)
 *             و خواندن مستقیم هم فایل .rgba و هم فایل .png با دیکدر خالص CPU.
 *             اگر اطلس اختصاصی کاراکتر خراب یا ناموجود باشد خطای صریح پرتاب می‌شود و به اطلس nila برنمی‌گردد.
 *  - فاز ۱/۲: پشتیبانی از تصویر ثابت پس‌زمینهٔ صحنه (backgroundImage) روی رستر CPU پشت کاراکترها،
 *             با حفظ کامل مسیر رنگ تخت (#rrggbb) به عنوان fallback.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { inflateSync, deflateSync } from 'zlib';
import { parseAtlas, atlasLookup, drawSkeletonGeometry, geometryCache } from '../engine/rigby-core/index.js';
import { resolveSafeAssetPath, PROJECT_ROOT } from './rigby-adapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ATLAS_REL = 'examples/atlas/scene.nila.atlas';

const atlasCacheMap = new Map();
const imageCacheMap = new Map();

/** جدول CRC32 برای نوشتن چانک‌های استاندارد PNG روی CPU */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * دیکد کردن فایل PNG (8-bit RGBA/RGB/Grayscale/Palette) به بافر خام RGBA روی CPU بدون هیچ کتابخانهٔ GPU/Canvas
 * @param {Buffer} buf
 * @returns {{width: number, height: number, pixels: Uint8Array}}
 */
export function decodePngBuffer(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 8 || buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    throw new Error('فایل PNG معتبر نیست (هدر نامعتبر)');
  }
  let offset = 8;
  let width = 0, height = 0, bitDepth = 8, colorType = 6;
  const idatChunks = [];
  let palette = null;
  let trns = null;

  while (offset + 8 <= buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buf.subarray(offset + 8, offset + 8 + len);
    offset += 12 + len;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'PLTE') {
      palette = data;
    } else if (type === 'tRNS') {
      trns = data;
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (width <= 0 || height <= 0 || !idatChunks.length) {
    throw new Error('اطلاعات تصویر PNG ناقص است');
  }

  const raw = inflateSync(Buffer.concat(idatChunks));
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const bpp = Math.max(1, Math.floor((channels * bitDepth) / 8));
  const stride = width * bpp;
  const recon = new Uint8Array(height * stride);

  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    return pb <= pc ? b : c;
  };

  let inPos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[inPos++];
    const rowOffset = y * stride;
    const prevOffset = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const byte = raw[inPos++];
      const a = x >= bpp ? recon[rowOffset + x - bpp] : 0;
      const b = y > 0 ? recon[prevOffset + x] : 0;
      const c = (x >= bpp && y > 0) ? recon[prevOffset + x - bpp] : 0;
      let val = byte;
      if (filter === 1) val = (byte + a) & 255;
      else if (filter === 2) val = (byte + b) & 255;
      else if (filter === 3) val = (byte + ((a + b) >> 1)) & 255;
      else if (filter === 4) val = (byte + paeth(a, b, c)) & 255;
      recon[rowOffset + x] = val;
    }
  }

  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    if (colorType === 6) {
      const s = i * 4;
      pixels[o] = recon[s];
      pixels[o + 1] = recon[s + 1];
      pixels[o + 2] = recon[s + 2];
      pixels[o + 3] = recon[s + 3];
    } else if (colorType === 2) {
      const s = i * 3;
      pixels[o] = recon[s];
      pixels[o + 1] = recon[s + 1];
      pixels[o + 2] = recon[s + 2];
      pixels[o + 3] = 255;
    } else if (colorType === 4) {
      const s = i * 2;
      pixels[o] = recon[s];
      pixels[o + 1] = recon[s];
      pixels[o + 2] = recon[s];
      pixels[o + 3] = recon[s + 1];
    } else if (colorType === 3 && palette) {
      const idx = recon[i];
      pixels[o] = palette[idx * 3] || 0;
      pixels[o + 1] = palette[idx * 3 + 1] || 0;
      pixels[o + 2] = palette[idx * 3 + 2] || 0;
      pixels[o + 3] = (trns && idx < trns.length) ? trns[idx] : 255;
    } else {
      const v = recon[i];
      pixels[o] = v;
      pixels[o + 1] = v;
      pixels[o + 2] = v;
      pixels[o + 3] = 255;
    }
  }

  return { width, height, pixels };
}

/**
 * انکد کردن بافر خام RGBA به فرمت استاندارد PNG (با کانال آلفا) روی CPU
 * @param {number} width
 * @param {number} height
 * @param {Uint8Array} rgbaPixels
 * @returns {Buffer}
 */
export function encodePngBuffer(width, height, rgbaPixels) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0;
    const srcStart = y * stride;
    Buffer.from(rgbaPixels.buffer, rgbaPixels.byteOffset + srcStart, stride).copy(raw, rowStart + 1);
  }
  const compressed = deflateSync(raw);

  const makeChunk = (type, data) => {
    const chunk = Buffer.alloc(12 + data.length);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const crc = crc32(chunk.subarray(4, 8 + data.length));
    chunk.writeUInt32BE(crc, 8 + data.length);
    return chunk;
  };

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

/** خواندن فایل RGBA خام (با هدر ۸ بایتی width/height) یا فایل PNG از دیسک (فقط از مسیر نسبی مجاز) */
export function loadRgbaOrPngFile(filePath, allowedRoot = null) {
  const full = resolveSafeAssetPath(filePath, DEFAULT_ATLAS_REL, allowedRoot);
  if (imageCacheMap.has(full)) return imageCacheMap.get(full);

  const buf = readFileSync(full);
  let result;
  if (full.endsWith('.rgba')) {
    if (buf.length < 8) throw new Error('فایل RGBA اطلس کوتاه‌تر از هدر است');
    const width = buf.readUInt32LE(0);
    const height = buf.readUInt32LE(4);
    const expected = 8 + width * height * 4;
    if (buf.length !== expected) {
      throw new Error(`طول فایل RGBA (${buf.length}) با هدر ${width}x${height} نمی‌خواند (انتظار ${expected})`);
    }
    result = { width, height, pixels: buf.subarray(8) };
  } else {
    result = decodePngBuffer(buf);
  }
  imageCacheMap.set(full, result);
  return result;
}

/** نوشتن بافر RGBA با هدر ۸ بایتی (سازگار با ساختار scene.nila.rgba) */
export function saveRgbaFile(width, height, rgbaPixels, filePath) {
  const header = Buffer.alloc(8);
  header.writeUInt32LE(width, 0);
  header.writeUInt32LE(height, 4);
  writeFileSync(filePath, Buffer.concat([header, Buffer.from(rgbaPixels.buffer, rgbaPixels.byteOffset, rgbaPixels.byteLength)]));
  return filePath;
}

/**
 * لود صفحهٔ اطلس: پیکسل‌های خام RGBA + توصیف ناحیه‌ها با پارسر رسمی موتور.
 * از مسیر نسبی دلخواه داخل examples/ یا assets/ پشتیبانی می‌کند تا هر کاراکتر اطلس خودش را داشته باشد.
 */
export function loadAtlas(atlasRelPath = null, options = {}) {
  const targetRel = atlasRelPath || DEFAULT_ATLAS_REL;
  const fullAtlasPath = resolveSafeAssetPath(targetRel, DEFAULT_ATLAS_REL, options.allowedRoot || null);
  if (!options.noCache && atlasCacheMap.has(fullAtlasPath)) {
    return atlasCacheMap.get(fullAtlasPath);
  }

  const atlasText = readFileSync(fullAtlasPath, 'utf8');
  const atlas = parseAtlas(atlasText);
  const atlasDirRel = relative(PROJECT_ROOT, dirname(fullAtlasPath));

  const page0Name = atlas.pages?.[0]?.name || 'scene.nila.png';
  const baseNoExt = page0Name.replace(/\.[^.]+$/, '');
  const rgbaRel = join(atlasDirRel, `${baseNoExt}.rgba`);
  const pngRel = join(atlasDirRel, page0Name);
  const altRgbaRel = targetRel.replace(/\.atlas$/, '.rgba');
  const altPngRel = targetRel.replace(/\.atlas$/, '.png');

  let texData = null;
  for (const candRel of [rgbaRel, altRgbaRel, pngRel, altPngRel]) {
    const fullCand = resolveSafeAssetPath(candRel, DEFAULT_ATLAS_REL, options.allowedRoot || null);
    if (existsSync(fullCand)) {
      texData = loadRgbaOrPngFile(candRel, options.allowedRoot || null);
      break;
    }
  }
  if (!texData) {
    throw new Error(`فایل تصویر اطلس برای "${targetRel}" پیدا نشد`);
  }

  const { width, height, pixels } = texData;
  const texture = { width, height, pixels };
  const lookup = atlasLookup(atlas, (page) => {
    if (!page.width) page.width = width;
    if (!page.height) page.height = height;
    return texture;
  });

  const entry = { width, height, pixels, atlas, lookup, texture, path: fullAtlasPath };
  if (!options.noCache) {
    atlasCacheMap.set(fullAtlasPath, entry);
  }
  return entry;
}

/** پاک کردن کش اطلس و تصاویر (در صورت بازسازی دارایی) */
export function clearAtlasCache() {
  atlasCacheMap.clear();
  imageCacheMap.clear();
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

/**
 * ساخت بافر فریم اولیه:
 *  - ابتدا رنگ تخت پس‌زمینه (یا پیش‌فرض تیره) را پر می‌کند.
 *  - اگر backgroundImage داده شده باشد (مسیر نسبی فایل PNG/RGBA یا شیء {width, height, pixels})،
 *    تصویر ثابت پس‌زمینه را با نمونه‌برداری bilinear روی کل فریم می‌کشد.
 */
export function createFrame(width = 1280, height = 720, background = null, backgroundImage = null, allowedRoot = null, onWarning = null) {
  let color = background;
  let bgImg = backgroundImage;
  if (background && typeof background === 'object' && !Array.isArray(background)) {
    color = background.color || null;
    bgImg = background.image || background.backgroundImage || bgImg;
  }
  const [br, bg, bb] = Array.isArray(color) ? color : [28, 32, 40];
  const pixels = new Uint8Array(width * height * 3);
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = br;
    pixels[i + 1] = bg;
    pixels[i + 2] = bb;
  }
  const frame = { width, height, pixels, backgroundDrawn: false };

  if (bgImg) {
    try {
      const tex = (typeof bgImg === 'string')
        ? loadRgbaOrPngFile(bgImg, allowedRoot)
        : (bgImg.pixels && bgImg.width && bgImg.height ? bgImg : null);
      if (tex) {
        drawBackgroundImage(frame, tex);
        frame.backgroundDrawn = true;
      }
    } catch (err) {
      if (onWarning) onWarning(`تصویر پس‌زمینه "${bgImg}" بارگذاری نشد (${err.message})؛ استفاده از رنگ تخت fallback`);
    }
  }
  return frame;
}

/** رسم تصویر ثابت پس‌زمینه روی کل فریم با مقیاس‌بندی bilinear روی CPU */
export function drawBackgroundImage(frame, tex) {
  const { width, height, pixels } = frame;
  const samp = [0, 0, 0, 0];
  for (let y = 0; y < height; y++) {
    const v = (y + 0.5) / height;
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      samplePage(tex, u, v, samp);
      const a = samp[3] / 255;
      if (a <= 0.003) continue;
      const idx = (y * width + x) * 3;
      if (a >= 0.997) {
        pixels[idx] = Math.round(samp[0]);
        pixels[idx + 1] = Math.round(samp[1]);
        pixels[idx + 2] = Math.round(samp[2]);
      } else {
        pixels[idx] = Math.round(samp[0] * a + pixels[idx] * (1 - a));
        pixels[idx + 1] = Math.round(samp[1] * a + pixels[idx + 1] * (1 - a));
        pixels[idx + 2] = Math.round(samp[2] * a + pixels[idx + 2] * (1 - a));
      }
    }
  }
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
    default:
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
 * هر کاراکتر می‌تواند اسکلت (ch.skeleton) و اطلس (ch.atlasPath یا ch.lookup) اختصاصی خود را داشته باشد.
 * اگر ch.atlasPath مشخص شده باشد و خراب یا ناموجود باشد، خطا پرتاب می‌شود و به اطلس nila برنمی‌گردد.
 * @param {Array<{pose, skeleton?, atlasPath?, lookup?, offsetX?, offsetY?}>} characters
 * @param {object} options - width, height, worldX, worldY, scale, skeleton, background, backgroundImage
 */
export function renderCharacters(characters, options = {}) {
  const width = options.width || 1280;
  const height = options.height || 720;
  const warnings = [];
  const onWarn = (msg) => {
    warnings.push(msg);
    if (typeof options.onWarning === 'function') options.onWarning(msg);
  };

  const frame = createFrame(
    width,
    height,
    options.background || null,
    options.backgroundImage || null,
    options.allowedRoot || null,
    onWarn
  );

  let defaultLookup = null;
  const getDefaultLookup = () => {
    if (!defaultLookup) {
      defaultLookup = loadAtlas(options.atlasPath || null, { allowedRoot: options.allowedRoot || null }).lookup;
    }
    return defaultLookup;
  };

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

    let charLookup = ch.lookup || null;
    if (!charLookup && ch.atlasPath) {
      charLookup = loadAtlas(ch.atlasPath, { allowedRoot: options.allowedRoot || null }).lookup;
    }
    if (!charLookup) {
      charLookup = getDefaultLookup();
    }

    drawSkeletonGeometry(skeleton, pose, charLookup, (tex, blend, positions, uvs, triangles, light, dark) => {
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

  frame.meta = { drawn, backgroundDrawn: frame.backgroundDrawn, warnings };
  return frame;
}

/** رندر یک pose تکی (خروجی computePose) */
export function renderPose(poseResult, options = {}) {
  const pose = poseResult?.pose;
  const skeleton = options.skeleton;
  if (pose && skeleton) return renderCharacters([{ pose, skeleton }], options);
  return createFrame(options.width || 1280, options.height || 720, options.background || null, options.backgroundImage || null);
}

export function savePpm(frame, filePath) {
  const header = `P6\n${frame.width} ${frame.height}\n255\n`;
  writeFileSync(filePath, Buffer.concat([Buffer.from(header), Buffer.from(frame.pixels)]));
  return filePath;
}
