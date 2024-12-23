import { GameState } from '@/types';
import { PLAYER_SIZE, BULLET_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, MAP_WIDTH, MAP_HEIGHT } from '../constants/gameConfig';
import { roomManager } from '@/services/roomManager';

function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  y: number,
  health: number,
  maxHealth: number
) {
  const healthPercentage = (health / maxHealth);
  const width = 40;
  const height = 5;

  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.fillRect(-width / 2, y, width, height);

  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.fillRect(
    -width / 2,
    y,
    width * healthPercentage,
    height
  );
}

export function renderGame(ctx: CanvasRenderingContext2D, gameState: GameState) {
  const { players, bullets, map } = gameState;
  const player = players.find(p => p.id === roomManager.PlayerId);

  if (!player) {
    return;
  }

  const cameraX = Math.max(0, Math.min(player.position?.x! - VIEWPORT_WIDTH / 2, MAP_WIDTH - VIEWPORT_WIDTH));
  const cameraY = Math.max(0, Math.min(player.position?.y! - VIEWPORT_HEIGHT / 2, MAP_HEIGHT - VIEWPORT_HEIGHT));

  ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // Draw map background
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(cameraX, cameraY, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

  // Draw grass patches
  ctx.fillStyle = '#374151';
  map.grassPatches?.forEach((patch) => {
    // Only draw grass patches that are visible in the viewport
    if (
      patch.x! + patch.radius! > cameraX &&
      patch.x! - patch.radius! < cameraX + VIEWPORT_WIDTH &&
      patch.y! + patch.radius! > cameraY &&
      patch.y! - patch.radius! < cameraY + VIEWPORT_HEIGHT
    ) {
      ctx.beginPath();
      ctx.arc(patch.x!, patch.y!, patch.radius!, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw obstacles
  map.obstacles?.forEach((obstacle) => {
    // Only draw obstacles that are visible in the viewport
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
      gradient.addColorStop(0, '#4B5563');
      gradient.addColorStop(1, '#374151');

      ctx.fillStyle = gradient;
      ctx.fillRect(obstacle.x!, obstacle.y!, obstacle.width!, obstacle.height!);
    }
  });

  // Draw players
  players.forEach((player) => {
    // Only draw players that are visible in the viewport
    if (
      player.position?.x! + PLAYER_SIZE > cameraX &&
      player.position?.x! - PLAYER_SIZE < cameraX + VIEWPORT_WIDTH &&
      player.position?.y! + PLAYER_SIZE > cameraY &&
      player.position?.y! - PLAYER_SIZE < cameraY + VIEWPORT_HEIGHT
    ) {
      ctx.save();
      ctx.translate(player.position?.x!, player.position?.y!);
      ctx.rotate(player.rotation!);

      // Draw the player body (rotated)
      ctx.fillStyle = player.inGrass ? '#1F2937' : player.color!;
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // Player direction indicator (rotated)
      ctx.strokeStyle = player.inGrass ? '#374151' : '#1F2937';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(PLAYER_SIZE, 0);
      ctx.stroke();

      // Reset rotation for name and health bar
      ctx.rotate(-player.rotation!);

      // Draw player name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(player.name!, 0, -PLAYER_SIZE - 20);

      // Draw health bar
      drawHealthBar(
        ctx,
        -PLAYER_SIZE - 13,
        player.health!,
        100
      );

      ctx.restore();
    }
  });


  // Draw bullets
  ctx.fillStyle = '#F7E1AE';
  bullets.forEach((bullet) => {
    // Only draw bullets that are visible in the viewport
    if (
      bullet.position?.x! + BULLET_SIZE > cameraX &&
      bullet.position?.x! - BULLET_SIZE < cameraX + VIEWPORT_WIDTH &&
      bullet.position?.y! + BULLET_SIZE > cameraY &&
      bullet.position?.y! - BULLET_SIZE < cameraY + VIEWPORT_HEIGHT
    ) {


      ctx.save();
      ctx.translate(bullet.position?.x!, bullet.position?.y!);
      ctx.rotate(bullet.rotation!);

      const gradient = ctx.createLinearGradient(-BULLET_SIZE * 4, 0, 0, 0);
      gradient.addColorStop(0, 'rgba(255, 200, 0, 0)');
      gradient.addColorStop(1, 'rgba(255, 200, 0, 0.5)');

      ctx.beginPath();
      ctx.moveTo(-BULLET_SIZE * 4, 0);
      ctx.lineTo(0, BULLET_SIZE);
      ctx.lineTo(0, -BULLET_SIZE);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw bullet
      ctx.beginPath();
      ctx.arc(0, 0, BULLET_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = '#FFA500';
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = '#FFA500';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.restore();
    }
  });

  // Restore the context state
  ctx.restore();
}