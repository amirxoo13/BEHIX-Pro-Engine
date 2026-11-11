/**
 * اولویت ۳: Timeline
 * JSON کارگردانی Gemini را به انیمیشن و pose ریگبی تبدیل می‌کند.
 *
 * رفع باگ‌ها و بهبودهای فاز ۱ و ۲:
 *  - #5:  یک CharacterInstance پایدار برای هر کاراکتر؛ هر فریم dt = 1/fps جلو می‌رود،
 *         زمان محلی با مدت واقعی انیمیشن wrap می‌شود (loop داخل AnimationState)، نه `% 2`
 *  - #6:  دوربین کارگردانی (camera هر صحنه) واقعاً خوانده و به worldX/worldY/scale نگاشت می‌شود
 *  - #12: سوراخ بین صحنه‌ها دیگر صحنهٔ آخر را برنمی‌گرداند؛ صحنهٔ قبلی (یا اولین صحنه قبل از شروع)
 *  - فاز ۱/۲: حذف برش کاراکترها به ۳ تا؛ پشتیبانی از تا ۲۰ کاراکتر متمایز (BEHIX_MAX_CHARACTERS) داخل قاب wide.
 *  - فاز ۱/۲: هر کاراکتر اسکلت و اطلس مستقل خودش را دارد (از skeletonPath و atlasPath در characters).
 *  - فاز ۱/۲: نگاشت اکشن هر کاراکتر فقط به انیمیشنی که در اسکلت خودش وجود دارد؛ اگر نبود، به اولین انیمیشن موجود همان اسکلت برمی‌گردد و در warnings ثبت می‌شود.
 *  - فاز ۱/۲: لب‌خوانی فقط از یک مسیر (در src/audio-track.js روی انیمیشن فعال همان بازه بدون تغییر مدت انیمیشن) اعمال می‌شود تا دوباره‌کاری رخ ندهد.
 *  - فاز ۱/۲: پشتیبانی از تصویر پس‌زمینهٔ ثابت هر صحنه (backgroundImageAt) با حفظ fallback رنگ تخت (backgroundAt).
 */

import { CharacterInstance, loadSkeletonFromFile } from './rigby-adapter.js';
import { MAX_CHARACTERS } from './gemini-directing.js';
import { sample } from '../engine/rigby-core/index.js';

/** نگاشت پایهٔ اکشن/احساس به نام انیمیشن استاندارد اسکلت */
export const ACTION_TO_ANIM = {
  walk: 'walk',
  run: 'run',
  stand: 'idle',
  idle: 'idle',
  wave: 'wave',
  greet: 'wave',
  talk: 'talk',
  speak: 'talk',
  happy: 'wave',
  sad: 'idle',
  promo: 'promo'
};

/** نگاشت جایگزین زمانی که انیمیشن دقیق (مثل walk یا talk) در اسکلت نیست ولی idle/wave هست */
const ACTION_FALLBACKS = {
  walk: ['walk', 'idle'],
  run: ['run', 'walk', 'idle'],
  stand: ['stand', 'idle'],
  idle: ['idle'],
  wave: ['wave', 'idle'],
  greet: ['wave', 'greet', 'idle'],
  talk: ['talk', 'speak', 'idle'],
  speak: ['speak', 'talk', 'idle'],
  happy: ['wave', 'happy', 'idle'],
  sad: ['sad', 'idle'],
  promo: ['promo', 'wave', 'idle']
};

/** نگاشت نام دوربین کارگردانی به پارامترهای دوربین رندر (باگ #6) */
/**
 * قاب‌بندی دوربین به‌صورت «کسری از ارتفاع قاب که کاراکتر باید اشغال کند» تعریف می‌شود،
 * نه مقیاس ثابت. مقیاس ثابت به قد کاراکتر در واحد جهانی گره خورده بود و با عوض شدن نسبت‌های
 * بدن از کالیبره خارج می‌شد: با scale=0.22 بازیکن ۱۰۸٪ ارتفاع قاب می‌شد و سرش بیرون می‌زد،
 * یعنی نمای «wide» عملاً نمای بسته بود.
 * مقیاس واقعی در cameraAt از روی قد اندازه‌گیری‌شدهٔ همان کاراکتر حساب می‌شود.
 */
