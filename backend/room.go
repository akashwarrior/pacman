package main

import (
	"math"
	"net"
	"sync"
	"sync/atomic"
	"time"

	pb "pacman-server/message"

	"github.com/gobwas/ws/wsutil"
	"google.golang.org/protobuf/proto"
)

const (
	EventJoin   = "Join"
	EventReady  = "Ready"
	EventSpawn  = "Spawn"
	EventMove   = "Move"
	EventShoot  = "Shoot"
	EventHit    = "Hit"
	EventKick   = "Kick"
	EventStart  = "Start"
	EventDelete = "Delete"
	EventKills  = "Kills"
)

type JoinRequest struct {
	Name     string
	Color    string
	Response chan JoinResponse
}

type JoinResponse struct {
	PlayerID int
	OK       bool
	Error    string
}

type ConnectRequest struct {
	PlayerID int32
	Conn     *net.Conn
	Response chan ConnectResponse
}

type ConnectResponse struct {
	OK      bool
	Players []*pb.Player
}

type RoomManager struct {
	rooms   sync.Map
	counter uint32
}

var globalRooms = &RoomManager{}

func (rm *RoomManager) Add(room *Room) uint16 {
	id := uint16(atomic.AddUint32(&rm.counter, 1))
	room.id = id
	rm.rooms.Store(id, room)
	return id
}

func (rm *RoomManager) Get(id uint16) (*Room, bool) {
	v, ok := rm.rooms.Load(id)
	if !ok {
		return nil, false
	}
	return v.(*Room), true
}

func (rm *RoomManager) Delete(id uint16) {
	rm.rooms.Delete(id)
}

func (rm *RoomManager) StartCleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		timeout := time.Duration(cfg.RoomIdleTimeout) * time.Second
		rm.rooms.Range(func(key, value any) bool {
			room := value.(*Room)
			if time.Since(room.lastActivity) > timeout {
				room.stop()
			}
			return true
		})
	}
}

type Room struct {
	id           uint16
	players      [MaxPlayers]*Player
	bullets      []*pb.Bullet
	events       chan *pb.Message
	joins        chan JoinRequest
	connects     chan ConnectRequest
	done         chan struct{}
	started      bool
	lastActivity time.Time
}

func NewRoom(hostName, hostColor string) *Room {
	room := &Room{
		events:       make(chan *pb.Message, 64),
		joins:        make(chan JoinRequest),
		connects:     make(chan ConnectRequest),
		bullets:      make([]*pb.Bullet, 0),
		done:         make(chan struct{}),
		lastActivity: time.Now(),
	}
	player := NewPlayer(0, hostName, hostColor)
	player.Position = getSpawnPosition(0)
	room.players[0] = player
	return room
}

func (r *Room) Send(msg *pb.Message) {
	select {
	case r.events <- msg:
	case <-r.done:
	}
}

func (r *Room) Join(name, color string) JoinResponse {
	resp := make(chan JoinResponse, 1)
	select {
	case r.joins <- JoinRequest{Name: name, Color: color, Response: resp}:
		return <-resp
	case <-r.done:
		return JoinResponse{OK: false, Error: "room closed"}
	}
}

func (r *Room) Connect(playerID int32, conn *net.Conn) ConnectResponse {
	resp := make(chan ConnectResponse, 1)
	select {
	case r.connects <- ConnectRequest{PlayerID: playerID, Conn: conn, Response: resp}:
		return <-resp
	case <-r.done:
		return ConnectResponse{OK: false}
	}
}

func (r *Room) Run() {
	defer r.cleanup()

	ticker := time.NewTicker(TickRate * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-r.done:
			return
		case req := <-r.joins:
			r.handleJoin(req)
		case req := <-r.connects:
			r.handleConnect(req)
		case <-ticker.C:
			if r.started {
				r.tick()
			}
		case msg, ok := <-r.events:
			if !ok {
				return
			}
			r.handleEvent(msg)
		}
	}
}

func (r *Room) ReadLoop(playerID int32, conn *net.Conn) {
	for {
		data, err := wsutil.ReadClientBinary(*conn)
		if err != nil {
			return
		}

		var msg pb.Message
		if err := proto.Unmarshal(data, &msg); err != nil {
			continue
		}

		if msg.Id == nil {
			msg.Id = &playerID
		}
		r.Send(&msg)
	}
}

