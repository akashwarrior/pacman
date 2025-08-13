import { useEffect, useRef } from 'react';
import { renderGame } from '@/lib/renderer';
import { GameState } from '@/types';

export function useGameLoop(gameState: GameState) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIdRef = useRef<number>(0);
  const latestGameStateRef = useRef<GameState>(gameState);

  useEffect(() => {
    latestGameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (ctx) {
        renderGame(ctx, latestGameStateRef.current);
      }
      frameIdRef.current = requestAnimationFrame(render);
    };

    frameIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  return canvasRef;
}