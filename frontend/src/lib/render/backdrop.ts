import { MAP } from "@/lib/constants/game";
import { createCanvas } from "./canvas";

function starCellHash(ix: number, iy: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263);
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return h >>> 0;
}

const BLOBS = [
  { x: 0.2, y: 0.3, r: 400, colorRGB: "139, 92, 246", driftX: 0.1, driftY: 0.15, phase: 0 },
  { x: 0.8, y: 0.7, r: 500, colorRGB: "56, 189, 248", driftX: -0.15, driftY: 0.1, phase: 2 },
  { x: 0.5, y: 0.8, r: 450, colorRGB: "236, 72, 153", driftX: 0.2, driftY: -0.1, phase: 4 },
];

const blobCanvases: Map<number, HTMLCanvasElement | OffscreenCanvas> = new Map();

function getColoredBlob(index: number): HTMLCanvasElement | OffscreenCanvas {
  if (blobCanvases.has(index)) return blobCanvases.get(index)!;

  const blobDef = BLOBS[index];
  const size = 512;
  const c = createCanvas(size, size);

  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  const center = size / 2;

  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, `rgba(${blobDef.colorRGB}, 0.05)`);
  grad.addColorStop(0.5, `rgba(${blobDef.colorRGB}, 0.015)`);
  grad.addColorStop(1, `rgba(${blobDef.colorRGB}, 0)`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  blobCanvases.set(index, c);
  return c;
}

let centerGlowCache: HTMLCanvasElement | OffscreenCanvas | null = null;

function getCenterGlowCanvas(): HTMLCanvasElement | OffscreenCanvas {
  if (centerGlowCache) return centerGlowCache;

  const w = 512;
  const h = 512;

  centerGlowCache = createCanvas(w, h);

  const ctx = centerGlowCache.getContext("2d") as CanvasRenderingContext2D;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.max(w, h);

  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  centerGrad.addColorStop(0, "rgba(255, 255, 255, 0.015)");
  centerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, w, h);

  return centerGlowCache;
}

function drawElegantStars(
  ctx: CanvasRenderingContext2D,
  vx: number,
  vy: number,
  vw: number,
  vh: number,
  t: number,
  step: number,
  mask: number,
  alphaMul: number,
  twMul: number,
  hashSalt: number,
  isForeground: boolean = false
): void {
  const ix0 = Math.floor(vx / step);
  const ix1 = Math.ceil((vx + vw) / step);
  const iy0 = Math.floor(vy / step);
  const iy1 = Math.ceil((vy + vh) / step);
  const jitterMax = Math.max(1, step - 4);
  const tPhase = t * twMul * 1.5;

  ctx.save();
  ctx.beginPath();

  for (let iy = iy0; iy < iy1; iy++) {
    for (let ix = ix0; ix < ix1; ix++) {
      const h = starCellHash(ix + hashSalt, iy + hashSalt * 37);
      if ((h & mask) !== 0) continue;

      const ox = 2 + ((h >>> 8) % jitterMax);
      const oy = 2 + ((h >>> 16) % jitterMax);
      const sx = ix * step + ox;
      const sy = iy * step + oy;

      if (isForeground) {
        const tw = 0.5 + 0.5 * Math.sin(tPhase + (h & 0xfff) * 0.02);
        const a = alphaMul * tw * 0.6;
        const size = (h >>> 12) % 10 === 0 ? 1.5 : 0.8;

        ctx.fillStyle = `rgba(224, 242, 254, ${a})`;
        ctx.moveTo(sx, sy);
        ctx.arc(sx, sy, size, 0, Math.PI * 2);

      } else {
        const isLarge = (h >>> 12) % 40 === 0;
        const tw = 0.5 + 0.5 * Math.sin(tPhase + (h & 0xfff) * 0.01);
        const a = alphaMul * tw * (isLarge ? 0.8 : 0.4);

        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.moveTo(sx, sy);
        ctx.arc(sx, sy, isLarge ? 1.2 : 0.6, 0, Math.PI * 2);
      }
    }
  }

  ctx.fill();
  ctx.restore();
}

function drawAmbientBlobs(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number): void {
  const w = MAP.WIDTH;
  const h = MAP.HEIGHT;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < BLOBS.length; i++) {
    const blob = BLOBS[i];
    const sprite = getColoredBlob(i);

    const rx = blob.x * w + Math.sin(t * 0.1 + blob.phase) * blob.driftX * 400 - cx * 0.3;
    const ry = blob.y * h + Math.cos(t * 0.08 + blob.phase) * blob.driftY * 400 - cy * 0.3;

    ctx.drawImage(sprite, rx - blob.r, ry - blob.r, blob.r * 2, blob.r * 2);
  }

  ctx.restore();
}

export function renderCosmicBackdrop(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  vw: number,
  vh: number,
  nowMs: number
): void {
  const vx = camX;
  const vy = camY;
  const t = nowMs * 0.001;
  const w = MAP.WIDTH;
  const h = MAP.HEIGHT;

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#030408";
  ctx.fillRect(vx, vy, vw, vh);

  const glowSprite = getCenterGlowCanvas();
  ctx.drawImage(glowSprite, 0, 0, glowSprite.width, glowSprite.height, vx, vy, vw, vh);

  drawAmbientBlobs(ctx, camX, camY, t);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  ctx.beginPath();
  ctx.rect(vx, vy, vw, vh);
  ctx.clip();
  drawElegantStars(ctx, vx * 0.9, vy * 0.9, vw, vh, t, 60, 3, 1, 0.4, 1234, false);
  drawElegantStars(ctx, vx * 0.7, vy * 0.7, vw, vh, t, 35, 7, 0.6, 0.8, 5678, false);
  drawElegantStars(ctx, vx * 1.3, vy * 1.3, vw, vh, t, 90, 1, 0.8, 1.2, 9999, true);

  ctx.restore();
}