func (r *Room) handleEvent(msg *pb.Message) {
	r.lastActivity = time.Now()
	switch msg.Event {
	case EventDelete:
		r.stop()
	case EventStart:
		r.onStart()
	case EventMove:
		r.onMove(msg)
	case EventKick:
		r.onKick(msg)
	case EventReady:
		r.onReady(msg)
	case EventShoot:
		r.onShoot(msg)
	}
}

func (r *Room) handleJoin(req JoinRequest) {
	r.lastActivity = time.Now()
	if r.started {
		req.Response <- JoinResponse{OK: false, Error: "game already started"}
		return
	}

	slot := r.findEmptySlot()
	if slot == -1 {
		req.Response <- JoinResponse{OK: false, Error: "room is full"}
		return
	}

	player := NewPlayer(int32(slot), req.Name, req.Color)
	player.Position = getSpawnPosition(slot)
	r.players[slot] = player

	req.Response <- JoinResponse{PlayerID: slot, OK: true}
}

func (r *Room) handleConnect(req ConnectRequest) {
	r.lastActivity = time.Now()
	player := r.player(req.PlayerID)
	if player == nil {
		req.Response <- ConnectResponse{OK: false}
		return
	}

	player.conn = req.Conn
	players := r.playerList()

	r.broadcast(&pb.Message{
		Id:      &req.PlayerID,
		Event:   EventJoin,
		Payload: &pb.Payload{Players: players},
	})

	req.Response <- ConnectResponse{OK: true, Players: players}
}

func (r *Room) onStart() {
	if r.started {
		return
	}
	r.started = true

	r.broadcast(&pb.Message{Event: EventStart})

	idx := 0
	for _, p := range r.players {
		if p != nil {
			p.Position = getSpawnPosition(idx)
			p.Health = MaxHealth
			p.Rotation = 0
			idx++
		}
	}

	r.broadcast(&pb.Message{
		Event:   EventSpawn,
		Payload: &pb.Payload{Players: r.playerList()},
	})
}

func (r *Room) onMove(msg *pb.Message) {
	if msg.Id == nil || msg.Payload == nil || msg.Payload.Position == nil {
		return
	}

	player := r.player(*msg.Id)
	if player == nil || !player.IsAlive() {
		return
	}

	movement := msg.Payload.Position
	angle := normalizeAngle(movement)
	newPos := calculatePosition(player.Position, angle, PlayerSpeed)

	collided := checkCollision(PlayerSize, newPos)

	rotation := player.Rotation
	if movement.X != 0 || movement.Y != 0 {
		rotation = math.Atan2(movement.Y, movement.X)
	}

	msg.Payload.Rotation = &rotation

	if collided {
		msg.Payload.Position = player.Position
	} else {
		msg.Payload.Position = newPos
	}

	r.broadcast(msg)

	player.Position = msg.Payload.Position
	player.Rotation = rotation
}

func (r *Room) onKick(msg *pb.Message) {
	if msg.Id == nil {
		return
	}

	id := *msg.Id
	if id < 0 || id >= MaxPlayers {
		return
	}

	if id == 0 && !r.started {
		r.closeRoom()
		return
	}

	r.removePlayer(id)
	r.broadcast(msg)

	if r.started && r.aliveCount() <= 1 {
		r.endGame()
	}
}

func (r *Room) onReady(msg *pb.Message) {
	if msg.Id == nil || msg.Payload == nil || msg.Payload.IsReady == nil {
		return
	}

	player := r.player(*msg.Id)
	if player == nil {
		return
	}

	player.IsReady = *msg.Payload.IsReady
	r.broadcast(msg)
}

func (r *Room) onShoot(msg *pb.Message) {
	if msg.Id == nil {
		return
	}

	player := r.player(*msg.Id)
	if player == nil || !player.IsAlive() || player.Position == nil {
		return
	}

	bullet := &pb.Bullet{
		Id:       float64(time.Now().UnixNano()),
		Position: &pb.Position{X: player.Position.X, Y: player.Position.Y},
		Rotation: player.Rotation,
		OwnerId:  *msg.Id,
	}

	r.bullets = append(r.bullets, bullet)
	msg.Payload = &pb.Payload{Bullet: bullet}
	r.broadcast(msg)
}

