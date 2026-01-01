export interface PlayerColorOption {
  hex: string;
  label: string;
  gradient: string;
}

export const PLAYER_COLOR_OPTIONS: readonly PlayerColorOption[] = [
  {
    hex: "#eab308",
    label: "Yellow",
    gradient: "linear-gradient(135deg, #eab308, #ca8a04)",
  },
  {
    hex: "#3b82f6",
    label: "Blue",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
  },
  {
    hex: "#a855f7",
    label: "Purple",
    gradient: "linear-gradient(135deg, #a855f7, #9333ea)",
  },
  {
    hex: "#ec4899",
    label: "Pink",
    gradient: "linear-gradient(135deg, #ec4899, #db2777)",
  },
  {
    hex: "#10b981",
    label: "Green",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
] as const;

export const GHOST_COLORS = [
  "#ff0000",
  "#00ffff",
  "#ffb8ff",
  "#ffb852",
  "#00ff00",
  "#ff69b4",
] as const;

export const PACMAN_PALETTES = [
  { body: "#fbbf24", outline: "#d97706", eye: "#1e293b" },
  { body: "#f472b6", outline: "#be185d", eye: "#1e293b" },
  { body: "#22d3ee", outline: "#0e7490", eye: "#1e293b" },
  { body: "#c084fc", outline: "#7e22ce", eye: "#1e293b" },
  { body: "#fb923c", outline: "#c2410c", eye: "#1e293b" },
  { body: "#4ade80", outline: "#15803d", eye: "#1e293b" },
] as const;

export const RENDER_COLORS = {
  healthHigh: "#34d399",
  healthMid: "#fbbf24",
  healthLow: "#f87171",
  pelletCore: "#fde047",
} as const;
