import { useEffect, useRef } from 'react';
import { renderGame } from '@/lib/renderer';
import { GameState } from '@/types';

export function useGameLoop(gameState: GameState) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (ctx) {
        renderGame(ctx, gameState);
      }
      frameIdRef.current = requestAnimationFrame(render);
    };

    frameIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameState]);

  return canvasRef;
}