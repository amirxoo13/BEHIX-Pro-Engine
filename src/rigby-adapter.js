/**
 * آداپتور Rigby2D — لود اسکلت و محاسبه pose
 * اولویت ۱: تست لود و pose با اسکلت نمونه
 *
 * رفع باگ‌ها:
 *  - #10 / فاز ۱: مسیر دارایی و اسکلت فقط به صورت مسیر نسبی داخل دایرکتوری‌های مجاز ریشهٔ پروژه (examples/ و assets/)
 *    پذیرفته می‌شود؛ مسیرهای مطلق (`/etc/...`) و `../` (path traversal) قاطعانه رد می‌شوند.
 *  - #5:  CharacterInstance با Pose/AnimationState پایدار؛ فیزیک بین فریم‌ها حفظ می‌شود
 *  - #15: تشخیص اجرای مستقیم با pathToFileURL (با آرگومان نسبی هم کار می‌کند)
 */

import { readSkeletonJson, Pose, AnimationState } from '../engine/rigby-core/index.js';
import { readFileSync, realpathSync, existsSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve, sep, isAbsolute, normalize } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(__dirname, '..');
export const ALLOWED_ASSET_ROOTS = [
  resolve(PROJECT_ROOT, 'examples'),
  resolve(PROJECT_ROOT, 'assets')
];

const skeletonCache = new Map();

/**
 * قفل امن مسیر دارایی (اسکلت، اطلس، لایه، پس‌زمینه):
 *  - مسیرهای مطلق (isAbsolute) قاطعانه رد می‌شوند.
 *  - هرگونه `..` (path traversal) قاطعانه رد می‌شود.
 *  - فقط مسیرهای نسبی که پس از resolve و realpath دقیقاً داخل examples/ یا assets/ زیر PROJECT_ROOT باشند مجازند.
 */
export function resolveSafeAssetPath(inputPath, defaultRelative = 'examples/nila.skel.json', extraAllowedRoot = null) {
  const raw = (typeof inputPath === 'string' && inputPath.trim()) ? inputPath.trim() : defaultRelative;
  if (raw.includes('\0')) {
    throw new Error('مسیر دارایی حاوی کاراکتر نامعتبر است');
  }
  if (isAbsolute(raw) || raw.startsWith('/') || raw.startsWith('\\') || /^[a-zA-Z]:/.test(raw)) {
    throw new Error(`مسیر مطلق برای دارایی مجاز نیست: "${raw}"`);
  }

  const rawParts = raw.split(/[\\/]/);
  if (rawParts.includes('..')) {
    throw new Error(`مسیر دارایی خارج از ریشهٔ مجاز است (path traversal): "${raw}"`);
  }

  const normalized = normalize(raw);
  if (isAbsolute(normalized) || normalized.split(/[\\/]/).includes('..')) {
    throw new Error(`مسیر دارایی خارج از ریشهٔ مجاز است (path traversal): "${raw}"`);
  }

  const baseRoot = extraAllowedRoot ? resolve(PROJECT_ROOT, String(extraAllowedRoot)) : PROJECT_ROOT;
  const candidate = resolve(baseRoot, normalized);
  let target = candidate;
  if (existsSync(candidate)) {
    target = realpathSync(candidate);
  }

  const allowed = ALLOWED_ASSET_ROOTS.some(root => {
    const realRoot = existsSync(root) ? realpathSync(root) : root;
    return (target === realRoot || target.startsWith(realRoot + sep)) &&
           (candidate === root || candidate.startsWith(root + sep));
  });

  if (!allowed) {
    throw new Error(`مسیر دارایی خارج از ریشهٔ مجاز (examples/ یا assets/) است: "${raw}"`);
  }
  return target;
}

/**
 * مسیر امن اسکلت برای کاراکترهای examples/ و assets/<id>/<id>.skel.json
 */
export function safeSkeletonPath(p, extraAllowedRoot = null) {
  if (!p) return resolveSafeAssetPath('examples/nila.skel.json', 'examples/nila.skel.json', extraAllowedRoot);
  return resolveSafeAssetPath(String(p), 'examples/nila.skel.json', extraAllowedRoot);
}

/** پاک کردن کش اسکلت در صورت بازسازی دارایی */
export function clearSkeletonCache(filePath = null) {
  if (!filePath) {
    skeletonCache.clear();
    return;
  }
  try {
    const full = resolveSafeAssetPath(filePath);
    skeletonCache.delete(full);
  } catch (err) {
    skeletonCache.delete(filePath);
  }
}

/**
 * لود اسکلت از مسیر نسبی، محدود به ریشه‌های مجاز پروژه (examples/ و assets/).
 * مقدارهایی مثل `../../etc/passwd` یا `/etc/passwd` رد می‌شوند.
 */
export function loadSkeletonFromFile(relativePath, options = {}) {
  if (typeof relativePath !== 'string' || !relativePath.trim()) {
    throw new Error('مسیر اسکلت باید رشتهٔ غیرخالی باشد');
  }
  const full = resolveSafeAssetPath(relativePath, 'examples/nila.skel.json', options.allowedRoot || null);
  if (!options.noCache && skeletonCache.has(full)) {
    return skeletonCache.get(full);
  }
  let text;
  try {
    text = readFileSync(full, 'utf8');
  } catch (err) {
    throw new Error(`فایل اسکلت "${relativePath}" پیدا نشد: ${err.message}`);
  }
  const json = JSON.parse(text);
  const skeleton = loadSkeleton(json, options.name || 'character');
  skeleton.sourcePath = relativePath;
  if (!options.noCache) {
    skeletonCache.set(full, skeleton);
  }
  return skeleton;
}

export function loadSkeleton(json, name = 'character') {
  const { skeleton } = readSkeletonJson(json, name);
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
