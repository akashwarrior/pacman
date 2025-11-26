import {
  Position as _Position,
  Bullet as _Bullet,
  Player as _Player,
} from './message'

export interface Position extends Required<_Position> { }

export interface Bullet extends Required<_Bullet & { position: Position }> { }

export interface Player extends Required<_Player & { position: Position }> { }

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

export interface GameMap {
  width: number;
  height: number;
  theme: string;
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
  isGameOver: boolean;
  time: number;
}
