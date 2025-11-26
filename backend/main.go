package main

import (
	"context"
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	pb "pacman-server/message"

	"github.com/gobwas/ws"
)

func main() {
	if err := loadMap("./map/arena.json"); err != nil {
		panic(err)
	}

	go globalRooms.StartCleanup()

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      newRouter(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go waitForShutdown(srv)

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		panic(err)
	}
}

func newRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handleHealth)
	mux.HandleFunc("POST /api/rooms/create", handleCreateRoom)
	mux.HandleFunc("POST /api/rooms/join", handleJoinRoom)
	mux.HandleFunc("GET /api/play", handlePlay)
	return withMiddleware(mux)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}

func waitForShutdown(srv *http.Server) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
}

func handleCreateRoom(w http.ResponseWriter, r *http.Request) {
	name, color, err := parsePlayerInput(r)
	if err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	room := NewRoom(name, color)
	roomID := globalRooms.Add(room)
	go room.Run()

	jsonResponse(w, http.StatusCreated, map[string]any{
		"roomId":   roomID,
		"playerId": int32(0),
	})
}

func handleJoinRoom(w http.ResponseWriter, r *http.Request) {
	roomID, err := parseUint(r.URL.Query().Get("roomId"), 16)
	if err != nil {
		jsonError(w, "invalid room id", http.StatusBadRequest)
		return
	}

	room, ok := globalRooms.Get(uint16(roomID))
	if !ok {
		jsonError(w, "room not found", http.StatusNotFound)
		return
	}

	name, color, err := parsePlayerInput(r)
	if err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	resp := room.Join(name, color)
	if !resp.OK {
		jsonError(w, resp.Error, http.StatusBadRequest)
		return
	}

	jsonResponse(w, http.StatusCreated, map[string]int32{
		"playerId": int32(resp.PlayerID),
	})
}

func handlePlay(w http.ResponseWriter, r *http.Request) {
	playerID, err := parseUint(r.URL.Query().Get("playerId"), 32)
	if err != nil || playerID < 0 || playerID >= MaxPlayers {
		jsonError(w, "invalid player id", http.StatusBadRequest)
		return
	}

	roomID, err := parseUint(r.URL.Query().Get("roomId"), 16)
	if err != nil {
		jsonError(w, "invalid room id", http.StatusBadRequest)
		return
	}

	room, ok := globalRooms.Get(uint16(roomID))
	if !ok {
		jsonError(w, "room not found", http.StatusNotFound)
		return
	}

	conn, _, _, err := ws.UpgradeHTTP(r, w)
	if err != nil {
		return
	}

	go serveWebSocket(int32(playerID), &conn, room)
}

func serveWebSocket(playerID int32, conn *net.Conn, room *Room) {
	resp := room.Connect(playerID, conn)
	if !resp.OK {
		(*conn).Close()
		return
	}

	defer func() {
		(*conn).Close()
		room.Send(&pb.Message{Id: &playerID, Event: EventKick})
	}()

	room.ReadLoop(playerID, conn)
}

type playerInput struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

func parsePlayerInput(r *http.Request) (string, string, error) {
	var input playerInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		return "", "", errors.New("invalid request body")
	}

	name := strings.TrimSpace(input.Name)
	if name == "" {
		return "", "", errors.New("name is required")
	}
	if len(name) > 20 {
		name = name[:20]
	}

	color := strings.TrimSpace(input.Color)
	if len(color) > 20 {
		color = color[:20]
	}

	return name, color, nil
}

func jsonResponse(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func jsonError(w http.ResponseWriter, msg string, status int) {
	jsonResponse(w, status, map[string]string{"error": msg})
}

func parseUint(s string, bits int) (int, error) {
	n, err := strconv.ParseUint(s, 10, bits)
	if err != nil {
		return 0, err
	}
	return int(n), nil
}
