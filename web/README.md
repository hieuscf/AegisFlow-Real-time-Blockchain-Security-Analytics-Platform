# AegisFlow Web Dashboard

Vite + React + TypeScript frontend for the AegisFlow MVP.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env` and set API/WebSocket URLs for the analytics core.

## Structure

```txt
src/
├── components/   # UI (Button, Card, LiveFeed, ChartPanel…)
├── hooks/        # useWebSocket, useAuth
├── services/     # api.ts
├── context/      # AuthProvider
├── types/        # Alert & blockchain types
├── styles/       # global.css (Tailwind)
├── App.tsx
└── main.tsx
```

Imports use the `@/` alias → `src/`.
