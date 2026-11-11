/**
 * ماژول ساخت خودکار کاراکتر و دارایی‌ها (فاز ۲):
 *  الف) تولید برگهٔ شخصیت (id، نام، نقش، و فهرست لایه‌ها) از سناریو با Vertex Gemini.
 *  ب) تطبیق نام لایه‌ها با roleهای engine/rigby-core/bodyparts.js و PART_ROLES در engine/rigby-core/autorig.js
 *     (مثل head, torso, upperarm, forearm, hand, thigh, shin, foot, eye, mouth و پسوند _l/_r).
 *     اگر role تشخیص داده نشود، آن قطعه وارد رندر کور نمی‌شود و در گزارش rig هشدار می‌آید.
 *  ج) ساخت PNG ثابت جدا با کانال آلفا برای هر لایه با مدل تصویر Vertex (gemini-3.1-flash-image) یا برش از اطلس پایه در حالت آفلاین/تست.
 *  د) اجرای autoRig(doc, alphaOf, options) روی CPU و ساخت اسکلت JSON به‌اضافهٔ اطلس اختصاصی هر کاراکتر.
 *  ه) ساخت تصویر ثابت پس‌زمینه برای هر صحنه (بدون تولید ویدیو با مدل هوش).
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import {
  Skeleton,
  makeSlot,
  makeAttachment,
  autoRig,
  PART_ROLES,
  classify,
  PAIRED,
  retarget,
  writeSkeletonJson,
  writeAtlas,
  VISEMES
} from '../engine/rigby-core/index.js';
import { buildBodySheetPrompt, sliceBodySheet } from './body-sheet.js';
import { PROJECT_ROOT, loadSkeletonFromFile, resolveSafeAssetPath, clearSkeletonCache } from './rigby-adapter.js';
import { decodePngBuffer, encodePngBuffer, loadAtlas, saveRgbaFile, clearAtlasCache } from './software-renderer.js';
import { callVertexAi, callGeminiApi, parseModelJson, MAX_CHARACTERS } from './gemini-directing.js';

export const ALLOWED_IMAGE_MODELS = Object.freeze([
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3-pro-image',
  'gemini-2.5-flash-image',
  'gemini-nano-banana-2.1'
]);

export const DEFAULT_IMAGE_MODEL = 'gemini-3.1-flash-image';

export function resolveImageModel(modelName = process.env.VERTEX_IMAGE_MODEL || DEFAULT_IMAGE_MODEL) {
  const m = String(modelName || DEFAULT_IMAGE_MODEL).trim();
  if (!ALLOWED_IMAGE_MODELS.includes(m)) {
    throw new Error(`مدل تصویری "${m}" مجاز نیست یا بازنشسته شده است؛ پیش‌فرض مجاز: ${DEFAULT_IMAGE_MODEL}`);
  }
  return m;
}

const VALID_ROLE_SET = new Set(PART_ROLES.filter(r => r !== 'extra'));

/**
 * چیدمان استاندارد جهانی (در مختصات Y-up موتور ریگبی، هم‌مقیاس با دوربین استاندارد)
 * برای قرار دادن لایه‌های تصویر کاراکتر پیش از اجرای autoRig روی CPU.
 */
const ROLE_WORLD_LAYOUT = {
  // چیدمان بر اساس قامت ۲۶۳۰ واحدی طراحی شده و سر حدود ۱۵٪ قد است (نسبت یک ورزشکار سبک کارتونی).
  // قبلاً سر ۶۷۰ واحد یعنی ۲۸٪ قد بود و از تنه هم پهن‌تر می‌شد.
  // هر عضو از مفصل بالایی تا مفصل پایینی چیده شده تا بین قطعات سوراخ نیفتد:
  //   پا ۰..۱۷۰ | ساق ۱۸۰..۸۰۰ | ران ۸۰۰..۱۴۲۰ | لگن ۱۳۳۰..۱۶۵۰
  //   تنه ۱۶۲۰..۲۱۸۰ | گردن ۲۱۵۵..۲۲۶۵ | سر ۲۲۳۰..۲۶۳۰
  foot_r:     { x: -118, y: 85,   w: 260, h: 170 },
  shin_r:     { x: -96,  y: 490,  w: 200, h: 620 },
  thigh_r:    { x: -82,  y: 1110, w: 225, h: 620 },
  foot_l:     { x: 118,  y: 85,   w: 260, h: 170 },
  shin_l:     { x: 96,   y: 490,  w: 200, h: 620 },
  thigh_l:    { x: 82,   y: 1110, w: 225, h: 620 },
  pelvis:     { x: 0,    y: 1490, w: 430, h: 320 },
  torso:      { x: 0,    y: 1900, w: 500, h: 560 },
  neck:       { x: 0,    y: 2210, w: 130, h: 110 },
  head:       { x: 0,    y: 2430, w: 360, h: 400 },
  hair:       { x: 0,    y: 2500, w: 430, h: 420 },
  hair_back:  { x: 0,    y: 2470, w: 420, h: 450 },
  ear_r:      { x: -185, y: 2450, w: 70,  h: 120 },
  ear_l:      { x: 185,  y: 2450, w: 70,  h: 120 },
  eye_r:      { x: -95,  y: 2470, w: 90,  h: 90  },
  pupil_r:    { x: -92,  y: 2468, w: 60,  h: 60  },
  eye_l:      { x: 95,   y: 2470, w: 90,  h: 90  },
  pupil_l:    { x: 92,   y: 2468, w: 60,  h: 60  },
  brow_r:     { x: -95,  y: 2540, w: 105, h: 28  },
  brow_l:     { x: 95,   y: 2540, w: 105, h: 28  },
  nose:       { x: 2,    y: 2410, w: 45,  h: 55  },
  mouth:      { x: 0,    y: 2320, w: 150, h: 60  },
  jaw:        { x: 0,    y: 2280, w: 190, h: 100 },
  upperarm_r: { x: -310, y: 1870, w: 190, h: 480 },
  forearm_r:  { x: -340, y: 1430, w: 160, h: 430 },
  hand_r:     { x: -350, y: 1130, w: 170, h: 230 },
  upperarm_l: { x: 310,  y: 1870, w: 190, h: 480 },
  forearm_l:  { x: 340,  y: 1430, w: 160, h: 430 },
  hand_l:     { x: 350,  y: 1130, w: 170, h: 230 },
  arm_r:      { x: -325, y: 1640, w: 200, h: 940 },
  arm_l:      { x: 325,  y: 1640, w: 200, h: 940 },
  leg_r:      { x: -90,  y: 790,  w: 220, h: 1250 },
  leg_l:      { x: 90,   y: 790,  w: 220, h: 1250 },
  tail:       { x: 170,  y: 1350, w: 150, h: 400 },
  wing_r:     { x: -360, y: 1950, w: 320, h: 440 },
  wing_l:     { x: 360,  y: 1950, w: 320, h: 440 }
};

/** فهرست استاندارد لایه‌های یک کاراکتر کامل برای ریگ اتوماتیک */
export function defaultCharacterLayers(charId) {
  const safeId = sanitizeId(charId);
  const specs = [
    { name: 'pelvis',     role: 'pelvis',   side: null },
    { name: 'thigh_r',    role: 'thigh',    side: 'r' },
    { name: 'shin_r',     role: 'shin',     side: 'r' },
    { name: 'foot_r',     role: 'foot',     side: 'r' },
    { name: 'thigh_l',    role: 'thigh',    side: 'l' },
    { name: 'shin_l',     role: 'shin',     side: 'l' },
    { name: 'foot_l',     role: 'foot',     side: 'l' },
    { name: 'torso',      role: 'torso',    side: null },
    { name: 'neck',       role: 'neck',     side: null },
    { name: 'head',       role: 'head',     side: null },
    { name: 'ear_r',      role: 'ear',      side: 'r' },
    { name: 'ear_l',      role: 'ear',      side: 'l' },
    { name: 'eye_r',      role: 'eye',      side: 'r' },
    { name: 'pupil_r',    role: 'pupil',    side: 'r' },
    { name: 'eye_l',      role: 'eye',      side: 'l' },
    { name: 'pupil_l',    role: 'pupil',    side: 'l' },
    { name: 'brow_r',     role: 'brow',     side: 'r' },
    { name: 'brow_l',     role: 'brow',     side: 'l' },
    { name: 'nose',       role: 'nose',     side: null },
    { name: 'mouth',      role: 'mouth',    side: null },
    { name: 'hair',       role: 'hair',     side: null },
    { name: 'upperarm_r', role: 'upperarm', side: 'r' },
    { name: 'forearm_r',  role: 'forearm',  side: 'r' },
    { name: 'hand_r',     role: 'hand',     side: 'r' },
    { name: 'upperarm_l', role: 'upperarm', side: 'l' },
    { name: 'forearm_l',  role: 'forearm',  side: 'l' },
    { name: 'hand_l',     role: 'hand',     side: 'l' }
  ];
  return specs.map(s => ({
    name: s.name,
    file: `assets/${safeId}/layers/${s.name}.png`,
    role: s.role,
    side: s.side
  }));
}

