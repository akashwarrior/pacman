import type { Bullet, Player, Position, RoomPlayer } from "./game";

export interface SocketEventPayloads {
  Join: { players: RoomPlayer[] };
  Ready: { isReady: boolean };
  Start: Record<string, never>;
  Spawn: { players: Player[] };
  Move: { position: Position; rotation?: number };
  Shoot: { bullet: Bullet };
  Hit: { health: number };
  Kick: { kills?: number };
  Kills: { kills: number };
}

export type SocketEventName = keyof SocketEventPayloads;

export type SocketEventHandler<K extends SocketEventName = SocketEventName> = (
  payload: SocketEventPayloads[K],
  playerId?: number,
) => void;

export type SocketConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface SocketConnectionState {
  status: SocketConnectionStatus;
  reason?: string;
}

export type SocketConnectionListener = (
  state: SocketConnectionState,
) => void;

export type PendingEvent = {
  [K in SocketEventName]: {
    event: K;
    payload: SocketEventPayloads[K];
    playerId?: number;
  };
}[SocketEventName];
