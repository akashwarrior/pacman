import type {
  Bullet as ProtoBullet,
  Player as ProtoPlayer,
  Position as ProtoPosition,
} from "./message";

export type Position = Required<ProtoPosition>;

export type Bullet = Omit<Required<ProtoBullet>, "position"> & {
  position: Position;
};

export type Player = Omit<Required<ProtoPlayer>, "position"> & {
  position: Position;
};

export type RoomPlayer = Pick<Player, "id" | "name" | "color" | "isReady">;

export interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
  variant: number;
}

export interface Water {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Bush {
  x: number;
  y: number;
  radius: number;
}

export interface Tree {
  x: number;
  y: number;
  size: number;
}

export interface Rock {
  x: number;
  y: number;
  size: number;
  variant: number;
}

export interface Crate {
  id: number;
  x: number;
  y: number;
  health: number;
}

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface GameMap {
  width: number;
  height: number;
  theme: string;
  spawnPoints?: SpawnPoint[];
  walls: Wall[];
  water: Water[];
  bushes: Bush[];
  trees: Tree[];
  rocks: Rock[];
  crates: Crate[];
}

export interface GameState {
  players: Map<number, Player>;
  bullets: Map<number, Bullet>;
  playerId: number;
}

export function createEmptyGameState(playerId = -1): GameState {
  return {
    players: new Map(),
    bullets: new Map(),
    playerId,
  };
}