/**
 * مجموعهٔ هستهٔ اعضای بدن که برای یک بدنِ بدون سوراخ و قابل انیمیت لازم است.
 *
 * چرا لازم است: برگهٔ کاراکتری که مدل می‌سازد گاهی فقط چند لایه می‌دهد (مثلاً تنه، سر، ران) و
 * آن‌وقت لگن، ساق، پا، ساعد و دست وجود ندارند و بدن وسطش قطع می‌شود.
 * جزئیات صورت (چشم، ابرو، بینی، مو، گوش) عمداً در این فهرست نیست چون داخل خودِ تصویر سر کشیده
 * می‌شود؛ فقط دهان جداست تا لب‌خوانی کار کند. این توازن بدنِ کامل را با کمترین تعداد تصویر می‌دهد.
 */
export const CORE_BODY_LAYERS = Object.freeze([
  { name: 'pelvis', role: 'pelvis', side: null },
  { name: 'torso', role: 'torso', side: null },
  { name: 'head', role: 'head', side: null },
  { name: 'mouth', role: 'mouth', side: null },
  { name: 'upperarm_l', role: 'upperarm', side: 'l' },
  { name: 'upperarm_r', role: 'upperarm', side: 'r' },
  { name: 'forearm_l', role: 'forearm', side: 'l' },
  { name: 'forearm_r', role: 'forearm', side: 'r' },
  { name: 'hand_l', role: 'hand', side: 'l' },
  { name: 'hand_r', role: 'hand', side: 'r' },
  { name: 'thigh_l', role: 'thigh', side: 'l' },
  { name: 'thigh_r', role: 'thigh', side: 'r' },
  { name: 'shin_l', role: 'shin', side: 'l' },
  { name: 'shin_r', role: 'shin', side: 'r' },
  { name: 'foot_l', role: 'foot', side: 'l' },
  { name: 'foot_r', role: 'foot', side: 'r' }
]);

/**
 * تکمیل فهرست لایه‌های یک کاراکتر تا هیچ عضو هسته‌ای جا نیفتد.
 * لایه‌های اضافهٔ خودِ برگهٔ کاراکتر (مثل مو یا چشم) حفظ می‌شوند.
 */
export function ensureCompleteBodyLayers(inputLayers, charId) {
  const safeId = sanitizeId(charId);
  const out = Array.isArray(inputLayers) ? [...inputLayers] : [];
  const present = new Set(
    out.map(l => String(l?.name || basename(String(l?.file || ''), '.png')).toLowerCase()).filter(Boolean)
  );
  for (const core of CORE_BODY_LAYERS) {
    if (present.has(core.name)) continue;
    out.push({
      name: core.name,
      file: `assets/${safeId}/layers/${core.name}.png`,
      role: core.role,
      side: core.side
    });
  }
  return out;
}

export function sanitizeId(rawId, fallback = 'char') {
  const cleaned = String(rawId || fallback)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || fallback;
}

/**
 * اعتبارسنجی و تطبیق یک لایه با PART_ROLES و classify در bodyparts.js.
 * اگر role قابل تشخیص نباشد یا جزو PART_ROLES نباشد، null برمی‌گرداند تا وارد رندر کور نشود و هشدار ثبت گردد.
 */
export function resolveLayerRoleAndSide(layer) {
  const fileBase = layer?.file ? basename(String(layer.file)).replace(/\.[^.]+$/, '') : '';
  const rawName = String(layer?.name || fileBase || '').trim();
  const explicitRole = typeof layer?.role === 'string' ? layer.role.trim().toLowerCase() : null;
  const classified = classify(rawName) || (explicitRole ? classify(explicitRole) : null);

  let role = null;
  if (explicitRole && VALID_ROLE_SET.has(explicitRole)) {
    role = explicitRole;
  } else if (classified && VALID_ROLE_SET.has(classified.role)) {
    role = classified.role;
  }

  if (!role) {
    return { valid: false, name: rawName || 'unknown', role: null, side: null };
  }

  let side = null;
  if (PAIRED.has(role)) {
    const rawSide = typeof layer?.side === 'string' ? layer.side.trim().toLowerCase() : null;
    if (rawSide === 'l' || rawSide === 'left') side = 'l';
    else if (rawSide === 'r' || rawSide === 'right') side = 'r';
    else if (classified?.side === 'l' || classified?.side === 'r') side = classified.side;
  }

  const canonicalName = side ? `${role}_${side}` : role;
  return {
    valid: true,
    name: rawName || canonicalName,
    canonicalName,
    role,
    side
  };
}

/**
 * دریافت توکن احراز هویت Google Cloud (ADC) با GoogleAuth و اسکوپ cloud-platform
 */
async function getGoogleAccessToken() {
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const res = await client.getAccessToken();
  const token = typeof res === 'string' ? res : res?.token;
  if (!token) throw new Error('دریافت توکن ADC از GoogleAuth ممکن نشد');
  return token;
}

function vertexGenerateContentUrl(project, location, model) {
  const loc = location && location !== 'global' ? location : 'global';
  const host = loc === 'global'
    ? 'https://aiplatform.googleapis.com'
    : `https://${loc}-aiplatform.googleapis.com`;
  return `${host}/v1/projects/${project}/locations/${loc}/publishers/google/models/${model}:generateContent`;
}

function inlineDataBase64(data, kind) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (!inline?.data) continue;
    const mime = String(inline.mimeType || inline.mime_type || '');
    if (kind === 'image' && mime && !mime.startsWith('image/')) continue;
    return inline.data;
  }
  return null;
}

/**
 * فراخوانی مدل تصویر (پیش‌فرض gemini-3.1-flash-image) با generateContent.
 * خروجی فقط PNG ثابت است و از inlineData خوانده می‌شود. :predict و bytesBase64Encoded استفاده نمی‌شود.
 */

/**
 * POST با retry و backoff نمایی برای خطاهای گذرا (429 سهمیه، 500/503).
 * Retry-After را در صورت وجود رعایت می‌کند. برای بقیهٔ کدها همان پاسخ برمی‌گردد.
 */
export async function postJsonWithRetry(endpoint, headers, bodyObj, { attempts = 5, baseDelayMs = 8000, label = 'vertex' } = {}) {
  let lastRes = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    lastRes = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(bodyObj) });
    if (lastRes.ok) return lastRes;
    if (![429, 500, 503].includes(lastRes.status) || attempt === attempts) return lastRes;
    const retryAfter = Number(lastRes.headers.get('retry-after'));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : baseDelayMs * Math.pow(2, attempt - 1);
    console.warn(`[${label}] کد ${lastRes.status}؛ تلاش ${attempt}/${attempts}، صبر ${Math.round(waitMs / 1000)} ثانیه`);
    await lastRes.text().catch(() => '');
    await new Promise(r => setTimeout(r, Math.min(waitMs, 120000)));
  }
  return lastRes;
}

