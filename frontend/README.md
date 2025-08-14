# Pacman Frontend

The frontend application for Pacman - a real-time multiplayer shooting game built with Next.js 15, React 19, and TypeScript.

## 🚀 Features

- **Real-time Game Rendering** - 60fps Canvas-based game loop
- **WebSocket Integration** - Seamless communication with Go backend
- **Responsive Design** - Modern UI with Tailwind CSS
- **Type Safety** - Full TypeScript implementation
- **Custom Game Hooks** - Reusable game logic and state management

## 🎮 Game Controls

- **WASD / Arrow Keys** - Move player
- **Space** - Shoot bullets

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Game Rendering**: Custom Canvas renderer

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── services/               # External services
└── types/                  # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 10 or higher

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set:
   ```env
   NEXT_PUBLIC_WEB_SOCKET_URL=ws://localhost:8080
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)