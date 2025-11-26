"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { GHOST_COLORS } from "@/lib/constants/colors";

// Background configuration
const PAC_COUNT = 3;
const GHOST_COUNT = 6;
const SAFE_MARGIN_PX = 50;
const STAR_COUNT = 100;

interface AnimationRefs {
  pacRefs: HTMLDivElement[];
  ghostRefs: HTMLDivElement[];
  animations: Animation[];
}

/**
 * Animated cosmic background component
 * Features floating Pacman characters, ghosts, and twinkling stars
 */
export function Background() {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const animationRefsRef = useRef<AnimationRefs>({
    pacRefs: [],
    ghostRefs: [],
    animations: [],
  });

  /**
   * Generate a random target position within safe bounds
   */
  const getRandomTarget = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = vw - SAFE_MARGIN_PX * 2;
    const maxY = vh - SAFE_MARGIN_PX * 2;
    return {
      x: (Math.random() - 0.5) * maxX,
      y: (Math.random() - 0.5) * maxY,
    };
  }, []);

  /**
   * Continuous floating animation for characters
   */
  const moveContinuous = useCallback(
    (element: HTMLDivElement, speed = 8) => {
      const { x, y } = getRandomTarget();
      const duration = (speed + Math.random() * 4) * 1000;
      const fromTransform = element.style.transform || "translate(-50%, -50%)";
      const toTransform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

      const animation = element.animate(
        [{ transform: fromTransform }, { transform: toTransform }],
        {
          duration,
          easing: "ease-in-out",
          fill: "forwards",
        }
      );

      animationRefsRef.current.animations.push(animation);

      animation.finished
        .then(() => {
          element.style.transform = toTransform;
          moveContinuous(element, speed);
        })
        .catch(() => {
          // Animation was cancelled, do nothing
        });
    },
    [getRandomTarget]
  );

  /**
   * Initial scatter animation before continuous movement
   */
  const scatterThenWander = useCallback(
    (element: HTMLDivElement, delayMs: number, baseSpeed: number) => {
      const { x, y } = getRandomTarget();
      const toTransform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

      const animation = element.animate(
        [
          { transform: element.style.transform || "translate(-50%, -50%)", opacity: 0.85 },
          { transform: toTransform, opacity: 1 },
        ],
        {
          duration: 900 + Math.random() * 600,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          delay: delayMs,
          fill: "forwards",
        }
      );

      animationRefsRef.current.animations.push(animation);

      animation.finished
        .then(() => {
          element.style.transform = toTransform;
          moveContinuous(element, baseSpeed);
        })
        .catch(() => {
          // Start continuous movement even if initial animation was cancelled
          moveContinuous(element, baseSpeed);
        });
    },
    [getRandomTarget, moveContinuous]
  );

  /**
   * Create star elements for the background
   */
  const createStars = useCallback(() => {
    const container = starsContainerRef.current;
    if (!container) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement("div");
      const size = Math.random() < 0.1 ? 2 : 1;

      Object.assign(star.style, {
        position: "absolute",
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "9999px",
        background: Math.random() < 0.2 ? "#dbeafe" : "#ffffff",
        opacity: `${0.7 + Math.random() * 0.25}`,
      });

      star.classList.add("animate-pulse-slow");
      fragment.appendChild(star);
    }

    container.appendChild(fragment);
  }, []);

  // Setup animations on mount
  useEffect(() => {
    const refs = animationRefsRef.current;

    // Start character animations
    refs.pacRefs.forEach((element, index) => {
      if (element) {
        scatterThenWander(element, index * 120, 5);
      }
    });

    refs.ghostRefs.forEach((element, index) => {
      if (element) {
        scatterThenWander(element, 200 + index * 120, 6);
      }
    });

    // Create stars
    createStars();

    // Cleanup function
    return () => {
      // Cancel all running animations
      refs.animations.forEach((animation) => {
        animation.cancel();
      });
      refs.animations = [];

      // Clear stars
      const container = starsContainerRef.current;
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [scatterThenWander, createStars]);

  /**
   * Store Pacman element reference
   */
  const setPacRef = useCallback((element: HTMLDivElement | null, index: number) => {
    if (element) {
      animationRefsRef.current.pacRefs[index] = element;
    }
  }, []);

  /**
   * Store Ghost element reference
   */
  const setGhostRef = useCallback((element: HTMLDivElement | null, index: number) => {
    if (element) {
      animationRefsRef.current.ghostRefs[index] = element;
    }
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#0b1020] via-[#070b16] to-black" />

      {/* Stars container */}
      <div ref={starsContainerRef} className="absolute inset-0" />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 60%, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Floating Pacman characters */}
      {Array.from({ length: PAC_COUNT }).map((_, index) => (
        <div
          key={`pac-${index}`}
          ref={(el) => setPacRef(el, index)}
          className="absolute left-1/2 top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2"
          style={{ transform: `translate(${(index - 1) * 80}px, ${(index - 1) * 40}px)` }}
        >
          <Image
            src="/pacman.png"
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 opacity-100 drop-shadow-glow"
          />
        </div>
      ))}

      {/* Floating Ghost characters */}
      {Array.from({ length: GHOST_COUNT }).map((_, index) => (
        <div
          key={`ghost-${index}`}
          ref={(el) => setGhostRef(el, index)}
          className="absolute left-1/2 top-1/2 w-7 h-7 -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(${(index - 3) * 50}px, ${(index - 3) * 30}px)`,
            filter: `drop-shadow(0 0 6px ${GHOST_COLORS[index]}80)`,
          }}
        >
          <GhostShape color={GHOST_COLORS[index]} />
        </div>
      ))}
    </div>
  );
}

/**
 * Ghost shape component using CSS
 */
function GhostShape({ color }: { color: string }) {
  return (
    <div className="relative w-full h-full">
      {/* Ghost body top */}
      <div
        className="absolute left-0 right-0 top-0 h-[60%] rounded-t-full"
        style={{ background: color }}
      />
      {/* Ghost body bottom (wavy) */}
      <div className="absolute left-0 right-0 bottom-0 h-[40%] flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex-1 h-full">
            <div
              className="w-full h-full rounded-b-full"
              style={{ background: color }}
            />
          </div>
        ))}
      </div>
      {/* Eyes */}
      <div className="absolute top-[20%] left-[22%] w-2 h-2 bg-white rounded-full" />
      <div className="absolute top-[20%] right-[22%] w-2 h-2 bg-white rounded-full" />
    </div>
  );
}
