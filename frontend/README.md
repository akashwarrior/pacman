# Pacman Frontend

Production-ready Next.js frontend for a real-time multiplayer Pacman arena shooter.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Motion (UI animation)
- WebSocket + protobuf transport

## Features

- Real-time canvas rendering loop with camera, minimap, and game effects
- Lobby flow (create/join room, ready state, host controls)
- Stronger runtime state handling:
  - Loading states for room and game routes
  - Route-level and global error boundaries
  - Connection status tracking and disconnect handling
- Environment validation for backend and WebSocket URLs

## Project Structure

```
src/
├── app/
│   ├── game/[gameId]/
│   ├── room/[roomId]/
│   ├── game-over/
│   └── ...
├── components/
├── hooks/
├── lib/
│   ├── constants/
│   ├── render/
│   ├── env.ts
│   └── ...
├── services/
│   ├── room-api.ts
│   └── socket-manager.ts
└── types/
```

## Environment Variables

Copy `.env.example` to `.env.local`.

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:8080"
NEXT_PUBLIC_WS_URL="ws://localhost:8080/api/play"
```

Notes:
- `NEXT_PUBLIC_BACKEND_URL` must be `http://` or `https://`.
- `NEXT_PUBLIC_WS_URL` must be `ws://` or `wss://`.

## Scripts

- `pnpm dev` - run development server
- `pnpm lint` - ESLint checks
- `pnpm build` - production build
- `pnpm start` - run built app

## Local Development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Deployment Checklist

1. Set production environment variables.
2. Run `pnpm build`.
4. Deploy with `pnpm start` (or your platform's Next.js runtime).
5. Verify backend/WebSocket endpoints are reachable from the deployed domain.

## Controls

- `WASD` / Arrow keys: move
- `Space`: shoot
