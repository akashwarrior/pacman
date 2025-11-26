interface Color {
  value: string;
  hex: string;
  label: string;
  gradient: string;
}

export const PACMAN_COLORS: Color[] = [
  {
    value: "from-cyan-500 to-cyan-600",
    hex: "#eab308",
    label: "Yellow",
    gradient: "linear-gradient(135deg, #eab308, #ca8a04)",
  },
  {
    value: "from-blue-500 to-blue-600",
    hex: "#3b82f6",
    label: "Blue",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
  },
  {
    value: "from-purple-500 to-purple-600",
    hex: "#a855f7",
    label: "Purple",
    gradient: "linear-gradient(135deg, #a855f7, #9333ea)",
  },
  {
    value: "from-pink-500 to-pink-600",
    hex: "#ec4899",
    label: "Pink",
    gradient: "linear-gradient(135deg, #ec4899, #db2777)",
  },
  {
    value: "from-emerald-500 to-emerald-600",
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