export async function generateStaticPngWithVertex(prompt, options = {}) {
  const project = process.env.VERTEX_AI_PROJECT;
  const apiKey = process.env.GOOGLE_API_KEY;
  const imageModel = resolveImageModel(options.imageModel || process.env.VERTEX_IMAGE_MODEL || DEFAULT_IMAGE_MODEL);
  const location = process.env.VERTEX_AI_LOCATION || 'global';

  if (!project && !apiKey) {
    throw new Error('VERTEX_AI_PROJECT یا GOOGLE_API_KEY برای تولید تصویر تنظیم نشده است');
  }

  const headers = { 'Content-Type': 'application/json' };
  let endpoint;
  if (project) {
    const token = await getGoogleAccessToken();
    headers.Authorization = `Bearer ${token}`;
    endpoint = vertexGenerateContentUrl(project, location, imageModel);
  } else {
    headers['x-goog-api-key'] = apiKey;
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent`;
  }

  const res = await postJsonWithRetry(endpoint, headers, {
    contents: [{ role: 'user', parts: [{ text: String(prompt) }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio: options.aspectRatio || '1:1' }
    }
  }, { label: 'image:' + imageModel });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`خطای مدل تصویر (${imageModel}، کد ${res.status}): ${errText.slice(0, 250)}`);
  }

  const data = await res.json();
  const b64 = inlineDataBase64(data, 'image');
  if (!b64) throw new Error('پاسخ مدل تصویر فاقد inlineData تصویر بود');
  return Buffer.from(b64, 'base64');
}

/**
 * شرح هنریِ دقیق هر عضو بدن برای مدل تصویر.
 *
 * چرا لازم است: با پرامپت عمومی، مدل برای «ران چپ» و «ران راست» هر دو یک شورتِ کاملِ دوپا می‌کشد
 * و برای «ساعد» یک دستِ کامل. نتیجه این می‌شود که اعضا روی هم می‌افتند و بدن قابل انیمیت نیست.
 * هر عضو باید دقیقاً یک تکهٔ مجزا و از یک مفصل تا مفصل بعدی باشد.
 */
const LAYER_ART_BRIEF = {
  // سر صورت را دارد ولی «بدون دهان»: دهان لایهٔ جداست تا لب‌خوانی کار کند، و اگر روی سر هم
  // دهان کشیده شود، از زیر لایهٔ دهان بیرون می‌زند و دو دهان دیده می‌شود.
  head: 'ONLY the head: face with eyes, eyebrows, nose, ears and hair, cut straight across at the base of the neck. Draw NO mouth and NO lips at all — leave the mouth area as blank skin. No neck, no shoulders, no torso.',
  neck: 'ONLY the neck column, standing UPRIGHT, jaw end at the TOP of the image and collarbone end at the BOTTOM. No head, no shoulders.',
  torso: 'ONLY the torso/jersey standing UPRIGHT, shoulders at the TOP of the image and waist at the BOTTOM. No head, no neck, no arms, no legs, no shorts.',
  pelvis: 'ONLY the hips and shorts, waist at the TOP of the image and the top of both thighs at the BOTTOM. No legs below the shorts, no torso.',
  upperarm: 'ONLY one single upper arm segment, drawn VERTICALLY: shoulder joint at the TOP of the image, elbow at the BOTTOM. One limb only, straight and upright. No hand, no forearm, no body.',
  forearm: 'ONLY one single forearm segment, drawn VERTICALLY: elbow at the TOP of the image, wrist at the BOTTOM. One limb only, straight and upright, taller than it is wide. No hand, no upper arm, no body.',
  hand: 'ONLY one single hand, drawn VERTICALLY: wrist at the TOP of the image, fingertips at the BOTTOM. One hand only. No arm, no body.',
  thigh: 'ONLY one single thigh segment, drawn VERTICALLY: hip joint at the TOP of the image, knee at the BOTTOM. ONE leg only — never a pair of shorts and never two legs. Straight and upright, taller than it is wide. No shin, no foot, no body.',
  shin: 'ONLY one single lower leg segment, drawn VERTICALLY: knee at the TOP of the image, ankle at the BOTTOM. ONE leg only, straight and upright, taller than it is wide. No thigh, no foot, no body.',
  foot: 'ONLY one single foot in a shoe, seen from the side, ankle at the TOP of the image and the sole at the BOTTOM, toes pointing to one side. ONE foot only. No leg, no body.',
  hair: 'ONLY the hair as a separate piece, shaped to sit on top of a head. No face, no body.',
  mouth: 'ONLY a mouth with lips, closed neutral expression, drawn large and centered. No face, no head, no body.',
  eye: 'ONLY one single eye with eyelid and lashes, drawn large and centered. No face, no head.',
  pupil: 'ONLY one single round iris and pupil, drawn large and centered. No eyelid, no face.',
  brow: 'ONLY one single eyebrow shape, drawn large and centered. No eye, no face.',
  nose: 'ONLY a nose, drawn large and centered. No face, no head.',
  ear: 'ONLY one single ear, drawn large and centered. No head, no face.'
};

/**
 * ساخت پرامپت تولید تصویر برای یک لایه.
 *
 * پس‌زمینه را «تختِ سرخابی» می‌خواهیم، نه «شفاف»: مدل آلفای واقعی تولید نمی‌کند و در پاسخ به درخواست
 * شفافیت یک الگوی شطرنجی داخل تصویر نقاشی می‌کند. پس‌زمینهٔ تختِ کروما بعداً در کد به آلفای واقعی
 * تبدیل می‌شود و نتیجه قطعی و قابل‌اتکاست.
 */
function buildLayerPrompt(layer, charName, appearance) {
  const brief = LAYER_ART_BRIEF[layer.role] || `ONLY the single body part "${layer.role}", isolated from the rest of the body.`;
  const sideWord = layer.side === 'l' ? 'LEFT' : layer.side === 'r' ? 'RIGHT' : '';
  const sideLine = sideWord ? ` This is the character's ${sideWord} side — draw exactly one ${layer.role}, not a pair.` : '';

  return [
    `Flat 2D animation sprite of a single isolated body part for the character "${charName}" (${appearance || 'stylized 2D animation character'}).`,
    `Part: ${layer.role}${sideWord ? ` (${sideWord})` : ''}. ${brief}${sideLine}`,
    'Draw the part large, centered, front-facing, filling most of the frame, in a clean flat cartoon style with crisp outlines, consistent with the rest of the character.',
    'The background MUST be a completely flat, uniform, solid magenta (#FF00FF) fill.',
    'Do NOT draw a checkerboard or transparency grid pattern. Do NOT add any shadow, gradient, texture, border, frame, label, text or watermark on the background.',
    'Nothing else in the image — only this one body part on flat magenta.'
  ].join(' ');
}

/**
 * حذف پس‌زمینهٔ تصویرِ تولیدشده و تبدیل آن به کانال آلفای واقعی.
 *
 * چرا لازم است: مدل تصویر وقتی «پس‌زمینهٔ شفاف» می‌خواهیم، آلفای واقعی نمی‌دهد و به‌جای آن
 * یک الگوی شطرنجیِ خاکستری-سفید (نماد شفافیت در ویرایشگرها) را داخل خود تصویر نقاشی می‌کند.
 * آن تصویر کاملاً مات است، پس موتور آن را عیناً رسم می‌کند و دور هر عضو یک مربع شطرنجی می‌افتد.
 *
 * روش: رنگ‌های غالبِ حاشیهٔ تصویر به‌عنوان پالت پس‌زمینه یاد گرفته می‌شوند (تا ۴ رنگ، که هر دو
 * تُنِ شطرنجی و نیز پس‌زمینهٔ تختِ کروما را پوشش می‌دهد)، سپس از تمام پیکسل‌های لبه یک flood-fill
 * به داخل اجرا می‌شود و هر پیکسلِ هم‌رنگِ پس‌زمینه که از لبه قابل دسترسی باشد شفاف می‌شود.
 * چون معیار «اتصال به لبه» است، رنگ مشابه در دل خودِ کاراکتر (مثل لوگوی پیراهن) پاک نمی‌شود.
 *
 * @returns {{pixels: Uint8Array, removed: number, total: number}|null} null یعنی تصویر از قبل آلفای سالم داشت
 */
export function keyOutBackgroundToAlpha(imgData, options = {}) {
  const { width: w, height: h, pixels } = imgData;
  const total = w * h;
  if (total <= 0) return null;

  const tol = Number.isFinite(options.tolerance) ? options.tolerance : 46;
  const tolSq = tol * tol;

  // اگر تصویر از قبل آلفای معنادار دارد (بیش از ۲٪ پیکسل نیمه‌شفاف/شفاف)، دست نمی‌زنیم
  let alreadyTransparent = 0;
  for (let i = 0; i < total; i++) {
    if (pixels[i * 4 + 3] < 240) alreadyTransparent++;
  }
  if (alreadyTransparent > total * 0.02) return null;

  // ۱) یادگیری رنگ‌های غالب حاشیه با کوانتیزه‌کردن به شبکهٔ ۳۲تایی
  const borderCounts = new Map();
  const addBorder = (x, y) => {
    const p = (y * w + x) * 4;
    const key = `${pixels[p] >> 5},${pixels[p + 1] >> 5},${pixels[p + 2] >> 5}`;
    const prev = borderCounts.get(key);
    if (prev) {
      prev.n++; prev.r += pixels[p]; prev.g += pixels[p + 1]; prev.b += pixels[p + 2];
    } else {
      borderCounts.set(key, { n: 1, r: pixels[p], g: pixels[p + 1], b: pixels[p + 2] });
    }
  };
  for (let x = 0; x < w; x++) { addBorder(x, 0); addBorder(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { addBorder(0, y); addBorder(w - 1, y); }

  const borderPixels = 2 * w + 2 * (h - 2);
  const palette = [...borderCounts.values()]
    .filter(c => c.n >= borderPixels * 0.02)
    .sort((a, b) => b.n - a.n)
    .slice(0, 4)
    .map(c => [c.r / c.n, c.g / c.n, c.b / c.n]);

  if (!palette.length) return null;

  const isBg = (p) => {
    const r = pixels[p], g = pixels[p + 1], b = pixels[p + 2];
    for (const [pr, pg, pb] of palette) {
      const dr = r - pr, dg = g - pg, db = b - pb;
      if (dr * dr + dg * dg + db * db <= tolSq) return true;
    }
    return false;
  };

  // ۲) flood-fill از تمام پیکسل‌های لبه به سمت داخل
  const bg = new Uint8Array(total);
  const queue = new Int32Array(total);
  let qh = 0, qt = 0;
  const push = (idx) => {
    if (bg[idx]) return;
    if (!isBg(idx * 4)) return;
    bg[idx] = 1;
    queue[qt++] = idx;
  };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }

  while (qh < qt) {
    const idx = queue[qh++];
    const x = idx % w, y = (idx / w) | 0;
    if (x > 0) push(idx - 1);
    if (x < w - 1) push(idx + 1);
    if (y > 0) push(idx - w);
    if (y < h - 1) push(idx + w);
  }

  // ۳) اعمال شفافیت + حذف هالهٔ یک‌پیکسلی روی مرز (de-fringe)
  const out = new Uint8Array(pixels);
  let removed = 0;
  for (let i = 0; i < total; i++) {
    if (bg[i]) { out[i * 4 + 3] = 0; removed++; }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (bg[i] || out[i * 4 + 3] === 0) continue;
      const touchesBg =
        (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) ||
        (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w]);
      if (touchesBg && isBg(i * 4)) out[i * 4 + 3] = 96;
    }
  }

  return { pixels: out, removed, total };
}

/**
 * برش تصویر به کادر تنگِ محتوای غیرشفاف.
 *
 * چرا لازم است: تصویر تولیدشده ۱۰۲۴×۱۰۲۴ است و خودِ عضو بدن فقط تکهٔ کوچکی وسط آن است.
 * اگر کل بوم روی استخوان چسبانده شود، عضو کوچک و در جای اشتباه رسم می‌شود و اعضای بدن از هم جدا می‌افتند.
 */
