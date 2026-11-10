/**
 * آداپتور Rigby2D — لود اسکلت و محاسبه pose
 * اولویت ۱: تست لود و pose با اسکلت نمونه
 */

import { readSkeletonJson, Pose, AnimationState } from '../engine/rigby-core/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadSkeletonFromFile(relativePath) {
  const full = join(__dirname, '..', relativePath);
  const text = readFileSync(full, 'utf8');
  const json = JSON.parse(text);
  return loadSkeleton(json);
}

export function loadSkeleton(json) {
  const { skeleton } = readSkeletonJson(json, 'character');
  return skeleton;
}

export function computePose(skeleton, animationName = null, time = 0.1) {
  const pose = new Pose(skeleton);
  const state = new AnimationState();

  if (animationName) {
    const anim = skeleton.animations?.find(a => a.name === animationName);
    if (anim) {
      state.play(skeleton, animationName, true, 0);
      state.update(skeleton, time);
      state.apply(skeleton, pose);
    }
  }

  const quads = pose.quads ? [...pose.quads(skeleton)] : [];
  return {
    boneCount: skeleton.bones?.length ?? 0,
    animationNames: (skeleton.animations || []).map(a => a.name),
    animationFound: animationName ? skeleton.animations?.some(a => a.name === animationName) : null,
    quadCount: quads.length,
    quads,
    ready: true
  };
}

// تست سریع اگر مستقیم اجرا شود
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const sk = loadSkeletonFromFile('examples/nila.skel.json');
    const result = computePose(sk, sk.animations?.[0]?.name);
    console.log('Priority 1 OK:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Priority 1 FAIL:', err);
    process.exit(1);
  }
}
