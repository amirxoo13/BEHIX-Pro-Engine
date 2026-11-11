#!/usr/bin/env node
/**
 * CLI واقعی موتور — بدون نیاز به سرور (برای Cloud Run Jobs هم همین اجرا می‌شود)
 * استفاده:
 *   node src/cli.js --demo
 *   node src/cli.js --directing path/to/directing.json
 *   node src/cli.js --job <jobId> [--directing path/to/directing.json]
 * گزینه‌ها:
 *   --output <path>       کپی خروجی MP4 به این مسیر (محلی؛ انتخاب خود شما، نه کلاینت)
 *   --duration/--fps/--width/--height/--chunk-sec <n>
 * متغیرها: OUTPUT_BUCKET، BEHIX_JOB_ID، BEHIX_DIRECTING_GCS برای اجرای Cloud Run Jobs.
 */

import { readFileSync, copyFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { randomUUID } from 'crypto';
import {
  renderFromDirecting,
  executeChunkedRenderJob,
  validateDirecting,
  mockDirecting
} from './index.js';

function flag(args, name, def) {
  const i = args.indexOf(name);
  if (i < 0 || !args[i + 1]) return def;
  const n = Number(args[i + 1]);
  return Number.isFinite(n) ? n : def;
}

function strFlag(args, name, def = null) {
  const i = args.indexOf(name);
  if (i < 0 || !args[i + 1]) return def;
  return args[i + 1];
}

async function loadDirectingFromGcsUri(gcsUri) {
  const m = String(gcsUri).match(/^gs:\/\/([^/]+)\/(.+)$/);
  if (!m) throw new Error(`آدرس GCS نامعتبر است: ${gcsUri}`);
  const { Storage } = await import('@google-cloud/storage');
  const storage = new Storage();
  const [buf] = await storage.bucket(m[1]).file(m[2]).download();
  return JSON.parse(buf.toString('utf8'));
}

async function main() {
  const args = process.argv.slice(2);
  let directing;
  const opts = {
    duration: flag(args, '--duration', undefined),
    fps: flag(args, '--fps', 8),
    width: flag(args, '--width', 640),
    height: flag(args, '--height', 360),
    chunkDurationSec: flag(args, '--chunk-sec', 20)
  };

  const envJobId = strFlag(args, '--job', process.env.BEHIX_JOB_ID);
  const envDirectingGcs = process.env.BEHIX_DIRECTING_GCS;

  if (args.includes('--demo')) {
    directing = mockDirecting();
    if (!opts.duration) opts.duration = 3;
  } else if (args.includes('--directing')) {
    const path = strFlag(args, '--directing');
    if (!path) throw new Error('مسیر فایل directing لازم است');
    directing = validateDirecting(JSON.parse(readFileSync(path, 'utf8')));
  } else if (envDirectingGcs) {
    directing = validateDirecting(await loadDirectingFromGcsUri(envDirectingGcs));
  } else {
    console.log('استفاده:');
    console.log('  node src/cli.js --demo');
    console.log('  node src/cli.js --directing directing.json [--output film.mp4]');
    console.log('  node src/cli.js --job <jobId> --directing directing.json');
    process.exit(0);
  }

  const targetDur = opts.duration || directing.durationSec || 3;
  opts.duration = targetDur;

  let result;
  if (envJobId || args.includes('--chunked') || targetDur > 60) {
    const jobId = envJobId || randomUUID();
    result = await executeChunkedRenderJob(jobId, directing, opts);
  } else {
    result = await renderFromDirecting(directing, opts);
  }

  const outDest = strFlag(args, '--output');
  if (outDest && result.outputPath) {
    mkdirSync(dirname(outDest) || '.', { recursive: true });
    copyFileSync(result.outputPath, outDest);
    result.copiedTo = outDest;
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
