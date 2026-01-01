export const MAP = { WIDTH: 2400, HEIGHT: 1600 } as const;

export const PLAYER_DRAW_SCALE = 1.15 as const;

export const PLAYER = {
  SIZE: 22,
  SPEED: 4.5,
  MAX_HEALTH: 100,
} as const;

export const BULLET = {
  SIZE: 5,
  SPEED: 8,
  TRAIL_LENGTH: 12,
  FIRE_INTERVAL: 250,
} as const;

export const WORLD_OBJECTS = {
  TREE_BASE_SIZE: 35,
  ROCK_BASE_SIZE: 25,
  CRATE_SIZE: 40,
} as const;

export const TIMING = {
  MOVEMENT_INTERVAL: 16,
} as const;

export const WORLD_EFFECTS = {
  TREE_SWAY_SPEED: 0.001,
  BUSH_WAVE_SPEED: 0.0015,
} as const;

export const MIN_PLAYERS_TO_START = 2 as const;
export const MAX_PLAYERS = 6 as const;
