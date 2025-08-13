'use client'
import { useEffect, useRef } from "react";
import Image from "next/image";

const GHOST_COLORS = ["#ff0000", "#00ffff", "#ffb8ff", "#ffb852", "#00ff00", "#ff69b4"];
const PAC_COUNT = 3;
const GHOST_COUNT = 6;
const SAFE_MARGIN_PX = 50;
const STAR_COUNT = 100;

export function GameBackground() {
  const starsRef = useRef<HTMLDivElement>(null);
  const pacRefs = useRef<HTMLDivElement[]>([]);
  const ghostRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = starsRef.current;
    if (!container) return;
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement("div");
      const size = Math.random() < 0.1 ? 2 : 1;
      star.style.position = "absolute";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.borderRadius = "9999px";
      star.style.background = Math.random() < 0.2 ? "#dbeafe" : "#ffffff";
      star.style.opacity = `${0.7 + Math.random() * 0.25}`;
      star.classList.add("animate-pulse-slow");
      fragment.appendChild(star);
    }
    container.appendChild(fragment);

    return () => {
      if (container) {
        container.textContent = "";
      }
    };
  }, []);

  useEffect(() => {
    const getRandomTarget = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxX = vw - SAFE_MARGIN_PX * 2;
      const maxY = vh - SAFE_MARGIN_PX * 2;
      return {
        x: (Math.random() - 0.5) * maxX,
        y: (Math.random() - 0.5) * maxY,
      };
    };

    const moveContinuous = (el: HTMLDivElement, speed = 8) => {
      const { x, y } = getRandomTarget();
      const duration = speed + Math.random() * 4;
      const fromTransform = el.style.transform || "translate(-50%, -50%)";
      const toTransform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      const anim = el.animate([
        { transform: fromTransform },
        { transform: toTransform }
      ], {
        duration: duration * 1000,
        easing: "ease-in-out",
        fill: "forwards"
      });
      anim.finished.then(() => {
        el.style.transform = toTransform;
        moveContinuous(el);
      }).catch(() => { });
    };

    const scatterThenWander = (el: HTMLDivElement, delayMs: number, baseSpeed: number) => {
      const { x, y } = getRandomTarget();
      const toTransform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      const anim = el.animate([
        { transform: el.style.transform || "translate(-50%, -50%)", opacity: 0.85 },
        { transform: toTransform, opacity: 1 }
      ], {
        duration: 900 + Math.random() * 600,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        delay: delayMs,
        fill: "forwards"
      });
      anim.finished.then(() => {
        el.style.transform = toTransform;
        moveContinuous(el, baseSpeed);
      }).catch(() => {
        moveContinuous(el, baseSpeed);
      });
    };

    pacRefs.current.forEach((el, i) => scatterThenWander(el, i * 120, 5));
    ghostRefs.current.forEach((el, i) => scatterThenWander(el, 200 + i * 120, 6));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1020] via-[#070b16] to-black" />

      <div ref={starsRef} className="absolute inset-0" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(1200px 600px at 50% 60%, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.85) 100%)"
        }}
      />

      {Array.from({ length: PAC_COUNT }).map((_, i) => (
        <div
          key={`pac-${i}`}
          ref={(el) => { if (el) pacRefs.current[i] = el; }}
          className="absolute left-1/2 top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2"
          style={{ transform: `translate(${(i - 1) * 80}px, ${(i - 1) * 40}px)`, willChange: "transform" }}
        >
          <Image src="/pacman.png" alt="" width={32} height={32} className="w-8 h-8 opacity-100 drop-shadow-glow" />
        </div>
      ))}

      {Array.from({ length: GHOST_COUNT }).map((_, i) => (
        <div
          key={`ghost-${i}`}
          ref={(el) => { if (el) ghostRefs.current[i] = el; }}
          className="absolute left-1/2 top-1/2 w-7 h-7 -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(${(i - 3) * 50}px, ${(i - 3) * 30}px)`,
            willChange: "transform",
            filter: `drop-shadow(0 0 6px ${GHOST_COLORS[i]}80)`
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute left-0 right-0 top-0 h-[60%] rounded-t-full"
              style={{ background: GHOST_COLORS[i], opacity: 1 }} />
            <div className="absolute left-0 right-0 bottom-0 h-[40%] flex">
              {Array.from({ length: 5 }).map((__, j) => (
                <div key={j} className="flex-1 h-full">
                  <div className="w-full h-full rounded-b-full" style={{ background: GHOST_COLORS[i], opacity: 1 }} />
                </div>
              ))}
            </div>
            <div className="absolute top-[20%] left-[22%] w-2 h-2 bg-white rounded-full" />
            <div className="absolute top-[20%] right-[22%] w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}