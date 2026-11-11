# BEHIX Pro Engine — Cloud Run & Cloud Run Jobs (CPU، بدون GPU)
FROM node:20-bookworm-slim

# ffmpeg برای کدگذاری MP4 و چسباندن صدای TTS (در image رسمی Node وجود ندارد)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY engine ./engine
COPY examples ./examples
COPY src ./src
COPY docs ./docs

# پوشهٔ دارایی‌های تولیدشده توسط autoRig و پس‌زمینه‌های ثابت صحنه
RUN mkdir -p /app/assets

ENV NODE_ENV=production
ENV PORT=8080
ENV GEMINI_MODEL=gemini-4-argon
ENV VERTEX_IMAGE_MODEL=gemini-3.1-flash-image
ENV VERTEX_TTS_MODEL=gemini-3.8-flash-tts
ENV BEHIX_MAX_CHARACTERS=20
ENV BEHIX_LONGFORM_MAX_SEC=300
EXPOSE 8080

CMD ["node", "src/server.js"]
