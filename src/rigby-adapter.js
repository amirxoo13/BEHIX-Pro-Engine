/**
 * آداپتور Rigby2D — لود اسکلت و محاسبه pose
 * اولویت ۱: تست لود و pose با اسکلت نمونه
 *
 * رفع باگ‌ها:
 *  - #10: مسیر اسکلت فقط داخل ریشهٔ پروژه پذیرفته می‌شود (بدون path traversal)
 *  - #5:  CharacterInstance با Pose/AnimationState پایدار؛ فیزیک بین فریم‌ها حفظ می‌شود
 *  - #15: تشخیص اجرای مستقیم با pathToFileURL (با آرگومان نسبی هم کار می‌کند)
 */

import { readSkeletonJson, Pose, AnimationState } from '../engine/rigby-core/index.js';
import { readFileSync, realpathSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve, sep } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(__dirname, '..');

const skeletonCache = new Map();

/**
 * لود اسکلت از مسیر نسبی، محدود به ریشهٔ پروژه.
 * مقدارهایی مثل `../../etc/passwd` رد می‌شوند (باگ #10).
 */
export function loadSkeletonFromFile(relativePath) {
  if (typeof relativePath !== 'string' || !relativePath) {
    throw new Error('مسیر اسکلت باید رشتهٔ غیرخالی باشد');
  }
  const full = resolve(PROJECT_ROOT, relativePath);
  // realpath برای خنثی کردن symlink؛ اگر فایل نباشد همان resolve چک می‌شود.
  let real = full;
  try { real = realpathSync(full); } catch { /* فایل وجود ندارد؛ readFileSync خطای خوانا می‌دهد */ }
  if (real !== PROJECT_ROOT && !real.startsWith(PROJECT_ROOT + sep)) {
    throw new Error('مسیر اسکلت خارج از ریشهٔ پروژه مجاز نیست');
  }
  if (skeletonCache.has(real)) return skeletonCache.get(real);
  let text;
  try {
    text = readFileSync(full, 'utf8');
  } catch {
    throw new Error(`فایل اسکلت "${relativePath}" پیدا نشد`);
  }
  const json = JSON.parse(text);
  const skeleton = loadSkeleton(json);
  skeletonCache.set(real, skeleton);
  return skeleton;
}

export function loadSkeleton(json) {
  const { skeleton } = readSkeletonJson(json, 'character');
  return skeleton;
}

/** مدت واقعی یک انیمیشن از خود دادهٔ اسکلت (باگ #5: به‌جای عدد ثابت ۲) */
export function animationDuration(skeleton, animationName) {
  const anim = skeleton.animations?.find(a => a.name === animationName);
  return anim ? (anim.duration || 0) : 0;
}

/**
 * یک نمونهٔ پایدار از کاراکتر: Pose و AnimationState در طول ویدیو زنده می‌مانند،
 * پس state فیزیک (pose.physics) بین فریم‌ها حفظ می‌شود و بافه/گوشواره پیوسته حرکت می‌کنند.
 * هر فریم فقط dt = 1/fps جلو می‌رود (باگ #5).
 */
export class CharacterInstance {
  constructor(skeleton) {
    this.skeleton = skeleton;
    this.pose = new Pose(skeleton);
    this.state = new AnimationState();
    this.currentAnimation = null;
  }

  /** انیمیشن را فقط وقتی عوض شد دوباره play می‌کند، با crossfade کوتاه برای نرمی تعویض صحنه */
  setAnimation(name, { loop = true, mix = 0.25 } = {}) {
    if (name === this.currentAnimation) return;
    const exists = this.skeleton.animations?.some(a => a.name === name);
    if (!exists) return;
    this.state.play(this.skeleton, name, loop, this.currentAnimation ? mix : 0);
    this.currentAnimation = name;
  }

  /** یک گام زمانی: state و فیزیک دقیقاً dt ثانیه جلو می‌روند و pose به‌روز می‌شود */
  advance(dt) {
    this.state.update(this.skeleton, dt);
    this.state.apply(this.skeleton, this.pose);
    return this.pose;
  }
}

/**
 * محاسبهٔ یک pose تکی (برای /preview-pose و تست‌ها).
 * زمان ورودی روی مدت واقعی انیمیشن wrap می‌شود، نه عدد ثابت.
 */
export function computePose(skeleton, animationName = null, time = 0.1) {
  const instance = new CharacterInstance(skeleton);

  let animationFound = null;
  if (animationName) {
    animationFound = skeleton.animations?.some(a => a.name === animationName) ?? false;
    if (animationFound) {
      instance.setAnimation(animationName, { loop: true, mix: 0 });
      const dur = animationDuration(skeleton, animationName);
      const localTime = dur > 0 ? ((time % dur) + dur) % dur : Math.max(0, time);
      instance.advance(localTime);
    }
  }

  const pose = instance.pose;
  const quads = pose.quads ? [...pose.quads(skeleton)] : [];
  return {
    boneCount: skeleton.bones?.length ?? 0,
    animationNames: (skeleton.animations || []).map(a => a.name),
    animationFound,
    quadCount: quads.length,
    quads,
    pose,
    ready: true
  };
}

// تست سریع اگر مستقیم اجرا شود (باگ #15: مقایسهٔ URL نرمال‌شده)
const invokedDirectly = process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) {
  try {
    const sk = loadSkeletonFromFile('examples/nila.skel.json');
    const { quads, pose, ...summary } = computePose(sk, sk.animations?.[0]?.name);
    console.log('Priority 1 OK:', JSON.stringify(summary, null, 2));
  } catch (err) {
    console.error('Priority 1 FAIL:', err);
    process.exit(1);
  }
}
