import { GameState } from '@/types';
import { PLAYER_SIZE, BULLET_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, MAP_WIDTH, MAP_HEIGHT } from '@/lib/constants/gameConfig';
import { roomManager } from '@/services/roomManager';

export function renderGame(ctx: CanvasRenderingContext2D, gameState: GameState) {
  const { players, bullets, map } = gameState;
  const player = players.find(p => p.id === roomManager.PlayerId);

  if (!player) {
    return;
  }

  const cameraX = Math.max(0, Math.min(player.position!.x - VIEWPORT_WIDTH / 2, MAP_WIDTH - VIEWPORT_WIDTH));
  const cameraY = Math.max(0, Math.min(player.position!.y - VIEWPORT_HEIGHT / 2, MAP_HEIGHT - VIEWPORT_HEIGHT));

  ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // Draw map background with a gradient
  const bgGradient = ctx.createLinearGradient(cameraX, cameraY, cameraX, cameraY + VIEWPORT_HEIGHT);
  bgGradient.addColorStop(0, '#1a1c2c');
  bgGradient.addColorStop(1, '#16213e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(cameraX, cameraY, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

  // Draw grid with improved style
  ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
  ctx.lineWidth = 1;
  const gridSize = 100;

  // Draw vertical grid lines
  for (let x = gridSize; x < MAP_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, MAP_HEIGHT);
    ctx.stroke();
  }

  // Draw horizontal grid lines
  for (let y = gridSize; y < MAP_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(MAP_WIDTH, y);
    ctx.stroke();
  }

  // Draw map boundaries with glowing effect
  ctx.strokeStyle = "#4f46e5";
  ctx.lineWidth = 4;
  ctx.shadowColor = '#4f46e5';
  ctx.shadowBlur = 15;
  ctx.strokeRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  ctx.shadowBlur = 0;

  // Draw grass patches
  map.grassPatches?.forEach((patch) => {
    if (
      patch.x! + patch.radius! > cameraX &&
      patch.x! - patch.radius! < cameraX + VIEWPORT_WIDTH &&
      patch.y! + patch.radius! > cameraY &&
      patch.y! - patch.radius! < cameraY + VIEWPORT_HEIGHT
    ) {
      const grassGradient = ctx.createRadialGradient(
        patch.x!, patch.y!, 0,
        patch.x!, patch.y!, patch.radius!
      );
      grassGradient.addColorStop(0, 'rgba(55, 65, 81, 0.7)');
      grassGradient.addColorStop(1, 'rgba(55, 65, 81, 0.3)');
      ctx.fillStyle = grassGradient;
      ctx.beginPath();
      ctx.arc(patch.x!, patch.y!, patch.radius!, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw obstacles
  map.obstacles?.forEach((obstacle) => {
    if (
      obstacle.x! + obstacle.width! > cameraX &&
      obstacle.x! < cameraX + VIEWPORT_WIDTH &&
      obstacle.y! + obstacle.height! > cameraY &&
      obstacle.y! < cameraY + VIEWPORT_HEIGHT
    ) {
      const gradient = ctx.createLinearGradient(
        obstacle.x!,
        obstacle.y!,
        obstacle.x!,
        obstacle.y! + obstacle.height!
      );
      gradient.addColorStop(0, '#3730a3');
      gradient.addColorStop(1, '#312e81');
      ctx.fillStyle = gradient;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.fillRect(obstacle.x!, obstacle.y!, obstacle.width!, obstacle.height!);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(obstacle.x!, obstacle.y!, obstacle.width!, obstacle.height! * 0.1);
    }
  });

  // Draw players
  players.forEach((p) => {
    if (
      p.position!.x + PLAYER_SIZE > cameraX &&
      p.position!.x - PLAYER_SIZE < cameraX + VIEWPORT_WIDTH &&
      p.position!.y + PLAYER_SIZE > cameraY &&
      p.position!.y - PLAYER_SIZE < cameraY + VIEWPORT_HEIGHT
    ) {
      ctx.save();
      ctx.translate(p.position!.x, p.position!.y);
      ctx.rotate(p.rotation!);

      // Draw player body (Pac-Man style)
      const isCurrentPlayer = p.id === roomManager.PlayerId;
      const baseColor = isCurrentPlayer ? '#fcd34d' : p.color!;
      const mouthAngle = Math.PI / 4;

      ctx.fillStyle = p.inGrass ? 'rgba(31, 41, 55, 0.8)' : baseColor;
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_SIZE, mouthAngle / 2, 2 * Math.PI - mouthAngle / 2);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      if (isCurrentPlayer) {
        ctx.shadowColor = '#fcd34d';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw eye
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(PLAYER_SIZE / 3, -PLAYER_SIZE / 2, PLAYER_SIZE / 6, 0, Math.PI * 2);
      ctx.fill();

      // Reset rotation for name
      ctx.rotate(-p.rotation!);

      // Draw player name
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(p.name!, 0, -PLAYER_SIZE - 10);
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  });

  // Draw bullets
  bullets.forEach((bullet) => {
    if (
      bullet.position!.x + BULLET_SIZE > cameraX &&
      bullet.position!.x - BULLET_SIZE < cameraX + VIEWPORT_WIDTH &&
      bullet.position!.y + BULLET_SIZE > cameraY &&
      bullet.position!.y - BULLET_SIZE < cameraY + VIEWPORT_HEIGHT
    ) {
      ctx.save();
      ctx.translate(bullet.position!.x, bullet.position!.y);
      ctx.rotate(bullet.rotation!);

      // Draw bullet trail
      const gradient = ctx.createLinearGradient(-BULLET_SIZE * 6, 0, 0, 0);
      gradient.addColorStop(0, 'rgba(252, 211, 77, 0)');
      gradient.addColorStop(1, 'rgba(252, 211, 77, 0.6)');

      ctx.beginPath();
      ctx.moveTo(-BULLET_SIZE * 6, 0);
      ctx.lineTo(0, BULLET_SIZE * 1.5);
      ctx.lineTo(0, -BULLET_SIZE * 1.5);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw bullet
      ctx.beginPath();
      ctx.arc(0, 0, BULLET_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = '#fcd34d';
      ctx.shadowColor = '#fcd34d';
      ctx.shadowBlur = 15;
      ctx.fill();

      ctx.restore();
    }
  });

  ctx.restore();
}