func (r *Room) tick() {
	if len(r.bullets) == 0 {
		return
	}

	active := make([]*pb.Bullet, 0, len(r.bullets))

	for _, bullet := range r.bullets {
		if bullet.Expired {
			continue
		}

		newPos := calculatePosition(bullet.Position, bullet.Rotation, BulletSpeed)

		if checkBulletCollision(newPos) {
			bullet.Expired = true
		}

		if !bullet.Expired {
			r.checkHit(bullet, newPos)
		}

		if !bullet.Expired {
			bullet.Position = newPos
			active = append(active, bullet)
		}

		var id int32 = 255
		r.broadcast(&pb.Message{
			Id:      &id,
			Event:   EventShoot,
			Payload: &pb.Payload{Bullet: bullet},
		})
	}

	r.bullets = active

	if r.aliveCount() <= 1 {
		r.endGame()
	}
}

func (r *Room) checkHit(bullet *pb.Bullet, pos *pb.Position) {
	for _, p := range r.players {
		if p == nil || p.Id == bullet.OwnerId || !p.IsAlive() || p.Position == nil {
			continue
		}

		if math.Hypot(p.Position.X-pos.X, p.Position.Y-pos.Y) < PlayerSize {
			bullet.Expired = true
			p.Health -= BulletDamage

			if p.Health <= 0 {
				if shooter := r.player(bullet.OwnerId); shooter != nil {
					shooter.Kills++
					r.sendTo(shooter, &pb.Message{
						Id:      &bullet.OwnerId,
						Event:   EventKills,
						Payload: &pb.Payload{Kills: &shooter.Kills},
					})
				}
				r.removePlayer(p.Id)
				r.broadcast(&pb.Message{Id: &p.Id, Event: EventKick})
			} else {
				health := p.Health
				r.broadcast(&pb.Message{
					Id:      &p.Id,
					Event:   EventHit,
					Payload: &pb.Payload{Health: &health},
				})
			}
			return
		}
	}
}

func (r *Room) endGame() {
	r.closeRoom()
}

func (r *Room) closeRoom() {
	for _, p := range r.players {
		if p != nil {
			r.removePlayer(p.Id)
		}
	}
	r.stop()
}

func (r *Room) removePlayer(id int32) {
	if id < 0 || id >= MaxPlayers {
		return
	}

	p := r.players[id]
	if p == nil {
		return
	}
	r.players[id] = nil

	if p.conn != nil {
		r.sendTo(p, &pb.Message{
			Id:      &id,
			Event:   EventKick,
			Payload: &pb.Payload{Kills: &p.Kills},
		})
		(*p.conn).Close()
		p.conn = nil
	}
}

func (r *Room) cleanup() {
	for _, p := range r.players {
		if p != nil && p.conn != nil {
			(*p.conn).Close()
			p.conn = nil
		}
	}
	globalRooms.Delete(r.id)
}

func (r *Room) stop() {
	select {
	case <-r.done:
	default:
		close(r.done)
	}
}

func (r *Room) player(id int32) *Player {
	if id < 0 || id >= MaxPlayers {
		return nil
	}
	return r.players[id]
}

func (r *Room) findEmptySlot() int {
	for i, p := range r.players {
		if p == nil {
			return i
		}
	}
	return -1
}

func (r *Room) playerList() []*pb.Player {
	list := make([]*pb.Player, 0, MaxPlayers)
	for _, p := range r.players {
		if p != nil {
			list = append(list, p.ToProto())
		}
	}
	return list
}

func (r *Room) aliveCount() int {
	count := 0
	for _, p := range r.players {
		if p != nil && p.IsAlive() {
			count++
		}
	}
	return count
}

func (r *Room) broadcast(msg *pb.Message) {
	data, err := proto.Marshal(msg)
	if err != nil {
		return
	}
	for _, p := range r.players {
		if p != nil && p.conn != nil {
			wsutil.WriteServerBinary(*p.conn, data)
		}
	}
}

func (r *Room) sendTo(p *Player, msg *pb.Message) {
	if p.conn == nil {
		return
	}
	if data, err := proto.Marshal(msg); err == nil {
		wsutil.WriteServerBinary(*p.conn, data)
	}
}
