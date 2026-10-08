FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# `npm ci` rejects the Windows-generated lock file on Linux (optional @emnapi packages).
# The VPS network sometimes drops npm downloads (ECONNRESET): retry before failing the build.
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && (npm install --no-audit --no-fund \
    || (sleep 10 && npm install --no-audit --no-fund) \
    || (sleep 30 && npm install --no-audit --no-fund))

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["npm", "run", "start"]
