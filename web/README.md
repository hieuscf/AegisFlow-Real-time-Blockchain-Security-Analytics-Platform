# AegisFlow Web — Realtime Security Dashboard

React + Vite frontend for the AegisFlow blockchain security platform.

## Tech stack

- **Vite** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** + **Shadcn/UI** (manual components in `src/components/ui`)
- **Zustand** — UI, WebSocket, theme state
- **Axios** — API client with JWT interceptor
- **GSAP** — dashboard entrance animations

## Project structure

```txt
src/
├── app/              # App shell & pages
├── components/
│   ├── layout/       # AppLayout, DashboardLayout, Header, Sidebar
│   └── ui/           # Shadcn-style primitives
├── features/
│   ├── alerts/       # SecurityFeed
│   ├── charts/       # RealtimeChart
│   └── wallet/       # WalletBadge
├── hooks/
├── lib/
├── services/         # api (axios), websocket
├── store/            # Zustand stores
├── types/
└── styles/
```

## Quick start

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Analytics API base URL (default `http://localhost:8080`) |
| `VITE_WS_URL` | WebSocket endpoint (default `ws://localhost:8080`) |
| `VITE_WALLETCONNECT_PROJECT_ID` | [WalletConnect Cloud](https://cloud.walletconnect.com) project ID (required for WalletConnect) |

## Web3 authentication (SIWE)

1. **Connect Wallet** — RainbowKit modal (MetaMask, WalletConnect)
2. **Sign In** — `GET /api/auth/nonce?address=…` → sign message → `POST /api/auth/verify`
3. **JWT** — stored in `localStorage` (`aegisflow_jwt`) and Zustand `useAuthStore`
4. **Logout** — clears JWT, auth store, and disconnects wallet

Wallet feature path: `src/features/wallet/` (components, hooks, services, types).

## Shadcn/UI setup

Components are pre-built to match Shadcn patterns. To add more via CLI:

```bash
cd web
npx shadcn@latest init
# Accept defaults; components.json is already configured

npx shadcn@latest add dialog dropdown-menu tabs
```

Aliases in `components.json`:

- `@/components` → `src/components`
- `@/lib/utils` → `src/lib/utils`
- `@/components/ui` → `src/components/ui`

## Zustand stores

| Store | Purpose |
|-------|---------|
| `useUiStore` | Sidebar open/collapsed |
| `useWebSocketStore` | Connection status + alert feed (max 20) |
| `useThemeStore` | Dark/light mode (persisted) |

## API client

`src/services/api.ts` exports `apiClient` (axios) and `api` helpers. JWT is read from `localStorage` key `aegisflow_jwt` via `src/lib/auth.ts`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Dashboard layout

```
┌─────────────────────────────────────┐
│ Header (brand, WS status, wallet)   │
├──────────────────┬──────────────────┤
│ Realtime Chart   │ Security Feed    │
│                  │                  │
└──────────────────┴──────────────────┘
```

Responsive: stacked on mobile, two-column on `lg+`. Glassmorphism cards + GSAP fade-up on mount.
