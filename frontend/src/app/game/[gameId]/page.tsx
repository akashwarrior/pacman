"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "@/hooks/useGame";
import { VIEWPORT, PLAYER } from "@/lib/constants/game";
import { Crosshair, Skull, Users, Zap, Shield } from "lucide-react";

export default function GamePage() {
  const { canvasRef, state, currentPlayer } = useGame();
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const health = currentPlayer?.health ?? 0;
  const healthPercent = (health / PLAYER.MAX_HEALTH) * 100;
  const kills = currentPlayer?.kills ?? 0;
  const alive = state.players.size;

  const healthColor = healthPercent > 60
    ? { bar: "#22c55e", glow: "rgba(34, 197, 94, 0.4)" }
    : healthPercent > 30
      ? { bar: "#eab308", glow: "rgba(234, 179, 8, 0.4)" }
      : { bar: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" };


  return (
    <div className="fixed inset-0 bg-[#0a0e17] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={VIEWPORT.WIDTH}
        height={VIEWPORT.HEIGHT}
        className="w-full h-full"
      />

      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center gap-1.5 sm:gap-2"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-sm rounded-lg border border-red-500/30 px-2 sm:px-3 py-1 sm:py-1.5">
            <Skull className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
            <span className="text-red-400 font-bold tabular-nums text-xs sm:text-sm">{kills}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-sm rounded-lg border border-emerald-500/30 px-2 sm:px-3 py-1 sm:py-1.5">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold tabular-nums text-xs sm:text-sm">{alive}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2"
        >
          <div
            className="relative bg-black/70 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 px-3 sm:px-4 py-2 sm:py-3"
            style={{ boxShadow: `0 0 20px ${healthColor.glow}` }}
          >
            <div className="flex items-center gap-2 sm:gap-4">
              <Shield
                className="w-5 h-5 sm:w-7 sm:h-7"
                style={{ color: healthColor.bar }}
                fill={health > 0 ? healthColor.bar : "transparent"}
                fillOpacity={0.3}
              />

              <div className="w-32 sm:w-56">
                <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                  <span className="text-[8px] sm:text-[10px] text-white/40 uppercase tracking-wider">Health</span>
                  <span className="text-[10px] sm:text-xs font-bold tabular-nums" style={{ color: healthColor.bar }}>
                    {health}/{PLAYER.MAX_HEALTH}
                  </span>
                </div>
                <div className="h-2 sm:h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${healthPercent}%` }}
                    style={{ backgroundColor: healthColor.bar }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 border-l border-white/10 pl-2 sm:pl-4">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 sm:w-1.5 h-3 sm:h-4 rounded-sm bg-blue-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-white/20" strokeWidth={1.5} />
        </div>

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-14 sm:bottom-20 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center gap-2 sm:gap-4 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div className="flex gap-0.5">
                    {["W", "A", "S", "D"].map((key) => (
                      <kbd key={key} className="px-1 sm:px-1.5 py-0.5 bg-white/10 rounded text-white/50 font-mono text-[8px] sm:text-[10px]">
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-white/30">Move</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-white/10" />
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <kbd className="px-1.5 sm:px-2 py-0.5 bg-white/10 rounded text-white/50 font-mono text-[8px] sm:text-[10px]">Space</kbd>
                  <span className="text-white/30">Fire</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden sm:block">
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-blue-500/20 rounded-br-2xl" />
          <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-blue-500/20 rounded-bl-2xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-blue-500/20 rounded-tr-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-blue-500/20 rounded-tl-2xl" />
        </div>

        {currentPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-sm rounded-full px-2.5 sm:px-4 py-1 sm:py-1.5 border border-white/10"
          >
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ring-2 ring-white/20" style={{ backgroundColor: currentPlayer.color }} />
            <span className="text-white/80 text-xs sm:text-sm font-medium">{currentPlayer.name}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
