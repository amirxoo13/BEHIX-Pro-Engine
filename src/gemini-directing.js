/**
 * اولویت ۲: اتصال به Gemini برای تولید JSON کارگردانی
 *
 * دو مسیر واقعی:
 *  1) Vertex AI با @google-cloud/vertexai و Application Default Credentials:
 *     متغیرها: VERTEX_AI_PROJECT (اجباری)، VERTEX_AI_LOCATION (پیش‌فرض global یا us-central1)
 *     روی Cloud Run با سرویس‌اکانت دارای roles/aiplatform.user هیچ کلیدی لازم نیست.
 *  2) Gemini API (AI Studio) با GOOGLE_API_KEY — کلید در هدر x-goog-api-key، نه در URL.
 *
 * اصلاحات فاز ۱ و ۲:
 *  - پیش‌فرض GEMINI_MODEL برابر gemini-4-argon و اعتبارسنجی مدل‌های مجاز متنی.
 *  - حذف سقف قدیمی ۳ کاراکتر و پشتیبانی از تا ۲۰ کاراکتر متمایز (BEHIX_MAX_CHARACTERS=20).
 *  - خطای صریح در صورت وجود بیش از ۲۰ کاراکتر (بدون حذف بی‌صدای کاراکتر بیست‌ویکم).
 *  - پشتیبانی از اسکلت و اطلس مستقل برای هر کاراکتر (skeletonPath, atlasPath, layers).
 *  - پشتیبانی از تصویر پس‌زمینهٔ ثابت هر صحنه (backgroundImage) با حفظ fallback رنگ تخت (#rrggbb).
 *  - پشتیبانی از دیالوگ و زمان‌بندی صدا (lines) و اتصال هر صحنه به بخش متناظر سناریو (sourceSpan).
 *  - اعتبارسنجی پیوستگی زمانی صحنه‌ها (بدون حفره تا durationSec) و بازهٔ ۱۸۰ تا ۳۰۰ ثانیه برای فیلم بلند.
 */

export const ALLOWED_TEXT_MODELS = Object.freeze([
  'gemini-4-argon',
  'gemini-4-argon-cyber-permissive',
  'gemini-3.8-flash',
  'gemini-3.8-flash-cyber',
  'gemini-3.8-live',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview'
]);

export const DEFAULT_GEMINI_MODEL = 'gemini-4-argon';
export const MODEL = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
export const MAX_CHARACTERS = Number(process.env.BEHIX_MAX_CHARACTERS) || 20;
export const LONGFORM_MIN_SEC = 180;
export const LONGFORM_MAX_SEC = Number(process.env.BEHIX_LONGFORM_MAX_SEC) || 300;

export function resolveTextModel(modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL) {
  const m = String(modelName || DEFAULT_GEMINI_MODEL).trim();
  if (!ALLOWED_TEXT_MODELS.includes(m)) {
    throw new Error(`مدل متنی "${m}" مجاز نیست یا بازنشسته شده است؛ پیش‌فرض مجاز: ${DEFAULT_GEMINI_MODEL}`);
  }
  return m;
}

