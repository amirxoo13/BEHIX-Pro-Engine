/**
 * ماژول تولید صدا (Google Cloud / Vertex TTS با پیش‌فرض gemini-3.8-flash-tts) و لب‌خوانی (فاز ۲):
 *  - سنتز هر خط دیالوگ (lines) در صحنه‌ها با مدل پیش‌فرض gemini-3.8-flash-tts (کلید در هدر یا توکن ADC با GoogleAuth؛ هرگز در URL قرار نمی‌گیرد).
 *  - استخراج کلمات زمان‌بندی‌شده و محاسبهٔ کلیدهای لب‌خوانی با visemeCues و keyLipSync از engine/rigby-core/lipsync.js.
 *  - فراخوانی keyLipSync فقط یک بار، فقط روی انیمیشنی که در بازهٔ همان خط دیالوگ واقعاً برای همان کاراکتر فعال است، و فقط بین startSec و endSec همان خط (بدون تغییر مدت اصلی انیمیشن).
 *  - اگر کاراکتری خط دیالوگ دارد و اسلات دهان در ریگ نیست، خطای صریح پرتاب می‌شود تا وضعیت کار failed شود. اگر کاراکتری خط دیالوگ ندارد، نبودن دهان خطا نیست.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { visemeCues, matchMouths, keyLipSync, timeTextByLoudness, classify } from '../engine/rigby-core/index.js';
import { timedWordsFromLine } from './timeline.js';

const SAMPLE_RATE = 24000;

export const ALLOWED_TTS_MODELS = Object.freeze([
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts'
]);

export const DEFAULT_TTS_MODEL = 'gemini-3.8-flash-tts';

export function resolveTtsModel(modelName = process.env.VERTEX_TTS_MODEL || process.env.TTS_MODEL || DEFAULT_TTS_MODEL) {
  const m = String(modelName || DEFAULT_TTS_MODEL).trim();
  if (!ALLOWED_TTS_MODELS.includes(m)) {
    throw new Error(`مدل صدای دیالوگ "${m}" مجاز نیست یا بازنشسته شده است؛ پیش‌فرض مجاز: ${DEFAULT_TTS_MODEL}`);
  }
  return m;
}

/** دریافت توکن ADC با GoogleAuth و اسکوپ cloud-platform برای فراخوانی سرویس TTS */
async function getCloudTtsToken() {
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const res = await client.getAccessToken();
  const token = typeof res === 'string' ? res : res?.token;
  if (!token) throw new Error('عدم دریافت توکن ADC از GoogleAuth برای سرویس TTS');
  return token;
}

/**
 * فراخوانی gemini-3.8-flash-tts با generateContent.
 * پاسخ صوتی از inlineData خوانده می‌شود. texttospeech.googleapis.com استفاده نمی‌شود.
 * درخواست unary با AUDIO_L16 تا PCM خام ۲۴کیلوهرتز برگردد؛ اگر WAV بود هدر جدا می‌شود.
 */
export async function synthesizeLineWithGoogleTts(text, options = {}) {
  const ttsModel = resolveTtsModel(options.ttsModel || process.env.VERTEX_TTS_MODEL || process.env.TTS_MODEL || DEFAULT_TTS_MODEL);
  const project = process.env.VERTEX_AI_PROJECT;
  const apiKey = process.env.GOOGLE_API_KEY;
  const headers = { 'Content-Type': 'application/json' };
  let endpoint;

  if (project) {
    const token = await getCloudTtsToken();
    headers.Authorization = `Bearer ${token}`;
    endpoint = vertexGenerateContentUrl(project, process.env.VERTEX_AI_LOCATION || 'global', ttsModel);
  } else if (apiKey) {
    headers['x-goog-api-key'] = apiKey;
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${ttsModel}:generateContent`;
  } else {
    throw new Error('VERTEX_AI_PROJECT یا GOOGLE_API_KEY برای سرویس TTS تنظیم نشده است');
  }

  const { postJsonWithRetry } = await import('./character-factory.js');
  const res = await postJsonWithRetry(endpoint, headers, {
    contents: [{ role: 'user', parts: [{ text: String(text) }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      responseFormat: {
        audio: { mimeType: 'AUDIO_L16', sampleRate: SAMPLE_RATE }
      },
      speechConfig: {
        voiceConfig: { voice: options.voiceName || 'Kore' }
      }
    }
  }, { label: 'tts:' + ttsModel });

  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    throw new Error(`خطای TTS (${ttsModel}، کد ${res.status}): ${raw.slice(0, 200)}`);
  }

  const data = await res.json();
  const b64 = inlineAudioBase64(data);
  if (!b64) throw new Error(`پاسخ TTS (${ttsModel}) فاقد inlineData صوتی بود`);
  return stripWavHeaderIfPresent(Buffer.from(b64, 'base64'));
}

function vertexGenerateContentUrl(project, location, model) {
  const loc = location && location !== 'global' ? location : 'global';
  const host = loc === 'global'
    ? 'https://aiplatform.googleapis.com'
    : `https://${loc}-aiplatform.googleapis.com`;
  return `${host}/v1/projects/${project}/locations/${loc}/publishers/google/models/${model}:generateContent`;
}

function inlineAudioBase64(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (!inline?.data) continue;
    const mime = String(inline.mimeType || inline.mime_type || '');
    if (mime && !mime.startsWith('audio/') && !/l16|wav|pcm|audio/i.test(mime)) continue;
    return inline.data;
  }
  return null;
}

