package main

import (
	"net"

	pb "pacman-server/message"
)

type Player struct {
	pb.Player
	conn *net.Conn
}

func NewPlayer(id int32, name, color string) *Player {
	return &Player{
		Player: pb.Player{
			Id:        id,
			Name:      name,
			Color:     color,
			Health:    MaxHealth,
			MaxHealth: MaxHealth,
		},
	}
}

func (p *Player) ToProto() *pb.Player {
	return &pb.Player{
		Id:        p.Id,
		Name:      p.Name,
		Color:     p.Color,
		Health:    p.Health,
		MaxHealth: p.MaxHealth,
		IsReady:   p.IsReady,
		Kills:     p.Kills,
		Rotation:  p.Rotation,
		Position:  p.Position,
		InBush:    p.InBush,
	}
}

func (p *Player) IsAlive() bool {
	return p.Health > 0
}
