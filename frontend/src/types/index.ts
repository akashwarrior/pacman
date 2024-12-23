import { Bullet, GameMap, Player } from "@/types/message";

export interface GameState {
    players: Player[];
    bullets: Bullet[];
    map: GameMap
}

export const SOCKET_EVENT = {
    JOIN: "Join",
    READY: "Ready",
    LEAVE: "Leave",
    SPAWN: "Spawn",
    MOVE: "Move",
    SHOOT: "Shoot",
    HIT: "Hit",
    KICK: "Kick",
    START: "Start",
    KILLS: "Kills",
    GAME_OVER: "Game Over"
}