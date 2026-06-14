# Playwright's official image ships Chromium + all system deps pre-installed
FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

# Prevent npm install from re-downloading browsers (already in this image)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Copy workspace manifests first for better layer caching
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/

RUN npm install --legacy-peer-deps

# Copy source
COPY packages/shared-types/ ./packages/shared-types/
COPY apps/api/ ./apps/api/

# Build NestJS
WORKDIR /app/apps/api
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/main"]
