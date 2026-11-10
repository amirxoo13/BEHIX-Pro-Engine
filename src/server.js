/**
 * سرور HTTP موتور BEHIX Pro
 *
 * رفع باگ‌ها:
 *  - #1: outputPath از بدنهٔ درخواست حذف شد؛ خروجی داخل پوشهٔ یکتای کار نوشته و با
 *        GET /renders/:jobId دانلود می‌شود. احراز هویت اختیاری با BEHIX_API_KEY
 *        (روی Cloud Run با --no-allow-unauthenticated هم IAM جلوی ورود را می‌گیرد).
 *  - #2: duration/fps/width/height اعتبارسنجی و سقف‌دار (sanitizeRenderOptions).
 *  - #10: options کلاینت فیلتر می‌شود؛ skeletonPath فقط داخل examples/.
 *  - خطاهای داخلی بدون بدنهٔ خام upstream به کلاینت برمی‌گردند.
 */

import express from 'express';
import { existsSync } from 'fs';
import { loadSkeletonFromFile, computePose } from './rigby-adapter.js';
import { generateDirecting } from './gemini-directing.js';
import { renderFromDirecting, LIMITS } from './index.js';
import { mockDirecting } from './timeline.js';
import { cleanupJobDir } from './video-encoder.js';

const app = express();
app.use(express.json({ limit: '2mb' }));

/** احراز هویت اختیاری: اگر BEHIX_API_KEY تنظیم شده باشد، هدر x-api-key اجباری است (باگ #1) */
app.use((req, res, next) => {
  const required = process.env.BEHIX_API_KEY;
  if (!required) return next();
  if (req.path === '/health') return next();
  if (req.get('x-api-key') === required) return next();
  res.status(401).json({ error: 'کلید API نامعتبر است (هدر x-api-key)' });
});

/** ثبت کارهای کامل‌شده برای دانلود؛ هر نمونه فقط کارهای خودش را می‌بیند */
const jobs = new Map(); // jobId -> { jobDir, outputPath, gcsUri, createdAt }
const JOB_TTL_MS = 30 * 60 * 1000;
const MAX_JOBS = 50;

function registerJob(result) {
  jobs.set(result.jobId, {
    jobDir: result.jobDir,
    outputPath: result.outputPath,
    gcsUri: result.gcsUri,
    createdAt: Date.now()
  });
  // حذف قدیمی‌ها تا دیسک نمونه پر نشود
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS || jobs.size > MAX_JOBS) {
      cleanupJobDir(job.jobDir);
      jobs.delete(id);
    } else break;
  }
}

/** فقط فیلدهای مجاز از بدنهٔ کلاینت عبور می‌کنند (باگ #1، #2، #10) */
function pickRenderOptions(body = {}) {
  const { duration, fps, width, height, skeletonPath } = body;
  return { duration, fps, width, height, skeletonPath };
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
    const { animationName = 'idle', time = 0.2 } = req.body || {};
    const skeleton = loadSkeletonFromFile('examples/nila.skel.json');
    const result = computePose(skeleton, String(animationName), Number(time) || 0);
    // quads و pose را حذف می‌کنیم تا پاسخ سبک بماند
    const { quads, pose, ...summary } = result;
    res.json(summary);
  } catch (err) {
    sendError(res, err);
  }
});

/**
 * رندر ویدیو از کارگردانی آماده
 * body: { directing: {...}, duration?, fps?, width?, height? }
 * پاسخ: { jobId, downloadUrl, gcsUri, ... } — فایل با GET /renders/:jobId
 */
app.post('/render', async (req, res) => {
  try {
    const directing = req.body?.directing;
    if (!directing || !Array.isArray(directing.scenes) || !directing.scenes.length) {
      return sendError(res, new Error('directing با فیلد scenes لازم است'), 400);
    }
    const result = await renderFromDirecting(directing, pickRenderOptions(req.body));
    registerJob(result);
    const { outputPath, jobDir, ...publicResult } = result;
    res.json({ ...publicResult, downloadUrl: `/renders/${result.jobId}` });
  } catch (err) {
    sendError(res, err);
  }
});

/**
 * مسیر کامل با Gemini / Vertex AI
 * body: { scenario: "متن سناریو", options?: { duration, fps, width, height } }
 */
app.post('/render-from-scenario', async (req, res) => {
  try {
    const scenario = req.body?.scenario;
    if (!scenario) return sendError(res, new Error('scenario لازم است'), 400);

    const directing = await generateDirecting(String(scenario));
    const result = await renderFromDirecting(directing, pickRenderOptions(req.body?.options || {}));
    registerJob(result);
    const { outputPath, jobDir, ...publicResult } = result;
    res.json({ ...publicResult, downloadUrl: `/renders/${result.jobId}`, directing });
  } catch (err) {
    sendError(res, err);
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
    registerJob(result);
    const { outputPath, jobDir, ...publicResult } = result;
    res.json({ ...publicResult, downloadUrl: `/renders/${result.jobId}` });
  } catch (err) {
    sendError(res, err);
  }
});

/** دانلود MP4 یک کار کامل‌شده (جایگزین امن outputPath کلاینتی) */
app.get('/renders/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || !job.outputPath || !existsSync(job.outputPath)) {
    return sendError(res, new Error('کار پیدا نشد یا منقضی شده'), 404);
  }
  res.download(job.outputPath, 'film.mp4');
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`BEHIX Pro Engine listening on ${port}`);
});
