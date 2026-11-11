/**
 * سرور HTTP موتور BEHIX Pro
 *
 * رفع باگ‌ها و بهبودهای فاز ۱ و ۲:
 *  - #1: outputPath از بدنهٔ درخواست حذف شد؛ خروجی داخل پوشهٔ یکتای کار نوشته و با
 *        GET /renders/:jobId دانلود می‌شود. احراز هویت اختیاری با BEHIX_API_KEY در هدر x-api-key.
 *  - #2: duration/fps/width/height اعتبارسنجی و سقف‌دار (sanitizeRenderOptions).
 *        درخواست HTTP هم‌زمان حداکثر ۶۰ ثانیه می‌ماند؛ فیلم‌های بلند (۱۸۰ تا ۳۰۰ ثانیه) از طریق Job تکهتکه اجرا می‌شوند
 *        و POST /render-from-scenario برای فیلم بلند بلافاصله jobId برمی‌گرداند بدون اینکه داخل همان درخواست تا آخر رندر کند.
 *  - #10: options کلاینت فیلتر می‌شود؛ skeletonPath فقط داخل ریشه‌های مجاز (examples/ و assets/).
 *  - فاز ۱/۲: وضعیت کارها (jobs) دیگر فقط در Map حافظهٔ پروسه با TTL و MAX_JOBS=50 نگه داشته نمی‌شود؛
 *             با saveJobStatus و loadJobStatus در Cloud Storage (GCS) ذخیره و بازیابی می‌شود تا ری‌استارت Cloud Run کار را گم نکند.
 */

