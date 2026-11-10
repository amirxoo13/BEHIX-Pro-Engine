/**
 * اولویت ۵: کدگذاری ویدیو با FFmpeg
 * فریم‌های تولیدشده توسط رندر نرم‌افزاری را به MP4 تبدیل می‌کند.
 */

import { spawn } from 'child_process';
import { mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { renderCharacters, savePpm } from './software-renderer.js';

/**
 * یک ویدیوی کوتاه از روی Timeline می‌سازد.
 * @param {object} timeline - نمونهٔ Timeline
 * @param {object} options
 * @returns {Promise<string>} مسیر فایل MP4
 */
export async function renderVideo(timeline, options = {}) {
  const outDir = resolve(options.outDir || 'out');
  const fps = options.fps || 12;
  const duration = options.duration || timeline.duration || 4;
  const width = options.width || 1280;
  const height = options.height || 720;
  const outputPath = resolve(options.outputPath || join(outDir, 'film.mp4'));

  mkdirSync(outDir, { recursive: true });

  const frameCount = Math.ceil(duration * fps);
  const frames = [];

  for (let i = 0; i < frameCount; i++) {
    const t = i / fps;
    const characters = timeline.charactersAt ? timeline.charactersAt(t) : [{ pose: timeline.poseAt(t), offsetX: 0 }];
    const frame = renderCharacters(characters, { width, height, scale: options.scale ?? 0.32 });
    const ppmPath = join(outDir, `frame_${String(i).padStart(4, '0')}.ppm`);
    savePpm(frame, ppmPath);
    frames.push(ppmPath);
  }

  await encodeFramesToMp4(frames, outputPath, fps);

  // پاک‌سازی فریم‌های موقت
  for (const f of frames) {
    try { unlinkSync(f); } catch {}
  }

  return outputPath;
}

function encodeFramesToMp4(framePaths, outputPath, fps) {
  return new Promise((resolve, reject) => {
    if (framePaths.length === 0) return reject(new Error('هیچ فریمی وجود ندارد'));

    const listPath = join(dirname(framePaths[0]), 'frames.txt');
    const listContent = framePaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
    writeFileSync(listPath, listContent);

    const args = [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-r', String(fps),
      '-i', listPath,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', '23',
      '-preset', 'veryfast',
      '-movflags', '+faststart',
      outputPath
    ];

    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      try { unlinkSync(listPath); } catch {}
      if (code === 0) resolve(outputPath);
      else reject(new Error(`ffmpeg failed (${code}): ${stderr.slice(-400)}`));
    });
  });
}
