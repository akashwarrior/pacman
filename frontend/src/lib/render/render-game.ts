import type { GameState } from "@/types";
import { MAP } from "@/lib/constants/game";
import { renderCosmicBackdrop } from "@/lib/render/backdrop";
import { renderWorld } from "@/lib/render/scene";
import { getCameraShake, renderJuiceWorld } from "@/lib/game-juice";
import { renderArenaFrame, renderMinimap, renderPost } from "./ui-overlay";

function clampCamera(x: number, y: number, viewW: number, viewH: number): { cameraX: number; cameraY: number } {
  const maxX = Math.max(0, MAP.WIDTH - viewW);
  const maxY = Math.max(0, MAP.HEIGHT - viewH);
  return {
    cameraX: Math.max(0, Math.min(maxX, x)),
    cameraY: Math.max(0, Math.min(maxY, y)),
  };
}

function resolveCamera(
  state: GameState,
  viewW: number,
  viewH: number,
): { cameraX: number; cameraY: number } {
  const self = state.players.get(state.playerId);
  const pos = self?.position;
  if (pos) {
    return clampCamera(pos.x - viewW / 2, pos.y - viewH / 2, viewW, viewH);
  }

  const first = state.players.values().next().value;
  const fp = first?.position;
  if (fp) {
    return clampCamera(fp.x - viewW / 2, fp.y - viewH / 2, viewW, viewH);
  }

  return clampCamera(MAP.WIDTH / 2 - viewW / 2, MAP.HEIGHT / 2 - viewH / 2, viewW, viewH);
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
  timeMs: number,
): void {
  ctx.clearRect(0, 0, width, height);

  const { cameraX, cameraY } = resolveCamera(state, width, height);
  const { x: shakeX, y: shakeY } = getCameraShake();

  ctx.save();
  ctx.translate(-cameraX + shakeX, -cameraY + shakeY);

  renderCosmicBackdrop(ctx, cameraX, cameraY, width, height, timeMs);
  renderWorld(ctx, cameraX, cameraY, width, height, timeMs, state);
  renderJuiceWorld(ctx);
  renderArenaFrame(ctx);

  ctx.restore();

  renderMinimap(ctx, state, width);
  renderPost(ctx, width, height);
}
