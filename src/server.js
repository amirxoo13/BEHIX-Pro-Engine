import express from 'express';
import { loadAndPose } from './rigby-adapter.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'behix-pro', rigby: true });
});

app.post('/preview-pose', async (req, res) => {
  try {
    const { skeletonJson, animationName } = req.body;
    const result = await loadAndPose(skeletonJson, animationName);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`BEHIX Pro Engine listening on ${port}`);
});
