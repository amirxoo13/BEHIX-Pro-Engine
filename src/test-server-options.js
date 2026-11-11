/**
 * تست عبور گزینه‌های رندر از بدنهٔ درخواست
 * اجرا: node src/test-server-options.js
 *
 * چرا این تست مهم است: `/render` گزینه‌ها را فقط از سطح اول بدنه می‌خواند و
 * `/render-from-scenario` فقط از `options`. اگر کلاینت آن‌ها را جای دیگری می‌فرستاد،
 * هیچ خطایی نمی‌گرفت و ویدیو با تنظیمات پیش‌فرض رندر می‌شد — خرابیِ خاموش.
 */

import { pickRenderOptions } from './server.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function main() {
  console.log('=== تست گزینه‌های رندر ===');

  const flat = pickRenderOptions({ duration: 6, fps: 8, width: 480, height: 640, buildAssets: true });
  assert(flat.duration === 6 && flat.fps === 8 && flat.width === 480 && flat.height === 640,
    `گزینه‌های سطح اول خوانده نشد: ${JSON.stringify(flat)}`);
  assert(flat.buildAssets === true, 'buildAssets سطح اول خوانده نشد');
  console.log('سطح اول بدنه خوانده می‌شود.');

  const nested = pickRenderOptions({ options: { duration: 12, fps: 24, width: 320, height: 180 } });
  assert(nested.duration === 12 && nested.fps === 24 && nested.width === 320 && nested.height === 180,
    `گزینه‌های داخل options خوانده نشد: ${JSON.stringify(nested)}`);
  console.log('گزینه‌های داخل options هم خوانده می‌شوند.');

  // وقتی هر دو شکل آمده، options اولویت دارد (نزدیک‌ترین نیت کاربر)
  const both = pickRenderOptions({ duration: 6, fps: 8, options: { duration: 30 } });
  assert(both.duration === 30, `options باید بر سطح اول اولویت داشته باشد، اما ${both.duration} شد`);
  assert(both.fps === 8, 'فیلدی که فقط در سطح اول آمده نباید گم شود');
  console.log('ترکیب دو شکل درست است (options اولویت دارد، بقیهٔ فیلدها حفظ می‌شوند).');

  // مسیر خروجی هرگز از کلاینت پذیرفته نمی‌شود
  const malicious = pickRenderOptions({ outputPath: '/etc/passwd', options: { outputPath: '/tmp/x' }, duration: 5 });
  assert(!('outputPath' in malicious), 'outputPath هرگز نباید از کلاینت عبور کند');
  assert(malicious.duration === 5, 'فیلد مجاز باید عبور کند');
  console.log('فیلدهای غیرمجاز (outputPath) از هر دو شکل فیلتر می‌شوند.');

  assert(Object.keys(pickRenderOptions({})).length === 7, 'فهرست فیلدهای مجاز تغییر کرده است');
  console.log('=== پایان تست گزینه‌های رندر ===');
}

main();