export const SYSTEM_PROMPT = `تو کارگردان انیمیشن ۲D برای موتور BEHIX Pro هستی.
از سناریوی کاربر یک برنامهٔ کارگردانی ساخت‌یافته (JSON) بساز.
فقط JSON معتبر برگردان، بدون توضیح اضافه و بدون markdown.

### قوانین و قابلیت‌های موتور (هرگز نقض نکن)
- موتور تا حداکثر ${MAX_CHARACTERS} کاراکتر متمایز را پشتیبانی می‌کند. هرگز شخصیت‌های سناریو را حذف نکن و قصه را به ۳ کلون تقلیل نده.
- هر کاراکتر شناسهٔ یکتا (id)، نام (name)، نقش (role)، توصیف ظاهری (appearance)، مسیر اسکلت ("assets/<id>/<id>.skel.json")، مسیر اطلس ("assets/<id>/<id>.atlas") و فهرست لایه‌های بدنی مجزا (layers) دارد.
- نام و role لایه‌ها باید با استاندارد Rigby2D سازگار باشد: head, neck, torso, pelvis, upperarm, forearm, hand, thigh, shin, foot, eye, pupil, brow, mouth, nose, ear, hair (به‌همراه side: "l" یا "r" برای اندام‌های زوج).
- هر صحنه باید با فیلد sourceSpan شامل {"start": number, "end": number} به بازهٔ کاراکترهای متناظر در متن سناریوی ورودی متصل باشد.
- صحنه‌ها باید کل بازهٔ زمانی از 0 تا durationSec را بدون هیچ حفره‌ای پوشش دهند: صحنهٔ اول از 0 شروع شود، endSec هر صحنه دقیقاً برابر startSec صحنهٔ بعدی باشد، و endSec آخرین صحنه برابر durationSec باشد.
- برای فیلم بلند، durationSec باید بین ${LONGFORM_MIN_SEC} و ${LONGFORM_MAX_SEC} ثانیه (۳ تا ۵ دقیقه) باشد.
- هر صحنه علاوه بر رنگ پس‌زمینهٔ fallback (background به فرمت "#rrggbb")، مسیر تصویر ثابت پس‌زمینه (backgroundImage به فرمت "assets/backgrounds/<sceneId>.png") و توصیف پس‌زمینه (backgroundPrompt) دارد.
- هر صحنه شامل خطوط دیالوگ (lines) برای تولید صدای TTS و لب‌خوانی (lipsync) روی اسلات دهان کاراکتر است: [{"characterId": "string", "text": "string", "startSec": number, "endSec": number}].
- اکشن‌های مجاز کاراکترها در صحنه: idle, walk, run, stand, wave, greet, talk, speak, promo, happy, sad.

### ساختار دقیق خروجی JSON
{
  "title": "string",
  "durationSec": 180,
  "characters": [
    {
      "id": "string",
      "name": "string",
      "role": "string",
      "appearance": "string",
      "skeletonPath": "assets/<id>/<id>.skel.json",
      "atlasPath": "assets/<id>/<id>.atlas",
      "layers": [
        { "file": "assets/<id>/layers/torso.png", "role": "torso", "side": null },
        { "file": "assets/<id>/layers/head.png", "role": "head", "side": null },
        { "file": "assets/<id>/layers/mouth.png", "role": "mouth", "side": null },
        { "file": "assets/<id>/layers/eye_l.png", "role": "eye", "side": "l" },
        { "file": "assets/<id>/layers/eye_r.png", "role": "eye", "side": "r" },
        { "file": "assets/<id>/layers/upperarm_l.png", "role": "upperarm", "side": "l" },
        { "file": "assets/<id>/layers/forearm_l.png", "role": "forearm", "side": "l" },
        { "file": "assets/<id>/layers/hand_l.png", "role": "hand", "side": "l" },
        { "file": "assets/<id>/layers/upperarm_r.png", "role": "upperarm", "side": "r" },
        { "file": "assets/<id>/layers/forearm_r.png", "role": "forearm", "side": "r" },
        { "file": "assets/<id>/layers/hand_r.png", "role": "hand", "side": "r" },
        { "file": "assets/<id>/layers/thigh_l.png", "role": "thigh", "side": "l" },
        { "file": "assets/<id>/layers/shin_l.png", "role": "shin", "side": "l" },
        { "file": "assets/<id>/layers/foot_l.png", "role": "foot", "side": "l" },
        { "file": "assets/<id>/layers/thigh_r.png", "role": "thigh", "side": "r" },
        { "file": "assets/<id>/layers/shin_r.png", "role": "shin", "side": "r" },
        { "file": "assets/<id>/layers/foot_r.png", "role": "foot", "side": "r" }
      ]
    }
  ],
  "scenes": [
    {
      "id": "string",
      "startSec": 0,
      "endSec": 20,
      "sourceSpan": { "start": 0, "end": 120 },
      "description": "string",
      "camera": "wide | medium | close",
      "background": "#112233",
      "backgroundImage": "assets/backgrounds/scene-01.png",
      "characters": [{ "id": "string", "action": "idle", "emotion": "string" }],
      "lines": [{ "characterId": "string", "text": "string", "startSec": 1, "endSec": 4 }]
    }
  ]
}`;

export function buildDirectingPrompt(scenario, options = {}) {
  const targetDuration = Number(options.durationSec || options.duration) || null;
  const durationHint = targetDuration
    ? `\nمدت زمان هدف (durationSec): ${targetDuration} ثانیه.`
    : '';
  return `${SYSTEM_PROMPT}${durationHint}\n\nسناریو (طول کل متن: ${String(scenario || '').length} کاراکتر):\n${scenario}`;
}

/**
 * استخراج امن اولین JSON معتبر از متن خروجی مدل با شمارش آکولاد و رعایت رشته‌ها
 */
export function parseModelJson(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('خروجی مدل خالی است');
  }
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch {}
    }
    const startIdx = trimmed.indexOf('{');
    if (startIdx < 0) throw new Error('خروجی مدل JSON معتبر نبود');
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = startIdx; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            const candidate = trimmed.slice(startIdx, i + 1);
            return JSON.parse(candidate);
          }
        }
      }
    }
    throw new Error('خروجی مدل JSON معتبر نبود');
  }
}

