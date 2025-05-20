import { useEffect, useCallback, useRef } from 'react';
import { BULLET_FIRE_INTERVAL, MOVEMENT_UPDATE_INTERVAL, PLAYER_SPEED } from '@/lib/constants/gameConfig';
import { roomManager } from '@/services/roomManager';

const pressedKeys = new Set<string>();

export function useGameControls() {
  const intervalRef = useRef<number>(0);
  const fireIntervalRed = useRef<number>(0);

  const updateMovement = useCallback(() => {
    const movement = { x: 0, y: 0 };

    if (pressedKeys.has('arrowup')) movement.y -= PLAYER_SPEED;
    if (pressedKeys.has('arrowdown')) movement.y += PLAYER_SPEED;
    if (pressedKeys.has('arrowleft')) movement.x -= PLAYER_SPEED;
    if (pressedKeys.has('arrowright')) movement.x += PLAYER_SPEED;

    if (movement.x === 0 && movement.y === 0) {
      return;
    }
    roomManager.movePlayer(movement);
  }, []);

  const fire = useCallback(() => {
    if (pressedKeys.has(' ')) {
      roomManager.shoot()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!pressedKeys.has(key)) {
        pressedKeys.add(key);
        if (key === ' ') {
          fire()
          fireIntervalRed.current = window.setInterval(fire, BULLET_FIRE_INTERVAL);
        }
        if (!intervalRef.current) {
          updateMovement();
          intervalRef.current = window.setInterval(updateMovement, MOVEMENT_UPDATE_INTERVAL);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pressedKeys.delete(key);

      if (!['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].some(k => pressedKeys.has(k))) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = 0;
        }
      }

      if (!pressedKeys.has(' ')) {
        if (fireIntervalRed.current) {
          clearInterval(fireIntervalRed.current);
          fireIntervalRed.current = 0;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      pressedKeys.clear();
    };
  }, [updateMovement, fire]);
}