/**
 * اولویت ۲: اتصال به Gemini برای تولید JSON کارگردانی
 *
 * دو مسیر واقعی (باگ #7):
 *  1) Vertex AI با @google-cloud/vertexai و Application Default Credentials:
 *     متغیرها: VERTEX_AI_PROJECT (اجباری)، VERTEX_AI_LOCATION (پیش‌فرض us-central1)
 *     روی Cloud Run با سرویس‌اکانت دارای roles/aiplatform.user هیچ کلیدی لازم نیست.
 *  2) Gemini API (AI Studio) با GOOGLE_API_KEY — کلید در هدر x-goog-api-key، نه در URL.
 *
 * خطاهای upstream به کلاینت نشت نمی‌کنند؛ فقط در لاگ سرور می‌روند.
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const SYSTEM_PROMPT = `تو کارگردان انیمیشن ۲D هستی.
از سناریوی کاربر یک برنامهٔ کارگردانی ساخت‌یافته (JSON) بساز.
فقط JSON معتبر برگردان، بدون توضیح اضافه.

ساختار خروجی:
{
  "title": "string",
  "durationSec": number,
  "characters": [{"id": "string", "name": "string", "appearance": "string"}],
  "scenes": [
    {
      "id": "string",
      "startSec": number,
      "endSec": number,
      "description": "string",
      "camera": "wide | medium | close",
      "characters": [{"id": "string", "action": "string", "emotion": "string"}]
    }
  ]
}

اکشن‌های مجاز: walk, run, stand, idle, wave, greet, talk, speak, promo
دوربین هر صحنه یکی از wide/medium/close باشد.`;

export function buildDirectingPrompt(scenario) {
  return `${SYSTEM_PROMPT}\n\nسناریو:\n${scenario}`;
}

/** اعتبارسنجی حداقلی خروجی مدل تا پایپ‌لاین روی JSON بدفرم نترکد */
export function validateDirecting(directing) {
  if (!directing || typeof directing !== 'object') {
    throw new Error('کارگردانی معتبر نیست: object نیست');
  }
  if (!Array.isArray(directing.scenes) || directing.scenes.length === 0) {
    throw new Error('کارگردانی معتبر نیست: فیلد scenes خالی است');
  }
  for (const s of directing.scenes) {
    if (typeof s.startSec !== 'number' || typeof s.endSec !== 'number' || s.endSec <= s.startSec) {
      throw new Error(`صحنهٔ نامعتبر: startSec/endSec در "${s.id || '?'}"`);
    }
  }
  if (!(Number(directing.durationSec) > 0)) {
    directing.durationSec = Math.max(...directing.scenes.map(s => s.endSec));
  }
  return directing;
}

async function callVertexAi(prompt) {
  const project = process.env.VERTEX_AI_PROJECT;
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
  const { VertexAI } = await import('@google-cloud/vertexai');
  const vertexAI = new VertexAI({ project, location });
  const model = vertexAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
  });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });
  const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('پاسخ خالی از Vertex AI');
  return text;
}

async function callGeminiApi(prompt, apiKey) {
  // باگ #7: کلید در هدر، نه در query string (در لاگ/پراکسی ثبت نمی‌شود)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
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
    // بدنهٔ خام فقط در لاگ سرور؛ به بیرون فقط کد وضعیت می‌رود
    const raw = await res.text().catch(() => '');
    console.error(`[gemini] upstream ${res.status}: ${raw.slice(0, 500)}`);
    throw new Error(`خطای Gemini (کد ${res.status})`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('پاسخ خالی از Gemini');
  return text;
}

/**
 * تولید کارگردانی از سناریو.
 * اول Vertex AI (اگر VERTEX_AI_PROJECT تنظیم شده)، وگرنه Gemini API با GOOGLE_API_KEY.
 * @param {string} scenario
 * @returns {Promise<object>}
 */
export async function generateDirecting(scenario) {
  if (typeof scenario !== 'string' || !scenario.trim()) {
    throw new Error('سناریو باید رشتهٔ غیرخالی باشد');
  }
  const prompt = buildDirectingPrompt(scenario.slice(0, 8000));

  let text;
  if (process.env.VERTEX_AI_PROJECT) {
    text = await callVertexAi(prompt);
  } else if (process.env.GOOGLE_API_KEY) {
    text = await callGeminiApi(prompt, process.env.GOOGLE_API_KEY);
  } else {
    throw new Error('VERTEX_AI_PROJECT یا GOOGLE_API_KEY تنظیم نشده — کارگردانی هوشمند غیرفعال است');
  }

  let directing;
  try {
    directing = JSON.parse(text);
  } catch {
    // گاهی مدل JSON را داخل code fence می‌گذارد
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('خروجی مدل JSON معتبر نبود');
    directing = JSON.parse(m[0]);
  }
  return validateDirecting(directing);
}
