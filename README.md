# BEHIX Pro Engine

موتور انیمیشن حرفه‌ای ۲D: runtime ریگبی۲D + کارگردانی هوشمند با Vertex AI / Gemini (`gemini-4-argon`) + ساخت تصویر ثابت لایه و پس‌زمینه (`gemini-3.1-flash-image`) + ریگ خودکار CPU (`autoRig`) + لب‌خوانی (`lipsync`) و صدای دیالوگ (`gemini-3.8-flash-tts`) + رندر CPU (بدون Canvas، بدون GPU) + خروجی MP4 با FFmpeg.

> **قاعدهٔ بنیادین معماری:** فریم‌ها را موتور CPU می‌سازد؛ مدل ویدیو فیلم نمی‌سازد.

## وضعیت فعلی (پیاده‌سازی‌شده و تست‌شده)

- **Runtime کامل Rigby2D** (`engine/rigby-core`): اسکلت، انیمیشن، IK، فیزیک، اطلس، clipping، دو-رنگ tint، ریگ خودکار (`autorig.js`)، لب‌خوانی (`lipsync.js`)، تشخیص اعضای بدن (`bodyparts.js`) و انتقال انیمیشن (`retarget.js`).
- **کارگردانی هوشمند و پایپ‌لاین سناریو** (`src/gemini-directing.js`, `src/scenario-pipeline.js`): تولید و اعتبارسنجی JSON کارگردانی با Vertex AI (`VERTEX_AI_PROJECT`) یا Gemini API (`GOOGLE_API_KEY` در هدر `x-goog-api-key`، نه در URL) با مدل پیش‌فرض `GEMINI_MODEL=gemini-4-argon`. پشتیبانی از تا **۲۰ کاراکتر متمایز** (`BEHIX_MAX_CHARACTERS=20`)، فیلم‌های ۳ تا ۵ دقیقه (`180` تا `300` ثانیه، `BEHIX_LONGFORM_MAX_SEC=300`)، اتصال هر صحنه به بخش متناظر سناریو (`sourceSpan`) و پوشش پیوستهٔ بدون حفرهٔ کل بازهٔ زمانی.
- **کارخانهٔ کاراکتر و AutoRig روی CPU** (`src/character-factory.js`): استخراج برگهٔ شخصیت، بررسی تطابق نام لایه‌ها با `PART_ROLES` و `bodyparts.js` (رد لایه‌های ناشناخته همراه با ثبت هشدار در گزارش ریگ)، ساخت PNG ثابت مجزا با کانال آلفا برای هر لایه با پیش‌فرض `VERTEX_IMAGE_MODEL=gemini-3.1-flash-image`، اجرای `autoRig(doc, alphaOf, options)` روی CPU و ساخت اسکلت JSON (`assets/<id>/<id>.skel.json`) و اطلس اختصاصی (`assets/<id>/<id>.atlas`) برای هر کاراکتر.
- **Timeline چندکاراکتره** (`src/timeline.js`): بارگذاری اسکلت و اطلس مستقل برای هر یک از ۲۰ کاراکتر داخل قاب `wide`، نگاشت اکشن به انیمیشن‌های موجود در اسکلت همان کاراکتر (با بازگشت به اولین انیمیشن موجود اسکلت و ثبت هشدار در گزارش)، حفظ فیزیک پیوسته (`CharacterInstance`)، دوربین صحنه و تصویر ثابت پس‌زمینه.
- **رندر نرم‌افزاری CPU** (`src/software-renderer.js`): رسم تصویر ثابت پس‌زمینهٔ هر صحنه (`backgroundImage`) پشت کاراکترها با حفظ fallback رنگ تخت (`#rrggbb`)، هندسه از `drawSkeletonGeometry`، نمونه‌برداری bilinear از اطلس اختصاصی هر کاراکتر (با خطای صریح در صورت خرابی اطلس اختصاصی بدون بازگشت به `nila`)، tint و blend. فریم‌ها را موتور CPU می‌سازد؛ مدل ویدیو فیلم نمی‌سازد.
- **صدا و لب‌خوانی** (`src/audio-track.js`, `engine/rigby-core/lipsync.js`): سنتز صدای هر خط دیالوگ (`lines`) با پیش‌فرض `VERTEX_TTS_MODEL=gemini-3.8-flash-tts`، تولید کلیدهای دهان با `visemeCues` و اجرای یک‌بارهٔ `keyLipSync` فقط روی انیمیشن فعال همان کاراکتر در بازهٔ `[startSec, endSec]` همان خط دیالوگ (بدون تغییر مدت انیمیشن)، و چسباندن (mux) صدا به ویدیو با FFmpeg. اگر کاراکتری خط دیالوگ داشته باشد و اسلات دهان در ریگ او نباشد، خطای صریح پرتاب می‌شود و وضعیت کار `failed` می‌گردد.
- **رندر تکهتکه (Chunked Job) و پایداری وضعیت در GCS** (`src/render-job.js`, `src/video-encoder.js`, `src/server.js`): درخواست‌های کوتاه HTTP حداکثر ۶۰ ثانیه می‌مانند؛ فیلم‌های بلند ۱۸۰ تا ۳۰۰ ثانیه به صورت Job تکهتکه رندر می‌شوند، قطعات در Cloud Storage ذخیره و با FFmpeg concat می‌شوند، و وضعیت Job در `gs://$OUTPUT_BUCKET/jobs/<jobId>/status.json` نگهداری می‌شود تا ری‌استارت Cloud Run کار را گم نکند.