export function cropToContentBbox(imgData, alphaThreshold = 12) {
  const { width: w, height: h, pixels } = imgData;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (pixels[(y * w + x) * 4 + 3] > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return null;

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  if (cw === w && ch === h) return imgData;

  const out = new Uint8Array(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    const src = ((minY + y) * w + minX) * 4;
    out.set(pixels.subarray(src, src + cw * 4), y * cw * 4);
  }
  return { width: cw, height: ch, pixels: out };
}

/**
 * آماده‌سازی لایهٔ تولیدشده برای ریگ: حذف پس‌زمینه، برش تنگ، و محاسبهٔ اندازهٔ اتصال با حفظ نسبت ابعاد.
 *
 * اندازهٔ اتصال از نسبت واقعی محتوا حساب می‌شود (نه کشیدن اجباری به w/h جدول چیدمان) تا سر و تنه و
 * دست با تناسب درست و دقیقاً روی استخوان خودشان بنشینند.
 *
 * @returns {{img: object, attW: number, attH: number}|null} null یعنی تصویر غیرقابل‌استفاده است و باید fallback شود
 */
export function prepareGeneratedLayer(imgData, layout, layerName) {
  const keyed = keyOutBackgroundToAlpha(imgData);
  let work = imgData;
  if (keyed) {
    const kept = keyed.total - keyed.removed;
    // اگر تقریباً چیزی حذف نشد، یعنی پس‌زمینه شناسایی نشده و تصویر همچنان یک مربع مات است
    if (keyed.removed < keyed.total * 0.03) {
      return { error: `پس‌زمینهٔ تصویر لایهٔ "${layerName}" شناسایی نشد (تصویر مات است)` };
    }
    // اگر تقریباً همه‌چیز حذف شد، محتوایی باقی نمانده
    if (kept < keyed.total * 0.005) {
      return { error: `پس از حذف پس‌زمینه، محتوایی در لایهٔ "${layerName}" باقی نماند` };
    }
    work = { width: imgData.width, height: imgData.height, pixels: keyed.pixels };
  }

  const cropped = cropToContentBbox(work);
  if (!cropped) return { error: `لایهٔ "${layerName}" پس از حذف پس‌زمینه کاملاً خالی بود` };

  // طول قطعه با طول بند استخوان تطبیق داده می‌شود (نه برازش داخل کادر با حفظ نسبت).
  // برازشِ «داخل کادر» قطعه را کوچک‌تر از بندش می‌کرد و بین اعضا سوراخ می‌افتاد: بازو با کادر
  // ۴۸۰ واحدی فقط ۳۴۰ واحد رسم می‌شد و دست و ساعد جدا از بدن شناور می‌ماندند.
  // عرض از همان نسبت می‌آید، با سقفی برابر ۱.۸ برابر عرض کادر تا قطعهٔ بدکشیده پهن‌تر از بدن نشود.
  let scale = layout.h / cropped.height;
  const maxWidth = layout.w * 1.8;
  if (cropped.width * scale > maxWidth) scale = maxWidth / cropped.width;

  return {
    img: cropped,
    attW: Math.max(1, Math.round(cropped.width * scale)),
    attH: Math.max(1, Math.round(cropped.height * scale))
  };
}

/**
 * تولید پالت رنگی متمایز و قطعی بر اساس شناسه/نام کاراکتر تا هر یک از ۲۰ کاراکتر رنگ‌بندی و بافت منحصربه‌فرد داشته باشند.
 */
function characterColorShift(charId, role) {
  let hash = 2166136261;
  const str = `${charId}:${role}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const u = (hash >>> 0) / 0xffffffff;
  const v = ((hash >>> 8) & 0xffff) / 0xffff;
  const w = ((hash >>> 16) & 0xffff) / 0xffff;

  // پوست و چشم تغییر ملایم‌تر دارند؛ لباس (torso, pelvis, upperarm, foot, hair) تغییر رنگ متمایزتر دارد
  const isCloth = ['torso', 'pelvis', 'upperarm', 'forearm', 'thigh', 'shin', 'foot', 'hair'].includes(role);
  const mulR = isCloth ? 0.55 + u * 0.9 : 0.88 + u * 0.24;
  const mulG = isCloth ? 0.55 + v * 0.9 : 0.88 + v * 0.24;
  const mulB = isCloth ? 0.55 + w * 0.9 : 0.88 + w * 0.24;
  return [mulR, mulG, mulB];
}

/**
 * استخراج یک ناحیه از اطلس مرجع با اعمال رنگ‌بندی اختصاصی کاراکتر به صورت بافر RGBA مستقل با کانال آلفا
 */
function extractRegionFromBaseAtlas(regionName, charId, role) {
  const baseAtlas = loadAtlas();
  const page = baseAtlas.atlas.pages[0];
  const reg = page.regions.find(r => r.name === regionName);
  if (!reg) return null;

  const w = Math.max(1, reg.width);
  const h = Math.max(1, reg.height);
  const out = new Uint8Array(w * h * 4);
  const [mr, mg, mb] = characterColorShift(charId, role);

  for (let y = 0; y < h; y++) {
    const sy = Math.min(baseAtlas.height - 1, reg.y + y);
    for (let x = 0; x < w; x++) {
      const sx = Math.min(baseAtlas.width - 1, reg.x + x);
      const srcIdx = (sy * baseAtlas.width + sx) * 4;
      const dstIdx = (y * w + x) * 4;
      const a = baseAtlas.pixels[srcIdx + 3];
      out[dstIdx] = Math.min(255, Math.round(baseAtlas.pixels[srcIdx] * mr));
      out[dstIdx + 1] = Math.min(255, Math.round(baseAtlas.pixels[srcIdx + 1] * mg));
      out[dstIdx + 2] = Math.min(255, Math.round(baseAtlas.pixels[srcIdx + 2] * mb));
      out[dstIdx + 3] = a;
    }
  }
  return { width: w, height: h, pixels: out };
}

/**
 * ساخت بافر RGBA با کانال آلفا برای یک لایهٔ بدنی (اگر تصویر از دیسک یا مدل تصویر Vertex نیامده باشد)
 */
function synthesizeLayerRgba(charId, canonicalName, role, width = 160, height = 160) {
  // نگاشت نام کانونیکال به نام ناحیه در اطلس پایه برای حفظ کیفیت هنری بالا همراه با رنگ اختصاصی هر کاراکتر
  const regionMap = {
    hair: 'hair_front',
    hand_l: 'hand_l_open',
    hand_r: 'hand_r_open',
    brow_l: 'brow_l_neutral',
    brow_r: 'brow_r_neutral',
    mouth: 'mouth_smile'
  };
  const lookupName = regionMap[canonicalName] || canonicalName;
  const extracted = extractRegionFromBaseAtlas(lookupName, charId, role);
  if (extracted) return extracted;

  // اگر ناحیه در اطلس پایه نبود (مثل tail یا wing)، یک بیضی نرم با کانال آلفا روی CPU می‌سازیم
  const pixels = new Uint8Array(width * height * 4);
  const [mr, mg, mb] = characterColorShift(charId, role);
  const baseR = Math.min(255, Math.round(180 * mr));
  const baseG = Math.min(255, Math.round(150 * mg));
  const baseB = Math.min(255, Math.round(140 * mb));
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.42;
  const ry = height * 0.42;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const d2 = dx * dx + dy * dy;
      if (d2 <= 1.0) {
        const idx = (y * width + x) * 4;
        const edgeAlpha = d2 > 0.85 ? Math.round(((1 - d2) / 0.15) * 255) : 255;
        pixels[idx] = baseR;
        pixels[idx + 1] = baseG;
        pixels[idx + 2] = baseB;
        pixels[idx + 3] = Math.max(0, Math.min(255, edgeAlpha));
      }
    }
  }
  return { width, height, pixels };
}

/**
 * بسته‌بندی (pack) مجموعه‌ای از تصاویر RGBA در یک صفحهٔ اطلس واحد روی CPU (الگوریتم Shelf Packing)
 */
export function packImagesIntoAtlas(namedImages, pageName = 'atlas.png') {
  const pad = 2;
  const sorted = [...namedImages].sort((a, b) => b.height - a.height);
  const totalArea = sorted.reduce((acc, img) => acc + (img.width + pad * 2) * (img.height + pad * 2), 0);
  let pageWidth = Math.max(512, Math.pow(2, Math.ceil(Math.log2(Math.sqrt(totalArea * 1.35)))));
  for (const img of sorted) {
    if (img.width + pad * 2 > pageWidth) {
      pageWidth = Math.pow(2, Math.ceil(Math.log2(img.width + pad * 2)));
    }
  }

  let curX = pad;
  let curY = pad;
  let shelfHeight = 0;
  const placements = [];

  for (const img of sorted) {
    if (curX + img.width + pad > pageWidth) {
      curX = pad;
      curY += shelfHeight + pad;
      shelfHeight = 0;
    }
    placements.push({
      name: img.name,
      x: curX,
      y: curY,
      width: img.width,
      height: img.height,
      pixels: img.pixels
    });
    curX += img.width + pad;
    shelfHeight = Math.max(shelfHeight, img.height);
  }

  const pageHeight = Math.max(512, Math.pow(2, Math.ceil(Math.log2(curY + shelfHeight + pad))));
  const pagePixels = new Uint8Array(pageWidth * pageHeight * 4);

  const regions = [];
  for (const p of placements) {
    for (let y = 0; y < p.height; y++) {
      const srcStart = y * p.width * 4;
      const dstStart = ((p.y + y) * pageWidth + p.x) * 4;
      pagePixels.set(p.pixels.subarray(srcStart, srcStart + p.width * 4), dstStart);
    }
    regions.push({
      name: p.name,
      index: -1,
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
      originalWidth: p.width,
      originalHeight: p.height,
      offsetX: 0,
      offsetY: 0,
      rotate: 0
    });
  }

  const atlasText = writeAtlas([{
    name: pageName,
    width: pageWidth,
    height: pageHeight,
    format: 'RGBA8888',
    filter: ['Linear', 'Linear'],
    repeat: 'none',
    pma: false,
    regions
  }]);

  return {
    pageWidth,
    pageHeight,
    pagePixels,
    atlasText,
    regions
  };
}

/**
 * ساخت کامل یک کاراکتر (لایه‌های PNG جدا با کانال آلفا + اجرای autoRig روی CPU + انتقال انیمیشن‌ها + ذخیرهٔ اسکلت و اطلس اختصاصی)
 * و آپلود اختیاری دارایی‌ها به GCS در صورت تنظیم بودن OUTPUT_BUCKET.
 */
/**
 * ساخت چرخهٔ دویدن به‌صورت رویه‌ای روی استخوان‌های humanoid که autoRig تولید می‌کند.
 *
 * چرا رویه‌ای و نه retarget: اسکلت مرجع (nila) انیمیشن دویدن ندارد و فقط idle/wave/promo دارد،
 * پس اکشن "run" در سناریو تا امروز بی‌صدا به idle برمی‌گشت و بازیکن سرِ جایش می‌ایستاد.
 *
 * ساختار یک چرخهٔ کلاسیک دو قدمی: ران‌ها در فاز مخالف جلو و عقب می‌روند، زانو در فاز هوا جمع
 * می‌شود، دست‌ها برعکس پاها تاب می‌خورند، و لگن دو بار در هر چرخه پایین و بالا می‌رود.
 * کلید اول و آخر یکسان‌اند تا حلقه بدون پرش بسته شود.
 */
function buildRunAnimation(cycleSec = 0.6) {
  const T = cycleSec;
  const half = T / 2;
  const q = T / 4;

  /** یک تایم‌لاین چرخش دو کلیدی متقارن با فاز دلخواه */
  const swing = (atZero, atHalf) => ({
    rotate: [
      { value: atZero },
      { time: half, value: atHalf },
      { time: T, value: atZero }
    ]
  });

  /** زانو: در نیمهٔ هوا جمع و در تماس با زمین باز می‌شود */
  const knee = (phase) => ({
    rotate: [
      { time: 0, value: phase === 0 ? -18 : -8 },
      { time: q, value: phase === 0 ? -62 : -30 },
      { time: half, value: phase === 0 ? -8 : -18 },
      { time: half + q, value: phase === 0 ? -30 : -62 },
      { time: T, value: phase === 0 ? -18 : -8 }
    ]
  });

  return {
    bones: {
      // پاها: فاز مخالف هم
      thigh_l: swing(32, -26),
      thigh_r: swing(-26, 32),
      shin_l: knee(0),
      shin_r: knee(1),
      foot_l: swing(10, -6),
      foot_r: swing(-6, 10),

      // دست‌ها برعکس پاها تاب می‌خورند تا تعادل بدن طبیعی به نظر برسد
      upperarm_l: swing(-28, 24),
      upperarm_r: swing(24, -28),
      forearm_l: { rotate: [{ value: -58 }, { time: half, value: -72 }, { time: T, value: -58 }] },
      forearm_r: { rotate: [{ value: -72 }, { time: half, value: -58 }, { time: T, value: -72 }] },

      // بالاتنه: چرخش خفیف خلاف جهت لگن و بالا-پایین شدن دو بار در هر چرخه
      chest: { rotate: [{ value: 3 }, { time: half, value: -3 }, { time: T, value: 3 }] },
      head: { rotate: [{ value: -2 }, { time: half, value: 2 }, { time: T, value: -2 }] },
      hip: {
        rotate: [{ value: -3 }, { time: half, value: 3 }, { time: T, value: -3 }],
        translate: [
          { time: 0, y: 0 },
          { time: q, y: -34 },
          { time: half, y: 0 },
          { time: half + q, y: -34 },
          { time: T, y: 0 }
        ]
      }
    },
    slots: {}
  };
}

export async function buildCharacterRig(characterSpec, options = {}) {
  const variantIndex = Number.isFinite(options.variantIndex) ? options.variantIndex : 0;
  const charId = sanitizeId(characterSpec?.id || characterSpec?.name || 'char');
  const charName = String(characterSpec?.name || charId);
  const baseAssetsDir = options.assetsRoot
    ? resolveSafeAssetPath(options.assetsRoot, 'assets', options.allowedRoot || null)
    : join(PROJECT_ROOT, 'assets');

  const charDir = join(baseAssetsDir, charId);
  const layersDir = join(charDir, 'layers');
  mkdirSync(layersDir, { recursive: true });

  // فهرست لایه‌ها همیشه تا مجموعهٔ هستهٔ بدن تکمیل می‌شود تا بدن وسطش قطع نشود،
  // حتی اگر برگهٔ کاراکترِ ساخته‌شده توسط مدل ناقص باشد.
  const inputLayers = ensureCompleteBodyLayers(
    Array.isArray(characterSpec?.layers) && characterSpec.layers.length > 0
      ? characterSpec.layers
      : [],
    charId
  );

  const warnings = [];
  const validLayers = [];
  const rolesMap = {};
  const sidesMap = {};

  for (const rawLayer of inputLayers) {
    const resolved = resolveLayerRoleAndSide(rawLayer);
    if (!resolved.valid) {
      warnings.push(`لایهٔ "${rawLayer?.name || rawLayer?.file || '?'}" در کاراکتر "${charId}" دارای role ناشناخته است و وارد رندر نشد`);
      continue;
    }
    validLayers.push({
      raw: rawLayer,
      name: resolved.canonicalName,
      role: resolved.role,
      side: resolved.side,
      file: rawLayer.file || `assets/${charId}/layers/${resolved.canonicalName}.png`
    });
    rolesMap[resolved.canonicalName] = resolved.role;
    if (resolved.side) sidesMap[resolved.canonicalName] = resolved.side;
  }

  const layerImages = new Map(); // imageName -> { width, height, pixels }
  const layerFit = new Map();    // imageName -> { attW, attH } اندازهٔ اتصال با نسبت ابعاد حفظ‌شده
  const useVertexImages = Boolean(options.useVertexImage !== false && options.useVertexImagen !== false && process.env.VERTEX_AI_PROJECT);

  // یک تصویر کامل بدن ساخته و در کد به قطعات بریده می‌شود، به‌جای تولید جداگانهٔ هر عضو.
  // تولید جداگانه قابل اتکا نبود: هر تصویر بی‌خبر از بقیه ساخته می‌شد، پس اعضا هم‌دیگر را
  // تکرار می‌کردند (شورت هم در لگن و هم در ران)، بعضی عضو اشتباهی بودند (بازو = تکه‌ای از
  // پیراهن)، و رنگ و سبک و مقیاسشان با هم نمی‌خواند. از یک نقاشی، همهٔ قطعات ذاتاً هماهنگ‌اند
  // و به‌جای ۱۶ فراخوانی مدل فقط یک فراخوانی لازم است.
  const sheetParts = new Map();
  const needsGeneration = validLayers.some(l => {
    const candidate = resolveSafeAssetPath(l.file, `assets/${charId}/layers/${l.name}.png`, options.allowedRoot || null);
    return options.forceRegenerate || !existsSync(candidate);
  });

  if (useVertexImages && needsGeneration && options.useBodySheet !== false) {
    try {
      const sheetPrompt = buildBodySheetPrompt(charName, characterSpec?.appearance);
      const sheetBuf = await generateStaticPngWithVertex(sheetPrompt);
      const sliced = sliceBodySheet(decodePngBuffer(sheetBuf));
      if (!sliced.ok) {
        warnings.push(`برش تصویر بدن کاراکتر "${charId}" ناموفق بود: ${sliced.error}؛ هر عضو جداگانه ساخته می‌شود`);
      } else {
        for (const [name, img] of sliced.parts) sheetParts.set(name, img);
        for (const w of sliced.warnings) warnings.push(`تصویر بدن کاراکتر "${charId}": ${w}`);
      }
    } catch (err) {
      warnings.push(`ساخت تصویر کامل بدن کاراکتر "${charId}" ناموفق بود (${err.message})؛ هر عضو جداگانه ساخته می‌شود`);
    }
  }

  for (const layer of validLayers) {
    const layout = ROLE_WORLD_LAYOUT[layer.name] || ROLE_WORLD_LAYOUT[layer.role] || { x: 0, y: 1700, w: 200, h: 200 };
    const layerDiskPath = join(layersDir, `${layer.name}.png`);

    let imgData = null;
    // ۱) اگر فایل PNG از قبل روی دیسک موجود است (یا در مسیر مشخص‌شده قرار دارد)
    const candidatePath = resolveSafeAssetPath(layer.file, `assets/${charId}/layers/${layer.name}.png`, options.allowedRoot || null);
    if (!options.forceRegenerate && existsSync(candidatePath)) {
      try {
        // PNG موجود هم از همان مسیر آماده‌سازی عبور می‌کند تا دارایی‌های خرابِ ساخته‌شده در
        // اجراهای قبلی (مربع مات با شطرنجی نقاشی‌شده) دوباره استفاده نشوند و بازسازی شوند.
        const raw = decodePngBuffer(readFileSync(candidatePath));
        const prepared = prepareGeneratedLayer(raw, layout, layer.name);
        if (prepared.error) {
          warnings.push(`PNG موجود لایهٔ "${layer.name}" کاراکتر "${charId}" قابل استفاده نبود: ${prepared.error}؛ بازسازی می‌شود`);
        } else {
          imgData = prepared.img;
          layerFit.set(layer.name, { attW: prepared.attW, attH: prepared.attH });
        }
      } catch (err) {
        warnings.push(`خواندن PNG لایهٔ "${layer.name}" ناموفق بود (${err.message})؛ بازسازی می‌شود`);
      }
    }

    // ۲) قطعهٔ بریده‌شده از تصویر کامل بدن، اگر برای این عضو موجود باشد
    if (!imgData && sheetParts.has(layer.name)) {
      const prepared = prepareGeneratedLayer(sheetParts.get(layer.name), layout, layer.name);
      if (prepared.error) {
        warnings.push(`قطعهٔ "${layer.name}" از تصویر بدن کاراکتر "${charId}" قابل استفاده نبود: ${prepared.error}`);
      } else {
        imgData = prepared.img;
        layerFit.set(layer.name, { attW: prepared.attW, attH: prepared.attH });
      }
    }

    // ۳) اگر مدل تصویر Vertex فعال است، PNG ثابت لایه را می‌سازیم.
    // پس‌زمینه را «تختِ سرخابی» می‌خواهیم، نه «شفاف»: مدل آلفای واقعی تولید نمی‌کند و در پاسخ به
    // درخواست شفافیت یک الگوی شطرنجی داخل تصویر نقاشی می‌کند. پس‌زمینهٔ تختِ کروما بعداً در کد
    // به آلفای واقعی تبدیل می‌شود و نتیجه قطعی و قابل‌اتکاست.
    if (!imgData && useVertexImages) {
      try {
        const prompt = buildLayerPrompt(layer, charName, characterSpec?.appearance);
        const pngBuf = await generateStaticPngWithVertex(prompt);
        const raw = decodePngBuffer(pngBuf);
        const prepared = prepareGeneratedLayer(raw, layout, layer.name);
        if (prepared.error) {
          warnings.push(`لایهٔ "${layer.name}" کاراکتر "${charId}": ${prepared.error}؛ استفاده از لایهٔ سنتزشدهٔ CPU`);
        } else {
          imgData = prepared.img;
          layerFit.set(layer.name, { attW: prepared.attW, attH: prepared.attH });
        }
      } catch (err) {
        warnings.push(`تولید تصویر Vertex برای لایهٔ "${layer.name}" کاراکتر "${charId}" با خطا مواجه شد (${err.message})؛ استفاده از لایهٔ سنتزشدهٔ CPU`);
      }
    }

    // ۴) سنتز لایهٔ PNG با کانال آلفا روی CPU
    if (!imgData) {
      imgData = synthesizeLayerRgba(charId, layer.name, layer.role, layout.w, layout.h);
      // رنگ‌بندی پایهٔ سنتز بر اساس hash است و برای دو کاراکتر می‌تواند تصادفاً یکی دربیاید.
      // چرخش فام با زاویهٔ طلایی روی لباس، تمایز بین کاراکترها را تضمین می‌کند.
      if (variantIndex > 0 && CLOTH_ROLES.has(layer.role)) {
        const hueShift = (variantIndex * 137.5) % 360;
        const px = imgData.pixels;
        for (let i = 0; i < imgData.width * imgData.height; i++) {
          if (px[i * 4 + 3] === 0) continue;
          const [r, g, b] = rotateHue(px[i * 4], px[i * 4 + 1], px[i * 4 + 2], hueShift, 0.5);
          px[i * 4] = r; px[i * 4 + 1] = g; px[i * 4 + 2] = b;
        }
      }
      layerFit.set(layer.name, { attW: layout.w, attH: layout.h });
    }

    // ذخیرهٔ PNG واقعی لایه روی دیسک
    const pngBuffer = encodePngBuffer(imgData.width, imgData.height, imgData.pixels);
    writeFileSync(layerDiskPath, pngBuffer);
    layerImages.set(layer.name, imgData);

    // اگر لایهٔ دهان است، اشکال viseme استاندارد (mouth_viseme_A, E, I, O, U, MBP, FV, L, mouth_smile, mouth_closed) را هم در اطلس و اسلات قرار می‌دهیم تا keyLipSync دقیق کار کند
    if (layer.role === 'mouth') {
      const mouthVariants = [
        'mouth_smile',
        'mouth_closed',
        ...VISEMES.filter(v => v !== 'rest').map(v => `mouth_viseme_${v}`)
      ];
      for (const vName of mouthVariants) {
        const vImg = extractRegionFromBaseAtlas(vName, charId, 'mouth') || imgData;
        layerImages.set(vName, vImg);
        writeFileSync(join(layersDir, `${vName}.png`), encodePngBuffer(vImg.width, vImg.height, vImg.pixels));
      }
    }
  }

  // ساخت سند خام Skeleton (بدون استخوان فرعی؛ فقط root bone 0) برای ارسال به autoRig(doc, alphaOf, options)
  const doc = new Skeleton();
  doc.name = charId;

  for (const layer of validLayers) {
    const img = layerImages.get(layer.name);
    const layout = ROLE_WORLD_LAYOUT[layer.name] || ROLE_WORLD_LAYOUT[layer.role] || { x: 0, y: 1700, w: img.width, h: img.height };
    const offset = { x: layout.x, y: layout.y, rotation: 0, scale_x: 1, scale_y: 1, shear_x: 0, shear_y: 0 };
    // اندازهٔ اتصال از کادر واقعیِ محتوای برش‌خورده می‌آید (با حفظ نسبت ابعاد)، نه کشیدن اجباری
    // کل بوم به ابعاد جدول چیدمان — وگرنه عضو کوچک و در جای اشتباه رسم می‌شود.
    const fit = layerFit.get(layer.name) || { attW: layout.w, attH: layout.h };
    const mainAtt = makeAttachment(layer.name, layer.name, offset, fit.attW, fit.attH);
    const slot = makeSlot(layer.name, 0, mainAtt);

    if (layer.role === 'mouth') {
      const extraAtts = [
        'mouth_smile',
        'mouth_closed',
        ...VISEMES.filter(v => v !== 'rest').map(v => `mouth_viseme_${v}`)
      ].map(vName => {
        const vImg = layerImages.get(vName) || img;
        return makeAttachment(vName, vName, { ...offset }, vImg.width, vImg.height);
      });
      slot.attachments.push(...extraAtts);
      slot.attachment = 'mouth_smile';
    }

    doc.slots.push(slot);
  }

  // تابع alphaOf برای autoRig: استخراج کانال آلفا (0..255) از بافر RGBA هر لایه روی CPU
  const alphaOf = (imageName) => {
    const img = layerImages.get(imageName);
    if (!img) return null;
    const alpha = new Uint8Array(img.width * img.height);
    for (let i = 0; i < alpha.length; i++) {
      alpha[i] = img.pixels[i * 4 + 3];
    }
    return { width: img.width, height: img.height, data: alpha };
  };

  // فراخوانی واقعی autoRig(doc, alphaOf, options) از engine/rigby-core/autorig.js روی CPU
  const rigReport = autoRig(doc, alphaOf, {
    meshes: 'deforming',
    ik: true,
    roles: rolesMap,
    sides: sidesMap
  });

  if (Array.isArray(rigReport.warnings) && rigReport.warnings.length) {
    warnings.push(...rigReport.warnings);
  }

  // انتقال انیمیشن‌های استاندارد (idle, wave, promo) به اسکلت تازه ریگ‌شده با retarget خود موتور
  const referenceSkel = loadSkeletonFromFile('examples/nila.skel.json');
  for (const anim of referenceSkel.animations || []) {
    try {
      retarget(referenceSkel, anim.name, doc, { replace: true });
    } catch (err) {
      warnings.push(`انتقال انیمیشن "${anim.name}" به کاراکتر "${charId}" با خطا مواجه شد: ${err.message}`);
    }
  }

  // ساخت اطلس اختصاصی کاراکتر (.atlas + .png + .rgba)
  const namedList = [...layerImages.entries()].map(([name, data]) => ({
    name,
    width: data.width,
    height: data.height,
    pixels: data.pixels
  }));
  const atlasPagePngName = `${charId}.png`;
  const packed = packImagesIntoAtlas(namedList, atlasPagePngName);

  const skelRelPath = `assets/${charId}/${charId}.skel.json`;
  const atlasRelPath = `assets/${charId}/${charId}.atlas`;
  const pngRelPath = `assets/${charId}/${charId}.png`;

  const skelFullPath = join(charDir, `${charId}.skel.json`);
  const atlasFullPath = join(charDir, `${charId}.atlas`);
  const pngFullPath = join(charDir, `${charId}.png`);
  const rgbaFullPath = join(charDir, `${charId}.rgba`);

  const { json: skelJson } = writeSkeletonJson(doc);

  // اسکلت مرجع انیمیشن دویدن ندارد، پس چرخهٔ دویدن روی استخوان‌های humanoid ساخته می‌شود.
  // بدون این، اکشن "run" در سناریو بی‌صدا به idle برمی‌گشت و بازیکن سرِ جایش می‌ایستاد.
  // تزریق در سطح JSON انجام می‌شود، چون در مدلِ اسکلت `animations` یک آرایه از اشیای Animation
  // است و افزودن کلید به آن بی‌اثر و بی‌صدا نادیده گرفته می‌شود.
  const rigBoneNames = new Set((doc.bones || []).map(b => b.name));
  if (rigBoneNames.has('thigh_l') && rigBoneNames.has('thigh_r')) {
    skelJson.animations = skelJson.animations || {};
    skelJson.animations.run = buildRunAnimation();
  } else {
    warnings.push(`کاراکتر "${charId}" استخوان ران ندارد، پس انیمیشن دویدن ساخته نشد`);
  }

  writeFileSync(skelFullPath, JSON.stringify(skelJson, null, 2), 'utf8');
  writeFileSync(atlasFullPath, packed.atlasText, 'utf8');
  writeFileSync(pngFullPath, encodePngBuffer(packed.pageWidth, packed.pageHeight, packed.pagePixels));
  saveRgbaFile(packed.pageWidth, packed.pageHeight, packed.pagePixels, rgbaFullPath);

  clearSkeletonCache(skelRelPath);
  clearAtlasCache();

  // آپلود اختیاری دارایی‌های کاراکتر به Cloud Storage در صورت تنظیم بودن OUTPUT_BUCKET
  const gcsUris = [];
  if (process.env.OUTPUT_BUCKET && options.uploadToGcs !== false) {
    try {
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage();
      const bucket = storage.bucket(process.env.OUTPUT_BUCKET);
      for (const [localFile, destRel] of [
        [skelFullPath, skelRelPath],
        [atlasFullPath, atlasRelPath],
        [pngFullPath, pngRelPath]
      ]) {
        await bucket.upload(localFile, { destination: destRel });
        gcsUris.push(`gs://${process.env.OUTPUT_BUCKET}/${destRel}`);
      }
    } catch (err) {
      warnings.push(`آپلود دارایی کاراکتر "${charId}" به GCS ناموفق بود: ${err.message}`);
    }
  }

  return {
    id: charId,
    name: charName,
    skeletonPath: skelRelPath,
    atlasPath: atlasRelPath,
    layers: validLayers.map(l => ({
      file: `assets/${charId}/layers/${l.name}.png`,
      role: l.role,
      side: l.side
    })),
    rigReport: {
      bones: rigReport.bones,
      ik: rigReport.ik,
      partCount: rigReport.parts.length,
      warnings
    },
    gcsUris
  };
}