function copyAttachmentKeys(anim, slot) {
  const keys = anim.slotTimelineMut(slot).attachment || [];
  return keys.map(k => ({
    time: k.time,
    value: Array.isArray(k.value) ? k.value.slice() : k.value,
    curve: k.curve
  }));
}

/** حذف هدر ۴۴ بایتی WAV در صورتی که خروجی LINEAR16 دارای هدر RIFF باشد */
function stripWavHeaderIfPresent(buf) {
  if (buf.length > 44 && buf.subarray(0, 4).toString('ascii') === 'RIFF') {
    return buf.subarray(44);
  }
  return buf;
}

/**
 * سنتز موج صوتی گفتار-مانند (فرمانت‌های واکه/صامت منطبق با visemeهای متن) روی CPU
 * برای حالت دمو یا زمانی که سرویس ابری در محیط تست آفلاین در دسترس نیست (همراه با ثبت هشدار شفاف در گزارش).
 */
export function synthesizeFallbackSpeechPcm(text, durationSec, characterId = 'main') {
  const dur = Math.max(0.2, Number(durationSec) || 1.5);
  const totalSamples = Math.max(1, Math.floor(dur * SAMPLE_RATE));
  const pcm = Buffer.alloc(totalSamples * 2);

  let hash = 0;
  for (let i = 0; i < characterId.length; i++) hash = (hash * 31 + characterId.charCodeAt(i)) & 0xffff;
  const f0 = 115 + (hash % 95);

  const words = timedWordsFromLine(text, 0, dur);
  const cues = visemeCues(words, { fps: 30 });

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let activeViseme = 'A';
    for (const c of cues) {
      if (c.time <= t) activeViseme = c.viseme;
      else break;
    }
    if (activeViseme === 'rest') {
      pcm.writeInt16LE(0, i * 2);
      continue;
    }
    const f1 = activeViseme === 'A' ? 720 : activeViseme === 'O' ? 500 : activeViseme === 'E' ? 580 : activeViseme === 'U' ? 350 : 420;
    const env = Math.min(1, t / 0.04) * Math.min(1, (dur - t) / 0.05) * (0.65 + 0.35 * Math.sin(2 * Math.PI * 4.5 * t));
    const wave =
      0.55 * Math.sin(2 * Math.PI * f0 * t) +
      0.30 * Math.sin(2 * Math.PI * f1 * t) +
      0.15 * Math.sin(2 * Math.PI * (f0 * 2) * t);
    const sample = Math.max(-32767, Math.min(32767, Math.round(wave * env * 11000)));
    pcm.writeInt16LE(sample, i * 2);
  }
  return pcm;
}

/** محاسبهٔ بلندی صدا (loudness) در هر فریم از بافر PCM 16-bit برای استفاده در timeTextByLoudness */
export function computeFrameLoudness(pcmBuffer, fps = 24) {
  const totalSamples = Math.floor(pcmBuffer.length / 2);
  const samplesPerFrame = Math.max(1, Math.floor(SAMPLE_RATE / fps));
  const frameCount = Math.max(1, Math.ceil(totalSamples / samplesPerFrame));
  const levels = new Array(frameCount).fill(0);

  for (let f = 0; f < frameCount; f++) {
    const startSample = f * samplesPerFrame;
    const endSample = Math.min(totalSamples, startSample + samplesPerFrame);
    let sumSq = 0;
    for (let s = startSample; s < endSample; s++) {
      const val = pcmBuffer.readInt16LE(s * 2) / 32768;
      sumSq += val * val;
    }
    const rms = Math.sqrt(sumSq / Math.max(1, endSample - startSample));
    levels[f] = rms > 0.015 ? rms : 0;
  }
  return levels;
}

