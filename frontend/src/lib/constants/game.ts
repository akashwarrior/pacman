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
  GROUND_BASE: "#5a9c4a",
  GROUND_DARK: "#4a8c3a",
  GROUND_LIGHT: "#6aac5a",
  GROUND_ACCENT: "#7abc6a",

  WATER_DEEP: "#1565c0",
  WATER_MID: "#1e88e5",
  WATER_LIGHT: "#42a5f5",
  WATER_FOAM: "#90caf9",
  WATER_HIGHLIGHT: "#bbdefb",

  BUSH_DARK: "#1b5e20",
  BUSH_MID: "#2e7d32",
  BUSH_LIGHT: "#43a047",
  BUSH_HIGHLIGHT: "#66bb6a",

  TREE_TRUNK: "#5d4037",
  TREE_TRUNK_DARK: "#3e2723",
  TREE_LEAVES_DARK: "#1b5e20",
  TREE_LEAVES_MID: "#2e7d32",
  TREE_LEAVES_LIGHT: "#4caf50",

  ROCK_DARK: "#424242",
  ROCK_MID: "#616161",
  ROCK_LIGHT: "#9e9e9e",
  ROCK_HIGHLIGHT: "#bdbdbd",

  WALL_STONE: "#78909c",
  WALL_STONE_DARK: "#546e7a",
  WALL_BRICK: "#a1887f",
  WALL_BRICK_DARK: "#795548",
  WALL_METAL: "#90a4ae",
  WALL_METAL_DARK: "#607d8b",

  CRATE_WOOD: "#d4a056",
  CRATE_DARK: "#8d6e40",
  CRATE_LIGHT: "#e8c078",

  HEALTH_HIGH: "#4caf50",
  HEALTH_MID: "#ffeb3b",
  HEALTH_LOW: "#f44336",
  SHADOW: "rgba(0, 0, 0, 0.3)",

  PACMAN: [
    { body: "#ffc107", outline: "#ff8f00", eye: "#000" },
    { body: "#e91e63", outline: "#c2185b", eye: "#000" },
    { body: "#00bcd4", outline: "#0097a7", eye: "#000" },
    { body: "#9c27b0", outline: "#7b1fa2", eye: "#000" },
    { body: "#ff5722", outline: "#e64a19", eye: "#000" },
    { body: "#4caf50", outline: "#388e3c", eye: "#000" },
  ],
};