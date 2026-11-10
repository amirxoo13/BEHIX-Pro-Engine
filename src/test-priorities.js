/**
 * تست اولویت ۱ و ۲
 * اجرا: node src/test-priorities.js
 */

import { loadSkeletonFromFile, computePose } from './rigby-adapter.js';
import { generateDirecting, buildDirectingPrompt } from './gemini-directing.js';

async function main() {
  console.log('=== اولویت ۱: لود اسکلت و pose ===');
  try {
    const sk = loadSkeletonFromFile('examples/nila.skel.json');
    const animName = sk.animations?.[0]?.name ?? null;
    const result = computePose(sk, animName, 0.5);
    console.log('موفق:', result);
  } catch (err) {
    console.error('شکست اولویت ۱:', err.message);
  }

  console.log('\n=== اولویت ۲: پرامپت کارگردانی Gemini ===');
  const scenario = 'یک پسر و یک دختر در پارک راه می‌روند و با هم حرف می‌زنند.';
  const prompt = buildDirectingPrompt(scenario);
  console.log('پرامپت آماده شد (طول:', prompt.length, 'کاراکتر)');

  const directing = await generateDirecting(scenario);
  if (directing.mock) {
    console.log('کلید API نیست — فقط پرامپت ساخته شد.');
    console.log('نمونهٔ ساختار مورد انتظار در کد موجود است.');
  } else if (directing.error) {
    console.log(directing.error);
  } else {
    console.log('کارگردانی تولید شد:', JSON.stringify(directing, null, 2).slice(0, 500));
  }

  console.log('\n=== پایان تست ===');
}

main().catch(console.error);
