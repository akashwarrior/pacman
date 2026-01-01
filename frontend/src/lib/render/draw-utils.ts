import { PACMAN_PALETTES } from "@/lib/constants/colors";

export type PacPalette = { body: string; outline: string; eye: string };

const paletteCache = new Map<string, PacPalette>();

export function pacPaletteFromColor(color: string | undefined, id: number): PacPalette {
  if (!color?.trim()) return PACMAN_PALETTES[id % PACMAN_PALETTES.length];

  const key = color.trim().toLowerCase();
  const cached = paletteCache.get(key);
  if (cached) return cached;

  let hex = key;
  if (!hex.startsWith("#")) hex = `#${hex}`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const outline = `rgb(${Math.round(r * 0.48)},${Math.round(g * 0.48)},${Math.round(b * 0.48)})`;
  const palette: PacPalette = { body: hex, outline, eye: "#0f172a" };
  paletteCache.set(key, palette);
  return palette;
}

export function addRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.roundRect(x, y, w, h, rr);
}

export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  addRoundRect(ctx, x, y, w, h, r);
}

export function isVisible(x: number, y: number, size: number, cx: number, cy: number, w: number, h: number): boolean {
  const m = size * 2;
  return x + m > cx && x - m < cx + w && y + m > cy && y - m < cy + h;
}