/**
 * ساخت تصویر ثابت پس‌زمینه برای یک صحنه (PNG ثابت، بدون تولید ویدیو).
 * اگر مدل تصویر Vertex فعال باشد از آن استفاده می‌کند؛ در غیر این صورت یک پس‌زمینهٔ گرادیان/صحنهٔ ۲D ثابت روی CPU می‌سازد.
 */
export async function buildSceneBackgroundImage(scene, options = {}) {
  const sceneId = sanitizeId(scene?.id || 'scene-01');
  const relPath = (typeof scene?.backgroundImage === 'string' && scene.backgroundImage.trim())
    ? scene.backgroundImage.trim()
    : `assets/backgrounds/${sceneId}.png`;

  const fullPath = resolveSafeAssetPath(relPath, `assets/backgrounds/${sceneId}.png`, options.allowedRoot || null);
  mkdirSync(dirname(fullPath), { recursive: true });

  const warnings = [];
  if (!options.forceRegenerate && existsSync(fullPath)) {
    return { backgroundImage: relPath, fullPath, warnings };
  }

  const useVertexImages = Boolean(options.useVertexImage !== false && options.useVertexImagen !== false && process.env.VERTEX_AI_PROJECT);
  if (useVertexImages) {
    try {
      const prompt = `2D stylized animation background illustration for scene: "${scene?.description || sceneId}". Wide shot environment, no characters, static 2D background painting, mood color ${scene?.background || '#1b263b'}.`;
      const pngBuf = await generateStaticPngWithVertex(prompt, { aspectRatio: '16:9' });
      writeFileSync(fullPath, pngBuf);
      return { backgroundImage: relPath, fullPath, warnings };
    } catch (err) {
      warnings.push(`تولید پس‌زمینهٔ Vertex برای صحنهٔ "${sceneId}" ناموفق بود (${err.message})؛ استفاده از تصویر پس‌زمینهٔ ثابت تولیدشده روی CPU`);
    }
  }

  // ساخت تصویر پس‌زمینهٔ ثابت ۲D روی CPU (آسمان، افق، تپه‌ها و زمین متناسب با رنگ صحنه)
  const w = Number(options.bgWidth) || 320;
  const h = Number(options.bgHeight) || 180;
  const hexMatch = String(scene?.background || '#1d2d44').trim().match(/^#?([0-9a-fA-F]{6})$/);
  const baseNum = hexMatch ? parseInt(hexMatch[1], 16) : 0x1d2d44;
  const br = (baseNum >> 16) & 255;
  const bg = (baseNum >> 8) & 255;
  const bb = baseNum & 255;

  const pixels = new Uint8Array(w * h * 4);
  const horizonY = Math.floor(h * 0.68);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const hill = Math.sin((x / w) * Math.PI * 3 + (sceneId.charCodeAt(0) || 1)) * (h * 0.05);
      if (y < horizonY + hill) {
        const skyT = y / Math.max(1, horizonY);
        pixels[idx] = Math.min(255, Math.round(br * (0.7 + 0.5 * skyT)));
        pixels[idx + 1] = Math.min(255, Math.round(bg * (0.75 + 0.45 * skyT)));
        pixels[idx + 2] = Math.min(255, Math.round(bb * (0.85 + 0.35 * skyT)));
        pixels[idx + 3] = 255;
      } else {
        const groundT = (y - horizonY) / Math.max(1, h - horizonY);
        pixels[idx] = Math.min(255, Math.round(br * (0.55 - 0.15 * groundT)));
        pixels[idx + 1] = Math.min(255, Math.round(bg * (0.65 - 0.15 * groundT)));
        pixels[idx + 2] = Math.min(255, Math.round(bb * (0.5 - 0.15 * groundT)));
        pixels[idx + 3] = 255;
      }
    }
  }

  writeFileSync(fullPath, encodePngBuffer(w, h, pixels));
  return { backgroundImage: relPath, fullPath, warnings };
}

