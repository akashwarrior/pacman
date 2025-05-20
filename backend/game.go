package main

import (
	"math"
	"math/rand"
	"net"
	"sync"
	"time"

	pb "battle-arena/message"
)

const (
	PLAYER_SPEED      = 4
	BULLET_SPEED      = 7
	GRASS_MIN_RADIUS  = 30
	GRASS_MAX_RADIUS  = 50
	NUM_GRASS_PATCHES = 20
	MAP_WIDTH         = 2000
	MAP_HEIGHT        = 1500
	PLAYER_SIZE       = 20
	BULLET_SIZE       = 4
)

type Player struct {
	pb.Player
	Conn *net.Conn
	mu   sync.RWMutex
}

var gameMap = generateMap()

func generateMap() *pb.GameMap {
	var Map pb.GameMap
	Map.Obstacles = []*pb.Obstacle{
		{X: MAP_WIDTH/2 - 100, Y: MAP_HEIGHT/2 - 100, Width: 200, Height: 200},

		// Corner obstacles
		{X: 50, Y: 50, Width: 100, Height: 100},
		{X: MAP_WIDTH - 150, Y: 50, Width: 100, Height: 100},
		{X: 50, Y: MAP_HEIGHT - 150, Width: 100, Height: 100},
		{X: MAP_WIDTH - 150, Y: MAP_HEIGHT - 150, Width: 100, Height: 100},
	}

	for i := 0; i < NUM_GRASS_PATCHES; i++ {
		Map.GrassPatches = append(Map.GrassPatches, &pb.GrassPatch{
			X:      uint32(rand.Float64() * float64(MAP_WIDTH)),
			Y:      uint32(rand.Float64() * float64(MAP_HEIGHT)),
			Radius: uint32(GRASS_MIN_RADIUS + rand.Float64()*(GRASS_MAX_RADIUS-GRASS_MIN_RADIUS)),
		})
	}

	return &Map
}

func calculateNewPosition(currentPosition *pb.Position, angle *float64, speed float64, newPosition *pb.Position) {
	newPosition.X = currentPosition.X + math.Cos(*angle)*speed
	newPosition.Y = currentPosition.Y + math.Sin(*angle)*speed
}

func normalizeMovement(movement *pb.Position) float64 {
	var magnitude = math.Sqrt(movement.X*movement.X + movement.Y*movement.Y)
	if magnitude == 0 {
		return math.Atan2(movement.Y, movement.X)
	}
	return math.Atan2(movement.Y/magnitude, movement.X/magnitude)
}

func checkInGrass(position *pb.Position, inGrass *bool, wg *sync.WaitGroup) {
	defer wg.Done()
	for _, grass := range gameMap.GrassPatches {
		if math.Hypot(position.X-float64(grass.X), position.Y-float64(grass.Y)) < float64(grass.Radius) {
			*inGrass = true
			return
		}
	}
	*inGrass = false
}

func checkCollision(size float64, position *pb.Position, isCollided *bool, wg *sync.WaitGroup) {
	defer wg.Done()

	if position.X-size < 0 ||
		position.X+size > float64(MAP_WIDTH) ||
		position.Y-size < 0 ||
		position.Y+size > float64(MAP_HEIGHT) {
		*isCollided = true
		return
	}

	for _, obstacle := range gameMap.Obstacles {
		if position.X+size > float64(obstacle.X) &&
			position.X-size < float64((obstacle.X)+uint32(obstacle.Width)) &&
			position.Y+size > float64(obstacle.Y) &&
			position.Y-size < float64((obstacle.Y)+uint32(obstacle.Height)) {
			*isCollided = true
			return
		}
	}
	*isCollided = false
}

func (room *Room) handleBulletMovement(bullet *pb.Bullet, playerID *int32) {
	var wg sync.WaitGroup
	var isCollided bool
	var newPosition pb.Position
	for {
		calculateNewPosition(bullet.Position, &bullet.Rotation, BULLET_SPEED, &newPosition)
		wg.Add(2)
		go checkCollision(BULLET_SIZE, &newPosition, &isCollided, &wg)
		go checkBulletHit(room, bullet, playerID, &wg)
		wg.Wait()
		if isCollided || bullet.Expired {
			bullet.Expired = true
		} else {
			bullet.Position = &newPosition
		}
		if room == nil {
			return
		}
		var roomSize uint8
		room.mu.RLock()
		for _, player := range room.player {
			if player != nil {
				roomSize++
			}
		}
		room.mu.RUnlock()
		if roomSize <= 1 {
			return
		}
		var ID int32 = 255
		go room.broadcastParallel(&pb.Message{
			Id:      &ID,
			Event:   SHOOT,
			Payload: &pb.Payload{Bullet: bullet},
		})
		if bullet.Expired {
			return
		}
		time.Sleep(16 * time.Millisecond)
	}
}

func checkBulletHit(room *Room, bullet *pb.Bullet, playerID *int32, wg *sync.WaitGroup) {
	room.mu.RLock()
	defer room.mu.RUnlock()
	defer wg.Done()

	for _, player := range room.player {
		if player != nil && *playerID != player.Id {
			player.mu.Lock()
			if math.Hypot(player.Position.X-bullet.Position.X, player.Position.Y-bullet.Position.Y) < PLAYER_SIZE {
				bullet.Expired = true
				player.Health -= 10
				if player.Health == 0 {
					room.broadcast <- &pb.Message{
						Id:    &player.Id,
						Event: KICK,
					}
					room.broadcast <- &pb.Message{
						Id:    playerID,
						Event: KILLS,
					}
				} else {
					go room.broadcastParallel(&pb.Message{
						Id:      &player.Id,
						Event:   HIT,
						Payload: &pb.Payload{Health: &player.Health},
					})
				}
				player.mu.Unlock()
				return
			}
			player.mu.Unlock()
		}
	}
}
