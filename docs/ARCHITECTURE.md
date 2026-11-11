# معماری کامل BEHIX Pro Engine

> **قاعدهٔ بنیادین:** فریم‌ها را موتور CPU می‌سازد؛ مدل ویدیو فیلم نمی‌سازد.

## اجزا

1. **Vertex AI / Gemini**
   - کارگردانی ساخت‌یافته JSON (`GEMINI_MODEL=gemini-4-argon`)
   - برگهٔ شخصیت و ساخت لایه‌های PNG ثابت و پس‌زمینهٔ ثابت (`VERTEX_IMAGE_MODEL=gemini-3.1-flash-image`)
   - سنتز صدای دیالوگ (`VERTEX_TTS_MODEL=gemini-3.8-flash-tts`) و تراز زمانی برای لب‌خوانی

2. **Rigby2D Runtime** (`engine/rigby-core`)
   - ریگ خودکار لایه‌ها روی CPU (`autorig.js` و `bodyparts.js`)
   - لب‌خوانی (`lipsync.js`: `visemeCues`, `matchMouths`, `keyLipSync`)
   - لود اسکلت JSON، محاسبه pose، constraints، IK، فیزیک و پشتیبانی از تا ۲۰ کاراکتر متمایز

3. **موتور رندر CPU** (`src/software-renderer.js`)
   - رسم تصویر ثابت پس‌زمینهٔ صحنه (`backgroundImage`) با fallback رنگ تخت
   - `drawSkeletonGeometry` (ترتیب رسم، clipping، UV اطلس اختصاصی هر کاراکتر، tint، blend)
   - rasterizer نرم‌افزاری روی CPU بدون Canvas و بدون GPU

4. **خروجی و اجرای تکهتکه** (`src/video-encoder.js`, `src/render-job.js`)
   - FFmpeg روی CPU → قطعات MP4 → concat و mux صدای WAV → `film.mp4`
   - ذخیرهٔ وضعیت و خروجی در Cloud Storage (`OUTPUT_BUCKET`) و اجرای کارهای بلند با Cloud Run Jobs (`CLOUD_RUN_JOB_NAME`, `BEHIX_JOB_ID`)
