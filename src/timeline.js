/**
 * اولویت ۳: Timeline
 * JSON کارگردانی Gemini را به انیمیشن و pose ریگبی تبدیل می‌کند.
 *
 * رفع باگ‌ها:
 *  - #5:  یک CharacterInstance پایدار برای هر کاراکتر؛ هر فریم dt = 1/fps جلو می‌رود،
 *         زمان محلی با مدت واقعی انیمیشن wrap می‌شود (loop داخل AnimationState)، نه `% 2`
 *  - #6:  دوربین کارگردانی (camera هر صحنه) واقعاً خوانده و به worldX/worldY/scale نگاشت می‌شود
 *  - #12: سوراخ بین صحنه‌ها دیگر صحنهٔ آخر را برنمی‌گرداند؛ صحنهٔ قبلی (یا اولین صحنه قبل از شروع)
 */

import { CharacterInstance } from './rigby-adapter.js';

/** نگاشت سادهٔ اکشن/احساس به نام انیمیشن موجود در اسکلت */
const ACTION_TO_ANIM = {
  walk: 'idle',
  run: 'idle',
  stand: 'idle',
  idle: 'idle',
  wave: 'wave',
  greet: 'wave',
  talk: 'idle',
  speak: 'idle',
  happy: 'wave',
  sad: 'idle',
  promo: 'promo'
};

/** نگاشت نام دوربین کارگردانی به پارامترهای دوربین رندر (باگ #6) */
const CAMERA_PRESETS = {
  wide:   { worldX: 0, worldY: 1200, scale: 0.22 },
  medium: { worldX: 0, worldY: 1400, scale: 0.28 },
  close:  { worldX: 0, worldY: 1550, scale: 0.38 },
  closeup:{ worldX: 0, worldY: 1550, scale: 0.38 }
};
const DEFAULT_CAMERA = CAMERA_PRESETS.medium;

function pickAnimation(action = '', emotion = '', available = []) {
  const key = String(action || emotion || 'idle').toLowerCase();
  const mapped = ACTION_TO_ANIM[key] || 'idle';
  if (available.includes(mapped)) return mapped;
  return available[0] || 'idle';
}

export class Timeline {
  /**
   * @param {object} directing - خروجی Gemini (title, durationSec, characters, scenes)
   * @param {object} skeleton  - اسکلت لودشده از Rigby
   */
  constructor(directing, skeleton) {
    this.directing = directing;
    this.skeleton = skeleton;
    this.duration = Number(directing.durationSec) > 0 ? Number(directing.durationSec) : 10;
    this.availableAnims = (skeleton.animations || []).map(a => a.name);
    /** @type {Map<string, CharacterInstance>} نمونهٔ پایدار برای هر کاراکتر (باگ #5) */
    this.instances = new Map();
  }

  /** لیست پایدار شناسهٔ کاراکترها (از ریشهٔ کارگردانی؛ صحنه‌ها زیرمجموعه‌اند) */
  characterIds() {
    const chars = this.directing.characters || [];
    if (chars.length) return chars.map((c, i) => c.id || `char${i}`);
    // اگر ریشه خالی بود، از همهٔ صحنه‌ها جمع کن
    const ids = new Set();
    for (const s of this.directing.scenes || []) {
      for (const c of s.characters || []) ids.add(c.id || 'main');
    }
    return ids.size ? [...ids] : ['main'];
  }

  instanceFor(characterId) {
    let inst = this.instances.get(characterId);
    if (!inst) {
      inst = new CharacterInstance(this.skeleton);
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

  /** پارامترهای دوربین برای زمان داده شده، از فیلد camera صحنه (باگ #6) */
  cameraAt(timeSec) {
    const scene = this.sceneAt(timeSec);
    const cam = scene?.camera;
    if (cam && typeof cam === 'object') {
      return {
        worldX: Number(cam.worldX) || DEFAULT_CAMERA.worldX,
        worldY: Number(cam.worldY) || DEFAULT_CAMERA.worldY,
        scale: Number(cam.scale) > 0 ? Number(cam.scale) : DEFAULT_CAMERA.scale
      };
    }
    const preset = CAMERA_PRESETS[String(cam || '').toLowerCase()];
    const result = preset ? { ...preset } : { ...DEFAULT_CAMERA };
    // نمای close با چند کاراکتر کنار هم، سرها را از قاب بیرون می‌اندازد؛ کمی باز می‌کنیم
    if (result.scale > 0.3 && this.characterIds().length > 1) {
      result.scale = 0.3;
      result.worldY = 1450;
    }
    return result;
  }

  /** انیمیشن مورد نظر برای یک کاراکتر در زمان داده شده */
  animationFor(characterId, timeSec) {
    const scene = this.sceneAt(timeSec);
    if (!scene) return this.availableAnims[0] || 'idle';

    const char = (scene.characters || []).find(c => c.id === characterId);
    if (!char) return this.availableAnims[0] || 'idle';

    return pickAnimation(char.action, char.emotion, this.availableAnims);
  }

  /**
   * محاسبه pose برای زمان داده شده.
   * dt گام زمانی واقعی از فریم قبل است؛ loop و wrap با مدت واقعی انیمیشن
   * داخل AnimationState انجام می‌شود و فیزیک پیوسته می‌ماند (باگ #5).
   */
  poseAt(timeSec, characterId = 'main', dt = 1 / 12) {
    const anim = this.animationFor(characterId, timeSec);
    const inst = this.instanceFor(characterId);
    inst.setAnimation(anim, { loop: true });
    return inst.advance(dt);
  }

  /**
   * همهٔ کاراکترهای فعال در زمان داده شده با offset افقی.
   * @returns {Array<{id, pose, offsetX, offsetY}>}
   */
  charactersAt(timeSec, dt = 1 / 12) {
    const ids = this.characterIds();
    const n = Math.max(1, ids.length);
    const spacing = 1100;
    const startX = -((n - 1) * spacing) / 2;

    return ids.map((id, i) => ({
      id,
      pose: this.poseAt(timeSec, id, dt),
      offsetX: startX + i * spacing,
      offsetY: 0
    }));
  }

  /** خلاصهٔ Timeline برای دیباگ */
  summary() {
    return {
      title: this.directing.title,
      duration: this.duration,
      sceneCount: (this.directing.scenes || []).length,
      availableAnims: this.availableAnims,
      characters: this.characterIds()
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
        description: 'راه رفتن',
        camera: 'medium',
        characters: [
          { id: 'boy', action: 'walk', emotion: 'happy' },
          { id: 'girl', action: 'walk', emotion: 'happy' }
        ]
      },
      {
        id: 's2',
        startSec: 4,
        endSec: 8,
        description: 'سلام و حرف زدن',
        camera: 'close',
        characters: [
          { id: 'boy', action: 'wave', emotion: 'happy' },
          { id: 'girl', action: 'talk', emotion: 'happy' }
        ]
      }
    ]
  };
}