/**
 * اعتبارسنجی کامل JSON کارگردانی پیش از رندر:
 *  - سقف کاراکترها: حداکثر ۲۰ کاراکتر (BEHIX_MAX_CHARACTERS). اگر بیشتر بود خطا می‌دهد و بی‌صدا حذف نمی‌کند.
 *  - یکتایی id کاراکترها و id صحنه‌ها.
 *  - وجود هر کاراکتر صحنه و دیالوگ در لیست characters ریشه.
 *  - بررسی sourceSpan، lines، و در حالت strict/longform بررسی پیوستگی بدون حفرهٔ صحنه‌ها و بازهٔ ۱۸۰ تا ۳۰۰ ثانیه.
 */
export function validateDirecting(directing, options = {}) {
  const maxChars = Number(options.maxCharacters) || MAX_CHARACTERS;
  const isLongform = Boolean(options.longform);
  const requireContiguous = Boolean(options.requireContiguous || isLongform);
  const requireSourceSpan = Boolean(options.requireSourceSpan || isLongform);

  if (!directing || typeof directing !== 'object') {
    throw new Error('کارگردانی معتبر نیست: object نیست');
  }
  if (!Array.isArray(directing.scenes) || directing.scenes.length === 0) {
    throw new Error('کارگردانی معتبر نیست: فیلد scenes خالی است');
  }

  if (!Array.isArray(directing.characters)) {
    directing.characters = [];
  }
  if (directing.characters.length > maxChars) {
    throw new Error(`تعداد کاراکترهای سناریو (${directing.characters.length}) بیش از سقف مجاز است؛ سقف ${maxChars} کاراکتر است`);
  }

  const charIds = new Set();
  for (let i = 0; i < directing.characters.length; i++) {
    const c = directing.characters[i];
    if (!c || typeof c !== 'object' || typeof c.id !== 'string' || !c.id.trim()) {
      throw new Error(`کاراکتر در اندیس ${i} شناسه (id) معتبر ندارد`);
    }
    const id = c.id.trim();
    if (charIds.has(id)) {
      throw new Error(`شناسهٔ کاراکتر تکراری است: "${id}" (id کاراکترها باید یکتا باشد)`);
    }
    charIds.add(id);
  }

  const sceneIds = new Set();
  for (let i = 0; i < directing.scenes.length; i++) {
    const s = directing.scenes[i];
    if (!s || typeof s !== 'object') {
      throw new Error(`صحنه در اندیس ${i} معتبر نیست`);
    }
    if (typeof s.id === 'string' && s.id.trim()) {
      if (sceneIds.has(s.id.trim())) {
        throw new Error(`شناسهٔ صحنه تکراری است: "${s.id}"`);
      }
      sceneIds.add(s.id.trim());
    }
    if (typeof s.startSec !== 'number' || typeof s.endSec !== 'number' || !Number.isFinite(s.startSec) || !Number.isFinite(s.endSec) || s.endSec <= s.startSec) {
      throw new Error(`صحنهٔ نامعتبر: startSec/endSec در "${s.id || i}"`);
    }
    if (s.sourceSpan !== undefined || requireSourceSpan) {
      if (
        !s.sourceSpan ||
        typeof s.sourceSpan !== 'object' ||
        typeof s.sourceSpan.start !== 'number' ||
        typeof s.sourceSpan.end !== 'number' ||
        s.sourceSpan.start < 0 ||
        s.sourceSpan.end <= s.sourceSpan.start
      ) {
        throw new Error(`صحنهٔ "${s.id || i}" فیلد sourceSpan معتبر ({start, end}) ندارد`);
      }
    }

    if (Array.isArray(s.characters)) {
      if (s.characters.length > maxChars) {
        throw new Error(`تعداد کاراکترهای هم‌زمان در صحنهٔ "${s.id || i}" (${s.characters.length}) بیش از سقف ${maxChars} است`);
      }
      const inSceneIds = new Set();
      for (const sc of s.characters) {
        if (!sc || typeof sc.id !== 'string' || !sc.id.trim()) {
          throw new Error(`کاراکتر بدون id در صحنهٔ "${s.id || i}"`);
        }
        if (inSceneIds.has(sc.id)) {
          throw new Error(`کاراکتر "${sc.id}" در صحنهٔ "${s.id || i}" تکرار شده است`);
        }
        inSceneIds.add(sc.id);
        if (charIds.size > 0 && !charIds.has(sc.id)) {
          throw new Error(`کاراکتر "${sc.id}" در صحنهٔ "${s.id || i}" در لیست characters ریشه تعریف نشده است`);
        }
      }
    }

    if (Array.isArray(s.lines)) {
      for (const line of s.lines) {
        if (!line || typeof line.characterId !== 'string' || !line.characterId.trim()) {
          throw new Error(`خط دیالوگ در صحنهٔ "${s.id || i}" فاقد characterId معتبر است`);
        }
        if (charIds.size > 0 && !charIds.has(line.characterId)) {
          throw new Error(`کاراکتر دیالوگ "${line.characterId}" در صحنهٔ "${s.id || i}" در لیست characters وجود ندارد`);
        }
        if (typeof line.text !== 'string' || !line.text.trim()) {
          throw new Error(`متن دیالوگ در صحنهٔ "${s.id || i}" خالی است`);
        }
        if (typeof line.startSec !== 'number' || typeof line.endSec !== 'number' || line.endSec <= line.startSec) {
          throw new Error(`زمان‌بندی دیالوگ (startSec/endSec) در صحنهٔ "${s.id || i}" نامعتبر است`);
        }
      }
    }
  }

  if (!(Number(directing.durationSec) > 0)) {
    directing.durationSec = Math.max(...directing.scenes.map(s => s.endSec));
  }

  if (isLongform) {
    const minSec = Number(options.minDurationSec) || LONGFORM_MIN_SEC;
    const maxSec = Number(options.maxDurationSec) || LONGFORM_MAX_SEC;
    if (directing.durationSec < minSec || directing.durationSec > maxSec) {
      throw new Error(`مدت فیلم بلند (durationSec=${directing.durationSec}) باید بین ${minSec} و ${maxSec} ثانیه باشد`);
    }
  }

  if (requireContiguous) {
    const first = directing.scenes[0];
    if (Math.abs(first.startSec - 0) > 1e-3) {
      throw new Error(`صحنهٔ اول ("${first.id || 0}") باید از ثانیهٔ 0 شروع شود (startSec=${first.startSec})`);
    }
    for (let i = 0; i < directing.scenes.length - 1; i++) {
      const cur = directing.scenes[i];
      const next = directing.scenes[i + 1];
      if (Math.abs(cur.endSec - next.startSec) > 1e-3) {
        throw new Error(`حفره یا هم‌پوشانی زمانی بین صحنهٔ "${cur.id || i}" (endSec=${cur.endSec}) و "${next.id || i + 1}" (startSec=${next.startSec})`);
      }
    }
    const last = directing.scenes[directing.scenes.length - 1];
    if (Math.abs(last.endSec - directing.durationSec) > 1e-3) {
      throw new Error(`پایان صحنهٔ آخر (endSec=${last.endSec}) با durationSec (${directing.durationSec}) برابر نیست`);
    }
  }

  return directing;
}