## اجرا

```bash
npm ci        # یا npm install
npm test      # اجرای هر ۴ فایل تست استاندارد پروژه (شامل تست‌های فاز ۱ و ۲ و تولید MP4 با صدا)
npm start     # سرور روی PORT (پیش‌فرض 8080)
npm run demo  # رندر دموی کوتاه بدون نیاز به Gemini و بدون GPU
```

### API

| مسیر | بدنه | توضیح |
|---|---|---|
| `GET /health` | — | وضعیت و سقف‌ها (`maxDuration: 60`, `maxLongformDuration: 300`, `maxCharacters: 20`) |
| `POST /preview-pose` | `{animationName, time, skeletonPath?}` | خلاصهٔ pose بدون رندر |
| `POST /render` | `{directing, duration?, fps?, width?, height?, asyncJob?}` | رندر از کارگردانی آماده (کوتاه ≤۶۰ ثانیه هم‌زمان، بلند >۶۰ ثانیه صف Job) |
| `POST /render-from-scenario` | `{scenario, options?}` | سناریو → Gemini → برای فیلم بلند (۱۸۰ تا ۳۰۰ ثانیه) فوراً `jobId` برمی‌گرداند |
| `POST /render-demo` | — | دموی سریع بدون Gemini و بدون GPU |
| `GET /jobs/:jobId` | — | وضعیت پیشرفت Job تکهتکه و گزارش هشدارهای ریگ/TTS یا علت خطا از GCS |
| `GET /renders/:jobId` | — | دانلود MP4 کار کامل‌شده (از دیسک یا بازیابی از GCS) |

### متغیرهای محیطی

