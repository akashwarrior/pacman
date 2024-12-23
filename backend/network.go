package main

import (
	"net"
	"net/http"
	"strconv"

	"github.com/gobwas/ws/wsutil"
	"google.golang.org/protobuf/proto"

	pb "gather-town/message"
)

func parseParams(r *http.Request) (int32, uint16, error) {
	playerIDStr := r.URL.Query().Get("playerId")
	roomIDStr := r.URL.Query().Get("roomId")

	roomID, err := strconv.Atoi(roomIDStr)
	if err != nil {
		return 0, 0, err
	}

	playerID, err := strconv.Atoi(playerIDStr)
	if err != nil {
		return 0, uint16(roomID), err
	}

	return int32(playerID), uint16(roomID), nil
}

func (player *Player) toProto() *pb.Player {
	return &pb.Player{
		Id:       player.Id,
		Health:   player.Health,
		IsReady:  player.IsReady,
		Kills:    player.Kills,
		Rotation: player.Rotation,
		Position: player.Position,
		Name:     player.Name,
		Color:    player.Color,
		InGrass:  player.InGrass,
	}
}

func handlePlayerConnection(ID int32, Conn *net.Conn, room *Room) {
	defer func() {
		room.mu.RLock()
		defer room.mu.RUnlock()

		if room.player[ID] != nil {
			room.broadcast <- &pb.Message{
				Id:    &ID,
				Event: KICK,
			}
		}
	}()

	room.player[ID].Conn = Conn

	var message = pb.Message{
		Id:    &ID,
		Event: JOIN,
		Payload: &pb.Payload{
			Players: []*pb.Player{},
		},
	}

	for _, player := range room.player {
		if player != nil {
			player.mu.RLock()
			message.Payload.Players = append(message.Payload.Players, player.toProto())
			player.mu.RUnlock()
		}
	}

	go room.broadcastParallel(&message)

	for {
		data, err := wsutil.ReadClientBinary(*Conn)
		if err != nil {
			return
		}

		var msg pb.Message
		if err := proto.Unmarshal(data, &msg); err != nil {
			continue
		}

		if msg.Id == nil {
			msg.Id = &ID
		}
		room.broadcast <- &msg
	}
}
