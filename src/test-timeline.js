/**
 * تست اولویت ۳: Timeline
 * اجرا: node src/test-timeline.js
 */

import { loadSkeletonFromFile } from './rigby-adapter.js';
import { Timeline, mockDirecting } from './timeline.js';

function main() {
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
    [0.5, 'a'], // قبل از اولین صحنه → اولین صحنه
    [2, 'a'],
    [4, 'a'],   // سوراخ بین a و b → صحنهٔ قبلی a (نه c)
    [7.5, 'b'], // سوراخ بین b و c → b
    [9, 'c']
  ];
  for (const [t, expected] of checks) {
    const got = tl2.sceneAt(t)?.id;
    if (got !== expected) throw new Error(`sceneAt(${t}) = ${got}، انتظار ${expected}`);
  }
  console.log('sceneAt برای سوراخ‌ها درست است (باگ #12).');

  console.log('=== پایان تست اولویت ۳ ===');
}

main();