const CAMERA_FRAMING = {
  wide:   { worldYRatio: 0.50, heightFraction: 0.30 },
  medium: { worldYRatio: 0.52, heightFraction: 0.58 },
  close:  { worldYRatio: 0.66, heightFraction: 1.05 },
  closeup:{ worldYRatio: 0.90, heightFraction: 2.20 }
};

/** ارتفاع مرجع قاب که مقیاس نسبت به آن نرمال می‌شود (هم‌راستا با نرمال‌سازی video-encoder) */
const REFERENCE_FRAME_HEIGHT = 540;

/** قد تقریبی کاراکتر در واحد جهانی، اگر اندازه‌گیری از اسکلت ممکن نبود */
const FALLBACK_FIGURE_HEIGHT = 2630;

const DEFAULT_CAMERA_KEY = 'medium';

/**
 * انتخاب انیمیشن فقط از میان انیمیشن‌های موجود در اسکلت همان کاراکتر.
 * اگر اکشن/نگاشت در اسکلت نبود، به اولین انیمیشن موجود همان اسکلت برمی‌گردد و هشدار ثبت می‌کند.
 */
export function pickAnimation(action = '', emotion = '', available = [], onWarning = null, characterId = '') {
  if (!Array.isArray(available) || available.length === 0) {
    if (onWarning) {
      onWarning(`اسکلت کاراکتر "${characterId || '?'}" هیچ انیمیشنی ندارد`);
    }
    return null;
  }

  const rawKey = String(action || emotion || 'idle').trim().toLowerCase();
  if (available.includes(rawKey)) return rawKey;

  const candidates = ACTION_FALLBACKS[rawKey] || [ACTION_TO_ANIM[rawKey]].filter(Boolean);
  for (const cand of candidates) {
    if (available.includes(cand)) return cand;
  }

  const fallback = available[0];
  if (onWarning) {
    onWarning(`اکشن "${action || emotion || 'idle'}" برای کاراکتر "${characterId || '?'}" در اسکلت یافت نشد؛ بازگشت به اولین انیمیشن موجود ("${fallback}")`);
  }
  return fallback;
}

/** تبدیل متن دیالوگ (فارسی یا انگلیسی) به کلمات زمان‌بندی‌شده برای visemeCues */
export function timedWordsFromLine(text, startSec, endSec) {
  const rawTokens = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!rawTokens.length) return [];
  const span = Math.max(0.1, Number(endSec) - Number(startSec));
  const step = span / rawTokens.length;
  const faMap = {
    'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's',
    'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
    'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'o', 'ه': 'e',
    'ی': 'i', 'ئ': 'i', 'ة': 'e', 'ي': 'i', 'ك': 'k'
  };
  return rawTokens.map((token, idx) => {
    let latin = '';
    for (const ch of token) {
      if (faMap[ch]) latin += faMap[ch];
      else if (/[a-zA-Z0-9]/.test(ch)) latin += ch;
    }
    if (!latin) latin = 'a';
    return {
      word: latin,
      start: Number(startSec) + idx * step,
      end: Number(startSec) + (idx + 1) * step
    };
  });
}

export class Timeline {
  /**
   * @param {object} directing - خروجی Gemini (title, durationSec, characters, scenes)
   * @param {object} [defaultSkeleton] - اسکلت پیش‌فرض در صورتی که کاراکتر skeletonPath اختصاصی نداشته باشد
   * @param {object} [options] - تنظیمات اضافی (allowedRoot، characterSkeletons، characterAtlases)
   */
  constructor(directing, defaultSkeleton = null, options = {}) {
    this.directing = directing || { scenes: [] };
    this.defaultSkeleton = defaultSkeleton || loadSkeletonFromFile('examples/nila.skel.json');
    this.skeleton = this.defaultSkeleton;
    this.options = options;
    this.duration = Number(this.directing.durationSec) > 0 ? Number(this.directing.durationSec) : 10;
    this.availableAnims = (this.defaultSkeleton.animations || []).map(a => a.name);

    /** @type {Set<string>} مجموعهٔ هشدارهای بدون تکرار برای گزارش رندر */
    this.warningSet = new Set();
    /** @type {string[]} لیست هشدارهای زمان‌بندی و انیمیشن */
    this.warnings = [];

    /** @type {Map<string, object>} اسکلت مستقل هر کاراکتر */
    this.characterSkeletons = new Map();
    /** @type {Map<string, string>} مسیر اطلس مستقل هر کاراکتر */
    this.characterAtlases = new Map();
    /** @type {Map<string, CharacterInstance>} نمونهٔ پایدار برای هر کاراکتر (باگ #5) */
    this.instances = new Map();
    /** کلیدهای لب‌خوانی هر خط، با زمان محلی انیمیشن، برای نمونه در poseAt */
    this.lipSyncLines = [];
    /** کلیدهای دهان قبل از لب‌خوانی، تا خارج از دیالوگ دهان با حلقهٔ کلیپ تکان نخورد */
    this.mouthBaseKeys = new Map();

    this._initCharacterAssets();
  }

