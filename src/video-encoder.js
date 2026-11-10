/**
 * اولویت ۵: کدگذاری ویدیو با FFmpeg
 * فریم‌های تولیدشده توسط رندر نرم‌افزاری را به MP4 تبدیل می‌کند.
 *
 * رفع باگ‌ها:
 *  - #1:  outputPath دیگر از کلاینت پذیرفته نمی‌شود؛ خروجی فقط داخل پوشهٔ یکتای کار است
 *  - #2:  duration/fps/width/height اعتبارسنجی و سقف‌دار می‌شوند؛ ابعاد زوج (yuv420p)
 *  - #3:  شنوندهٔ error روی پروسس ffmpeg + settle فقط یک بار (spawn شکست‌خورده سرور را نمی‌کشد)
 *  - #4:  هر کار پوشهٔ موقت یکتا os.tmpdir()/behix-<uuid> دارد؛ مسابقهٔ فریم بین درخواست‌ها رفع شد
 *  - #11: پاک‌سازی فریم‌های PPM در finally، حتی بعد از شکست encode
 *  - دستور ffmpeg با image2 (frame_%04d.ppm) به‌جای concat بدون duration ⇒ زمان‌بندی فریم‌ها قطعی
 */

import { spawn } from 'child_process';
import { rmSync, mkdtempSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { renderCharacters, savePpm } from './software-renderer.js';

export const LIMITS = Object.freeze({
  maxDuration: 60,   // ثانیه
  maxFps: 30,
  maxWidth: 1920,
  maxHeight: 1080,
  minDimension: 16
});

function clampInt(value, def, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function clampNumber(value, def, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

/** اعتبارسنجی و سقف‌گذاری پارامترهای رندر (باگ #2) */
export function sanitizeRenderOptions(options = {}, timelineDuration = 4) {
  const duration = clampNumber(options.duration, Math.min(timelineDuration, LIMITS.maxDuration), 0.1, LIMITS.maxDuration);
  const fps = clampInt(options.fps, 12, 1, LIMITS.maxFps);
  let width = clampInt(options.width, 1280, LIMITS.minDimension, LIMITS.maxWidth);
  let height = clampInt(options.height, 720, LIMITS.minDimension, LIMITS.maxHeight);
  // yuv420p بعد فرد را رد می‌کند ⇒ زوج‌سازی
  width -= width % 2;
  height -= height % 2;
  return { duration, fps, width, height, scale: options.scale, worldX: options.worldX, worldY: options.worldY };
}

/**
 * یک ویدیوی کوتاه از روی Timeline می‌سازد.
 * @param {object} timeline - نمونهٔ Timeline
 * @param {object} options  - duration, fps, width, height (سقف‌دار)؛ outputPath پذیرفته نمی‌شود
 * @returns {Promise<{outputPath: string, jobId: string, jobDir: string, frameCount: number}>}
 */
export async function renderVideo(timeline, options = {}) {
  const { duration, fps, width, height, scale, worldX, worldY } =
    sanitizeRenderOptions(options, timeline?.duration || 4);

  // باگ #1 و #4: پوشهٔ یکتای هر کار؛ هیچ مسیر کلاینتی resolve نمی‌شود
  const jobId = randomUUID();
  const jobDir = mkdtempSync(join(tmpdir(), `behix-${jobId.slice(0, 8)}-`));
  const outputPath = join(jobDir, 'film.mp4');

  const frameCount = Math.max(1, Math.ceil(duration * fps));
  const dt = 1 / fps;
  const skeleton = timeline?.skeleton;

  try {
    for (let i = 0; i < frameCount; i++) {
      const t = i / fps;
      // دوربین صحنهٔ فعال از کارگردانی (باگ #6)؛ options در صورت وجود override می‌کند.
      // scale دوربین نسبت به ارتفاع مرجع ۵۴۰ نرمال می‌شود تا قاب در هر رزولوشنی یکسان بماند.
      const cam = timeline?.cameraAt ? timeline.cameraAt(t) : {};
      const resScale = height / 540;
      const characters = timeline.charactersAt
        ? timeline.charactersAt(t, dt)
        : [{ pose: timeline.poseAt(t, 'main', dt), offsetX: 0 }];
      const frame = renderCharacters(characters, {
        width,
        height,
        skeleton,
        worldX: worldX ?? cam.worldX,
        worldY: worldY ?? cam.worldY,
        scale: scale ?? (cam.scale != null ? cam.scale * resScale : undefined)
      });
      savePpm(frame, join(jobDir, `frame_${String(i).padStart(4, '0')}.ppm`));
    }

    await encodeFramesToMp4(jobDir, outputPath, fps);
    return { outputPath, jobId, jobDir, frameCount, duration, fps, width, height };
  } finally {
    // باگ #11: فریم‌های PPM همیشه پاک می‌شوند، موفق یا ناموفق
    cleanupFrames(jobDir);
  }
}

function cleanupFrames(jobDir) {
  try {
    for (const f of readdirSync(jobDir)) {
      if (f.endsWith('.ppm')) {
        try { rmSync(join(jobDir, f), { force: true }); } catch {}
      }
    }
  } catch {}
}

/** حذف کامل پوشهٔ یک کار (بعد از آپلود/دانلود خروجی) */
export function cleanupJobDir(jobDir) {
  const base = tmpdir();
  const full = resolve(jobDir || '');
  if (!full.startsWith(resolve(base) + '/')) return; // فقط زیر tmp
  try { rmSync(full, { recursive: true, force: true }); } catch {}
}

/**
 * کدگذاری فریم‌های شماره‌دار با demuxer image2 (زمان‌بندی قطعی با -framerate).
 * باگ #3: شنوندهٔ error و settle فقط یک بار.
 */
export function encodeFramesToMp4(framesDir, outputPath, fps) {
  return new Promise((resolvePromise, rejectPromise) => {
    let settled = false;
    const settle = (fn, arg) => {
      if (settled) return;
      settled = true;
      fn(arg);
    };

    const args = [
      '-y',
      '-framerate', String(fps),
      '-i', join(framesDir, 'frame_%04d.ppm'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', '23',
      '-preset', 'veryfast',
      '-movflags', '+faststart',
      outputPath
    ];

    let proc;
    try {
      proc = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch (err) {
      return settle(rejectPromise, new Error(`اجرای ffmpeg ممکن نشد: ${err.message}`));
    }

    let stderr = '';
    proc.stderr.on('data', d => {
      stderr += d.toString();
      if (stderr.length > 8192) stderr = stderr.slice(-8192);
    });
    proc.on('error', err => {
      // باگ #3: بدون این شنونده، نبودن ffmpeg کل پروسس سرور را می‌کشت
      settle(rejectPromise, new Error(`ffmpeg در دسترس نیست یا اجرا نشد: ${err.message}`));
    });
    proc.on('close', code => {
      if (code === 0) settle(resolvePromise, outputPath);
      else settle(rejectPromise, new Error(`ffmpeg failed (${code}): ${stderr.slice(-400)}`));
    });
  });
}
