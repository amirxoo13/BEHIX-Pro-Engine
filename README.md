# BEHIX Pro Engine

موتور انیمیشن حرفه‌ای ۲D با ادغام runtime ریگبی۲D و کارگردانی با Vertex AI / Gemini.

## معماری (مطابق طراحی)

- **هوش مصنوعی**: Vertex AI Gemini برای کارگردانی، مشخصات کاراکتر و صدا. Skills ثابت برای ثبات.
- **استخوان‌بندی**: runtime جاوااسکریپت Rigby2D (`engine/rigby-core`) — bones، mesh، IK، لب‌خوانی.
- **رندر**: مسیر CPU نرم‌افزاری (بدون Canvas و بدون GPU). فریم‌ها تولید و با FFmpeg کدگذاری می‌شوند.
- **زیرساخت**: Cloud Run (CPU) + Vertex AI + Cloud Storage.

## وضعیت فعلی

این مخزن **پایهٔ اولیه** است:

- runtime کامل Rigby2D کپی شده.
- اسکلت سرور Express برای Cloud Run.
- ماژول نمونه برای لود اسکلت و محاسبه pose.
- جای‌گذاری برای اتصال Gemini و rasterizer نرم‌افزاری.

**هنوز کامل نیست.** رندر نرم‌افزاری نهایی، اتصال کامل Timeline، پایپ‌لاین Imagen→AutoRig و تولید ویدیو نیاز به ادامهٔ کار دارند.

## اجرا

```bash
npm install
npm start
```

## لایسنس

- کد موتور: طبق تصمیم صاحب پروژه.
- runtime Rigby2D: MIT یا Apache-2.0 (طبق مخزن اصلی).
