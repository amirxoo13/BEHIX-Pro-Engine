/**
 * اولویت ۲: اتصال ساده به Gemini برای تولید JSON کارگردانی
 * 
 * متغیر محیطی لازم: GOOGLE_API_KEY یا VERTEX_AI_PROJECT + VERTEX_AI_LOCATION
 * (فعلاً فقط ساختار و پرامپت آماده است؛ فراخوانی واقعی با کلید انجام می‌شود)
 */

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
      "camera": "string",
      "characters": [{"id": "string", "action": "string", "emotion": "string"}]
    }
  ]
}`;

export function buildDirectingPrompt(scenario) {
  return `${SYSTEM_PROMPT}\n\nسناریو:\n${scenario}`;
}

/**
 * فراخوانی واقعی Gemini (وقتی کلید موجود باشد)
 * @param {string} scenario
 * @returns {Promise<object>}
 */
export async function generateDirecting(scenario) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return {
      error: 'GOOGLE_API_KEY تنظیم نشده',
      prompt: buildDirectingPrompt(scenario),
      mock: true
    };
  }

  // فراخوانی ساده به Gemini API (REST)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: buildDirectingPrompt(scenario) }] }],
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('پاسخ خالی از Gemini');

  return JSON.parse(text);
}
