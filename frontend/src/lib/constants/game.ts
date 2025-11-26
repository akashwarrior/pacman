export const MAP = { WIDTH: 2400, HEIGHT: 1600 } as const;
export const VIEWPORT = { WIDTH: 1200, HEIGHT: 800 } as const;

export const PLAYER = {
  SIZE: 22,
  SPEED: 4.5,
  MAX_HEALTH: 100,
} as const;

export const BULLET = {
  SIZE: 5,
  SPEED: 8,
  TRAIL_LENGTH: 8,
  FIRE_INTERVAL: 250,
} as const;

export const OBJECTS = {
  TREE_BASE_SIZE: 35,
  ROCK_BASE_SIZE: 25,
  CRATE_SIZE: 40,
} as const;

export const TIMING = {
  MOVEMENT_INTERVAL: 16,
} as const;

export const EFFECTS = {
  WATER_WAVE_SPEED: 0.002,
  TREE_SWAY_SPEED: 0.001,
  BUSH_WAVE_SPEED: 0.0015,
} as const;

export const MIN_PLAYERS_TO_START = 2 as const;

export const COLORS = {
  GROUND_BASE: "#4a7c3f",
  GROUND_DARK: "#3d6634",
  GROUND_LIGHT: "#5a8c4f",
  GROUND_ACCENT: "#6b9c5f",

  WATER_DEEP: "#1a5c8a",
  WATER_MID: "#2980b9",
  WATER_LIGHT: "#3498db",
  WATER_FOAM: "#87ceeb",
  WATER_HIGHLIGHT: "#b3e0f2",

  BUSH_DARK: "#1e5631",
  BUSH_MID: "#2d7a46",
  BUSH_LIGHT: "#4a9c5d",
  BUSH_HIGHLIGHT: "#6bc77d",

  TREE_TRUNK: "#4a3728",
  TREE_TRUNK_DARK: "#362a1e",
  TREE_LEAVES_DARK: "#1e5631",
  TREE_LEAVES_MID: "#2d7a46",
  TREE_LEAVES_LIGHT: "#4a9c5d",

  ROCK_DARK: "#4a4a4a",
  ROCK_MID: "#6b6b6b",
  ROCK_LIGHT: "#8c8c8c",
  ROCK_HIGHLIGHT: "#a0a0a0",

  WALL_STONE: "#6b7b8c",
  WALL_STONE_DARK: "#4a5a6a",
  WALL_BRICK: "#8b4513",
  WALL_BRICK_DARK: "#6b3510",
  WALL_METAL: "#708090",
  WALL_METAL_DARK: "#4a5a6a",

  CRATE_WOOD: "#b8860b",
  CRATE_DARK: "#8b6914",
  CRATE_LIGHT: "#daa520",

  HEALTH_HIGH: "#22c55e",
  HEALTH_MID: "#eab308",
  HEALTH_LOW: "#ef4444",
  SHADOW: "rgba(0, 0, 0, 0.3)",

  PACMAN: [
    { body: "#ffcc00", outline: "#e6b800", eye: "#000" },
    { body: "#ff6b6b", outline: "#e85555", eye: "#000" },
    { body: "#4ecdc4", outline: "#3db8b0", eye: "#000" },
    { body: "#a855f7", outline: "#9333ea", eye: "#000" },
    { body: "#f97316", outline: "#ea580c", eye: "#000" },
    { body: "#06b6d4", outline: "#0891b2", eye: "#000" },
  ],
};