/**
 * استخراج برگه‌های شخصیت (Character Sheets) از متن سناریو با Gemini / Vertex AI
 */
export async function generateCharacterSheetsFromScenario(scenario, options = {}) {
  const prompt = `از روی سناریوی زیر، فهرست کامل تمام شخصیت‌ها (حداکثر ${MAX_CHARACTERS} کاراکتر) را به صورت JSON استخراج کن.
هیچ شخصیتی را حذف نکن. برای هر شخصیت id یکتا، name، role، appearance و آرایهٔ layers با roleهای استاندارد Rigby2D (torso, pelvis, head, neck, eye, pupil, brow, nose, mouth, ear, hair, upperarm, forearm, hand, thigh, shin, foot و side: "l" | "r" | null) بده.
فقط JSON با ساختار {"characters": [...]} برگردان.

سناریو:
${scenario}`;

  let text;
  if (process.env.VERTEX_AI_PROJECT) {
    text = await callVertexAi(prompt);
  } else if (process.env.GOOGLE_API_KEY) {
    text = await callGeminiApi(prompt, process.env.GOOGLE_API_KEY);
  } else {
    throw new Error('VERTEX_AI_PROJECT یا GOOGLE_API_KEY برای ساخت برگهٔ شخصیت تنظیم نشده است');
  }

  const parsed = parseModelJson(text);
  const chars = Array.isArray(parsed?.characters) ? parsed.characters : [];
  if (chars.length > MAX_CHARACTERS) {
    throw new Error(`تعداد کاراکترهای سناریو (${chars.length}) بیش از سقف ${MAX_CHARACTERS} است`);
  }
  return chars;
}

