package main

import (
	pb "battle-arena/message"
	"encoding/json"
	"net/http"

	"github.com/gobwas/ws"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/rooms/create", createRoom)
	mux.HandleFunc("POST /api/rooms/join", joinRoom)
	mux.HandleFunc("GET /play", playGame)

	handler := enableCORS(mux)

	http.ListenAndServe(":8080", handler)
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "battle-arena.akashgupta.tech")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func createRoom(w http.ResponseWriter, r *http.Request) {
	var player Player

	err := json.NewDecoder(r.Body).Decode(&player)
	if err != nil {
		http.Error(w, "Invalid Inputs", http.StatusBadRequest)
		return
	}

	var roodId = ROOM_ID
	ROOM_ID++

	room := &Room{
		player:        [6]*Player{},
		broadcast:     make(chan *pb.Message),
		ID:            roodId,
		IsGameStarted: false,
	}

	var playerID int32 = 0
	initializePlayer(&player, playerID)

	room.player[playerID] = &player
	rooms.Store(roodId, room)

	go room.run()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int32{"roomId": int32(roodId), "playerId": player.Id})
}

func joinRoom(w http.ResponseWriter, r *http.Request) {
	var player Player
	_, roomId, err := parseParams(r)

	if roomId == 0 && err != nil {
		http.Error(w, "Invalid Inputs", http.StatusBadRequest)
		return
	}

	err = json.NewDecoder(r.Body).Decode(&player)
	if err != nil {
		http.Error(w, "Invalid Inputs", http.StatusBadRequest)
		return
	}

	room, ok := rooms.Load(uint16(roomId))

	if !ok || room.(*Room).IsGameStarted {
		http.Error(w, "Invalid Request", http.StatusBadRequest)
		return
	}

	var playerID *int32 = nil
	for i, p := range room.(*Room).player {
		if p == nil {
			var index = int32(i)
			playerID = &index
			break
		}
	}

	if playerID == nil {
		http.Error(w, "Room is full", http.StatusBadRequest)
		return
	}

	initializePlayer(&player, *playerID)

	room.(*Room).player[*playerID] = &player

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int32{"playerId": player.Id})
}

func initializePlayer(player *Player, id int32) {
	player.Id = id
	player.Health = 100
	player.IsReady = false
	player.Kills = 0
	player.Rotation = 0
	player.Position = &pb.Position{
		X: float64(MAP_WIDTH/uint16(player.Id+1) - 200),
		Y: float64(MAP_HEIGHT/uint16(player.Id+1) - 200),
	}
}

func playGame(w http.ResponseWriter, r *http.Request) {
	playerId, roomId, err := parseParams(r)
	if err != nil {
		http.Error(w, "Invalid Inputs", http.StatusBadRequest)
		return
	}

	room, ok := rooms.Load(roomId)
	if !ok {
		http.Error(w, "Invalid Room Id", http.StatusBadRequest)
		return
	}

	conn, _, _, err := ws.UpgradeHTTP(r, w)
	if err != nil {
		http.Error(w, "Failed to connect", http.StatusInternalServerError)
		return
	}

	go handlePlayerConnection(playerId, &conn, room.(*Room))
}
