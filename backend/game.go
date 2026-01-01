package main

import (
	"encoding/json"
	"math"
	"os"

	pb "pacman-server/message"
)

const (
	PlayerSpeed  = 4.5
	BulletSpeed  = 8.0
	PlayerSize   = 22.0
	BulletSize   = 5.0
	TreeSize     = 35.0
	CrateSize    = 40.0
	MaxHealth    = 100
	BulletDamage = 10
	MaxPlayers   = 6
	TickRate     = 16
)

type GameMap struct {
	Width       int         `json:"width"`
	Height      int         `json:"height"`
	Theme       string      `json:"theme"`
	SpawnPoints []SpawnPoint `json:"spawnPoints"`
	Walls       []Wall      `json:"walls"`
	Water       []Water     `json:"water"`
	Bushes      []Bush      `json:"bushes"`
	Trees       []Tree      `json:"trees"`
	Rocks       []Rock      `json:"rocks"`
	Crates      []Crate     `json:"crates"`
}

type SpawnPoint struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type Wall struct{ X, Y, Width, Height, Variant int }
type Water struct{ X, Y, Width, Height int }
type Bush struct{ X, Y, Radius int }
type Tree struct{ X, Y, Size int }
type Rock struct{ X, Y, Size, Variant int }
type Crate struct{ ID, X, Y, Health int }

var gameMap GameMap

func loadMap(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &gameMap)
}

func getSpawnPosition(index int) *pb.Position {
	n := len(gameMap.SpawnPoints)
	if n == 0 {
		return &pb.Position{
			X: float64(gameMap.Width)/2 - 100,
			Y: float64(gameMap.Height)/2 - 100,
		}
	}

	try := func(i int) *pb.Position {
		sp := gameMap.SpawnPoints[i%n]
		return &pb.Position{X: sp.X, Y: sp.Y}
	}

	for offset := 0; offset < n; offset++ {
		pos := try(index + offset)
		if !checkCollision(PlayerSize, pos) {
			return pos
		}
	}

	return try(index)
}

func calculatePosition(pos *pb.Position, angle, speed float64) *pb.Position {
	return &pb.Position{
		X: pos.X + math.Cos(angle)*speed,
		Y: pos.Y + math.Sin(angle)*speed,
	}
}

func normalizeAngle(movement *pb.Position) float64 {
	mag := math.Hypot(movement.X, movement.Y)
	if mag == 0 {
		mag = 1
	}
	return math.Atan2(movement.Y/mag, movement.X/mag)
}

func checkCollision(size float64, pos *pb.Position) bool {
	w, h := float64(gameMap.Width), float64(gameMap.Height)

	if pos.X-size < 0 || pos.X+size > w || pos.Y-size < 0 || pos.Y+size > h {
		return true
	}

	for _, wall := range gameMap.Walls {
		if circleRect(pos.X, pos.Y, size, float64(wall.X), float64(wall.Y), float64(wall.Width), float64(wall.Height)) {
			return true
		}
	}

	for _, water := range gameMap.Water {
		if circleRect(pos.X, pos.Y, size, float64(water.X), float64(water.Y), float64(water.Width), float64(water.Height)) {
			return true
		}
	}

	for _, t := range gameMap.Trees {
		radius := TreeSize * (0.5 + float64(t.Size)*0.3) * 0.4
		if math.Hypot(pos.X-float64(t.X), pos.Y-float64(t.Y)) < size+radius {
			return true
		}
	}

	for _, r := range gameMap.Rocks {
		if math.Hypot(pos.X-float64(r.X), pos.Y-float64(r.Y)) < size+float64(r.Size) {
			return true
		}
	}

	half := CrateSize / 2.0
	for _, c := range gameMap.Crates {
		if c.Health > 0 && circleRect(pos.X, pos.Y, size, float64(c.X)-half, float64(c.Y)-half, CrateSize, CrateSize) {
			return true
		}
	}

	return false
}

func checkBulletCollision(pos *pb.Position) bool {
	w, h := float64(gameMap.Width), float64(gameMap.Height)

	if pos.X-BulletSize < 0 || pos.X+BulletSize > w || pos.Y-BulletSize < 0 || pos.Y+BulletSize > h {
		return true
	}

	for _, wall := range gameMap.Walls {
		if pointInRect(pos.X, pos.Y, float64(wall.X), float64(wall.Y), float64(wall.Width), float64(wall.Height)) {
			return true
		}
	}

	for _, r := range gameMap.Rocks {
		if math.Hypot(pos.X-float64(r.X), pos.Y-float64(r.Y)) < float64(r.Size) {
			return true
		}
	}

	half := CrateSize / 2.0
	for _, c := range gameMap.Crates {
		if c.Health > 0 && pointInRect(pos.X, pos.Y, float64(c.X)-half, float64(c.Y)-half, CrateSize, CrateSize) {
			return true
		}
	}

	return false
}

func circleRect(cx, cy, cr, rx, ry, rw, rh float64) bool {
	closestX := math.Max(rx, math.Min(cx, rx+rw))
	closestY := math.Max(ry, math.Min(cy, ry+rh))
	dx, dy := cx-closestX, cy-closestY
	return dx*dx+dy*dy < cr*cr
}

func pointInRect(px, py, rx, ry, rw, rh float64) bool {
	return px > rx && px < rx+rw && py > ry && py < ry+rh
}
