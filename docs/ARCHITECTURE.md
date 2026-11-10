# معماری کامل BEHIX Pro Engine

## اجزا

1. **Vertex AI / Gemini**
   - کارگردانی ساخت‌یافته (JSON)
   - مشخصات کاراکتر
   - TTS و تراز زمانی برای لب‌خوانی
   - Skills ثابت برای ثبات خروجی

2. **Rigby2D Runtime** (`engine/rigby-core`)
   - لود اسکلت JSON
   - محاسبه pose، constraints، IK
   - پشتیبانی از چند کاراکتر

3. **موتور رندر CPU**
   - محاسبه pose
   - rasterizer نرم‌افزاری → فریم PNG
   - بدون Canvas و بدون GPU

4. **خروجی**
   - FFmpeg (CPU) → MP4
   - ذخیره در Cloud Storage

## جریان پیاده‌سازی‌شدهٔ فعلی

سناریو → Gemini/Vertex (کارگردانی JSON اعتبارسنجی‌شده) → Timeline (Pose پایدار + فیزیک پیوسته، دوربین صحنه)
→ drawSkeletonGeometry (ترتیب رسم، clipping، UV اطلس، tint، blend) → رستر CPU → FFmpeg (image2) → MP4
→ (اختیاری) آپلود Cloud Storage با OUTPUT_BUCKET

## جریان هدف آینده (هنوز متصل نیست)

سناریو → Gemini (مشخصات کاراکتر) → Imagen (لایه‌ها) → AutoRig → asset ریگبی → همان مسیر بالا

## محدودیت‌ها و کارهای باقی‌مانده

- پایپ‌لاین طراحی کاراکتر از روی متن/عکس سر (Imagen → AutoRig)
- صف Cloud Tasks / Cloud Run Jobs برای jobهای طولانی‌تر از timeout سرویس
- لب‌خوانی: پیاده‌سازی viseme در engine/rigby-core/lipsync.js موجود است ولی هنوز به پایپ‌لاین متصل نشده
- دارایی کاراکتر دوم: فعلاً همهٔ کاراکترها نمونه‌های مستقل (Pose/State/فیزیک جدا) از همان اسکلت nila هستند
