# Pacman Frontend

Next.js frontend for Pacman - a real-time multiplayer arena shooter.

## Features

- **Real-time Rendering** - 60fps Canvas 2D game loop
- **WebSocket Integration** - Binary protobuf communication
- **Responsive UI** - Tailwind CSS with animations
- **Type Safety** - Full TypeScript implementation

## Tech Stack

- **Next.js 16** with App Router
- **React 19** with React Compiler
- **TypeScript 5**
- **Tailwind CSS 4**
- **Motion** (Framer Motion) for UI animations
- **Protocol Buffers** for WebSocket messages

## Project Structure

```
src/
├── app/                # Pages (home, room, game, game-over)
├── components/         # UI components
├── hooks/              # useGame, useRoom hooks
├── lib/
│   ├── renderer.ts     # Canvas game renderer
│   ├── constants/      # Game config & colors
│   └── utils.ts        # Utilities
├── services/
│   ├── api.ts          # REST API client
│   └── socket.ts       # WebSocket manager
└── types/
    ├── index.ts        # Game types
    ├── message.ts      # Generated protobuf
    └── message.proto   # Protobuf definition
```

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Start dev server
pnpm dev
```

### Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL="http://localhost:8080"

# WebSocket URL
NEXT_PUBLIC_WS_URL="ws://localhost:8080/api/play"
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Game Controls

- **WASD / Arrow Keys** - Move player
- **Space** - Shoot bullets

## Customization

- **Game Constants**: `src/lib/constants/game.ts`
- **Colors**: `src/lib/constants/colors.ts`
- **Renderer**: `src/lib/renderer.ts`
- **Arena Map**: `public/map/arena.json`