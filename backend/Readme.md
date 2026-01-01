# Pacman Game Server

Real-time multiplayer game server in Go.

## Structure

```
backend/
├── main.go       # Server setup, routes, HTTP handlers
├── room.go       # Room management, event loop, game logic
├── game.go       # Map loading, physics, collision detection
├── player.go     # Player state management
├── config.go     # Environment configuration
├── middleware.go # CORS, recovery, request limits
├── map/          # Game maps (JSON)
└── message/      # Protobuf messages
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/rooms/create` | Create room |
| POST | `/api/rooms/join?roomId=X` | Join room |
| GET | `/api/play?playerId=X&roomId=Y` | WebSocket |

## Events

| Event | Description |
|-------|-------------|
| Join | Player joined, includes player list |
| Ready | Player ready status changed |
| Start | Game starting |
| Spawn | Players spawned with positions |
| Move | Player movement |
| Shoot | Bullet fired/updated |
| Hit | Player took damage |
| Kick | Player removed/died |
| Kills | Kill count updated |

## Run

```bash
go build -o server .
./server
```

## Environment Variables

Create a `.env.local` file:

```env
PORT=8080
ALLOWED_ORIGINS=*
ROOM_IDLE_TIMEOUT=300
MAX_REQUEST_BODY=4096
```

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Server port |
| ALLOWED_ORIGINS | * | CORS origins (comma-separated) |
| ROOM_IDLE_TIMEOUT | 300 | Idle room cleanup (seconds) |
| MAX_REQUEST_BODY | 4096 | Max request body size (bytes) |

## Game Constants

Edit in `game.go`:

| Constant | Default | Description |
|----------|---------|-------------|
| PlayerSpeed | 4.5 | Movement speed |
| BulletSpeed | 8.0 | Bullet speed |
| PlayerSize | 22.0 | Hitbox radius |
| MaxHealth | 100 | Starting health |
| BulletDamage | 10 | Damage per hit |
| MaxPlayers | 6 | Players per room |
| TickRate | 16 | Game tick (ms) |

