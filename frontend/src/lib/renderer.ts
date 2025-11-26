import type { GameState, Player, Bullet } from "@/types";
import { MAP, PLAYER, BULLET, OBJECTS, EFFECTS, COLORS } from "./constants/game";
import ARENA_MAP from "@/../public/map/arena.json";

let animationTime = 0;

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number
): void {
  animationTime = Date.now();

  const player = state.players.get(state.playerId);
  if (!player) return;

  const cameraX = player.position.x - width / 2;
  const cameraY = player.position.y - height / 2;

  ctx.fillStyle = COLORS.GROUND_BASE;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  renderGround(ctx, cameraX, cameraY, width, height);
  renderWater(ctx, cameraX, cameraY, width, height);
  renderWalls(ctx, cameraX, cameraY, width, height);
  renderRocks(ctx, cameraX, cameraY, width, height);
  renderCrates(ctx, cameraX, cameraY, width, height);
  renderBushBase(ctx, cameraX, cameraY, width, height);

  renderBullets(ctx, state.bullets, cameraX, cameraY, width, height);
  renderPlayers(ctx, state.players, state.playerId, cameraX, cameraY, width, height);

  renderBushTop(ctx, cameraX, cameraY, width, height);
  renderTrees(ctx, cameraX, cameraY, width, height);

  renderBorder(ctx);
  ctx.restore();

  renderMinimap(ctx, state, width, height);
}

function isVisible(x: number, y: number, size: number, cx: number, cy: number, w: number, h: number): boolean {
  const margin = size * 2;
  return x + margin > cx && x - margin < cx + w && y + margin > cy && y - margin < cy + h;
}

