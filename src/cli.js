#!/usr/bin/env node
/**
 * CLI واقعی موتور — بدون نیاز به سرور
 * استفاده: node src/cli.js --demo
 * یا: node src/cli.js --directing path/to/directing.json
 */

import { readFileSync } from 'fs';
import { renderFromDirecting } from './index.js';
import { mockDirecting } from './timeline.js';

async function main() {
  const args = process.argv.slice(2);
  let directing;
  const opts = { duration: 3, fps: 8, width: 640, height: 360 };

  if (args.includes('--demo')) {
    directing = mockDirecting();
  } else if (args.includes('--directing')) {
    const i = args.indexOf('--directing');
    const path = args[i + 1];
    if (!path) throw new Error('مسیر فایل directing لازم است');
    directing = JSON.parse(readFileSync(path, 'utf8'));
  } else {
    console.log('استفاده:');
    console.log('  node src/cli.js --demo');
    console.log('  node src/cli.js --directing directing.json');
    process.exit(0);
  }

  const result = await renderFromDirecting(directing, opts);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
