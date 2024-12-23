import { useState, useEffect } from 'react';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../constants/gameConfig';

export function useResponsiveCanvas() {
  const [viewport, setViewport] = useState<number>();

  useEffect(() => {
    function handleResize() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Add padding for UI elements (joystick, buttons)
      const padding = 32; // 16px padding on each side
      const availableWidth = screenWidth - padding;
      const availableHeight = screenHeight - padding;

      // Calculate the scale factor to fit the canvas to the available space
      const scaleX = availableWidth / VIEWPORT_WIDTH;
      const scaleY = availableHeight / VIEWPORT_HEIGHT;
      const scale = Math.min(scaleX, scaleY, 1); // Cap at 1 to prevent upscaling

      setViewport(scale);
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    if ('orientation' in screen) {
      screen.orientation.addEventListener('change', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if ('orientation' in screen) {
        screen.orientation.removeEventListener('change', handleResize);
      }
    };
  }, []);

  return viewport;
}