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

  const times = [0, 2, 4, 6, 7.5];
  for (const t of times) {
    const scene = tl.sceneAt(t);
    const animBoy = tl.animationFor('boy', t);
    const animGirl = tl.animationFor('girl', t);
    const pose = tl.poseAt(t, 'boy');
    console.log(
      `t=${t}s | صحنه=${scene?.id} | پسر=${animBoy} | دختر=${animGirl} | quad=${pose.quadCount}`
    );
  }

  console.log('=== پایان تست اولویت ۳ ===');
}

main();