  addWarning(msg) {
    if (!msg || this.warningSet.has(msg)) return;
    this.warningSet.add(msg);
    this.warnings.push(msg);
  }

  /** بارگذاری اسکلت و اطلس اختصاصی هر کاراکتر (با کپی مستقل تا کلیدهای لب‌خوانی کاراکترها تداخل نکنند) */
  _initCharacterAssets() {
    const providedSkeletons = this.options.characterSkeletons || {};
    const providedAtlases = this.options.characterAtlases || {};

    for (const ch of this.directing.characters || []) {
      if (!ch || !ch.id) continue;
      let sk = null;
      if (providedSkeletons[ch.id]) {
        sk = providedSkeletons[ch.id];
      } else if (ch.skeleton && typeof ch.skeleton === 'object') {
        sk = ch.skeleton;
      } else if (typeof ch.skeletonPath === 'string' && ch.skeletonPath.trim()) {
        sk = loadSkeletonFromFile(ch.skeletonPath.trim(), {
          allowedRoot: this.options.allowedRoot || null,
          name: ch.id
        });
      } else {
        sk = this.defaultSkeleton;
      }

      if (sk && typeof sk.clone === 'function') {
        sk = sk.clone();
      }
      this.characterSkeletons.set(ch.id, sk);

      if (providedAtlases[ch.id]) {
        this.characterAtlases.set(ch.id, providedAtlases[ch.id]);
      } else if (typeof ch.atlasPath === 'string' && ch.atlasPath.trim()) {
        this.characterAtlases.set(ch.id, ch.atlasPath.trim());
      }
    }
  }

  /** اسکلت مربوط به کاراکتر داده شده */
  skeletonFor(characterId) {
    let sk = this.characterSkeletons.get(characterId);
    if (!sk) {
      sk = typeof this.defaultSkeleton?.clone === 'function'
        ? this.defaultSkeleton.clone()
        : this.defaultSkeleton;
      this.characterSkeletons.set(characterId, sk);
    }
    return sk;
  }

  /** مسیر اطلس مربوط به کاراکتر داده شده (یا null برای اطلس پیش‌فرض) */
  atlasFor(characterId) {
    return this.characterAtlases.get(characterId) || null;
  }

  /** لیست پایدار شناسهٔ کاراکترها (تا سقف MAX_CHARACTERS = ۲۰ کاراکتر) */
  characterIds() {
    const rawChars = this.directing.characters || [];
    if (rawChars.length > MAX_CHARACTERS) {
      throw new Error(`تعداد کاراکترها (${rawChars.length}) بیش از سقف مجاز ${MAX_CHARACTERS} است`);
    }
    if (rawChars.length) {
      return rawChars.map((c, i) => c.id || `char${i}`);
    }
    const ids = new Set();
    for (const s of this.directing.scenes || []) {
      for (const c of s.characters || []) ids.add(c.id || 'main');
    }
    const list = ids.size ? [...ids] : ['main'];
    if (list.length > MAX_CHARACTERS) {
      throw new Error(`تعداد کاراکترها (${list.length}) بیش از سقف مجاز ${MAX_CHARACTERS} است`);
    }
    return list;
  }

  instanceFor(characterId) {
    let inst = this.instances.get(characterId);
    if (!inst) {
      const skel = this.skeletonFor(characterId);
      inst = new CharacterInstance(skel);
      this.instances.set(characterId, inst);
    }
    return inst;
  }

