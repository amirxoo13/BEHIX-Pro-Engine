/**
 * رندر نرم‌افزاری CPU با بافت واقعی اطلس
 * هندسهٔ pose.quads را با rasterizer مثلثی رسم و از دادهٔ خام RGBA اطلس نمونه‌برداری می‌کند.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let atlasCache = null;

function loadAtlas() {
  if (atlasCache) return atlasCache;

  const base = join(__dirname, '..', 'examples', 'atlas');
  const rgbaPath = join(base, 'scene.nila.rgba');
  const atlasPath = join(base, 'scene.nila.atlas');

  const buf = readFileSync(rgbaPath);
  const width = buf.readUInt32LE(0);
  const height = buf.readUInt32LE(4);
  const pixels = buf.subarray(8);

  const regions = new Map();
  const text = readFileSync(atlasPath, 'utf8');
  let current = null;
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('size:') || t.startsWith('filter:') || t.endsWith('.png')) continue;
    if (t.startsWith('bounds:')) {
      if (current) {
        const [x, y, w, h] = t.slice(7).split(',').map(Number);
        regions.set(current, { x, y, w, h });
      }
    } else {
      current = t;
    }
  }

  atlasCache = { width, height, pixels, regions };
  return atlasCache;
}

function sampleAtlas(atlas, name, u, v) {
  const r = atlas.regions.get(name);
  if (!r) return [180, 180, 180, 255];
  const px = Math.max(0, Math.min(r.w - 1, Math.floor(u * r.w)));
  const py = Math.max(0, Math.min(r.h - 1, Math.floor(v * r.h)));
  const ix = r.x + px;
  const iy = r.y + py;
  if (ix < 0 || iy < 0 || ix >= atlas.width || iy >= atlas.height) return [0, 0, 0, 0];
  const idx = (iy * atlas.width + ix) * 4;
  return [
    atlas.pixels[idx],
    atlas.pixels[idx + 1],
    atlas.pixels[idx + 2],
    atlas.pixels[idx + 3]
  ];
}

export function createFrame(width = 1280, height = 720) {
  const pixels = new Uint8Array(width * height * 3);
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = 28;
    pixels[i + 1] = 32;
    pixels[i + 2] = 40;
  }
  return { width, height, pixels };
}

function setPixel(frame, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= frame.width || y >= frame.height || a < 8) return;
  const idx = (frame.width * y + x) * 3;
  if (a >= 250) {
    frame.pixels[idx] = r;
    frame.pixels[idx + 1] = g;
    frame.pixels[idx + 2] = b;
  } else {
    const af = a / 255;
    frame.pixels[idx] = Math.round(r * af + frame.pixels[idx] * (1 - af));
    frame.pixels[idx + 1] = Math.round(g * af + frame.pixels[idx + 1] * (1 - af));
    frame.pixels[idx + 2] = Math.round(b * af + frame.pixels[idx + 2] * (1 - af));
  }
}

function worldToScreen(wx, wy, cam) {
  const sx = cam.cx + (wx - cam.worldX) * cam.scale;
  const sy = cam.cy - (wy - cam.worldY) * cam.scale;
  return [sx, sy];
}

function rasterTriangleTextured(frame, atlas, name, p0, p1, p2, uv0, uv1, uv2) {
  let minX = Math.max(0, Math.floor(Math.min(p0[0], p1[0], p2[0])));
  let maxX = Math.min(frame.width - 1, Math.ceil(Math.max(p0[0], p1[0], p2[0])));
  let minY = Math.max(0, Math.floor(Math.min(p0[1], p1[1], p2[1])));
  let maxY = Math.min(frame.height - 1, Math.ceil(Math.max(p0[1], p1[1], p2[1])));
  if (minX > maxX || minY > maxY) return;

  const area = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1]);
  if (Math.abs(area) < 0.5) return;
  const inv = 1 / area;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const w0 = ((p1[0] - x) * (p2[1] - y) - (p2[0] - x) * (p1[1] - y)) * inv;
      const w1 = ((p2[0] - x) * (p0[1] - y) - (p0[0] - x) * (p2[1] - y)) * inv;
      const w2 = 1 - w0 - w1;
      if (w0 >= -0.001 && w1 >= -0.001 && w2 >= -0.001) {
        const u = w0 * uv0[0] + w1 * uv1[0] + w2 * uv2[0];
        const v = w0 * uv0[1] + w1 * uv1[1] + w2 * uv2[1];
        const [r, g, b, a] = sampleAtlas(atlas, name, u, v);
        setPixel(frame, x, y, r, g, b, a);
      }
    }
  }
}

/**
 * رندر کاراکترها با بافت واقعی
 * @param {Array<{pose, offsetX?, offsetY?}>} characters
 */
export function renderCharacters(characters, options = {}) {
  const width = options.width || 1280;
  const height = options.height || 720;
  const frame = createFrame(width, height);
  const atlas = loadAtlas();

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
    if (!pose?.quads) continue;
    const ox = ch.offsetX || 0;
    const oy = ch.offsetY || 0;

    for (const q of pose.quads) {
      const name = q.image || q.attachment?.image || q.attachment?.name;
      const pts = q.positions;
      const uvs = q.uvs;
      if (!pts || !uvs || pts.length < 3) continue;

      const screen = pts.map(p => worldToScreen(p[0] + ox, p[1] + oy, cam));

      if (q.kind === 'region' && pts.length >= 4 && uvs.length >= 4) {
        rasterTriangleTextured(frame, atlas, name, screen[0], screen[1], screen[2], uvs[0], uvs[1], uvs[2]);
        rasterTriangleTextured(frame, atlas, name, screen[0], screen[2], screen[3], uvs[0], uvs[2], uvs[3]);
        drawn++;
      } else if (q.triangles && pts.length >= 3) {
        for (let t = 0; t + 2 < q.triangles.length; t += 3) {
          const i0 = q.triangles[t];
          const i1 = q.triangles[t + 1];
          const i2 = q.triangles[t + 2];
          if (screen[i0] && screen[i1] && screen[i2] && uvs[i0] && uvs[i1] && uvs[i2]) {
            rasterTriangleTextured(frame, atlas, name, screen[i0], screen[i1], screen[i2], uvs[i0], uvs[i1], uvs[i2]);
          }
        }
        drawn++;
      }
    }
  }

  frame.meta = { drawn };
  return frame;
}

export function renderPose(poseResult, options = {}) {
  if (poseResult?.quads) return renderCharacters([{ pose: poseResult }], options);
  return createFrame(options.width || 1280, options.height || 720);
}

export function savePpm(frame, filePath) {
  const header = `P6\n${frame.width} ${frame.height}\n255\n`;
  writeFileSync(filePath, Buffer.concat([Buffer.from(header), Buffer.from(frame.pixels)]));
  return filePath;
}
