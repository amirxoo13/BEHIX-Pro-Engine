import express from 'express';
import { loadSkeletonFromFile, computePose } from './rigby-adapter.js';
import { generateDirecting } from './gemini-directing.js';
import { renderFromDirecting } from './index.js';
import { mockDirecting } from './timeline.js';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'behix-pro', rigby: true });
});

/** پیش‌نمایش pose از اسکلت موجود */
app.post('/preview-pose', (req, res) => {
  try {
    const { animationName = 'idle', time = 0.2 } = req.body || {};
    const skeleton = loadSkeletonFromFile('examples/nila.skel.json');
    const result = computePose(skeleton, animationName, time);
    // quads را حذف می‌کنیم تا پاسخ سبک بماند
    const { quads, ...summary } = result;
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

/**
 * رندر ویدیو از کارگردانی آماده
 * body: { directing: {...}, duration?, fps?, width?, height? }
 */
app.post('/render', async (req, res) => {
  try {
    const directing = req.body?.directing;
    if (!directing || !directing.scenes) {
      return res.status(400).json({ error: 'directing با فیلد scenes لازم است' });
    }
    const result = await renderFromDirecting(directing, {
      duration: req.body.duration,
      fps: req.body.fps,
      width: req.body.width,
      height: req.body.height,
      outputPath: req.body.outputPath
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

/**
 * مسیر کامل با Gemini (اگر کلید موجود باشد)
 * body: { scenario: "متن سناریو" }
 */
app.post('/render-from-scenario', async (req, res) => {
  try {
    const scenario = req.body?.scenario;
    if (!scenario) return res.status(400).json({ error: 'scenario لازم است' });

    const directing = await generateDirecting(scenario);
    const result = await renderFromDirecting(directing, req.body.options || {});
    res.json({ ...result, directing });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

/** تست سریع بدون Gemini (از دادهٔ نمونهٔ واقعی استفاده می‌کند) */
app.post('/render-demo', async (req, res) => {
  try {
    const directing = mockDirecting();
    const result = await renderFromDirecting(directing, {
      duration: 2,
      fps: 6,
      width: 480,
      height: 270
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`BEHIX Pro Engine listening on ${port}`);
});