/**
 * ساخت و ریگ کردن تمامی کاراکترها و پس‌زمینه‌های موجود در یک کارگردانی (directing)
 */
/**
 * سقف کاراکترهایی که ریگ کامل و اختصاصی می‌گیرند (هر کدام ۱۶ تصویر تولیدی).
 * بقیهٔ کاراکترها از روی ریگ یکی از همین‌ها مشتق می‌شوند و هیچ تصویری مصرف نمی‌کنند.
 */
export const MAX_RIGGED_CHARACTERS = Math.max(
  1,
  Number(process.env.BEHIX_MAX_RIGGED || 4) || 4
);

/**
 * رتبه‌بندی کاراکترها برای انتخاب «نقش‌های اصلی».
 * کاراکتری که دیالوگ دارد مهم‌تر از کاراکتری است که فقط در صحنه ایستاده.
 */
function rankCharactersByImportance(directing) {
  const score = new Map();
  for (const ch of directing?.characters || []) score.set(ch.id, 0);

  for (const scene of directing?.scenes || []) {
    for (const sc of scene.characters || []) {
      if (score.has(sc.id)) score.set(sc.id, score.get(sc.id) + 1);
    }
    for (const line of scene.lines || []) {
      if (score.has(line.characterId)) score.set(line.characterId, score.get(line.characterId) + 100);
    }
  }

  return [...(directing?.characters || [])]
    .map((ch, idx) => ({ ch, idx, score: score.get(ch.id) || 0 }))
    .sort((a, b) => (b.score - a.score) || (a.idx - b.idx));
}

