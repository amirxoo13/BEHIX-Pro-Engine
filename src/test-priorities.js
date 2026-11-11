/**
 * تست اولویت ۱ و ۲ (به‌روزرسانی‌شده برای فاز ۱ و ۲)
 * اجرا: node src/test-priorities.js
 *
 * بررسی‌ها:
 *  - لود اسکلت و محاسبهٔ pose
 *  - قفل امن مسیر اسکلت (safeSkeletonPath / resolveSafeAssetPath) برای examples/ و assets/ و مسدود بودن path traversal
 *  - بررسی مدل‌های پیش‌فرض مجاز (gemini-4-argon، gemini-3.1-flash-image، gemini-3.8-flash-tts) و رد مدل‌های بازنشسته/ویدیویی
 *  - اعتبارسنجی کارگردانی تا ۲۰ کاراکتر، خطا روی ۲۱ کاراکتر، بررسی sourceSpan، پیوستگی صحنه‌ها، و بازهٔ ۱۸۰ تا ۳۰۰ ثانیه برای فیلم بلند
 *  - ساخت کاراکتر جدید با autoRig روی CPU از لایه‌های PNG و بررسی هشدار لایهٔ ناشناخته
 */

import { loadSkeletonFromFile, computePose, safeSkeletonPath, resolveSafeAssetPath } from './rigby-adapter.js';
import {
  generateDirecting,
  buildDirectingPrompt,
  validateDirecting,
  parseModelJson,
  DEFAULT_GEMINI_MODEL,
  resolveTextModel
} from './gemini-directing.js';
import { mockDirecting } from './timeline.js';
import {
  buildCharacterRig,
  defaultCharacterLayers,
  DEFAULT_IMAGE_MODEL,
  resolveImageModel
} from './character-factory.js';
import { DEFAULT_TTS_MODEL, resolveTtsModel } from './audio-track.js';

