import type { Bush, GameState } from "@/types";
import { MAP } from "@/lib/constants/game";
import { getHurtFlash } from "@/lib/game-juice";
import { ARENA_MAP } from "./arena-map";
import { createCanvas } from "./canvas";
import { pacPaletteFromColor, roundRectPath } from "./draw-utils";

export function renderArenaFrame(ctx: CanvasRenderingContext2D): void {
  const w = MAP.WIDTH;
  const h = MAP.HEIGHT;

  ctx.save();
  ctx.shadowBlur = 24;
  ctx.shadowColor = "rgba(56, 189, 248, 0.6)";
  ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, w, h);
  ctx.restore();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
}

const mapSize = 132;
const corner = 12;
const scale = mapSize / MAP.WIDTH;
const mapHeight = mapSize * (MAP.HEIGHT / MAP.WIDTH);

let staticMinimapCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;

function getStaticMinimapCanvas(): HTMLCanvasElement | OffscreenCanvas {
  if (staticMinimapCanvas) return staticMinimapCanvas;

  staticMinimapCanvas = createCanvas(mapSize, mapHeight);

  const ctx = staticMinimapCanvas.getContext("2d") as CanvasRenderingContext2D;
  if (!ctx) return staticMinimapCanvas;

  const miniBg = ctx.createLinearGradient(0, 0, 0, mapHeight);
  miniBg.addColorStop(0, "#020617");
  miniBg.addColorStop(0.52, "#04091a");
  miniBg.addColorStop(1, "#020306");
  ctx.fillStyle = miniBg;
  ctx.fillRect(0, 0, mapSize, mapHeight);

  ctx.fillStyle = "rgba(14, 165, 233, 0.15)";
  for (const water of ARENA_MAP.water) {
    ctx.fillRect(water.x * scale, water.y * scale, Math.max(water.width * scale, 1), Math.max(water.height * scale, 1));
  }

  ctx.fillStyle = "#1e293b";
  for (const wall of ARENA_MAP.walls) {
    ctx.fillRect(wall.x * scale, wall.y * scale, Math.max(wall.width * scale, 1), Math.max(wall.height * scale, 1));
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (const rock of ARENA_MAP.rocks) {
    ctx.beginPath();
    ctx.arc(rock.x * scale, rock.y * scale, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  return staticMinimapCanvas;
}

export function renderMinimap(ctx: CanvasRenderingContext2D, state: GameState, canvasWidth: number): void {
  const pad = 16;
  const mapX = canvasWidth - mapSize - pad;
  const mapY = pad + 16;

  ctx.save();

  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  roundRectPath(ctx, mapX, mapY, mapSize, mapHeight, corner);
  
  ctx.clip();
  ctx.drawImage(getStaticMinimapCanvas(), mapX, mapY);
  ctx.restore();
  
  ctx.beginPath();
  roundRectPath(ctx, mapX, mapY, mapSize, mapHeight, corner);
  ctx.clip();

  ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
  for (const crate of ARENA_MAP.crates) {
    if (crate.health <= 0) continue;
    ctx.fillRect(mapX + crate.x * scale - 1.5, mapY + crate.y * scale - 1.5, 3, 3);
  }

  const miniBushes = ARENA_MAP.bushes as Bush[];
  if (miniBushes.length > 0) {
    ctx.fillStyle = "rgba(253, 224, 71, 0.6)";
    for (const bush of miniBushes) {
      const pr = Math.max(bush.radius * scale * 0.25, 0.8);
      ctx.beginPath();
      ctx.arc(mapX + bush.x * scale, mapY + bush.y * scale, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  state.players.forEach((p) => {
    const colors = pacPaletteFromColor(p.color, p.id);
    const cur = p.id === state.playerId;
    const px = mapX + p.position.x * scale;
    const py = mapY + p.position.y * scale;
    
    ctx.fillStyle = cur ? "#ffffff" : colors.body;
    ctx.beginPath();
    ctx.arc(px, py, cur ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    if (cur) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const rot = p.rotation;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(rot) * 6, py + Math.sin(rot) * 6);
      ctx.stroke();
    }
  });

  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  roundRectPath(ctx, mapX + 0.5, mapY + 0.5, mapSize - 1, mapHeight - 1, corner);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.rect(mapX, mapY, mapSize, mapHeight);
  ctx.clip();
  const bevelGradient = ctx.createLinearGradient(mapX, mapY, mapX, mapY + mapHeight);
  bevelGradient.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  bevelGradient.addColorStop(0.2, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = bevelGradient;
  roundRectPath(ctx, mapX + 1, mapY + 1, mapSize - 2, mapHeight - 2, corner - 1);
  ctx.fill();
  
  ctx.restore();

  ctx.font = '500 8px ui-sans-serif, system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText("ARENA", mapX + mapSize - 2, pad);
  
  ctx.font = '400 7px ui-sans-serif, system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillText("Yellow = pellets · Gold = crate", mapX + mapSize - 2, mapY + mapHeight + 6);
}

export function renderPost(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const cx = width / 2;
  const cy = height / 2;
  const vg = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.4, cx, cy, Math.max(width, height) * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, width, height);

  const hf = getHurtFlash();
  if (hf > 0.01) {
    const hg = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.2, cx, cy, Math.max(width, height) * 0.8);
    hg.addColorStop(0, "rgba(239, 68, 68, 0)");
    hg.addColorStop(1, `rgba(220, 38, 38, ${hf * 0.25})`);
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, width, height);
  }
}