  /**
   * صحنهٔ فعال در زمان داده شده (باگ #12):
   *  - داخل بازهٔ یک صحنه → همان صحنه
   *  - در سوراخ بین دو صحنه → آخرین صحنه‌ای که شروع شده (صحنهٔ قبلی)
   *  - قبل از اولین صحنه → اولین صحنه
   */
  sceneAt(timeSec) {
    const scenes = this.directing.scenes || [];
    if (!scenes.length) return null;
    const active = scenes.find(s => timeSec >= s.startSec && timeSec < s.endSec);
    if (active) return active;
    let previous = null;
    for (const s of scenes) {
      if (s.startSec <= timeSec && (!previous || s.startSec > previous.startSec)) previous = s;
    }
    return previous || scenes[0];
  }

  /** رنگ پس‌زمینهٔ صحنهٔ فعال (#rrggbb از کارگردانی)؛ null = پیش‌فرض رندرر */
  backgroundAt(timeSec) {
    const bg = this.sceneAt(timeSec)?.background;
    if (typeof bg !== 'string') return null;
    const m = bg.trim().match(/^#?([0-9a-fA-F]{6})$/);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /** مسیر تصویر پس‌زمینهٔ ثابت صحنهٔ فعال در صورت وجود */
  backgroundImageAt(timeSec) {
    const img = this.sceneAt(timeSec)?.backgroundImage;
    if (typeof img === 'string' && img.trim()) return img.trim();
    return null;
  }

  /** پارامترهای دوربین برای زمان داده شده، از فیلد camera صحنه (باگ #6 و ب20: حفظ تا ۲۰ کاراکتر داخل قاب wide) */
  /**
   * قد کاراکترها در واحد جهانی، یک‌بار از روی pose استراحت اندازه‌گیری و نگه داشته می‌شود.
   * دوربین از روی همین عدد مقیاس را حساب می‌کند، پس اگر نسبت‌های بدن عوض شوند قاب‌بندی
   * خودش را تطبیق می‌دهد و نیازی به کالیبرهٔ دستی مقیاس نیست.
   */
  figureHeight() {
    if (this._figureHeight) return this._figureHeight;
    let tallest = 0;
    for (const id of this.characterIds()) {
      const skel = this.skeletonFor(id);
      if (!skel) continue;
      try {
        const inst = new CharacterInstance(skel);
        inst.advance(0);
        let minY = Infinity, maxY = -Infinity;
        for (const q of inst.pose.quads(skel)) {
          for (const [, y] of q.positions) {
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
        if (Number.isFinite(minY) && maxY > minY) tallest = Math.max(tallest, maxY - minY);
      } catch {
        // اندازه‌گیری یک کاراکتر که شکست بخورد، بقیه را متوقف نمی‌کند
      }
    }
    this._figureHeight = tallest > 0 ? tallest : FALLBACK_FIGURE_HEIGHT;
    return this._figureHeight;
  }

  /** مقیاس لازم تا کاراکتر همان کسر خواسته‌شده از ارتفاع قاب را بگیرد */
  scaleForFraction(heightFraction) {
    return (heightFraction * REFERENCE_FRAME_HEIGHT) / this.figureHeight();
  }

  cameraAt(timeSec) {
    const scene = this.sceneAt(timeSec);
    const cam = scene?.camera;
    const height = this.figureHeight();

    // دوربین دستی: هر مقداری که صحنه صریحاً داده، عیناً رعایت می‌شود
    if (cam && typeof cam === 'object') {
      const fallback = CAMERA_FRAMING[DEFAULT_CAMERA_KEY];
      return {
        worldX: Number(cam.worldX) || 0,
        worldY: Number(cam.worldY) || Math.round(height * fallback.worldYRatio),
        scale: Number(cam.scale) > 0 ? Number(cam.scale) : this.scaleForFraction(fallback.heightFraction)
      };
    }

    const key = String(cam || '').toLowerCase();
    const framing = CAMERA_FRAMING[key] || CAMERA_FRAMING[DEFAULT_CAMERA_KEY];
    const result = {
      worldX: 0,
      worldY: Math.round(height * framing.worldYRatio),
      scale: this.scaleForFraction(framing.heightFraction)
    };

    // با زیاد شدن کاراکترها قاب باز می‌شود تا همه داخل تصویر جا شوند
    const activeCount = this.activeCharacterIdsAt(timeSec).length;
    const wideScale = this.scaleForFraction(CAMERA_FRAMING.wide.heightFraction);
    if (activeCount > 3) {
      const widenFactor = 1 + (activeCount - 3) * 0.07;
      result.scale = Math.max(wideScale * 0.35, Math.min(result.scale, wideScale) / widenFactor);
      result.worldY = Math.round(height * CAMERA_FRAMING.wide.worldYRatio);
    } else if (activeCount > 1) {
      const mediumScale = this.scaleForFraction(CAMERA_FRAMING.medium.heightFraction);
      if (result.scale > mediumScale) {
        result.scale = mediumScale;
        result.worldY = Math.round(height * CAMERA_FRAMING.medium.worldYRatio);
      }
    }
    return result;
  }

  /** لیست کاراکترهای حاضر در صحنهٔ فعال (یا کل کاراکترها اگر صحنه لیست جدا نداشت) */
  activeCharacterIdsAt(timeSec) {
    const scene = this.sceneAt(timeSec);
    if (scene && Array.isArray(scene.characters) && scene.characters.length > 0) {
      return scene.characters.slice(0, MAX_CHARACTERS).map((c, i) => c.id || `char${i}`);
    }
    return this.characterIds();
  }

  /** انیمیشن مورد نظر برای یک کاراکتر در زمان داده شده از روی اسکلت همان کاراکتر */
  animationFor(characterId, timeSec) {
    const skel = this.skeletonFor(characterId);
    const avail = (skel?.animations || []).map(a => a.name);
    const scene = this.sceneAt(timeSec);
    if (!scene) return avail[0] || 'idle';

    const char = (scene.characters || []).find(c => c.id === characterId);
    if (!char) return avail[0] || 'idle';

    return pickAnimation(
      char.action,
      char.emotion,
      avail,
      msg => this.addWarning(msg),
      characterId
    );
  }

  /**
   * محاسبه pose برای زمان داده شده.
   * dt گام زمانی واقعی از فریم قبل است؛ loop و wrap با مدت واقعی انیمیشن
   * داخل AnimationState انجام می‌شود و فیزیک پیوسته می‌ماند (باگ #5).
   */
  poseAt(timeSec, characterId = 'main', dt = 1 / 12) {
    const anim = this.animationFor(characterId, timeSec);
    const inst = this.instanceFor(characterId);
    if (anim) {
      inst.setAnimation(anim, { loop: true });
    }
    const pose = inst.advance(dt);
    this._applyDialogueMouth(pose, characterId, timeSec, inst);
    return pose;
  }

  /**
   * کلیدهای keyLipSync را برای یک خط نگه می‌دارد.
   * keys زمان محلی انیمیشن است (۰ تا مدت خط)، نه ثانیهٔ مطلق فیلم.
   */
  recordLipSync({ characterId, animName, slot, startSec, endSec, keys, baseKeys }) {
    const id = `${characterId}:${animName}`;
    if (!this.mouthBaseKeys.has(id) && Array.isArray(baseKeys)) {
      this.mouthBaseKeys.set(id, baseKeys);
    }
    this.lipSyncLines.push({
      characterId,
      animName,
      slot,
      startSec,
      endSec,
      keys: keys || []
    });
  }

  _applyDialogueMouth(pose, characterId, timeSec, inst) {
    const lines = this.lipSyncLines.filter(l => l.characterId === characterId);
    if (!lines.length || !pose?.attachment) return;
    const skel = this.skeletonFor(characterId);
    const slot = lines[0].slot;
    if (slot < 0 || slot >= pose.attachment.length) return;

    const line = lines.find(l => timeSec >= l.startSec && timeSec < l.endSec);
    if (line) {
      const localT = timeSec - line.startSec;
      const name = sample(line.keys, localT);
      if (typeof name === 'string') pose.attachment[slot] = name;
      return;
    }

    const animName = inst?.currentAnimation;
    const base = this.mouthBaseKeys.get(`${characterId}:${animName}`);
    const dur = (skel?.animations || []).find(a => a.name === animName)?.duration || 0;
    const rawT = inst?.state?.currentTime?.() ?? 0;
    const wrapped = dur > 0 ? ((rawT % dur) + dur) % dur : rawT;
    const setup = skel?.slots?.[slot]?.attachment;
    const name = (base && base.length) ? sample(base, wrapped) : setup;
    if (typeof name === 'string') pose.attachment[slot] = name;
  }

  /**
   * همهٔ کاراکترهای فعال در زمان داده شده با offset افقی، اسکلت و اطلس اختصاصی
   * به گونه‌ای که تا ۲۰ کاراکتر کاملاً داخل قاب wide قرار می‌گیرند.
   * @returns {Array<{id, pose, skeleton, atlasPath, offsetX, offsetY}>}
   */
  charactersAt(timeSec, dt = 1 / 12) {
    const ids = this.activeCharacterIdsAt(timeSec);
    const n = Math.max(1, ids.length);
    const spacing = n <= 3 ? 900 : Math.max(90, Math.round(1800 / (n - 1)));
    const startX = -((n - 1) * spacing) / 2;

    const scene = this.sceneAt(timeSec);
    // پیشرفت خطی داخل صحنه، برای درون‌یابی جابه‌جایی کاراکتر
    const sStart = Number(scene?.startSec);
    const sEnd = Number(scene?.endSec);
    const span = Number.isFinite(sStart) && Number.isFinite(sEnd) && sEnd > sStart ? sEnd - sStart : 0;
    const progress = span > 0 ? Math.min(1, Math.max(0, (timeSec - sStart) / span)) : 0;

    return ids.map((id, i) => {
      // جای پیش‌فرض: جایگاه ثابت بر اساس شمارهٔ کاراکتر.
      // اگر صحنه برای این کاراکتر fromX/toX داده باشد، بین آن دو درون‌یابی می‌شود تا کاراکتر
      // واقعاً در قاب حرکت کند — بدون این، اکشن "run" فقط درجا دویدن بود.
      let offsetX = startX + i * spacing;
      let offsetY = 0;

      const entry = (scene?.characters || []).find(c => c?.id === id);
      const fromX = Number(entry?.fromX);
      const toX = Number(entry?.toX);
      if (Number.isFinite(fromX) && Number.isFinite(toX)) {
        offsetX = fromX + (toX - fromX) * progress;
      } else if (Number.isFinite(fromX)) {
        offsetX = fromX;
      } else if (Number.isFinite(Number(entry?.x))) {
        offsetX = Number(entry.x);
      }

      const fromY = Number(entry?.fromY);
      const toY = Number(entry?.toY);
      if (Number.isFinite(fromY) && Number.isFinite(toY)) {
        offsetY = fromY + (toY - fromY) * progress;
      } else if (Number.isFinite(Number(entry?.y))) {
        offsetY = Number(entry.y);
      }

      return {
        id,
        pose: this.poseAt(timeSec, id, dt),
        skeleton: this.skeletonFor(id),
        atlasPath: this.atlasFor(id),
        offsetX,
        offsetY
      };
    });
  }

  /** خلاصهٔ Timeline برای دیباگ و گزارش */
  summary() {
    return {
      title: this.directing.title,
      duration: this.duration,
      sceneCount: (this.directing.scenes || []).length,
      availableAnims: this.availableAnims,
      characters: this.characterIds(),
      warnings: [...this.warnings]
    };
  }
}

/** نمونهٔ کارگردانی برای تست (وقتی Gemini در دسترس نیست) */
export function mockDirecting() {
  return {
    title: 'صحبت در پارک',
    durationSec: 8,
    characters: [
      { id: 'boy', name: 'پسر', appearance: 'پیراهن آبی' },
      { id: 'girl', name: 'دختر', appearance: 'لباس قرمز' }
    ],
    scenes: [
      {
        id: 's1',
        startSec: 0,
        endSec: 4,
        sourceSpan: { start: 0, end: 25 },
        description: 'راه رفتن',
        camera: 'medium',
        background: '#1c2430',
        characters: [
          { id: 'boy', action: 'walk', emotion: 'happy' },
          { id: 'girl', action: 'walk', emotion: 'happy' }
        ],
        lines: [
          { characterId: 'boy', text: 'سلام روزت بخیر', startSec: 0.5, endSec: 3.0 }
        ]
      },
      {
        id: 's2',
        startSec: 4,
        endSec: 8,
        sourceSpan: { start: 25, end: 55 },
        description: 'سلام و حرف زدن',
        camera: 'close',
        background: '#222b38',
        characters: [
          { id: 'boy', action: 'wave', emotion: 'happy' },
          { id: 'girl', action: 'talk', emotion: 'happy' }
        ],
        lines: [
          { characterId: 'girl', text: 'سلام چه خبر از پروژه', startSec: 4.5, endSec: 7.5 }
        ]
      }
    ]
  };
}