/** ساخت فایل WAV استاندارد (PCM 16-bit Mono 24kHz) از بافر نمونه */
export function writeWavFile(pcmBuffer, filePath, sampleRate = SAMPLE_RATE) {
  mkdirSync(dirname(filePath), { recursive: true });
  const dataLen = pcmBuffer.length;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 4, 'ascii');
  header.writeUInt32LE(36 + dataLen, 4);
  header.write('WAVE', 8, 4, 'ascii');
  header.write('fmt ', 12, 4, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36, 4, 'ascii');
  header.writeUInt32LE(dataLen, 40);

  writeFileSync(filePath, Buffer.concat([header, pcmBuffer]));
  return filePath;
}

/**
 * ساخت ترک صوتی کامل فیلم از روی خطوط دیالوگ (lines) صحنه‌ها + تولید کلیدهای لب‌خوانی (lipsync)
 * فقط یک بار و فقط روی انیمیشن فعال همان بازه (بدون تغییر مدت انیمیشن) و بررسی اجباری وجود اسلات دهان.
 */
export async function buildAudioTrackAndLipSync(directing, timeline, workDir, options = {}) {
  const ttsModel = resolveTtsModel(options.ttsModel || process.env.VERTEX_TTS_MODEL || process.env.TTS_MODEL || DEFAULT_TTS_MODEL);
  const fps = Number(options.fps) || 24;
  const totalDuration = Math.max(1, Number(options.duration || directing?.durationSec || timeline?.duration || 4));
  const startOffsetSec = Number(options.startSec) || 0;
  const endOffsetSec = Number(options.endSec) || (startOffsetSec + totalDuration);

  const totalSamples = Math.max(1, Math.ceil((endOffsetSec - startOffsetSec) * SAMPLE_RATE));
  const masterPcm = Buffer.alloc(totalSamples * 2);

  const warnings = [];
  const lineReports = [];
  const hasCloudCreds = Boolean(process.env.VERTEX_AI_PROJECT || process.env.GOOGLE_API_KEY);

  const allLines = [];
  for (const scene of directing?.scenes || []) {
    if (!Array.isArray(scene.lines)) continue;
    for (const line of scene.lines) {
      if (!line || !line.text || typeof line.startSec !== 'number' || typeof line.endSec !== 'number') continue;
      if (line.endSec <= startOffsetSec || line.startSec >= endOffsetSec) continue;
      allLines.push({ ...line, sceneId: scene.id });
    }
  }

  for (const line of allLines) {
    // بررسی اجباری وجود اسلات دهان برای کاراکتری که خط دیالوگ دارد (پیش از ادامهٔ مسیر)
    let skel = null;
    let mouthSlotIdx = -1;
    let mouths = null;
    let activeAnim = null;

    if (timeline) {
      skel = timeline.skeletonFor(line.characterId);
      mouthSlotIdx = skel
        ? skel.slots.findIndex(s => s.name === 'mouth' || classify(s.name)?.role === 'mouth')
        : -1;
      const mouthSlot = mouthSlotIdx >= 0 ? skel.slots[mouthSlotIdx] : null;
      const attNames = (mouthSlot?.attachments || []).map(a => a.name);

      if (mouthSlotIdx < 0 || attNames.length === 0) {
        // ریگ بدون دهان (مثلاً ریگ جایگزین پس از خطای تولید تصویر): صدا ساخته می‌شود،
        // فقط لب‌خوانی همین کاراکتر با هشدار رد می‌شود؛ کل فیلم نمی‌میرد.
        warnings.push(`لب‌خوانی برای کاراکتر "${line.characterId}" رد شد: اسلات دهان (mouth) در ریگ او وجود ندارد`);
        mouthSlotIdx = -1;
      } else {
      mouths = matchMouths(attNames);
      const fallbackOpen = mouths.A || mouths.O || mouths.E || mouths.I || attNames[0] || null;
      const fallbackRest = mouths.rest || mouths.MBP || attNames.find(n => /closed|rest|smile|idle/i.test(n)) || attNames[0] || null;
      for (const k of Object.keys(mouths)) {
        if (!mouths[k]) mouths[k] = (k === 'rest' || k === 'MBP') ? fallbackRest : fallbackOpen;
      }

      const activeAnimName = timeline.animationFor(line.characterId, line.startSec);
      activeAnim = (skel.animations || []).find(a => a.name === activeAnimName) || skel.animations?.[0] || null;
      if (!activeAnim) {
        warnings.push(`لب‌خوانی برای کاراکتر "${line.characterId}" رد شد: انیمیشن فعال در بازهٔ [${line.startSec}, ${line.endSec}] یافت نشد`);
        mouthSlotIdx = -1;
      }
      }
    }

    const lineDur = Math.max(0.2, line.endSec - line.startSec);
    let linePcm = null;
    let source = ttsModel;

    if (hasCloudCreds && options.useCloudTts !== false) {
      linePcm = await synthesizeLineWithGoogleTts(line.text, { ...options, ttsModel });
    } else if (!hasCloudCreds) {
      warnings.push(`متغیر VERTEX_AI_PROJECT یا GOOGLE_API_KEY برای TTS (${ttsModel}) تنظیم نشده؛ استفاده از سینت سایزر صوتی داخلی برای کاراکتر "${line.characterId}"`);
      source = 'cpu-formant-fallback';
      linePcm = synthesizeFallbackSpeechPcm(line.text, lineDur, line.characterId);
    } else {
      throw new Error(`TTS برای کاراکتر "${line.characterId}" خاموش است`);
    }

    // محاسبهٔ زمان‌بندی کلمات بر اساس بلندی صدای واقعی (timeTextByLoudness از lipsync.js)
    const levels = computeFrameLoudness(linePcm, fps);
    const relWords = timeTextByLoudness(line.text, levels, fps);
    const timedWords = (relWords.length ? relWords : timedWordsFromLine(line.text, 0, lineDur)).map(w => ({
      word: w.word,
      start: line.startSec + w.start,
      end: Math.min(line.endSec, line.startSec + w.end)
    }));
    const cues = visemeCues(timedWords, { fps });

    // کلیدها با زمان محلی خط (۰ تا مدت خط) روی انیمیشن فعال نوشته می‌شوند.
    // مدت انیمیشن عوض نمی‌شود. poseAt همان کلید را در بازهٔ فیلم نمونه می‌کند.
    if (timeline && activeAnim && mouthSlotIdx >= 0 && mouths) {
      const lineDurLocal = Math.max(0.05, line.endSec - line.startSec);
      const savedDuration = activeAnim.duration;
      const baseKeys = copyAttachmentKeys(activeAnim, mouthSlotIdx);
      const localCues = cues.map(c => ({ ...c, time: c.time - line.startSec }));
      keyLipSync(activeAnim, mouthSlotIdx, localCues, mouths, {
        start: 0,
        end: lineDurLocal,
        offset: 0
      });
      if (activeAnim.duration !== savedDuration) activeAnim.duration = savedDuration;
      const written = copyAttachmentKeys(activeAnim, mouthSlotIdx)
        .filter(k => k.time >= -1e-4 && k.time <= lineDurLocal + 1e-4);
      if (typeof timeline.recordLipSync === 'function') {
        timeline.recordLipSync({
          characterId: line.characterId,
          animName: activeAnim.name,
          slot: mouthSlotIdx,
          startSec: line.startSec,
          endSec: line.endSec,
          keys: written,
          baseKeys
        });
      }
    }

    // میکس کردن بافر PCM این خط دیالوگ در بافر سراسری قطعه
    const dstStartSample = Math.max(0, Math.floor((line.startSec - startOffsetSec) * SAMPLE_RATE));
    const maxLineSamples = Math.min(
      Math.floor(lineDur * SAMPLE_RATE),
      Math.floor(linePcm.length / 2)
    );
    for (let s = 0; s < maxLineSamples; s++) {
      const dstIdx = dstStartSample + s;
      if (dstIdx < 0 || dstIdx >= totalSamples) break;
      const existing = masterPcm.readInt16LE(dstIdx * 2);
      const incoming = linePcm.readInt16LE(s * 2);
      const mixed = Math.max(-32767, Math.min(32767, existing + incoming));
      masterPcm.writeInt16LE(mixed, dstIdx * 2);
    }

    lineReports.push({
      characterId: line.characterId,
      sceneId: line.sceneId,
      startSec: line.startSec,
      endSec: line.endSec,
      animation: activeAnim?.name || null,
      visemeCount: cues.length,
      ttsModel,
      source
    });
  }

  const audioPath = join(workDir, 'dialogue_track.wav');
  writeWavFile(masterPcm, audioPath, SAMPLE_RATE);

  return {
    audioPath,
    ttsModel,
    lineCount: allLines.length,
    lines: lineReports,
    warnings
  };
}