/**
 * ساخت کاراکتر جدید از روی ریگ یک کاراکتر موجود، با تغییر رنگ لباس و پوست.
 *
 * چرا لازم است: هر ریگ کامل ۱۶ تصویر از مدل می‌خواهد. برای صحنه‌ای با ۱۲ بازیکن یعنی ۱۹۲ تصویر،
 * که به سقف سهمیهٔ مدل تصویر می‌خورد و نتیجه‌اش لایه‌های ناقص و کاراکتر خراب است.
 * بازیکنان فرعی از روی ریگ یک نقش اصلی ساخته می‌شوند: هیچ تصویری مصرف نمی‌شود و بدنشان کامل است.
 */
/** نقش‌هایی که لباس‌اند و باید رنگشان واقعاً عوض شود (برخلاف پوست و صورت) */
const CLOTH_ROLES = new Set(['torso', 'pelvis', 'thigh', 'shin', 'foot', 'upperarm', 'forearm', 'hair']);

/**
 * چرخش فام رنگ یک پیکسل به اندازهٔ degrees درجه، با حفظ اشباع و روشنایی.
 * برخلاف ضرب ساده در یک عدد، این کار رنگ را واقعاً عوض می‌کند و تیرگی/روشنی را خراب نمی‌کند.
 */
function rotateHue(r, g, b, degrees, minSaturation = 0) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0 && minSaturation <= 0) return [r, g, b]; // خاکستری خالص فام ندارد

  let h;
  if (d === 0) h = 0;
  else if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + degrees) % 360;
  if (h < 0) h += 360;

  // کف اشباع: چرخش فام روی رنگ کم‌اشباع عملاً دیده نمی‌شود، پس دو بازیکن هم‌رنگ می‌مانند.
  // بالا بردن اشباع تا یک کف مشخص باعث می‌شود رنگ لباس واقعاً متمایز شود.
  const s = Math.max(max === 0 ? 0 : d / max, minSaturation);
  const v = max;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [
    Math.round(Math.min(255, Math.max(0, rgb[0] + m))),
    Math.round(Math.min(255, Math.max(0, rgb[1] + m))),
    Math.round(Math.min(255, Math.max(0, rgb[2] + m)))
  ];
}

export async function deriveCharacterFromRig(sourceBuilt, targetSpec, options = {}) {
  const variantIndex = Number.isFinite(options.variantIndex) ? options.variantIndex : 1;
  const targetId = sanitizeId(targetSpec?.id || targetSpec?.name || 'char');
  const baseAssetsDir = options.assetsRoot
    ? resolveSafeAssetPath(options.assetsRoot, 'assets', options.allowedRoot || null)
    : join(PROJECT_ROOT, 'assets');
  const targetLayersDir = join(baseAssetsDir, targetId, 'layers');
  mkdirSync(targetLayersDir, { recursive: true });

  const derivedLayers = [];
  for (const srcLayer of sourceBuilt.layers) {
    const srcFull = resolveSafeAssetPath(srcLayer.file, srcLayer.file, options.allowedRoot || null);
    if (!existsSync(srcFull)) continue;

    const img = decodePngBuffer(readFileSync(srcFull));
    const name = basename(srcLayer.file, '.png');

    // چرخش فام با زاویهٔ طلایی (۱۳۷.۵ درجه) به ازای هر کاراکتر مشتق‌شده: برخلاف hash تصادفی،
    // این کار تمایز رنگ را تضمین می‌کند و دو بازیکن هیچ‌وقت هم‌رنگ درنمی‌آیند.
    // صورت و پوست تقریباً دست‌نخورده می‌ماند تا آدم‌ها طبیعی بمانند؛ فقط لباس رنگ عوض می‌کند.
    const isCloth = CLOTH_ROLES.has(srcLayer.role);
    const hueShift = isCloth ? (variantIndex * 137.5) % 360 : ((variantIndex * 137.5) % 360) * 0.06;

    const px = new Uint8Array(img.pixels);
    for (let i = 0; i < img.width * img.height; i++) {
      if (px[i * 4 + 3] === 0) continue; // پیکسل شفاف دست‌نخورده می‌ماند
      const [r, g, b] = rotateHue(px[i * 4], px[i * 4 + 1], px[i * 4 + 2], hueShift, isCloth ? 0.5 : 0);
      px[i * 4] = r; px[i * 4 + 1] = g; px[i * 4 + 2] = b;
    }

    const outFile = `assets/${targetId}/layers/${name}.png`;
    writeFileSync(join(targetLayersDir, `${name}.png`), encodePngBuffer(img.width, img.height, px));
    derivedLayers.push({ name, file: outFile, role: srcLayer.role, side: srcLayer.side });
  }

  if (!derivedLayers.length) {
    throw new Error(`مشتق‌سازی کاراکتر "${targetId}" ناموفق بود: لایه‌ای از "${sourceBuilt.id}" پیدا نشد`);
  }

  // ریگ از همان مسیر همیشگی ساخته می‌شود، فقط بدون هیچ فراخوانی مدل تصویر
  return buildCharacterRig(
    { ...targetSpec, id: targetId, layers: derivedLayers },
    { ...options, useVertexImage: false, forceRegenerate: false }
  );
}

export async function buildAllDirectingAssets(directing, options = {}) {
  const characters = directing?.characters || [];
  if (characters.length > MAX_CHARACTERS) {
    throw new Error(`تعداد کاراکترها (${characters.length}) بیش از سقف مجاز ${MAX_CHARACTERS} است`);
  }

  const characterReports = [];
  const allWarnings = [];

  // نقش‌های اصلی ریگ کامل می‌گیرند؛ بقیه از روی همان‌ها مشتق می‌شوند تا سهمیهٔ تصویر تمام نشود
  const maxRigged = Math.max(1, Number(options.maxRiggedCharacters) || MAX_RIGGED_CHARACTERS);
  const ranked = rankCharactersByImportance(directing);
  const heroIds = new Set(ranked.slice(0, maxRigged).map(r => r.ch.id));
  const builtById = new Map();
  // شمارندهٔ مشترک بین نقش‌های اصلی و مشتق‌شده‌ها: اگر جدا باشند، هر دو گروه زاویهٔ یکسان
  // می‌گیرند و یک نقش اصلی با یک کاراکتر مشتق‌شده هم‌رنگ درمی‌آید.
  let variantCounter = 0;

  if (characters.length > maxRigged) {
    allWarnings.push(
      `${characters.length} کاراکتر در سناریو هست؛ ${maxRigged} نقش اصلی ریگ اختصاصی می‌گیرند و ` +
      `${characters.length - maxRigged} کاراکتر دیگر از روی آن‌ها با تغییر رنگ ساخته می‌شوند (برای نماندن در سقف سهمیهٔ تصویر)`
    );
  }

  // مرحلهٔ ۱: نقش‌های اصلی با ریگ کامل
  for (const ch of characters) {
    if (!heroIds.has(ch.id)) continue;
    const built = await buildCharacterRig(ch, { ...options, variantIndex: variantCounter++ });
    builtById.set(ch.id, built);
    if (built.rigReport.warnings.length) allWarnings.push(...built.rigReport.warnings);
  }

  // مرحلهٔ ۲: بقیه، مشتق‌شده از نقش‌های اصلی به‌صورت چرخشی
  const heroBuilts = [...builtById.values()];
  let heroCursor = 0;
  for (const ch of characters) {
    if (builtById.has(ch.id)) continue;
    const source = heroBuilts[heroCursor++ % heroBuilts.length];
    try {
      const built = await deriveCharacterFromRig(source, ch, { ...options, variantIndex: variantCounter++ });
      builtById.set(ch.id, built);
      if (built.rigReport.warnings.length) allWarnings.push(...built.rigReport.warnings);
    } catch (err) {
      allWarnings.push(`مشتق‌سازی کاراکتر "${ch.id}" ناموفق بود (${err.message})؛ ریگ کامل ساخته می‌شود`);
      const built = await buildCharacterRig(ch, options);
      builtById.set(ch.id, built);
      if (built.rigReport.warnings.length) allWarnings.push(...built.rigReport.warnings);
    }
  }

  // مرحلهٔ ۳: نوشتن مسیر دارایی‌ها روی سند کارگردانی با همان ترتیب اصلی
  for (const ch of characters) {
    const built = builtById.get(ch.id);
    if (!built) continue;
    ch.id = built.id;
    ch.name = built.name;
    ch.skeletonPath = built.skeletonPath;
    ch.atlasPath = built.atlasPath;
    ch.layers = built.layers;
    characterReports.push(built);
  }

  for (const scene of directing?.scenes || []) {
    const bgRes = await buildSceneBackgroundImage(scene, options);
    scene.backgroundImage = bgRes.backgroundImage;
    if (bgRes.warnings.length) {
      allWarnings.push(...bgRes.warnings);
    }
  }

  return {
    characters: characterReports,
    warnings: allWarnings
  };
}
