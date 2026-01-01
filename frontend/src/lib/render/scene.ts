import type { Bullet, Bush, GameState, Player } from "@/types";
import { RENDER_COLORS } from "@/lib/constants/colors";
import {
  MAP,
  PLAYER,
  PLAYER_DRAW_SCALE,
  WORLD_EFFECTS,
  WORLD_OBJECTS,
} from "@/lib/constants/game";
import { ARENA_MAP } from "./arena-map";
import { createCanvas } from "./canvas";
import {
  addRoundRect,
  isVisible,
  pacPaletteFromColor,
  roundRectPath,
} from "./draw-utils";

let staticWorldCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
let bulletCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
let playerVolumeCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;

function getStaticWorldCanvas(): HTMLCanvasElement | OffscreenCanvas {
  if (staticWorldCanvas) return staticWorldCanvas;

  staticWorldCanvas = createCanvas(MAP.WIDTH, MAP.HEIGHT);

  const ctx = staticWorldCanvas.getContext("2d") as CanvasRenderingContext2D;
  if (!ctx) return staticWorldCanvas;

  ctx.fillStyle = "rgba(14, 165, 233, 0.15)";
  ctx.beginPath();
  for (const water of ARENA_MAP.water) {
    addRoundRect(ctx, water.x, water.y, water.width, water.height, 8);
  }
  ctx.fill();

  ctx.save();
  ctx.shadowBlur = 15;
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.fillStyle = "#020617";
  ctx.beginPath();
  for (const wall of ARENA_MAP.walls) {
    const rr = Math.min(6, wall.width / 2, wall.height / 2);
    addRoundRect(ctx, wall.x, wall.y, wall.width, wall.height, rr);
  }
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  for (const wall of ARENA_MAP.walls) {
    const rr = Math.min(6, wall.width / 2, wall.height / 2);
    addRoundRect(ctx, wall.x, wall.y, wall.width, wall.height, rr);
  }
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.beginPath();
  for (const wall of ARENA_MAP.walls) {
    const rr = Math.min(6, wall.width / 2, wall.height / 2);
    addRoundRect(ctx, wall.x + 1, wall.y + 1, wall.width - 2, wall.height - 2, Math.max(1, rr - 1));
  }
  ctx.fill();

  for (const rock of ARENA_MAP.rocks) {
    const s = rock.size * 1.5;
    const rr = s * 0.4;
    const tilt = rock.variant * 0.2;

    ctx.save();
    ctx.translate(rock.x, rock.y);
    ctx.rotate(tilt);

    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    addRoundRect(ctx, -s / 2, -s / 2, s, s, rr);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    addRoundRect(ctx, -s / 2 + 1, -s / 2 + 1, s - 2, s - 2, rr);
    ctx.fill();
    ctx.restore();
  }

  return staticWorldCanvas;
}

function getBulletCanvas(): { canvas: HTMLCanvasElement | OffscreenCanvas; cx: number; cy: number } {
  if (bulletCanvas) return { canvas: bulletCanvas, cx: 40, cy: 10 };

  const w = 50;
  const h = 20;

  const c = createCanvas(w, h);

  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const cx = 40;
  const cy = 10;
  const trailLen = 30;

  const grad = ctx.createLinearGradient(cx - trailLen, cy, cx, cy);
  grad.addColorStop(0, "rgba(56, 189, 248, 0)");
  grad.addColorStop(0.5, "rgba(56, 189, 248, 0.3)");
  grad.addColorStop(1, "rgba(56, 189, 248, 0.9)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx - trailLen / 2, cy, trailLen / 2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 10;
  ctx.shadowColor = "#38bdf8";
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 6, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx + 3, cy, 1.2, 0, Math.PI * 2);
  ctx.fill();

  bulletCanvas = c;
  return { canvas: bulletCanvas, cx, cy };
}

function getPlayerVolumeCanvas(pr: number): { canvas: HTMLCanvasElement | OffscreenCanvas; size: number } {
  if (playerVolumeCanvas) return { canvas: playerVolumeCanvas, size: pr * 2 };

  const size = Math.ceil(pr * 2);
  const c = createCanvas(size, size);

  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const center = size / 2;

  const innerShadow = ctx.createRadialGradient(
    center - pr * 0.3, center - pr * 0.3, 0,
    center, center, pr * 1.5
  );
  innerShadow.addColorStop(0, "rgba(255, 255, 255, 0.35)");
  innerShadow.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  innerShadow.addColorStop(1, "rgba(0, 0, 0, 0.3)");

  ctx.fillStyle = innerShadow;
  ctx.fillRect(0, 0, size, size);

  playerVolumeCanvas = c;
  return { canvas: playerVolumeCanvas, size };
}

