# BEHIX Pro Engine

موتور انیمیشن حرفه‌ای ۲D: runtime ریگبی۲D + کارگردانی هوشمند با Vertex AI / Gemini + رندر CPU (بدون Canvas، بدون GPU) + خروجی MP4 با FFmpeg.

## وضعیت فعلی (پیاده‌سازی‌شده و تست‌شده)

- **Runtime کامل Rigby2D** (`engine/rigby-core`): اسکلت، انیمیشن، IK، فیزیک، اطلس، clipping، دو-رنگ tint.
- **کارگردانی هوشمند** (`src/gemini-directing.js`): Vertex AI با Application Default Credentials (متغیر `VERTEX_AI_PROJECT`) یا Gemini API با `GOOGLE_API_KEY` (کلید در هدر، نه URL). خروجی JSON اعتبارسنجی می‌شود.
- **Timeline** (`src/timeline.js`): نگاشت اکشن/احساس به انیمیشن، یک `Pose`/`AnimationState` پایدار برای هر کاراکتر (فیزیک پیوسته)، زمان بر اساس مدت واقعی انیمیشن، دوربین هر صحنه (`wide/medium/close` یا `{worldX, worldY, scale}`).
- **رندر نرم‌افزاری CPU** (`src/software-renderer.js`): هندسه از `drawSkeletonGeometry` خود موتور (ترتیب رسم، clipping، trim/rotate اطلس با `parseAtlas`)، نمونه‌برداری bilinear، رنگ اسلات + dark tint + blend (normal/additive/multiply/screen).
- **کدگذاری ویدیو** (`src/video-encoder.js`): فریم‌های PPM در پوشهٔ موقت یکتای هر کار، FFmpeg با demuxer `image2`، شنوندهٔ `error`، پاک‌سازی در `finally`، سقف مدت/فریم‌ریت/رزولوشن.
- **سرور Express** (`src/server.js`): اعتبارسنجی ورودی، بدون `outputPath` کلاینتی، دانلود خروجی با `GET /renders/:jobId`، احراز هویت اختیاری با `BEHIX_API_KEY`، آپلود اختیاری به Cloud Storage با `OUTPUT_BUCKET`.

کارهای آینده (هنوز متصل نیستند): پایپ‌لاین Imagen→AutoRig برای ساخت کاراکتر جدید، لب‌خوانی (`engine/rigby-core/lipsync.js` موجود است)، صف Cloud Tasks برای jobهای طولانی.

## اجرا

```bash
npm ci        # یا npm install
npm test      # هر ۴ اولویت، شامل تولید MP4 واقعی (ffmpeg لازم است)
npm start     # سرور روی PORT (پیش‌فرض 8080)
npm run demo  # رندر دموی ۲کاراکتره بدون سرور
```

### API

| مسیر | بدنه | توضیح |
|---|---|---|
| `GET /health` | — | وضعیت و سقف‌ها |
| `POST /preview-pose` | `{animationName, time}` | خلاصهٔ pose بدون رندر |
| `POST /render` | `{directing, duration?, fps?, width?, height?}` | رندر از کارگردانی آماده |
| `POST /render-from-scenario` | `{scenario, options?}` | سناریو → Gemini → رندر |
| `POST /render-demo` | — | دموی سریع |
| `GET /renders/:jobId` | — | دانلود MP4 کار کامل‌شده |

سقف‌ها: مدت ≤ ۶۰ ثانیه، fps ≤ ۳۰، رزولوشن ≤ ۱۹۲۰×۱۰۸۰ (ابعاد خودکار زوج می‌شوند).

### متغیرهای محیطی

| متغیر | نقش |
|---|---|
| `VERTEX_AI_PROJECT` / `VERTEX_AI_LOCATION` | کارگردانی با Vertex AI و ADC (روی Cloud Run با سرویس‌اکانت `roles/aiplatform.user`) |
| `GOOGLE_API_KEY` | جایگزین: Gemini API (AI Studio) |
| `GEMINI_MODEL` | پیش‌فرض `gemini-2.0-flash` |
| `OUTPUT_BUCKET` | آپلود خودکار MP4 به `gs://bucket/renders/<jobId>/film.mp4` |
| `BEHIX_API_KEY` | اگر تنظیم شود، هدر `x-api-key` اجباری است |
| `PORT` | پیش‌فرض ۸۰۸۰ |

## استقرار روی Google Cloud (CPU، بدون GPU)

```bash
PROJECT=<project-id>
REGION=<region>

gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  cloudbuild.googleapis.com aiplatform.googleapis.com

gcloud artifacts repositories create behix --repository-format=docker --location=$REGION

gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT/behix/engine:0.1.0

gcloud storage buckets create gs://$PROJECT-behix-renders --location=$REGION \
  --uniform-bucket-level-access

gcloud run deploy behix-pro-engine \
  --image $REGION-docker.pkg.dev/$PROJECT/behix/engine:0.1.0 \
  --region $REGION --cpu 2 --memory 2Gi --timeout 300 --concurrency 1 \
  --no-allow-unauthenticated \
  --set-env-vars VERTEX_AI_PROJECT=$PROJECT,VERTEX_AI_LOCATION=$REGION,OUTPUT_BUCKET=$PROJECT-behix-renders
```

`--concurrency 1` چون رندر CPU-bound است؛ `--no-allow-unauthenticated` چون رندر منابع می‌خورد.
فراخوانی با توکن IAM:

```bash
curl -X POST "$(gcloud run services describe behix-pro-engine --region $REGION --format 'value(status.url)')/render-demo" \
  -H "Authorization: Bearer $(gcloud auth print-identity-token)"
```

## لایسنس

- کد موتور: طبق تصمیم صاحب پروژه.
- runtime Rigby2D: MIT یا Apache-2.0 (طبق هدر فایل‌ها).
