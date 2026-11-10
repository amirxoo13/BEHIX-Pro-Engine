#!/usr/bin/env node
/**
 * CLI واقعی موتور — بدون نیاز به سرور (برای Cloud Run Jobs هم همین اجرا می‌شود)
 * استفاده:
 *   node src/cli.js --demo
 *   node src/cli.js --directing path/to/directing.json
 * گزینه‌ها:
 *   --output <path>       کپی خروجی MP4 به این مسیر (محلی؛ انتخاب خود شما، نه کلاینت)
 *   --duration/--fps/--width/--height <n>
 * متغیرها: OUTPUT_BUCKET برای آپلود خودکار به Cloud Storage.
 */

import { readFileSync, copyFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { renderFromDirecting } from './index.js';
import { mockDirecting } from './timeline.js';
import { validateDirecting } from './gemini-directing.js';

function flag(args, name, def) {
  const i = args.indexOf(name);
  if (i < 0 || !args[i + 1]) return def;
  const n = Number(args[i + 1]);
  return Number.isFinite(n) ? n : def;
}

async function main() {
  const args = process.argv.slice(2);
  let directing;
  const opts = {
    duration: flag(args, '--duration', 3),
    fps: flag(args, '--fps', 8),
    width: flag(args, '--width', 640),
    height: flag(args, '--height', 360)
  };

  if (args.includes('--demo')) {
    directing = mockDirecting();
  } else if (args.includes('--directing')) {
    const i = args.indexOf('--directing');
    const path = args[i + 1];
    if (!path) throw new Error('مسیر فایل directing لازم است');
    directing = validateDirecting(JSON.parse(readFileSync(path, 'utf8')));
  } else {
    console.log('استفاده:');
    console.log('  node src/cli.js --demo');
    console.log('  node src/cli.js --directing directing.json [--output film.mp4]');
    process.exit(0);
  }

  const result = await renderFromDirecting(directing, opts);

  const oi = args.indexOf('--output');
  if (oi >= 0 && args[oi + 1]) {
    const dest = args[oi + 1];
    mkdirSync(dirname(dest) || '.', { recursive: true });
    copyFileSync(result.outputPath, dest);
    result.copiedTo = dest;
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