function renderBushes(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, t: number): void {
  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = RENDER_COLORS.pelletCore;
  ctx.fillStyle = RENDER_COLORS.pelletCore;

  ctx.beginPath();
  for (const bush of ARENA_MAP.bushes as Bush[]) {
    if (!isVisible(bush.x, bush.y, bush.radius * 2, cx, cy, w, h)) continue;

    const sway = Math.sin(t * WORLD_EFFECTS.BUSH_WAVE_SPEED + bush.x * 0.08) * 0.5;
    const bx = bush.x + sway;
    const by = bush.y + Math.sin(t * 0.003 + bush.y * 0.05) * 1.5;
    const visR = Math.max(2.5, bush.radius * 0.35);

    ctx.moveTo(bx + visR, by);
    ctx.arc(bx, by, visR, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

function renderTrees(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, t: number): void {
  for (const tree of ARENA_MAP.trees) {
    const sway = Math.sin(t * WORLD_EFFECTS.TREE_SWAY_SPEED + tree.x * 0.04) * 0.3;
    const tx = tree.x + sway;
    const poleW = 2;
    const poleH = Math.round(20 + tree.size * 3);
    const lampR = (5 + tree.size) * 0.6;
    const footY = tree.y;
    const headY = footY - poleH - lampR * 0.5;

    if (!isVisible(tx, footY, poleH + lampR + 10, cx, cy, w, h)) continue;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(tx, footY, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#334155";
    roundRectPath(ctx, tx - poleW / 2, headY, poleW, poleH, 1);
    ctx.fill();

    const pulse = 0.85 + 0.15 * Math.sin(t * 0.003 + tree.x * 0.06);
    ctx.save();
    ctx.shadowBlur = 12 * pulse;
    ctx.shadowColor = "#38bdf8";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(tx, headY, lampR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const CRATE_VISUAL_MAX_HP = 45;

function renderCrates(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  const size = WORLD_OBJECTS.CRATE_SIZE * 0.85;
  const half = size / 2;

  for (const crate of ARENA_MAP.crates) {
    if (crate.health <= 0) continue;
    if (!isVisible(crate.x, crate.y, size * 1.5, cx, cy, w, h)) continue;

    const integrity = Math.min(1, Math.max(0, crate.health / CRATE_VISUAL_MAX_HP));

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.fillStyle = "#1e293b";
    roundRectPath(ctx, crate.x - half, crate.y - half, size, size, 4);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRectPath(ctx, crate.x - half + 1, crate.y - half + 1, size - 2, size - 2, 3);
    ctx.fill();

    const coreColor = integrity > 0.3 ? "#fbbf24" : "#ef4444";
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = coreColor;
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.arc(crate.x, crate.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function renderBullets(ctx: CanvasRenderingContext2D, bullets: Map<number, Bullet>, cx: number, cy: number, w: number, h: number): void {
  const sprite = getBulletCanvas();

  bullets.forEach((bullet) => {
    if (bullet.expired) return;
    if (!isVisible(bullet.position.x, bullet.position.y, 50, cx, cy, w, h)) return;

    ctx.save();
    ctx.translate(bullet.position.x, bullet.position.y);
    ctx.rotate(bullet.rotation);
    ctx.drawImage(sprite.canvas, -sprite.cx, -sprite.cy);
    ctx.restore();
  });
}

function renderPlayers(ctx: CanvasRenderingContext2D, players: Map<number, Player>, currentId: number, cx: number, cy: number, w: number, h: number, t: number): void {
  const pr = PLAYER.SIZE * PLAYER_DRAW_SCALE;
  const volumeSprite = getPlayerVolumeCanvas(pr);

  ctx.font = '600 11px ui-sans-serif, system-ui, -apple-system, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  players.forEach((player) => {
    if (!isVisible(player.position.x, player.position.y, pr * 4, cx, cy, w, h)) return;

    const isCurrent = player.id === currentId;
    const colors = pacPaletteFromColor(player.color, player.id);
    const px = player.position.x;
    const py = player.position.y;
    const mouthAngle = Math.abs(Math.sin(t * 0.012)) * 0.45;
    const rotation = player.rotation;

    if (isCurrent) {
      ctx.fillStyle = colors.body;
      ctx.beginPath();
      for (let i = 1; i <= 3; i++) {
        const offset = i * 4;
        const trailX = px - Math.cos(rotation) * offset;
        const trailY = py - Math.sin(rotation) * offset;
        ctx.globalAlpha = 0.15 - (i * 0.04);
        ctx.arc(trailX, trailY, pr * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, pr + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(px, py + pr * 0.3, pr * 0.8, pr * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rotation);

    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.arc(0, 0, pr, mouthAngle, Math.PI * 2 - mouthAngle);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.drawImage(volumeSprite.canvas, -pr, -pr, volumeSprite.size, volumeSprite.size);
    ctx.restore();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(-pr * 0.1, -pr * 0.45, pr * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    const barW = 28;
    const barH = 2.5;
    const barY = py - pr - 10;
    const hp = player.health / (player.maxHealth || 100);

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    roundRectPath(ctx, px - barW / 2, barY, barW, barH, 1);
    ctx.fill();

    if (hp > 0) {
      const hc =
        hp <= 0.3
          ? RENDER_COLORS.healthLow
          : hp <= 0.6
            ? RENDER_COLORS.healthMid
            : RENDER_COLORS.healthHigh;
      ctx.fillStyle = hc;
      roundRectPath(ctx, px - barW / 2, barY, barW * hp, barH, 1);
      ctx.fill();
    }

    ctx.shadowBlur = 3;
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.fillStyle = isCurrent ? "#ffffff" : "rgba(203, 213, 225, 0.9)";
    ctx.fillText(player.name, px, py - pr - 18);
    ctx.shadowBlur = 0;
  });
}

export function renderWorld(ctx: CanvasRenderingContext2D, cx: number, cy: number, vw: number, vh: number, animationTime: number, state: GameState): void {
  ctx.drawImage(getStaticWorldCanvas(), 0, 0);
  renderCrates(ctx, cx, cy, vw, vh);
  renderBushes(ctx, cx, cy, vw, vh, animationTime);
  renderTrees(ctx, cx, cy, vw, vh, animationTime);
  renderBullets(ctx, state.bullets, cx, cy, vw, vh);
  renderPlayers(ctx, state.players, state.playerId, cx, cy, vw, vh, animationTime);
}