async function main() {
  let failures = 0;

  console.log('=== اولویت ۱: لود اسکلت، قفل مسیر، مدل‌های مجاز و AutoRig روی CPU ===');
  try {
    if (DEFAULT_GEMINI_MODEL !== 'gemini-4-argon') {
      throw new Error(`DEFAULT_GEMINI_MODEL باید gemini-4-argon باشد اما ${DEFAULT_GEMINI_MODEL} است`);
    }
    if (DEFAULT_IMAGE_MODEL !== 'gemini-3.1-flash-image') {
      throw new Error(`DEFAULT_IMAGE_MODEL باید gemini-3.1-flash-image باشد اما ${DEFAULT_IMAGE_MODEL} است`);
    }
    if (DEFAULT_TTS_MODEL !== 'gemini-3.8-flash-tts') {
      throw new Error(`DEFAULT_TTS_MODEL باید gemini-3.8-flash-tts باشد اما ${DEFAULT_TTS_MODEL} است`);
    }

    let retiredBlocked = 0;
    try { resolveTextModel('veo-3.1-generate-001'); } catch { retiredBlocked++; }
    try { resolveImageModel('veo-3.1-fast-generate-001'); } catch { retiredBlocked++; }
    try { resolveTtsModel('veo-3.1-generate-001'); } catch { retiredBlocked++; }
    if (retiredBlocked !== 3) {
      throw new Error('مدل‌های غیرمجاز/ویدیویی به‌درستی رد نشدند');
    }

    const sk = loadSkeletonFromFile('examples/nila.skel.json');
    const animName = sk.animations?.[0]?.name ?? null;
    const { quads, pose, ...summary } = computePose(sk, animName, 0.5);
    if (!summary.ready || summary.quadCount <= 0) throw new Error('pose بدون quad');
    console.log('موفق:', summary);

    // بررسی قفل امن مسیر دارایی (BUG-06)
    const allowedAsset = safeSkeletonPath('assets/hero_1/hero_1.skel.json');
    if (!allowedAsset.endsWith('assets/hero_1/hero_1.skel.json')) {
      throw new Error(`مسیر assets/ به‌درستی پذیرفته نشد: ${allowedAsset}`);
    }
    let traversalBlocked = false;
    try {
      resolveSafeAssetPath('../../etc/passwd');
    } catch {
      traversalBlocked = true;
    }
    if (!traversalBlocked) throw new Error('path traversal مسدود نشد!');
    let absBlocked = false;
    try { resolveSafeAssetPath('/etc/passwd'); } catch { absBlocked = true; }
    if (!absBlocked) throw new Error('مسیر مطلق مسدود نشد!');
    console.log('قفل امن مسیر اسکلت (examples/ و assets/ بدون path traversal) تایید شد.');

    // بررسی ساخت کاراکتر با autoRig روی CPU و رد لایهٔ ناشناخته همراه با هشدار (BUG-09)
    const layersWithUnknown = [
      ...defaultCharacterLayers('test_autorig_char'),
      { file: 'assets/test_autorig_char/layers/mystery_gadget.png', role: 'unknown_gadget', side: null }
    ];
    const builtChar = await buildCharacterRig({
      id: 'test_autorig_char',
      name: 'کاراکتر تست اتوریگ',
      layers: layersWithUnknown
    }, { uploadToGcs: false });

    const loadedCustomSkel = loadSkeletonFromFile(builtChar.skeletonPath);
    const customPose = computePose(loadedCustomSkel, 'idle', 0.3);
    if (!customPose.ready || customPose.quadCount <= 0) {
      throw new Error('اسکلت تولیدشده با autoRig قادر به تولید quad نیست');
    }
    const hasUnknownWarning = builtChar.rigReport.warnings.some(w => w.includes('mystery_gadget'));
    if (!hasUnknownWarning) {
      throw new Error('هشدار لایهٔ دارای role ناشناخته در گزارش rig ثبت نشد');
    }
    console.log(`AutoRig روی CPU موفق بود: اسکلت ${builtChar.skeletonPath} (${customPose.boneCount} استخوان، ${customPose.quadCount} quad) با ثبت هشدار لایهٔ ناشناخته.`);
  } catch (err) {
    failures++;
    console.error('شکست اولویت ۱:', err.message);
  }

  console.log('\n=== اولویت ۲: پرامپت و اعتبارسنجی کارگردانی (۲۰ کاراکتر، ۱۸۰-۳۰۰ ثانیه، sourceSpan) ===');
  const scenario = 'یک پسر و یک دختر در پارک راه می‌روند و با هم حرف می‌زنند.';
  const prompt = buildDirectingPrompt(scenario);
  console.log('پرامپت آماده شد (طول:', prompt.length, 'کاراکتر)');

  try {
    validateDirecting(mockDirecting());
    console.log('validateDirecting روی نمونه موفق بود.');

    // بررسی پشتیبانی از ۲۰ کاراکتر متمایز بدون برش به ۳ کاراکتر (BUG-01)
    const twentyChars = Array.from({ length: 20 }, (_, i) => ({
      id: `char_${i + 1}`,
      name: `شخصیت ${i + 1}`,
      skeletonPath: `assets/char_${i + 1}/char_${i + 1}.skel.json`,
      atlasPath: `assets/char_${i + 1}/char_${i + 1}.atlas`
    }));
    const validLongform = validateDirecting({
      title: 'فیلم بلند ۲۰ شخصیته',
      durationSec: 180,
      characters: twentyChars,
      scenes: [
        {
          id: 's1',
          startSec: 0,
          endSec: 90,
          sourceSpan: { start: 0, end: 50 },
          background: '#112233',
          backgroundImage: 'assets/backgrounds/s1.png',
          characters: twentyChars.map(c => ({ id: c.id, action: 'idle', emotion: 'happy' })),
          lines: [{ characterId: 'char_1', text: 'سلام به همه در صحنه اول', startSec: 2, endSec: 6 }]
        },
        {
          id: 's2',
          startSec: 90,
          endSec: 180,
          sourceSpan: { start: 50, end: 100 },
          background: '#223344',
          backgroundImage: 'assets/backgrounds/s2.png',
          characters: twentyChars.map(c => ({ id: c.id, action: 'wave', emotion: 'happy' })),
          lines: [{ characterId: 'char_2', text: 'پایان داستان در صحنه دوم', startSec: 95, endSec: 100 }]
        }
      ]
    }, { longform: true, requireContiguous: true, requireSourceSpan: true });

    if (validLongform.characters.length !== 20) {
      throw new Error(`انتظار ۲۰ کاراکتر بود اما ${validLongform.characters.length} باقی ماند`);
    }

    // بررسی خطای صریح روی کاراکتر بیست‌ویکم (BUG-01)
    let overLimitCaught = false;
    try {
      validateDirecting({
        title: 'بیش از سقف',
        durationSec: 180,
        characters: Array.from({ length: 21 }, (_, i) => ({ id: `c${i + 1}`, name: `C${i + 1}` })),
        scenes: [{ id: 's1', startSec: 0, endSec: 180, sourceSpan: { start: 0, end: 10 } }]
      });
    } catch (e) {
      if (e.message.includes('20')) overLimitCaught = true;
    }
    if (!overLimitCaught) throw new Error('کاراکتر بیست‌ویکم خطای سقف ۲۰ کاراکتر را پرتاب نکرد!');

    // بررسی parseModelJson در برابر توضیحات دارای آکولاد بعد از JSON (BUG-02)
    const parsedExtra = parseModelJson('```json\n{"title":"ok","scenes":[]}\n```\nتوضیح اضافه {یادداشت}');
    if (parsedExtra.title !== 'ok') throw new Error('parseModelJson نتوانست JSON را درست استخراج کند');

    console.log('اعتبارسنجی ۲۰ کاراکتر، رد کاراکتر ۲۱ام، پیوستگی صحنه‌ها (۱۸۰ ثانیه) و parseModelJson موفق بود.');
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
