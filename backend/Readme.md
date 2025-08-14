# Pacman Backend

The backend server for Pacman - a high-performance real-time multiplayer game server built with Go 1.23, WebSocket, and Protocol Buffers.

## 🛠️ Tech Stack

- **Language**: Go 1.23.2
- **WebSocket**: Gobwas/ws for high-performance connections
- **Data Serialization**: Protocol Buffers (protobuf)
- **HTTP Server**: Standard Go net/http with custom routing
- **Concurrency**: Go routines and channels

## 📁 Project Structure

```
backend/
├── main.go              # HTTP server
├── game.go              # Game physics and map generation
├── room.go              # Room & player management, and game events
├── network.go           # WebSocket handling and connection management
├── proto/               # Protocol Buffer definitions (schema)
└── message/             # Auto-generated protobuf bindings
```

## 🚀 Getting Started

### Prerequisites

- Go 1.23 or higher
- Protocol Buffer compiler (protoc)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Go dependencies**
   ```bash
   go mod tidy
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   ALLOWED_ORIGINS="*"
   ```

4. **Start the server**
   ```bash
   go run .
   ```
   
   The server will start on port 8080

## 🌐 API Endpoints

### HTTP Endpoints

- **POST** `/api/rooms/create` - Create a new game room
- **POST** `/api/rooms/join` - Join an existing room
- **GET** `/play` - Start the game

## 📚 Additional Resources

- [Go Documentation](https://golang.org/doc/)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [Go WebSocket Libraries](https://github.com/gorilla/websocket)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with Go 1.23, WebSocket, and Protocol Buffers**