export async function callVertexAi(prompt, modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL) {
  const validModel = resolveTextModel(modelName);
  const project = process.env.VERTEX_AI_PROJECT;
  const location = process.env.VERTEX_AI_LOCATION || 'global';
  const { VertexAI } = await import('@google-cloud/vertexai');
  const options = { project, location };
  if (location === 'global') options.apiEndpoint = 'aiplatform.googleapis.com';
  const vertexAI = new VertexAI(options);
  const model = vertexAI.getGenerativeModel({
    model: validModel,
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
  });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });
  const parts = result?.response?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || '').join('');
  if (!text) throw new Error('پاسخ خالی از Vertex AI');
  return text;
}

export async function callGeminiApi(prompt, apiKey, modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL) {
  const validModel = resolveTextModel(modelName);
  // کلید در هدر x-goog-api-key، نه در query string
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${validModel}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    console.error(`[gemini] upstream ${res.status}: ${raw.slice(0, 500)}`);
    throw new Error(`خطای Gemini (کد ${res.status})`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || '').join('');
  if (!text) throw new Error('پاسخ خالی از Gemini');
  return text;
}

/**
 * تولید کارگردانی از سناریو.
 * اول Vertex AI (اگر VERTEX_AI_PROJECT تنظیم شده)، وگرنه Gemini API با GOOGLE_API_KEY.
 * @param {string} scenario
 * @param {object} [options]
 * @returns {Promise<object>}
 */
export async function generateDirecting(scenario, options = {}) {
  if (typeof scenario !== 'string' || !scenario.trim()) {
    throw new Error('سناریو باید رشتهٔ غیرخالی باشد');
  }
  const maxScenarioLength = Number(options.maxScenarioLength) || 64000;
  if (scenario.length > maxScenarioLength) {
    throw new Error(`طول سناریو (${scenario.length}) بیش از حد مجاز (${maxScenarioLength} کاراکتر) است`);
  }
  const prompt = buildDirectingPrompt(scenario, options);

  let text;
  if (process.env.VERTEX_AI_PROJECT) {
    text = await callVertexAi(prompt);
  } else if (process.env.GOOGLE_API_KEY) {
    text = await callGeminiApi(prompt, process.env.GOOGLE_API_KEY);
  } else {
    throw new Error('VERTEX_AI_PROJECT یا GOOGLE_API_KEY تنظیم نشده — کارگردانی هوشمند غیرفعال است');
  }

  const directing = parseModelJson(text);
  return validateDirecting(directing, options);
}