| متغیر | نقش |
|---|---|
| `VERTEX_AI_PROJECT` | شناسهٔ پروژهٔ Google Cloud برای Vertex AI و سرویس TTS با ADC (`GoogleAuth`) |
| `VERTEX_AI_LOCATION` | پیش‌فرض `global` برای Gemini متنی (یا منطقهٔ مشخص مثل `us-central1`) |
| `GEMINI_MODEL` | مدل کارگردانی JSON؛ پیش‌فرض `gemini-4-argon` |
| `VERTEX_IMAGE_MODEL` | مدل ساخت PNG ثابت لایه و پس‌زمینه؛ پیش‌فرض `gemini-3.1-flash-image` |
| `VERTEX_TTS_MODEL` | مدل صدای دیالوگ (TTS)؛ پیش‌فرض `gemini-3.8-flash-tts` |
| `GOOGLE_API_KEY` | جایگزین: کلید Gemini API / Cloud TTS در هدر `x-goog-api-key` (هرگز در URL قرار نمی‌گیرد) |
| `OUTPUT_BUCKET` | باکت Cloud Storage برای ذخیرهٔ لایه‌ها، اسکلت‌ها، قطعات میانی، وضعیت `jobs/<jobId>/status.json` و `renders/<jobId>/film.mp4` |
| `BEHIX_API_KEY` | اگر تنظیم شود، هدر `x-api-key` برای فراخوانی API اجباری است |
| `PORT` | پیش‌فرض `8080` |
| `BEHIX_MAX_CHARACTERS` | حداکثر تعداد کاراکترها (پیش‌فرض `20`) |
| `BEHIX_LONGFORM_MAX_SEC` | سقف مدت فیلم بلند در Job (پیش‌فرض `300` ثانیه) |
| `CLOUD_RUN_JOB_NAME` | نام Cloud Run Job برای اجرای رندرهای بلند خارج از درخواست HTTP |
| `BEHIX_JOB_ID` | شناسهٔ کار رندر برای اجرای مستقیم در Cloud Run Job (`src/cli.js`) |

## استقرار روی Google Cloud (فقط CPU، بدون GPU)

```bash
PROJECT=<project-id>
REGION=us-central1

gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  cloudbuild.googleapis.com aiplatform.googleapis.com \
  cloudtasks.googleapis.com storage.googleapis.com

gcloud artifacts repositories create behix --repository-format=docker --location=$REGION

gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT/behix/engine:0.2.0

gcloud storage buckets create gs://$PROJECT-behix-renders --location=$REGION \
  --uniform-bucket-level-access

# ۱) استقرار سرویس Cloud Run برای API کوتاه و ثبت Jobها
gcloud run deploy behix-pro-engine \
  --image $REGION-docker.pkg.dev/$PROJECT/behix/engine:0.2.0 \
  --region $REGION --cpu 2 --memory 2Gi --timeout 300 --concurrency 1 \
  --no-allow-unauthenticated \
  --set-env-vars VERTEX_AI_PROJECT=$PROJECT,VERTEX_AI_LOCATION=$REGION,GEMINI_MODEL=gemini-4-argon,VERTEX_IMAGE_MODEL=gemini-3.1-flash-image,VERTEX_TTS_MODEL=gemini-3.8-flash-tts,OUTPUT_BUCKET=$PROJECT-behix-renders,BEHIX_MAX_CHARACTERS=20,BEHIX_LONGFORM_MAX_SEC=300,CLOUD_RUN_JOB_NAME=behix-render-job

# ۲) ایجاد Cloud Run Job برای رندر تکهتکهٔ فیلم‌های بلند ۳ تا ۵ دقیقه‌ای روی CPU
gcloud run jobs create behix-render-job \
  --image $REGION-docker.pkg.dev/$PROJECT/behix/engine:0.2.0 \
  --region $REGION --cpu 4 --memory 4Gi --task-timeout 3600 \
  --command "node" --args "src/cli.js" \
  --set-env-vars VERTEX_AI_PROJECT=$PROJECT,VERTEX_AI_LOCATION=$REGION,GEMINI_MODEL=gemini-4-argon,VERTEX_IMAGE_MODEL=gemini-3.1-flash-image,VERTEX_TTS_MODEL=gemini-3.8-flash-tts,OUTPUT_BUCKET=$PROJECT-behix-renders,BEHIX_MAX_CHARACTERS=20,BEHIX_LONGFORM_MAX_SEC=300

# ۳) اجرای دستی یک Job مشخص با BEHIX_JOB_ID در Cloud Run Jobs
gcloud run jobs execute behix-render-job \
  --region $REGION \
  --update-env-vars BEHIX_JOB_ID=<job-id>,BEHIX_DIRECTING_GCS=gs://$PROJECT-behix-renders/jobs/<job-id>/directing.json
```

## لایسنس

- کد موتور: طبق تصمیم صاحب پروژه.
- runtime Rigby2D: MIT یا Apache-2.0 (طبق هدر فایل‌ها).