import express from 'express';
import { existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { timingSafeEqual } from 'crypto';
import { loadSkeletonFromFile, computePose } from './rigby-adapter.js';
import { validateDirecting, LONGFORM_MIN_SEC } from './gemini-directing.js';
import {
  renderFromDirecting,
  LIMITS,
  saveJobStatus,
  loadJobStatus,
  enqueueLongformRenderJob,
  ensureLocalOutputFromGcs,
  prepareScenarioDirecting
} from './index.js';
import { mockDirecting } from './timeline.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();
app.use(express.json({ limit: '2mb' }));

/** صفحهٔ تست (فارسی) — بدون کلید باز است؛ خود رندرها کلید می‌خواهند */
app.get('/', (_req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

function keyMatches(given, required) {
  if (typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(required);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * احراز هویت اختیاری: اگر BEHIX_API_KEY تنظیم شده باشد، هدر x-api-key اجباری است (باگ #1).
 * استثناها: صفحهٔ تست، /health، و دانلود /renders/:jobId.
 */
app.use((req, res, next) => {
  const required = process.env.BEHIX_API_KEY;
  if (!required) return next();
  if (req.path === '/' || req.path === '/health') return next();
  if (req.method === 'GET' && req.path.startsWith('/renders/')) return next();
  if (keyMatches(req.get('x-api-key'), required)) return next();
  res.status(401).json({ error: 'کلید API نامعتبر است (هدر x-api-key)' });
});

/** ثبت کارهای کامل‌شده در Cloud Storage (GCS) و دیسک تا ری‌استارت Cloud Run وضعیت را گم نکند */
async function registerJob(result) {
  await saveJobStatus(result.jobId, {
    ...result,
    status: 'completed',
    phase: 'done',
    progress: 100,
    downloadUrl: `/renders/${result.jobId}`,
    createdAt: new Date().toISOString()
  });
}

/** فقط فیلدهای مجاز از بدنهٔ کلاینت عبور می‌کنند (outputPath از کلاینت هرگز پذیرفته نمی‌شود) */
function pickRenderOptions(body = {}) {
  const { duration, fps, width, height, skeletonPath, chunkDurationSec, buildAssets } = body;
  return { duration, fps, width, height, skeletonPath, chunkDurationSec, buildAssets };
}

function sendError(res, err, status = 500) {
  const message = String(err?.message || err);
  if (status >= 500) console.error('[server]', err);
  res.status(status).json({ error: message });
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'behix-pro', rigby: true, limits: LIMITS });
});

/** پیش‌نمایش pose از اسکلت موجود */
app.post('/preview-pose', (req, res) => {
  try {
    const { animationName = 'idle', time = 0.2, skeletonPath = 'examples/nila.skel.json' } = req.body || {};
    const skeleton = loadSkeletonFromFile(String(skeletonPath));
    const result = computePose(skeleton, String(animationName), Number(time) || 0);
    const { quads, pose, ...summary } = result;
    res.json(summary);
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * رندر ویدیو از کارگردانی آماده
 * اگر مدت کارگردانی بلند باشد (> ۶۰ ثانیه یا بین ۱۸۰ تا ۳۰۰ ثانیه)، به صورت Job تکهتکه صف می‌شود و فوراً jobId برمی‌گرداند.
 * برای ویدیوهای کوتاه (≤ ۶۰ ثانیه)، همان‌جا رندر و وضعیت در GCS ذخیره می‌شود.
 */
app.post('/render', async (req, res) => {
  try {
    const directing = req.body?.directing;
    if (!directing || !Array.isArray(directing.scenes) || !directing.scenes.length) {
      return sendError(res, new Error('directing با فیلد scenes لازم است'), 400);
    }

    const opts = pickRenderOptions(req.body);
    const requestedDur = Number(opts.duration || directing.durationSec || 0);
    const isLongform = requestedDur > LIMITS.maxDuration || Boolean(req.body?.asyncJob);

    validateDirecting(directing, {
      longform: requestedDur >= LONGFORM_MIN_SEC,
      requireContiguous: requestedDur >= LONGFORM_MIN_SEC
    });

    if (isLongform) {
      const queued = await enqueueLongformRenderJob(directing, {
        ...opts,
        longform: requestedDur >= LONGFORM_MIN_SEC
      });
      return res.status(202).json({
        jobId: queued.jobId,
        status: queued.status,
        statusUrl: `/jobs/${queued.jobId}`,
        downloadUrl: queued.downloadUrl || null,
        directing
      });
    }

    const result = await renderFromDirecting(directing, opts);
    await registerJob(result);
    const { outputPath, jobDir, ...publicResult } = result;
    res.json({ ...publicResult, downloadUrl: `/renders/${result.jobId}` });
  } catch (err) {
    const isClientErr = /معتبر نیست|سقف|نامعتبر|خالی|تکراری|پیدا نشد|خارج از ریشه|مطلق/.test(String(err?.message || ''));
    sendError(res, err, isClientErr ? 400 : 500);
  }
});

/**
 * مسیر کامل با Gemini / Vertex AI:
 *  - برای فیلم بلند (۱۸۰ تا ۳۰۰ ثانیه، که حالت پیش‌فرض محصول است یا زمانی که duration > 60 باشد):
 *    فقط کارگردانی را با prepareScenarioDirecting آماده و اعتبارسنجی می‌کند، Job تکهتکه را در پس‌زمینه/Cloud Run Job ثبت می‌کند
 *    و فوراً `{ jobId, status: 'queued', statusUrl, downloadUrl: null, directing }` برمی‌گرداند (داخل همان درخواست HTTP تا آخر رندر نمی‌کند).
 *  - برای کلیپ کوتاه (مثلاً وقتی کاربر در پنل تست duration <= 60 داده و asyncJob نخواسته):
 *    کلیپ کوتاه را رندر کرده و برمی‌گرداند.
 */
app.post('/render-from-scenario', async (req, res) => {
  try {
    const scenario = req.body?.scenario;
    if (!scenario || typeof scenario !== 'string' || !scenario.trim()) {
      return sendError(res, new Error('scenario لازم است'), 400);
    }

    const rawOpts = pickRenderOptions(req.body?.options || req.body || {});
    const explicitDur = Number(rawOpts.duration);
    const isLongform = !Number.isFinite(explicitDur) || explicitDur > LIMITS.maxDuration || Boolean(req.body?.longform);
    const targetDuration = isLongform
      ? (Number.isFinite(explicitDur) && explicitDur >= LONGFORM_MIN_SEC ? explicitDur : LONGFORM_MIN_SEC)
      : explicitDur;

    const { directing } = await prepareScenarioDirecting(String(scenario), {
      durationSec: targetDuration,
      longform: isLongform,
      buildAssets: !isLongform && !req.body?.asyncJob
    });

    if (isLongform || req.body?.asyncJob) {
      const queued = await enqueueLongformRenderJob(directing, {
        ...rawOpts,
        duration: directing.durationSec,
        longform: isLongform
      });
      return res.status(202).json({
        jobId: queued.jobId,
        status: queued.status,
        statusUrl: `/jobs/${queued.jobId}`,
        downloadUrl: queued.downloadUrl || null,
        directing
      });
    }

    const result = await renderFromDirecting(directing, rawOpts);
    await registerJob(result);
    const { outputPath, jobDir, ...publicResult } = result;
    res.json({ ...publicResult, downloadUrl: `/renders/${result.jobId}`, directing });
  } catch (err) {
    const isClientErr = /معتبر نیست|سقف|نامعتبر|خالی|تکراری|مطلق/.test(String(err?.message || ''));
    sendError(res, err, isClientErr ? 400 : 500);
  }
});

/** تست سریع بدون Gemini (از دادهٔ نمونهٔ واقعی استفاده می‌کند) */
app.post('/render-demo', async (_req, res) => {
  try {
    const directing = mockDirecting();
    const result = await renderFromDirecting(directing, {
      duration: 2,
      fps: 6,
      width: 480,
      height: 270
    });
    await registerJob(result);
    const { outputPath, jobDir, ...publicResult } = result;
    res.json({ ...publicResult, downloadUrl: `/renders/${result.jobId}` });
  } catch (err) {
    sendError(res, err);
  }
});

/** مشاهدهٔ وضعیت Job (از GCS یا دیسک محلی) همراه با پیشرفت قطعات و هشدارها یا علت خطا */
app.get('/jobs/:jobId', async (req, res) => {
  try {
    const job = await loadJobStatus(req.params.jobId);
    if (!job) {
      return sendError(res, new Error('کار پیدا نشد'), 404);
    }
    const { outputPath, jobDir, ...publicState } = job;
    res.json(publicState);
  } catch (err) {
    sendError(res, err);
  }
});

/** دانلود MP4 یک کار کامل‌شده (اگر کار failed باشد، کد 409 همراه با علت خطا برمی‌گرداند و لینک دانلود موفق نمی‌دهد) */
app.get('/renders/:jobId', async (req, res) => {
  try {
    const job = await loadJobStatus(req.params.jobId);
    if (!job) {
      return sendError(res, new Error('کار پیدا نشد یا منقضی شده'), 404);
    }
    if (job.status === 'failed') {
      return res.status(409).json({
        jobId: job.jobId,
        status: 'failed',
        phase: job.phase,
        error: job.error || 'رندر کار با خطا متوقف شد',
        warnings: job.warnings || []
      });
    }
    if (job.status && job.status !== 'completed') {
      return res.status(202).json({
        jobId: job.jobId,
        status: job.status,
        phase: job.phase,
        progress: job.progress,
        warnings: job.warnings || []
      });
    }
    const localFile = await ensureLocalOutputFromGcs(job);
    if (!localFile || !existsSync(localFile)) {
      return sendError(res, new Error('فایل خروجی کار پیدا نشد'), 404);
    }
    res.download(localFile, 'film.mp4');
  } catch (err) {
    sendError(res, err);
  }
});

const invokedDirectly = process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) {
  const port = Number(process.env.PORT) || 8080;
  app.listen(port, () => {
    console.log(`BEHIX Pro Engine listening on ${port}`);
  });
}
