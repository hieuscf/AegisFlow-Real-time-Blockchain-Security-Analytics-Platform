# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Dependencies — production node_modules
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

# -----------------------------------------------------------------------------
# Build — TypeScript → dist/
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# -----------------------------------------------------------------------------
# Runtime
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S -g 10001 aegis \
    && adduser -S -u 10001 -G aegis aegis

COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER aegis

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8080) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
