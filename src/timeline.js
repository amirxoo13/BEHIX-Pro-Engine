/**
 * اولویت ۳: Timeline ساده
 * JSON کارگردانی Gemini را به انیمیشن و pose ریگبی تبدیل می‌کند.
 */

import { computePose } from './rigby-adapter.js';

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

function pickAnimation(action = '', emotion = '', available = []) {
  const key = (action || emotion || 'idle').toLowerCase();
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
    this.duration = directing.durationSec || 10;
    this.availableAnims = (skeleton.animations || []).map(a => a.name);
  }

  /** صحنهٔ فعال در زمان داده شده */
  sceneAt(timeSec) {
    const scenes = this.directing.scenes || [];
    return scenes.find(s => timeSec >= s.startSec && timeSec < s.endSec) || scenes[scenes.length - 1] || null;
  }

  /** انیمیشن مورد نظر برای یک کاراکتر در زمان داده شده */
  animationFor(characterId, timeSec) {
    const scene = this.sceneAt(timeSec);
    if (!scene) return this.availableAnims[0] || 'idle';

    const char = (scene.characters || []).find(c => c.id === characterId);
    if (!char) return this.availableAnims[0] || 'idle';

    return pickAnimation(char.action, char.emotion, this.availableAnims);
  }

  /** محاسبه pose برای زمان داده شده */
  poseAt(timeSec, characterId = 'main') {
    const anim = this.animationFor(characterId, timeSec);
    const localTime = timeSec % 2; // حلقهٔ ساده
    return computePose(this.skeleton, anim, localTime);
  }

  /** خلاصهٔ Timeline برای دیباگ */
  summary() {
    return {
      title: this.directing.title,
      duration: this.duration,
      sceneCount: (this.directing.scenes || []).length,
      availableAnims: this.availableAnims,
      characters: (this.directing.characters || []).map(c => c.id)
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
