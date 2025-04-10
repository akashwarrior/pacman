# 🔫 Battle Arena

**Battle Arena** is a real-time multiplayer shooting game built with performance and scalability in mind. It uses WebSockets for low-latency communication and is optimized for fast-paced interactions and smooth multiplayer experiences.

---

## 📸 Demo
https://drive.google.com/file/d/15L7mWzqtlogf6PkSvlBUFZIR249JZNSU

---

## 🚀 Features

- ⚔️ Real-time multiplayer shooting action
- 📡 High-performance WebSocket server written in Go
- 📦 Protobuf-based data serialization for faster message delivery and lower bandwidth usage
- 🎯 Accurate and concurrent handling of frequent, small-sized in-game events
- 🧱 Modular game logic for extensibility and maintainability

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Go (Golang), WebSocket, Protobuf
- **Others:** Message Compression, Custom Game Loop

---

## 🖥️ Live Demo

👉 [Play the Game](https://battle-arena-chi.vercel.app/)  

---

## 📦 Setup Instructions

1. Clone the repo  
   ```bash
   git clone https://github.com/akashwarrior/battle-arena.git
   cd battle-arena
   ```
   
2.  Install dependencies for the frontend
	```bash
    cd frontend
	npm install
	npm run dev
	```
3. Run the WebSocket server
    
    ```bash
    cd backend
    go run main.go
    ```
