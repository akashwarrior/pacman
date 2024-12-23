package main

import (
	"math"
	"sync"
	"time"

	pb "gather-town/message"

	"github.com/gobwas/ws/wsutil"
	"google.golang.org/protobuf/proto"
)

// Event Constants
const (
	JOIN      = "Join"
	READY     = "Ready"
	LEAVE     = "Leave"
	SPAWN     = "Spawn"
	MOVE      = "Move"
	SHOOT     = "Shoot"
	HIT       = "Hit"
	KICK      = "Kick"
	START     = "Start"
	DELETE    = "Delete"
	KILLS     = "Kills"
	GAME_OVER = "Game Over"
)

type Room struct {
	ID            uint16
	IsGameStarted bool
	player        [6]*Player
	broadcast     chan *pb.Message
	Time          uint8
	mu            sync.RWMutex
}

// GLOBAL ROOM to store all the rooms
var rooms sync.Map
var ROOM_ID uint16 = 1

func (room *Room) run() {
	defer func() {
		rooms.Delete(room.ID)
	}()
	for msg := range room.broadcast {
		switch msg.Event {
		case DELETE:
			return
		case START:
			go room.startGame(msg)
		case MOVE:
			go room.broadcastMove(msg)
		case KICK:
			go room.kickPlayer(msg)
		case READY:
			go func(msg *pb.Message, room *Room) {
				room.broadcastParallel(msg)
				room.mu.RLock()
				defer room.mu.RUnlock()
				room.player[*msg.Id].mu.Lock()
				room.player[*msg.Id].IsReady = *msg.Payload.IsReady
				room.player[*msg.Id].mu.Unlock()
			}(msg, room)
		case SHOOT:
			if *msg.Id == 255 {
				go room.broadcastParallel(msg)
			} else {
				go func(msg *pb.Message, room *Room) {
					var bullet = pb.Bullet{
						Id:       float64(time.Now().UnixNano()),
						Position: room.player[*msg.Id].Position,
						Rotation: room.player[*msg.Id].Rotation,
					}
					msg.Payload.Bullet = &bullet
					go room.broadcastParallel(msg)
					go room.handleBulletMovement(&bullet, msg.Id)
				}(msg, room)
			}
		case KILLS:
			go func(msg *pb.Message, room *Room) {
				room.mu.RLock()
				defer room.mu.RUnlock()
				room.player[*msg.Id].mu.Lock()
				defer room.player[*msg.Id].mu.Unlock()
				room.player[*msg.Id].Kills++
				msg.Payload = &pb.Payload{Kills: &room.player[*msg.Id].Kills}
				data, err := proto.Marshal(msg)
				if err != nil {
					return
				}
				_ = wsutil.WriteServerBinary(*room.player[*msg.Id].Conn, data)
			}(msg, room)
		default:
			// doing nothing yet
		}
	}
}

func (room *Room) startGame(msg *pb.Message) {
	go room.broadcastParallel(msg)
	room.mu.Lock()
	room.IsGameStarted = true
	room.mu.Unlock()
	room.mu.RLock()
	defer room.mu.RUnlock()

	data := pb.Message{
		Event: SPAWN,
		Payload: &pb.Payload{
			Players: []*pb.Player{},
		},
	}

	for _, player := range room.player {
		if player != nil {
			player.mu.RLock()
			data.Payload.Players = append(data.Payload.Players, player.toProto())
			player.mu.RUnlock()
		}
	}

	data.Payload.Map = gameMap
	go room.broadcastParallel(&data)
}

func (room *Room) broadcastParallel(msg *pb.Message) {
	data, err := proto.Marshal(msg)
	if err != nil {
		return
	}
	room.mu.RLock()
	defer room.mu.RUnlock()
	for _, player := range room.player {
		go func(player *Player) {
			if player == nil {
				return
			}
			player.mu.Lock()
			defer player.mu.Unlock()
			if player.Conn == nil {
				return
			}
			_ = wsutil.WriteServerBinary(*player.Conn, data)
		}(player)
	}
}

func (room *Room) kickPlayer(msg *pb.Message) {
	go room.removePlayer(*msg.Id)
	go func() {
		room.mu.RLock()
		defer room.mu.RUnlock()
		if *msg.Id == 0 && !room.IsGameStarted {
			for _, player := range room.player {
				if player != nil {
					go room.removePlayer(player.Id)
				}
			}
			room.broadcast <- &pb.Message{
				Event: DELETE,
			}
		}
	}()
	go room.broadcastParallel(msg)
	var roomSize uint8
	room.mu.RLock()
	for _, player := range room.player {
		if player != nil && player.Id != *msg.Id {
			roomSize++
		}
	}
	if roomSize <= 1 && room.IsGameStarted {
		go room.broadcastGameOver()
	}
	room.mu.RUnlock()
}

func (room *Room) removePlayer(ID int32) {
	room.mu.Lock()
	defer room.mu.Unlock()
	if room.player[ID] == nil {
		return
	}
	room.player[ID].mu.Lock()
	data, _ := proto.Marshal(&pb.Message{
		Id:      &ID,
		Event:   KICK,
		Payload: &pb.Payload{Kills: &room.player[ID].Kills},
	})
	wsutil.WriteServerBinary(*room.player[ID].Conn, data)
	_ = (*room.player[ID].Conn).Close()
	room.player[ID].Conn = nil
	room.player[ID].mu.Unlock()
	room.player[ID] = nil
}

func (room *Room) broadcastGameOver() {
	room.mu.RLock()
	defer room.mu.RUnlock()
	for _, player := range room.player {
		if player != nil {
			go room.removePlayer(player.Id)
		}
	}
	room.broadcast <- &pb.Message{
		Event: DELETE,
	}
}

func (room *Room) broadcastMove(msg *pb.Message) {
	var wg sync.WaitGroup
	var movement = msg.Payload.Position
	var angle = normalizeMovement(movement)
	var newPosition pb.Position
	var isCollided bool
	var inGrass bool

	room.mu.RLock()
	defer room.mu.RUnlock()

	room.player[*msg.Id].mu.RLock()
	var currentPosition = room.player[*msg.Id].Position
	room.player[*msg.Id].mu.RUnlock()

	calculateNewPosition(currentPosition, &angle, PLAYER_SPEED, &newPosition)

	wg.Add(2)
	go checkInGrass(&newPosition, &inGrass, &wg)
	go checkCollision(PLAYER_SIZE, &newPosition, &isCollided, &wg)

	msg.Payload.InGrass = &inGrass

	var Rotaion float64
	if movement.X != 0 || movement.Y != 0 {
		Rotaion = math.Atan2(movement.Y, movement.X)
		msg.Payload.Rotation = &Rotaion
	}

	wg.Wait()

	if !isCollided {
		msg.Payload.Position = &newPosition
	} else {
		msg.Payload.Position = currentPosition
	}
	go room.broadcastParallel(msg)

	room.player[*msg.Id].mu.Lock()
	room.player[*msg.Id].Position = msg.Payload.Position
	room.player[*msg.Id].Rotation = Rotaion
	room.player[*msg.Id].InGrass = inGrass
	room.player[*msg.Id].mu.Unlock()
}
