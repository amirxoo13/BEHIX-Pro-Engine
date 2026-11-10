/**
 * تست اولویت ۱ و ۲
 * اجرا: node src/test-priorities.js
 *
 * باگ #9 رفع شد: generateDirecting بدون کلید throw می‌کند؛ تست همین رفتار واقعی را
 * می‌سنجد (شاخه‌های mock/error که هرگز اجرا نمی‌شدند حذف شدند).
 */

import { loadSkeletonFromFile, computePose } from './rigby-adapter.js';
import { generateDirecting, buildDirectingPrompt, validateDirecting } from './gemini-directing.js';
import { mockDirecting } from './timeline.js';

async function main() {
  let failures = 0;

  console.log('=== اولویت ۱: لود اسکلت و pose ===');
  try {
    const sk = loadSkeletonFromFile('examples/nila.skel.json');
    const animName = sk.animations?.[0]?.name ?? null;
    const { quads, pose, ...summary } = computePose(sk, animName, 0.5);
    if (!summary.ready || summary.quadCount <= 0) throw new Error('pose بدون quad');
    console.log('موفق:', summary);
  } catch (err) {
    failures++;
    console.error('شکست اولویت ۱:', err.message);
  }

  console.log('\n=== اولویت ۲: پرامپت و کارگردانی ===');
  const scenario = 'یک پسر و یک دختر در پارک راه می‌روند و با هم حرف می‌زنند.';
  const prompt = buildDirectingPrompt(scenario);
  console.log('پرامپت آماده شد (طول:', prompt.length, 'کاراکتر)');

  try {
    validateDirecting(mockDirecting());
    console.log('validateDirecting روی نمونه موفق بود.');
  } catch (err) {
    failures++;
    console.error('شکست validateDirecting:', err.message);
  }

  const hasCreds = !!(process.env.VERTEX_AI_PROJECT || process.env.GOOGLE_API_KEY);
  try {
    const directing = await generateDirecting(scenario);
    console.log('کارگردانی تولید شد:', JSON.stringify(directing, null, 2).slice(0, 500));
  } catch (err) {
    if (hasCreds) {
      failures++;
      console.error('شکست اولویت ۲ با وجود کلید:', err.message);
    } else {
      // رفتار مورد انتظار: بدون کلید باید throw شود
      console.log('بدون کلید، همان‌طور که انتظار می‌رود خطا داد:', err.message);
    }
  }

  console.log('\n=== پایان تست ===');
  if (failures) {
    console.error(`${failures} تست شکست خورد`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
