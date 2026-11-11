/**
 * پایپ‌لاین کامل سناریو به کارگردانی و دارایی‌های ریگ‌شده (فاز ۲):
 *  - دریافت متن سناریو از کاربر.
 *  - تولید JSON کارگردانی ساخت‌یافته با Vertex Gemini (و استخراج برگه‌های شخصیت با generateCharacterSheetsFromScenario).
 *  - تضمین اتصال هر صحنه به بخش متناظر سناریو با `sourceSpan: { start, end }`.
 *  - تضمین پیوستگی کامل صحنه‌ها بدون حفره از ثانیهٔ 0 تا `durationSec` (بین ۱۸۰ تا ۳۰۰ ثانیه برای فیلم بلند).
 *  - پشتیبانی از تا ۲۰ کاراکتر متمایز با اسکلت و اطلس اختصاصی (`assets/<id>/<id>.skel.json` و `assets/<id>/<id>.atlas`) که با `autoRig` روی CPU ساخته می‌شوند.
 *  - خطای صریح در صورت وجود بیش از ۲۰ کاراکتر.
 */

import {
  generateDirecting,
  validateDirecting,
  MAX_CHARACTERS,
  LONGFORM_MIN_SEC,
  LONGFORM_MAX_SEC
} from './gemini-directing.js';
import {
  defaultCharacterLayers,
  sanitizeId,
  buildAllDirectingAssets,
  generateCharacterSheetsFromScenario
} from './character-factory.js';

/**
 * نرمال‌سازی و تکمیل قرارداد JSON کارگردانی پس از دریافت از مدل:
 *  - اطمینان از وجود `sourceSpan` معتبر متصل به متن سناریو برای هر صحنه.
 *  - اطمینان از وجود `skeletonPath`, `atlasPath`, `layers` برای هر کاراکتر (بدون استفاده از مسیر nila برای کاراکترهای جدید).
 *  - اطمینان از وجود `backgroundImage` و `lines` برای هر صحنه.
 *  - تنظیم پیوستگی دقیق صحنه‌ها تا کل بازهٔ زمانی `durationSec` را بدون حفره بپوشانند.
 */
