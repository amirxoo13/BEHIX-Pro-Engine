/**
 * تست اولویت ۵: تولید ویدیو با FFmpeg، چسباندن صدای TTS (mux) و اجرای Job تکهتکه (به‌روزرسانی‌شده برای فاز ۱ و ۲)
 * اجرا: node src/test-video.js
 */

import { statSync } from 'fs';
import { spawnSync } from 'child_process';
import {
  renderFromDirecting,
  cleanupJobDir,
  executeChunkedRenderJob,
  loadJobStatus,
  loadSkeletonFromFile,
  mockDirecting
} from './index.js';

async function main() {
  console.log('=== اولویت ۵: کدگذاری ویدیو با FFmpeg + صدای دیالوگ و لب‌خوانی + Job تکهتکه ===');

  const directing = mockDirecting();
  const result = await renderFromDirecting(directing, {
    duration: 2,
    fps: 6,
    width: 320,
    height: 180
  });

  const size = statSync(result.outputPath).size;
  console.log('ویدیوی دمو با صدا ساخته شد:', result.outputPath, `(${size} بایت، ${result.frameCount} فریم)`);
  if (size < 1000) throw new Error('فایل MP4 مشکوک به خالی بودن است');

  // بررسی وجود استریم ویدیو و استریم صدا در فایل MP4 خروجی با ffprobe/ffmpeg
  const probe = spawnSync('ffmpeg', ['-i', result.outputPath], { encoding: 'utf8' });
  const info = (probe.stderr || '') + (probe.stdout || '');
  if (!info.includes('Video:') || !info.includes('Audio:')) {
    throw new Error(`فایل MP4 باید هم تصویر و هم صدای mux شده داشته باشد:\n${info}`);
  }
  console.log('تایید شد: فایل MP4 هم استریم Video (h264) و هم استریم Audio (aac) دارد.');
  cleanupJobDir(result.jobDir);

  // تست اجرای تکهتکه (Chunked Render Job) و ذخیره/بازیابی وضعیت Job
  const jobState = await executeChunkedRenderJob('test-chunked-job', mockDirecting(), {
    duration: 2,
    chunkDurationSec: 1,
    fps: 6,
    width: 320,
    height: 180,
    buildAssets: false
  });
  const loadedState = await loadJobStatus('test-chunked-job');
  if (!loadedState || loadedState.status !== 'completed' || loadedState.totalChunks !== 2) {
    throw new Error('وضعیت Job تکهتکه به‌درستی ذخیره و کامل نشد');
  }
  const chunkedSize = statSync(jobState.outputPath).size;
  console.log(`Job تکهتکه (${loadedState.totalChunks} قطعه) با موفقیت concat و mux شد (${chunkedSize} بایت).`);
  cleanupJobDir(jobState.jobDir);

  // تست ثبت وضعیت failed و عدم ارائهٔ downloadUrl وقتی کاراکتر دارای دیالوگ اسلات دهان ندارد
  const baseSkel = loadSkeletonFromFile('examples/nila.skel.json');
  const mouthlessSkel = baseSkel.clone();
  const mIdx = mouthlessSkel.slots.findIndex(s => s.name === 'mouth');
  if (mIdx >= 0) mouthlessSkel.removeSlot(mIdx);

  let jobFailedAsExpected = false;
  try {
    await executeChunkedRenderJob('test-failed-mouth-job', mockDirecting(), {
      duration: 2,
      chunkDurationSec: 1,
      fps: 6,
      width: 320,
      height: 180,
      buildAssets: false,
      characterSkeletons: {
        boy: mouthlessSkel
      }
    });
  } catch {
    jobFailedAsExpected = true;
  }
  const failedJobState = await loadJobStatus('test-failed-mouth-job');
  if (!jobFailedAsExpected || !failedJobState || failedJobState.status !== 'failed' || failedJobState.downloadUrl !== null || !failedJobState.error?.includes('دهان')) {
    throw new Error(`وضعیت کار بدون دهان باید failed و بدون downloadUrl باشد، اما: ${JSON.stringify(failedJobState)}`);
  }
  console.log('تایید شد: کاراکتر دارای دیالوگ بدون اسلات دهان وضعیت Job را failed می‌کند و لینک دانلود موفق نمی‌دهد.');

  console.log('=== پایان تست اولویت ۵ ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
