"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { GhostShape } from "@/components/ghost-shape";
import { GHOST_COLORS } from "@/lib/constants/colors";

const PACMAN_OFFSETS = [-80, 0, 80] as const;
const GHOST_OFFSETS = [-150, -100, -50, 0, 50, 100] as const;
const SAFE_MARGIN_PX = 50;
const DESKTOP_STAR_COUNT = 260;
const MOBILE_STAR_COUNT = 160;

interface BackgroundAnimationState {
  animations: Set<Animation>;
  ghostRefs: Array<HTMLDivElement | null>;
  isMounted: boolean;
  pacmanRefs: Array<HTMLDivElement | null>;
}

export function AnimatedBackground() {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const animationStateRef = useRef<BackgroundAnimationState>({
    animations: new Set(),
    ghostRefs: [],
    isMounted: false,
    pacmanRefs: [],
  });

  const getRandomTarget = useCallback(() => {
    const maxX = window.innerWidth - SAFE_MARGIN_PX * 2;
    const maxY = window.innerHeight - SAFE_MARGIN_PX * 2;

    return {
      x: (Math.random() - 0.5) * maxX,
      y: (Math.random() - 0.5) * maxY,
    };
  }, []);

  const trackAnimation = useCallback((animation: Animation) => {
    const { animations } = animationStateRef.current;
    animations.add(animation);
    void animation.finished.finally(() => {
      animations.delete(animation);
    });
  }, []);

  const moveContinuously = useCallback(
    function continueMotion(element: HTMLDivElement, speed = 8) {
      if (!animationStateRef.current.isMounted) {
        return;
      }

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
        },
      );

      trackAnimation(animation);
      void animation.finished
        .then(() => {
          if (!animationStateRef.current.isMounted) {
            return;
          }

          element.style.transform = toTransform;
          continueMotion(element, speed);
        })
        .catch(() => {});
    },
    [getRandomTarget, trackAnimation],
  );

  const scatterThenWander = useCallback(
    (element: HTMLDivElement, delayMs: number, baseSpeed: number) => {
      const { x, y } = getRandomTarget();
      const toTransform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      const animation = element.animate(
        [
          {
            transform: element.style.transform || "translate(-50%, -50%)",
            opacity: 0.85,
          },
          { transform: toTransform, opacity: 1 },
        ],
        {
          duration: 900 + Math.random() * 600,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          delay: delayMs,
          fill: "forwards",
        },
      );

      trackAnimation(animation);
      void animation.finished
        .then(() => {
          if (!animationStateRef.current.isMounted) {
            return;
          }

          element.style.transform = toTransform;
          moveContinuously(element, baseSpeed);
        })
        .catch(() => {
          if (animationStateRef.current.isMounted) {
            moveContinuously(element, baseSpeed);
          }
        });
    },
    [getRandomTarget, moveContinuously, trackAnimation],
  );

  const createStars = useCallback(() => {
    const container = starsContainerRef.current;
    if (!container) {
      return;
    }

    const starCount =
      window.innerWidth < 640 ? MOBILE_STAR_COUNT : DESKTOP_STAR_COUNT;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < starCount; index += 1) {
      const star = document.createElement("div");
      const randomValue = Math.random();
      const size = randomValue < 0.06 ? 3 : randomValue < 0.22 ? 2 : 1;
      const isCool = Math.random() < 0.35;
      const alpha =
        size >= 3
          ? 0.55 + Math.random() * 0.35
          : 0.35 + Math.random() * 0.45;

      Object.assign(star.style, {
        position: "absolute",
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "9999px",
        background: isCool ? "rgb(200 220 255)" : "rgb(255 252 245)",
        boxShadow:
          size >= 2
            ? isCool
              ? "0 0 4px rgb(147 197 253 / 0.5)"
              : "0 0 3px rgb(255 255 255 / 0.45)"
            : "none",
        animationDelay: `${(Math.random() * 4).toFixed(2)}s`,
      });
      star.style.setProperty("--tw-a", String(alpha));
      star.classList.add("lobby-star-twinkle");
      fragment.appendChild(star);
    }

    container.replaceChildren(fragment);
  }, []);

  useEffect(() => {
    const animationState = animationStateRef.current;
    const starsContainer = starsContainerRef.current;
    animationState.isMounted = true;

    animationState.pacmanRefs.forEach((element, index) => {
      if (element) {
        scatterThenWander(element, index * 120, 5);
      }
    });

    animationState.ghostRefs.forEach((element, index) => {
      if (element) {
        scatterThenWander(element, 200 + index * 120, 6);
      }
    });

    createStars();

    return () => {
      animationState.isMounted = false;
      animationState.animations.forEach((animation) => animation.cancel());
      animationState.animations.clear();
      starsContainer?.replaceChildren();
    };
  }, [createStars, scatterThenWander]);

  const setPacmanRef = useCallback(
    (element: HTMLDivElement | null, index: number) => {
      animationStateRef.current.pacmanRefs[index] = element;
    },
    [],
  );

  const setGhostRef = useCallback(
    (element: HTMLDivElement | null, index: number) => {
      animationStateRef.current.ghostRefs[index] = element;
    },
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-[#0b1020] via-[#070b16] to-black" />
      <div ref={starsContainerRef} className="absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 60%, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {PACMAN_OFFSETS.map((xOffset, index) => (
        <div
          key={`pac-${index}`}
          ref={(element) => setPacmanRef(element, index)}
          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2"
          style={{ transform: `translate(${xOffset}px, ${(index - 1) * 40}px)` }}
        >
          <Image
            width={32}
            height={32}
            loading="eager"
            src="/pacman.webp"
            alt="Pacman"
            className="size-8 opacity-100 drop-shadow-glow"
          />
        </div>
      ))}

      {GHOST_OFFSETS.map((xOffset, index) => (
        <div
          key={`ghost-${index}`}
          ref={(element) => setGhostRef(element, index)}
          className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(${xOffset}px, ${(index - 3) * 30}px)`,
            filter: `drop-shadow(0 0 3px ${GHOST_COLORS[index]}66)`,
          }}
        >
          <GhostShape color={GHOST_COLORS[index]} />
        </div>
      ))}
    </div>
  );
}
