"use client";

import { useLayoutEffect } from "react";
import { stepJuice } from "@/lib/game-juice";
import { renderGame } from "@/lib/render/render-game";
import type { GameState } from "@/types";

export function useGameRenderLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  stateRef: React.RefObject<GameState>,
): void {
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context =
      canvas.getContext("2d", { desynchronized: true, alpha: true }) ??
      canvas.getContext("2d");
    if (!context) return;

    const viewport = {
      width: Math.max(320, Math.floor(window.innerWidth)),
      height: Math.max(320, Math.floor(window.innerHeight)),
    };

    const resizeCanvas = () => {
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      viewport.width = Math.max(320, Math.floor(window.innerWidth));
      viewport.height = Math.max(320, Math.floor(window.innerHeight));

      canvas.width = Math.floor(viewport.width * devicePixelRatio);
      canvas.height = Math.floor(viewport.height * devicePixelRatio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let frameId = 0;
    let isPaused = false;
    let lastFrameTime = performance.now();

    const renderFrame = (now: number) => {
      if (isPaused) {
        frameId = window.requestAnimationFrame(renderFrame);
        return;
      }

      const deltaTime = Math.min(48, now - lastFrameTime);
      lastFrameTime = now;

      stepJuice(deltaTime);
      renderGame(context, stateRef.current, viewport.width, viewport.height, now);
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      lastFrameTime = performance.now();
    };

    frameId = window.requestAnimationFrame(renderFrame);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.cancelAnimationFrame(frameId);
    };
  }, [canvasRef, stateRef]);
}
