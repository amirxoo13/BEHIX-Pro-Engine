/**
 * آداپتور ساده برای runtime ریگبی۲D.
 * در نسخهٔ کامل: برنامهٔ کارگردانی Gemini به AnimationState تبدیل می‌شود
 * و pose برای rasterizer نرم‌افزاری آماده می‌گردد.
 */

import { readSkeletonJson, Pose, AnimationState } from '../engine/rigby-core/index.js';

export async function loadAndPose(skeletonJsonText, animationName = 'idle') {
  const data = typeof skeletonJsonText === 'string'
    ? JSON.parse(skeletonJsonText)
    : skeletonJsonText;

  const { skeleton } = readSkeletonJson(data, 'character');
  const pose = new Pose(skeleton);
  const state = new AnimationState();

  // اگر انیمیشن وجود داشت پخش کن، وگرنه pose خنثی
  const anim = skeleton.animations?.find(a => a.name === animationName);
  if (anim) {
    state.play(skeleton, animationName, true, 0);
    state.update(skeleton, 0.016);
    state.apply(skeleton, pose);
  }

  return {
    boneCount: skeleton.bones?.length ?? 0,
    animationFound: !!anim,
    // در نسخهٔ بعدی: خروجی quadها یا ماتریس‌ها برای رندر CPU
    ready: true
  };
}