export function normalizeScenarioDirecting(directing, scenarioText = '', options = {}) {
  if (!directing || typeof directing !== 'object') {
    throw new Error('کارگردانی معتبر نیست');
  }
  const textLen = Math.max(1, String(scenarioText || '').length);
  const chars = Array.isArray(directing.characters) ? directing.characters : [];
  if (chars.length > MAX_CHARACTERS) {
    throw new Error(`تعداد کاراکترهای سناریو (${chars.length}) بیش از سقف مجاز است؛ سقف ${MAX_CHARACTERS} کاراکتر است`);
  }

  const seenIds = new Set();
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const id = sanitizeId(ch.id || `char_${i + 1}`);
    if (seenIds.has(id)) {
      throw new Error(`شناسهٔ کاراکتر تکراری است: "${id}"`);
    }
    seenIds.add(id);
    ch.id = id;
    ch.name = String(ch.name || id);
    if (!ch.skeletonPath || ch.skeletonPath.includes('nila.skel.json')) {
      ch.skeletonPath = `assets/${id}/${id}.skel.json`;
    }
    if (!ch.atlasPath || ch.atlasPath.includes('scene.nila.atlas')) {
      ch.atlasPath = `assets/${id}/${id}.atlas`;
    }
    if (!Array.isArray(ch.layers) || ch.layers.length === 0) {
      ch.layers = defaultCharacterLayers(id);
    }
  }

  const scenes = Array.isArray(directing.scenes) ? directing.scenes : [];
  if (!scenes.length) {
    throw new Error('کارگردانی معتبر نیست: فیلد scenes خالی است');
  }

  const requestedDur = Number(options.durationSec || options.duration || directing.durationSec);
  const isLongform = Boolean(options.longform || requestedDur >= LONGFORM_MIN_SEC);
  let targetDuration = Number.isFinite(requestedDur) && requestedDur > 0
    ? requestedDur
    : (isLongform ? LONGFORM_MIN_SEC : Math.max(...scenes.map(s => Number(s.endSec) || 10)));

  if (isLongform) {
    targetDuration = Math.min(LONGFORM_MAX_SEC, Math.max(LONGFORM_MIN_SEC, targetDuration));
  }
  directing.durationSec = targetDuration;

  if (options.normalizeTiming !== false) {
    const rawTotal = scenes.reduce((acc, s) => acc + Math.max(1, (Number(s.endSec) || 0) - (Number(s.startSec) || 0)), 0);
    let cursor = 0;
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      const rawSpan = Math.max(1, (Number(s.endSec) || 0) - (Number(s.startSec) || 0));
      const scaledSpan = (i === scenes.length - 1)
        ? (targetDuration - cursor)
        : Math.max(1, Math.round((rawSpan / rawTotal) * targetDuration * 100) / 100);
      s.startSec = Number(cursor.toFixed(2));
      s.endSec = Number((i === scenes.length - 1 ? targetDuration : cursor + scaledSpan).toFixed(2));
      cursor = s.endSec;
    }
  }

  const spanStep = Math.max(1, Math.floor(textLen / scenes.length));
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    s.id = s.id || `scene-${String(i + 1).padStart(2, '0')}`;
    if (!s.sourceSpan || typeof s.sourceSpan.start !== 'number' || typeof s.sourceSpan.end !== 'number' || s.sourceSpan.end <= s.sourceSpan.start) {
      const start = Math.min(textLen - 1, i * spanStep);
      const end = (i === scenes.length - 1) ? textLen : Math.min(textLen, (i + 1) * spanStep);
      s.sourceSpan = { start, end: Math.max(start + 1, end) };
    }
    if (!s.background) s.background = '#1b263b';
    if (!s.backgroundImage) {
      s.backgroundImage = `assets/backgrounds/${sanitizeId(s.id)}.png`;
    }
    if (!Array.isArray(s.characters) || s.characters.length === 0) {
      const fallbackCharId = chars[0]?.id || 'main';
      s.characters = [{ id: fallbackCharId, action: 'idle', emotion: 'neutral' }];
    }
    if (!Array.isArray(s.lines) || s.lines.length === 0) {
      const speakerId = s.characters[0]?.id || chars[0]?.id || 'main';
      const lineStart = Number((s.startSec + Math.min(1, (s.endSec - s.startSec) * 0.1)).toFixed(2));
      const lineEnd = Number((s.endSec - Math.min(1, (s.endSec - s.startSec) * 0.1)).toFixed(2));
      if (lineEnd > lineStart) {
        s.lines = [{
          characterId: speakerId,
          text: s.description || directExcerpt(scenarioText, s.sourceSpan.start, s.sourceSpan.end) || 'سلام به همگی',
          startSec: lineStart,
          endSec: lineEnd
        }];
      } else {
        s.lines = [];
      }
    }
  }

  return validateDirecting(directing, {
    longform: isLongform,
    requireContiguous: true,
    requireSourceSpan: true
  });
}

function directExcerpt(text, start, end) {
  if (!text) return '';
  return String(text).slice(start, end).replace(/\s+/g, ' ').trim().slice(0, 120);
}

/**
 * اجرای کامل پایپ‌لاین سناریو:
 *  سناریو → Gemini (کارگردانی + برگهٔ شخصیت) → نرمال‌سازی و اعتبارسنجی (۱۸۰-۳۰۰ ثانیه، تا ۲۰ کاراکتر، sourceSpan)
 *  → ساخت لایه‌ها با مدل تصویر Vertex و autoRig روی CPU و ساخت پس‌زمینهٔ ثابت (در صورت فعال بودن buildAssets).
 */
export async function prepareScenarioDirecting(scenario, options = {}) {
  const rawDirecting = await generateDirecting(scenario, options);
  if (!Array.isArray(rawDirecting.characters) || rawDirecting.characters.length === 0) {
    rawDirecting.characters = await generateCharacterSheetsFromScenario(scenario, options);
  }
  const directing = normalizeScenarioDirecting(rawDirecting, scenario, options);

  let assetReport = null;
  if (options.buildAssets !== false) {
    assetReport = await buildAllDirectingAssets(directing, options);
  }

  return {
    directing,
    assetReport
  };
}
