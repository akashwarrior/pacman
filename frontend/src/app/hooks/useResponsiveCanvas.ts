import { useState, useEffect } from 'react';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../../lib/constants/gameConfig';

export function useResponsiveCanvas() {
  const [viewport, setViewport] = useState<{ scale: number; width: number; height: number }>({
    scale: 1,
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT
  });

  useEffect(() => {
    function handleResize() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight * 1.2;

      // Calculate scale to fit the screen while maintaining aspect ratio
      const scaleX = screenWidth / VIEWPORT_WIDTH;
      const scaleY = screenHeight / VIEWPORT_HEIGHT;
      const scale = Math.min(scaleX, scaleY);

      // For mobile (portrait), use a different scaling approach
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const isPortrait = screenHeight > screenWidth;

      if (isMobile && isPortrait) {
        // In portrait mode on mobile, use the width as the constraint
        const mobileScale = screenWidth / VIEWPORT_WIDTH;
        setViewport({
          scale: mobileScale,
          width: screenWidth,
          height: screenWidth * (VIEWPORT_HEIGHT / VIEWPORT_WIDTH)
        });
      } else {
        // For landscape and desktop, use normal scaling
        setViewport({
          scale,
          width: VIEWPORT_WIDTH * scale,
          height: VIEWPORT_HEIGHT * scale
        });
      }
    }

    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
}