function renderGround(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  const tile = 80;
  const startX = Math.max(0, Math.floor(cx / tile) * tile);
  const startY = Math.max(0, Math.floor(cy / tile) * tile);
  const endX = Math.min(ARENA_MAP.width, cx + w + tile);
  const endY = Math.min(ARENA_MAP.height, cy + h + tile);

  for (let x = startX; x < endX; x += tile) {
    for (let y = startY; y < endY; y += tile) {
      const noise = ((x * 7 + y * 13) % 100) / 100;
      
      ctx.fillStyle = noise > 0.6 ? COLORS.GROUND_LIGHT : noise > 0.3 ? COLORS.GROUND_BASE : COLORS.GROUND_DARK;
      ctx.fillRect(x, y, tile, tile);

      // Subtle grass accent
      if (noise > 0.7) {
        ctx.fillStyle = COLORS.GROUND_ACCENT;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x + noise * 50 + 15, y + (1 - noise) * 50 + 15, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
}

function renderWater(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  const wave = Math.sin(animationTime * EFFECTS.WATER_WAVE_SPEED) * 2;

  for (const water of ARENA_MAP.water) {
    if (!isVisible(water.x + water.width / 2, water.y + water.height / 2, Math.max(water.width, water.height), cx, cy, w, h)) continue;

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(water.x + 4, water.y + 4, water.width, water.height);

    // Water gradient
    const waterGradient = ctx.createLinearGradient(water.x, water.y, water.x, water.y + water.height);
    waterGradient.addColorStop(0, COLORS.WATER_LIGHT);
    waterGradient.addColorStop(1, COLORS.WATER_DEEP);
    
    ctx.fillStyle = waterGradient;
    ctx.fillRect(water.x, water.y, water.width, water.height);

    // Simple wave lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const waveY = water.y + 20 + i * 25 + wave;
      if (waveY < water.y + water.height - 10) {
        ctx.beginPath();
        ctx.moveTo(water.x + 10, waveY);
        ctx.bezierCurveTo(
          water.x + water.width * 0.3, waveY - 5,
          water.x + water.width * 0.7, waveY + 5,
          water.x + water.width - 10, waveY
        );
        ctx.stroke();
      }
    }

    // Border
    ctx.strokeStyle = COLORS.WATER_DEEP;
    ctx.lineWidth = 3;
    ctx.strokeRect(water.x, water.y, water.width, water.height);
  }
}

function renderWalls(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  for (const wall of ARENA_MAP.walls) {
    if (!isVisible(wall.x + wall.width / 2, wall.y + wall.height / 2, Math.max(wall.width, wall.height), cx, cy, w, h)) continue;

    const colors = wall.variant === 1
      ? { main: COLORS.WALL_BRICK, dark: COLORS.WALL_BRICK_DARK }
      : wall.variant === 2
        ? { main: COLORS.WALL_METAL, dark: COLORS.WALL_METAL_DARK }
        : { main: COLORS.WALL_STONE, dark: COLORS.WALL_STONE_DARK };

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(wall.x + 5, wall.y + 5, wall.width, wall.height);

    // Wall base (3D side)
    ctx.fillStyle = colors.dark;
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

    // Wall top
    ctx.fillStyle = colors.main;
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height - 8);

    // Simple brick pattern for variant 1
    if (wall.variant === 1) {
      ctx.strokeStyle = colors.dark;
      ctx.lineWidth = 1;
      const bw = 25, bh = 12;
      for (let y = wall.y; y < wall.y + wall.height - 8; y += bh) {
        const offset = ((y - wall.y) / bh) % 2 === 0 ? 0 : bw / 2;
        for (let x = wall.x + offset; x < wall.x + wall.width; x += bw) {
          ctx.strokeRect(x, y, bw, bh);
        }
      }
    }

    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fillRect(wall.x, wall.y, wall.width, 3);
  }
}

function renderBushBase(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  for (const bush of ARENA_MAP.bushes) {
    if (!isVisible(bush.x, bush.y, bush.radius * 2, cx, cy, w, h)) continue;

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(bush.x + 4, bush.y + bush.radius * 0.3, bush.radius * 1.1, bush.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark base
    ctx.fillStyle = COLORS.BUSH_DARK;
    ctx.beginPath();
    ctx.arc(bush.x, bush.y, bush.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderBushTop(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  for (const bush of ARENA_MAP.bushes) {
    if (!isVisible(bush.x, bush.y, bush.radius * 2, cx, cy, w, h)) continue;

    const sway = Math.sin(animationTime * EFFECTS.BUSH_WAVE_SPEED + bush.x * 0.1) * 2;

    // Main gradient
    const gradient = ctx.createRadialGradient(
      bush.x + sway - bush.radius * 0.3, bush.y - bush.radius * 0.3, 0,
      bush.x + sway, bush.y, bush.radius
    );
    gradient.addColorStop(0, COLORS.BUSH_HIGHLIGHT);
    gradient.addColorStop(0.5, COLORS.BUSH_LIGHT);
    gradient.addColorStop(1, COLORS.BUSH_DARK);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(bush.x + sway, bush.y, bush.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderTrees(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  for (const tree of ARENA_MAP.trees) {
    const baseSize = OBJECTS.TREE_BASE_SIZE * (0.7 + tree.size * 0.3);
    if (!isVisible(tree.x, tree.y, baseSize * 3, cx, cy, w, h)) continue;

    const sway = Math.sin(animationTime * EFFECTS.TREE_SWAY_SPEED + tree.x * 0.05) * (2 + tree.size);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(tree.x + 6, tree.y + baseSize * 0.4, baseSize * 1.1, baseSize * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    const tw = 12 + tree.size * 4;
    const th = 30 + tree.size * 15;

    // Trunk
    ctx.fillStyle = COLORS.TREE_TRUNK;
    ctx.beginPath();
    ctx.moveTo(tree.x - tw / 2, tree.y);
    ctx.lineTo(tree.x - tw / 3, tree.y - th);
    ctx.lineTo(tree.x + tw / 3, tree.y - th);
    ctx.lineTo(tree.x + tw / 2, tree.y);
    ctx.closePath();
    ctx.fill();

    // Trunk dark side
    ctx.fillStyle = COLORS.TREE_TRUNK_DARK;
    ctx.beginPath();
    ctx.moveTo(tree.x - tw / 2, tree.y);
    ctx.lineTo(tree.x - tw / 3, tree.y - th);
    ctx.lineTo(tree.x, tree.y - th);
    ctx.lineTo(tree.x - tw / 4, tree.y);
    ctx.closePath();
    ctx.fill();

    const foliageY = tree.y - th;
    
    // Foliage layers
    for (let layer = 2; layer >= 0; layer--) {
      const layerSize = baseSize * (1 - layer * 0.15);
      const ly = foliageY - layer * baseSize * 0.35;
      const ls = sway * (1 + layer * 0.2);

      const gradient = ctx.createRadialGradient(
        tree.x + ls - layerSize * 0.3, ly - layerSize * 0.3, 0,
        tree.x + ls, ly, layerSize
      );
      gradient.addColorStop(0, COLORS.TREE_LEAVES_LIGHT);
      gradient.addColorStop(0.6, COLORS.TREE_LEAVES_MID);
      gradient.addColorStop(1, COLORS.TREE_LEAVES_DARK);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(tree.x + ls, ly, layerSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderRocks(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  for (const rock of ARENA_MAP.rocks) {
    if (!isVisible(rock.x, rock.y, rock.size * 2, cx, cy, w, h)) continue;

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(rock.x + 3, rock.y + rock.size * 0.3, rock.size * 1.1, rock.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rock gradient
    const gradient = ctx.createRadialGradient(
      rock.x - rock.size * 0.3, rock.y - rock.size * 0.3, 0,
      rock.x, rock.y, rock.size
    );
    gradient.addColorStop(0, COLORS.ROCK_HIGHLIGHT);
    gradient.addColorStop(0.5, COLORS.ROCK_LIGHT);
    gradient.addColorStop(1, COLORS.ROCK_DARK);

    // Irregular shape
    ctx.fillStyle = gradient;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const variance = 0.8 + ((rock.variant + i) % 3) * 0.12;
      const px = rock.x + Math.cos(angle) * rock.size * variance;
      const py = rock.y + Math.sin(angle) * rock.size * variance;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.ellipse(rock.x - rock.size * 0.25, rock.y - rock.size * 0.25, rock.size * 0.25, rock.size * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderCrates(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  const size = OBJECTS.CRATE_SIZE;
  const half = size / 2;

  for (const crate of ARENA_MAP.crates) {
    if (crate.health <= 0) continue;
    if (!isVisible(crate.x, crate.y, size, cx, cy, w, h)) continue;

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(crate.x - half + 4, crate.y - half + 4, size, size);

    // Crate base
    ctx.fillStyle = COLORS.CRATE_DARK;
    ctx.fillRect(crate.x - half, crate.y - half, size, size);

    // Crate top
    ctx.fillStyle = COLORS.CRATE_WOOD;
    ctx.fillRect(crate.x - half, crate.y - half, size, size - 5);

    // Plank lines
    ctx.strokeStyle = COLORS.CRATE_DARK;
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
      const py = crate.y - half + i * (size - 5) / 3;
      ctx.beginPath();
      ctx.moveTo(crate.x - half + 2, py);
      ctx.lineTo(crate.x + half - 2, py);
      ctx.stroke();
    }

    // Metal bands
    ctx.fillStyle = "#555";
    ctx.fillRect(crate.x - half - 1, crate.y - half + 4, 3, size - 8);
    ctx.fillRect(crate.x + half - 2, crate.y - half + 4, 3, size - 8);

    // Highlight
    ctx.fillStyle = COLORS.CRATE_LIGHT;
    ctx.fillRect(crate.x - half + 2, crate.y - half + 2, size - 4, 3);
  }
}

function renderBullets(ctx: CanvasRenderingContext2D, bullets: Map<number, Bullet>, cx: number, cy: number, w: number, h: number): void {
  bullets.forEach((bullet) => {
    if (bullet.expired) return;
    if (!isVisible(bullet.position.x, bullet.position.y, 50, cx, cy, w, h)) return;

    for (let i = BULLET.TRAIL_LENGTH; i > 0; i--) {
      const tx = bullet.position.x - Math.cos(bullet.rotation) * i * 4;
      const ty = bullet.position.y - Math.sin(bullet.rotation) * i * 4;
      const alpha = (BULLET.TRAIL_LENGTH - i) / BULLET.TRAIL_LENGTH * 0.5;
      const size = BULLET.SIZE * (1 - i / BULLET.TRAIL_LENGTH * 0.5);
      ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
      ctx.beginPath();
      ctx.arc(tx, ty, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const glow = ctx.createRadialGradient(
      bullet.position.x, bullet.position.y, 0,
      bullet.position.x, bullet.position.y, BULLET.SIZE * 3
    );
    glow.addColorStop(0, "rgba(255, 200, 50, 0.8)");
    glow.addColorStop(0.5, "rgba(255, 150, 0, 0.3)");
    glow.addColorStop(1, "rgba(255, 100, 0, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(bullet.position.x, bullet.position.y, BULLET.SIZE * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(bullet.position.x, bullet.position.y, BULLET.SIZE, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffc832";
    ctx.beginPath();
    ctx.arc(bullet.position.x, bullet.position.y, BULLET.SIZE * 0.6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderPlayers(ctx: CanvasRenderingContext2D, players: Map<number, Player>, currentId: number, cx: number, cy: number, w: number, h: number): void {
  players.forEach((player) => {
    if (!isVisible(player.position.x, player.position.y, PLAYER.SIZE * 3, cx, cy, w, h)) return;

    const isCurrent = player.id === currentId;
    const colors = COLORS.PACMAN[player.id % COLORS.PACMAN.length];

    // Shadow
    ctx.fillStyle = COLORS.SHADOW;
    ctx.beginPath();
    ctx.ellipse(player.position.x + 3, player.position.y + PLAYER.SIZE * 0.4, PLAYER.SIZE * 0.9, PLAYER.SIZE * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pacman body with mouth animation
    const mouthAngle = Math.abs(Math.sin(animationTime * 0.015)) * 0.4;
    const rotation = player.rotation;

    ctx.save();
    ctx.translate(player.position.x, player.position.y);
    ctx.rotate(rotation);

    // Body gradient
    const bodyGradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, PLAYER.SIZE);
    bodyGradient.addColorStop(0, colors.body);
    bodyGradient.addColorStop(1, colors.outline);

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER.SIZE, mouthAngle, Math.PI * 2 - mouthAngle);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-2, -PLAYER.SIZE * 0.4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.eye;
    ctx.beginPath();
    ctx.arc(-1, -PLAYER.SIZE * 0.4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Health bar
    const barWidth = 50;
    const barHeight = 6;
    const barY = player.position.y - PLAYER.SIZE - 20;
    const healthPercent = player.health / (player.maxHealth || 100);

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.roundRect(player.position.x - barWidth / 2 - 2, barY - 2, barWidth + 4, barHeight + 4, 4);
    ctx.fill();

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(player.position.x - barWidth / 2, barY, barWidth, barHeight);

    const healthColor = healthPercent <= 0.3 ? COLORS.HEALTH_LOW : healthPercent <= 0.6 ? COLORS.HEALTH_MID : COLORS.HEALTH_HIGH;
    ctx.fillStyle = healthColor;
    ctx.fillRect(player.position.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(player.position.x - barWidth / 2, barY, barWidth * healthPercent, barHeight / 2);

    // Name
    const nameY = player.position.y - PLAYER.SIZE - 35;
    ctx.font = "bold 12px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillText(player.name, player.position.x + 1, nameY + 1);
    ctx.fillStyle = isCurrent ? "#ffd700" : "#fff";
    ctx.fillText(player.name, player.position.x, nameY);
  });
}

function renderBorder(ctx: CanvasRenderingContext2D): void {
  // Outer border
  ctx.strokeStyle = "#2d1810";
  ctx.lineWidth = 16;
  ctx.strokeRect(-8, -8, MAP.WIDTH + 16, MAP.HEIGHT + 16);

  // Middle border
  ctx.strokeStyle = "#4a2c17";
  ctx.lineWidth = 8;
  ctx.strokeRect(-4, -4, MAP.WIDTH + 8, MAP.HEIGHT + 8);

  // Inner border
  ctx.strokeStyle = "#6b3d1f";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, MAP.WIDTH, MAP.HEIGHT);
}

function renderMinimap(ctx: CanvasRenderingContext2D, state: GameState, canvasWidth: number, canvasHeight: number): void {
  const mapSize = 150;
  const mapX = canvasWidth - mapSize - 15;
  const mapY = 15;
  const scale = mapSize / MAP.WIDTH;
  const mapHeight = mapSize * (MAP.HEIGHT / MAP.WIDTH);

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.beginPath();
  ctx.roundRect(mapX - 4, mapY - 4, mapSize + 8, mapHeight + 8, 6);
  ctx.fill();

  // Map ground
  ctx.fillStyle = COLORS.GROUND_BASE;
  ctx.fillRect(mapX, mapY, mapSize, mapHeight);

  // Water
  ctx.fillStyle = COLORS.WATER_MID;
  for (const water of ARENA_MAP.water) {
    ctx.fillRect(mapX + water.x * scale, mapY + water.y * scale, water.width * scale, water.height * scale);
  }

  // Walls
  ctx.fillStyle = COLORS.WALL_STONE;
  for (const wall of ARENA_MAP.walls) {
    ctx.fillRect(mapX + wall.x * scale, mapY + wall.y * scale, wall.width * scale, wall.height * scale);
  }

  // Bushes
  ctx.fillStyle = COLORS.BUSH_MID;
  for (const bush of ARENA_MAP.bushes) {
    ctx.beginPath();
    ctx.arc(mapX + bush.x * scale, mapY + bush.y * scale, Math.max(bush.radius * scale, 3), 0, Math.PI * 2);
    ctx.fill();
  }

  // Players
  state.players.forEach((player) => {
    const colors = COLORS.PACMAN[player.id % COLORS.PACMAN.length];
    const isCurrent = player.id === state.playerId;
    const px = mapX + player.position.x * scale;
    const py = mapY + player.position.y * scale;

    ctx.fillStyle = isCurrent ? "#ffd700" : colors.body;
    ctx.beginPath();
    ctx.arc(px, py, isCurrent ? 5 : 4, 0, Math.PI * 2);
    ctx.fill();

    if (isCurrent) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // Border
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(mapX, mapY, mapSize, mapHeight);
}
