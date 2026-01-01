import { PLAYER } from "@/lib/constants/game";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  color: string;
};

type HitRing = { x: number; y: number; life: number; maxLife: number; tint: "rose" | "sky" | "amber" };

type FloatText = {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  color: string;
};

let shakeAmp = 0;
let shakePhase = 0;
let hurtFlash = 0;
let particles: Particle[] = [];
let rings: HitRing[] = [];
let floatTexts: FloatText[] = [];
let muzzleLife = 0;
let muzzleX = 0;
let muzzleY = 0;
let muzzleRot = 0;

function addShake(amount: number): void {
  shakeAmp = Math.min(6, shakeAmp + amount * 0.4);
}

export function stepJuice(dtMs: number): void {
  const k = Math.min(2.5, dtMs / 16);
  shakeAmp *= Math.pow(0.82, k);
  hurtFlash *= Math.pow(0.9, k);
  muzzleLife = Math.max(0, muzzleLife - dtMs);

  let w = 0;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.life -= dtMs;
    const s = dtMs / 16;
    p.x += p.vx * s;
    p.y += p.vy * s;
    p.vx *= Math.pow(0.95, k);
    p.vy *= Math.pow(0.95, k);
    if (p.life > 0) particles[w++] = p;
  }
  particles.length = w;

  w = 0;
  for (let i = 0; i < rings.length; i++) {
    const r = rings[i];
    r.life -= dtMs;
    if (r.life > 0) rings[w++] = r;
  }
  rings.length = w;

  w = 0;
  for (let i = 0; i < floatTexts.length; i++) {
    const t = floatTexts[i];
    t.life -= dtMs;
    t.y += t.vy * (dtMs / 16);
    t.vy *= Math.pow(0.92, k);
    if (t.life > 0) floatTexts[w++] = t;
  }
  floatTexts.length = w;
}

export function getCameraShake(): { x: number; y: number } {
  if (shakeAmp < 0.2) return { x: 0, y: 0 };
  shakePhase += 2.39996322972865332;
  const a = shakePhase;
  return {
    x: Math.sin(a) * Math.cos(a * 2.1) * shakeAmp * 0.65,
    y: Math.cos(a * 1.3) * Math.sin(a * 0.73) * shakeAmp * 0.65,
  };
}

export function getHurtFlash(): number {
  return Math.min(1, hurtFlash);
}

export function onLocalShoot(worldX: number, worldY: number, rotation: number): void {
  addShake(0.5);
  muzzleLife = 80;
  muzzleX = worldX;
  muzzleY = worldY;
  muzzleRot = rotation;

  const mouth = PLAYER.SIZE * 0.8;
  const ox = worldX + Math.cos(rotation) * mouth;
  const oy = worldY + Math.sin(rotation) * mouth;

  for (let i = 0; i < 5; i++) {
    const a = rotation + (Math.random() - 0.5) * 0.5;
    const sp = 2 + Math.random() * 3;
    particles.push({
      x: ox,
      y: oy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 120 + Math.random() * 80,
      maxLife: 200,
      r: 1 + Math.random() * 1.5,
      color: "rgba(255, 255, 255, 0.9)",
    });
  }
}

export function onPlayerDamaged(worldX: number, worldY: number, isLocalPlayer: boolean, damage: number): void {
  addShake(isLocalPlayer ? 4 : 1.5);
  if (isLocalPlayer) {
    hurtFlash = Math.min(1, hurtFlash + 0.3 + Math.min(damage, 40) * 0.005);
  }

  const color = isLocalPlayer ? "rgba(244, 63, 94, 0.9)" : "rgba(56, 189, 248, 0.9)";
  const count = isLocalPlayer ? 10 : 6;

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1 + Math.random() * 4;
    particles.push({
      x: worldX,
      y: worldY,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 200 + Math.random() * 150,
      maxLife: 350,
      r: 1 + Math.random() * 1.5,
      color: color,
    });
  }

  rings.push({ x: worldX, y: worldY, life: 300, maxLife: 300, tint: isLocalPlayer ? "rose" : "sky" });
  
  if (damage > 0) {
    floatTexts.push({
      x: worldX,
      y: worldY - PLAYER.SIZE - 4,
      vy: -1.2,
      life: 500,
      maxLife: 500,
      text: `-${Math.round(damage)}`,
      color: isLocalPlayer ? "rgba(244, 63, 94, 0.95)" : "rgba(255, 255, 255, 0.9)",
    });
  }
}

export function onLocalKill(worldX: number, worldY: number): void {
  addShake(2);
  rings.push({ x: worldX, y: worldY, life: 400, maxLife: 400, tint: "amber" });

  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 3;
    particles.push({
      x: worldX,
      y: worldY,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 250 + Math.random() * 150,
      maxLife: 400,
      r: 1 + Math.random() * 2,
      color: "rgba(251, 191, 36, 0.9)",
    });
  }
}

export function renderJuiceWorld(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  for (const p of particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = a * a;
    ctx.fillStyle = p.color;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const r of rings) {
    const t = 1 - r.life / r.maxLife;
    const rad = 8 + Math.pow(t, 0.6) * 45;
    const alpha = (1 - t) * (1 - t);

    const colorRGB = r.tint === "rose" ? "244, 63, 94" : r.tint === "amber" ? "251, 191, 36" : "56, 189, 248";

    ctx.strokeStyle = `rgba(${colorRGB}, ${alpha * 0.9})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(r.x, r.y, rad, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (muzzleLife > 0) {
    const a = muzzleLife / 80;
    const easedA = a * a;

    ctx.save();
    ctx.translate(muzzleX, muzzleY);
    ctx.rotate(muzzleRot);

    ctx.fillStyle = `rgba(255, 255, 255, ${easedA * 0.9})`;
    ctx.beginPath();
    ctx.arc(PLAYER.SIZE * 1.1, 0, 3 * easedA, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(56, 189, 248, ${easedA * 0.4})`;
    ctx.beginPath();
    ctx.arc(PLAYER.SIZE * 1.1, 0, 7 * easedA, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  if (floatTexts.length > 0) {
    ctx.font = '500 11px ui-sans-serif, system-ui, -apple-system, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 4;
    ctx.shadowColor = "rgba(0,0,0,0.8)";

    for (const t of floatTexts) {
      const alpha = Math.min(1, t.life / 140);
      ctx.globalAlpha = alpha * alpha;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}
