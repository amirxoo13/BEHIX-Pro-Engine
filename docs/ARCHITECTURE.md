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

## جریان

سناریو → Gemini (کارگردانی + مشخصات) → Imagen (لایه‌ها) → AutoRig → asset ریگبی  
→ Timeline → pose → رندر CPU → FFmpeg → ویدیو

## محدودیت‌ها و کارهای باقی‌مانده

- پیاده‌سازی rasterizer نرم‌افزاری باکیفیت
- اتصال کامل برنامهٔ کارگردانی Gemini
- پایپ‌لاین طراحی کاراکتر از روی متن/عکس سر
- مدیریت jobهای طولانی روی Cloud Run
- لب‌خوانی پیشرفته روی mesh ریگبی
