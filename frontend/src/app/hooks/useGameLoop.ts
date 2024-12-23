import { useEffect, useRef } from 'react';
import { renderGame } from '../utils/renderer';
import { GameState } from '@/types';

export function useGameLoop(gameState: GameState) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameIdRef.current = requestAnimationFrame(() => renderGame(ctx, gameState));

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [gameState]);

  return canvasRef;
}