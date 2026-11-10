# BEHIX Pro Engine — Cloud Run (CPU، بدون GPU)
FROM node:20-bookworm-slim

# ffmpeg برای کدگذاری MP4 (باگ #3: در image رسمی Node وجود ندارد)
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

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/server.js"]
