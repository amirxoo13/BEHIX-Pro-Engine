/**
 * تست اولویت ۳: Timeline و لب‌خوانی تک‌مسیره (به‌روزرسانی‌شده برای فاز ۱ و ۲)
 * اجرا: node src/test-timeline.js
 *
 * بررسی‌ها:
 *  - خلاصهٔ Timeline، دوربین، و محاسبهٔ pose پیوسته
 *  - بررسی عدم برش کاراکترها به ۳ و پشتیبانی از ۲۰ کاراکتر متمایز داخل قاب wide
 *  - بررسی نگاشت اکشن به انیمیشن موجود در اسکلت کاراکتر و ثبت هشدار در صورت نبودن اکشن
 *  - بررسی لب‌خوانی تک‌مسیره با keyLipSync فقط روی انیمیشن فعال همان بازه بدون تغییر مدت اصلی انیمیشن
 *  - بررسی پرتاب خطای صریح در صورت نبودن اسلات دهان برای کاراکتر دارای دیالوگ (و عدم خطا برای کاراکتر بدون دیالوگ)
 */

import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline, mockDirecting } from './timeline.js';
import { buildAudioTrackAndLipSync } from './audio-track.js';

async function main() {
  console.log('=== اولویت ۳: Timeline ===');

  const skeleton = loadSkeletonFromFile('examples/nila.skel.json');
  const directing = mockDirecting();
  const tl = new Timeline(directing, skeleton);

  console.log('خلاصه:', tl.summary());

  const fps = 8;
  const times = [0, 2, 4, 6, 7.5];
  for (const t of times) {
    const scene = tl.sceneAt(t);
    const cam = tl.cameraAt(t);
    const animBoy = tl.animationFor('boy', t);
    const animGirl = tl.animationFor('girl', t);
    const pose = tl.poseAt(t, 'boy', 1 / fps);
    const quadCount = [...pose.quads(skeleton)].length;
    console.log(
      `t=${t}s | صحنه=${scene?.id} | دوربین scale=${cam.scale} | پسر=${animBoy} | دختر=${animGirl} | quad=${quadCount}`
    );
    if (quadCount <= 0) throw new Error('pose بدون quad');
  }

  // باگ #12: سوراخ بین صحنه‌ها نباید صحنهٔ آخر را بدهد
  const gapDirecting = {
    title: 'gap',
    durationSec: 10,
    characters: [{ id: 'main' }],
    scenes: [
      { id: 'a', startSec: 1, endSec: 3, characters: [{ id: 'main', action: 'idle' }] },
      { id: 'b', startSec: 5, endSec: 7, characters: [{ id: 'main', action: 'wave' }] },
      { id: 'c', startSec: 8, endSec: 10, characters: [{ id: 'main', action: 'idle' }] }
    ]
  };
  const tl2 = new Timeline(gapDirecting, skeleton);
  const checks = [
    [0.5, 'a'],
    [2, 'a'],
    [4, 'a'],
    [7.5, 'b'],
    [9, 'c']
  ];
  for (const [t, expected] of checks) {
    const got = tl2.sceneAt(t)?.id;
    if (got !== expected) throw new Error(`sceneAt(${t}) = ${got}، انتظار ${expected}`);
  }
  console.log('sceneAt برای سوراخ‌ها درست است (باگ #12).');

  // بررسی ۲۰ کاراکتر هم‌زمان داخل قاب wide، کاراکتر بدون دیالوگ بدون دهان (موفق)، و لب‌خوانی تک‌مسیره بدون تغییر مدت انیمیشن
  const skelWithoutMouth = skeleton.clone();
  const mouthIdx = skelWithoutMouth.slots.findIndex(s => s.name === 'mouth');
  if (mouthIdx >= 0) skelWithoutMouth.removeSlot(mouthIdx);

  const twentyChars = Array.from({ length: 20 }, (_, i) => ({
    id: `hero_${i + 1}`,
    name: `قهرمان ${i + 1}`
  }));
  const multiDirecting = {
    title: 'بیست قهرمان',
    durationSec: 60,
    characters: twentyChars,
    scenes: [
      {
        id: 's1',
        startSec: 0,
        endSec: 60,
        camera: 'wide',
        backgroundImage: 'assets/backgrounds/s1.png',
        characters: twentyChars.map((c, idx) => ({
          id: c.id,
          action: idx === 0 ? 'backflip_nonexistent' : (idx === 1 ? 'wave' : 'idle'),
          emotion: 'happy'
        })),
        lines: [
          // hero_1 دهان ندارد ولی خط دیالوگ هم ندارد (نباید خطا بدهد)
          // hero_2 دهان دارد و اکشن فعال او wave است
          { characterId: 'hero_2', text: 'سلام به همه قهرمانان حاضر در صحنه', startSec: 0.2, endSec: 1.5 }
        ]
      }
    ]
  };

  const tl20 = new Timeline(multiDirecting, skeleton, {
    characterSkeletons: {
      hero_1: skelWithoutMouth
    }
  });

  const activeAt2 = tl20.charactersAt(2, 1 / 12);
  if (activeAt2.length !== 20) {
    throw new Error(`charactersAt باید ۲۰ کاراکتر برگرداند، اما ${activeAt2.length} برگرداند`);
  }

  // بررسی قرارگیری هر ۲۰ کاراکتر داخل قاب wide (1280x720)
  const camWide = tl20.cameraAt(2);
  const frameWidth = 1280;
  const cx = frameWidth / 2;
  for (const ch of activeAt2) {
    const screenX = cx + (ch.offsetX - camWide.worldX) * camWide.scale;
    if (screenX < 40 || screenX > frameWidth - 40) {
      throw new Error(`کاراکتر ${ch.id} از قاب wide بیرون زد: screenX=${screenX}`);
    }
  }

  if (!tl20.warnings.some(w => w.includes('backflip_nonexistent'))) {
    throw new Error('هشدار نبودن اکشن backflip_nonexistent در اسکلت ثبت نشد');
  }
  if (tl20.backgroundImageAt(2) !== 'assets/backgrounds/s1.png') {
    throw new Error('backgroundImageAt مسیر تصویر پس‌زمینه را برنگرداند');
  }

  // بررسی اجرای یک‌بارهٔ keyLipSync فقط روی انیمیشن فعال (wave) بدون تغییر مدت اصلی انیمیشن
  const hero2Skel = tl20.skeletonFor('hero_2');
  const origDurations = new Map(hero2Skel.animations.map(a => [a.name, a.duration]));
  const mouthSlotIndex = hero2Skel.slots.findIndex(s => s.name === 'mouth');
  const waveAnim = hero2Skel.animations.find(a => a.name === 'wave');
  const idleAnim = hero2Skel.animations.find(a => a.name === 'idle');
  const origWaveMouthKeys = (waveAnim.slots.find(s => s.slot === mouthSlotIndex)?.attachment || []).length;
  const origIdleMouthKeys = (idleAnim.slots.find(s => s.slot === mouthSlotIndex)?.attachment || []).length;

  const tempWork = mkdtempSync(join(tmpdir(), 'behix-tl-test-'));
  try {
    await buildAudioTrackAndLipSync(multiDirecting, tl20, tempWork, {
      fps: 24,
      duration: 60,
      startSec: 0,
      endSec: 60
    });
    for (const anim of hero2Skel.animations) {
      if (anim.duration !== origDurations.get(anim.name)) {
        throw new Error(`مدت انیمیشن "${anim.name}" نباید به طول فیلم کشیده شود (${origDurations.get(anim.name)} -> ${anim.duration})`);
      }
    }
    const waveMouthKeys = waveAnim.slots.find(s => s.slot === mouthSlotIndex)?.attachment || [];
    const idleMouthKeys = idleAnim.slots.find(s => s.slot === mouthSlotIndex)?.attachment || [];
    if (waveMouthKeys.length <= origWaveMouthKeys) {
      throw new Error('keyLipSync روی انیمیشن فعال (wave) کلید دهان ثبت نکرد');
    }
    if (idleMouthKeys.length !== origIdleMouthKeys) {
      throw new Error('keyLipSync نباید روی انیمیشن غیرفعال (idle) اجرا شود');
    }

    const during = tl20.poseAt(0.8, 'hero_2', 1 / 24);
    const mouthNow = during.attachment[mouthSlotIndex];
    if (typeof mouthNow !== 'string' || !mouthNow) {
      throw new Error('poseAt در بازهٔ دیالوگ کلید محلی دهان را نمونه نکرد');
    }
    const outside = tl20.poseAt(10, 'hero_2', 1 / 24);
    if (outside.attachment[mouthSlotIndex] === undefined) {
      throw new Error('poseAt خارج از دیالوگ دهان را بدون مقدار گذاشت');
    }

    // کاراکتر دیالوگ‌دار بدون اسلات دهان: صدا ساخته می‌شود و فقط لب‌خوانی همان خط
    // با «هشدار» رد می‌شود (کل فیلم نباید بمیرد — رفتار مقاوم‌شده پس از ریگ‌های جایگزین)
    const badMouthDirecting = {
      ...multiDirecting,
      scenes: [{
        ...multiDirecting.scenes[0],
        lines: [{ characterId: 'hero_1', text: 'من دهان ندارم ولی دیالوگ دارم', startSec: 0.2, endSec: 1.2 }]
      }]
    };
    const noMouthRes = await buildAudioTrackAndLipSync(badMouthDirecting, tl20, tempWork, { fps: 24, duration: 10, useCloudTts: false });
    const mouthWarned = (noMouthRes.warnings || []).some(w => w.includes('hero_1') && w.includes('دهان'));
    if (!mouthWarned) {
      throw new Error('نبودن اسلات دهان باید هشدار ثبت کند (نه خطا) ولی هشداری ثبت نشد!');
    }
    if (!noMouthRes.audioPath) {
      throw new Error('با وجود نبود دهان، ترک صوتی باید ساخته می‌شد');
    }
  } finally {
    rmSync(tempWork, { recursive: true, force: true });
  }

  console.log('پشتیبانی از ۲۰ کاراکتر داخل قاب wide، لب‌خوانی تک‌مسیره روی انیمیشن فعال بدون تغییر مدت، و هشدارِ نبودن دهان (بدون مرگ کار) تایید شد.');
  console.log('=== پایان تست اولویت ۳ ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
