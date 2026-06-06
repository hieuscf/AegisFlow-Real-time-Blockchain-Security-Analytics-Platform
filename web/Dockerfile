# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Build — Vite production bundle (env vars are baked at build time)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src

ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_WS_URL=
ARG VITE_WALLETCONNECT_PROJECT_ID=

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID

RUN npm run build

# -----------------------------------------------------------------------------
# Runtime — nginx serves static SPA
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
