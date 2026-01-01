"use client";

import { motion } from "motion/react";
import { useGame } from "@/hooks/use-game";
import { PLAYER } from "@/lib/constants/game";

export default function GamePage() {
  const {
    canvasRef,
    alivePlayers,
    currentPlayer,
    isAwaitingSpawn,
    isMatchEnding,
    connectionState,
  } = useGame();

  const health = currentPlayer?.health ?? 0;
  const healthPercent = Math.max(
    0,
    Math.min(100, (health / PLAYER.MAX_HEALTH) * 100),
  );
  const kills = currentPlayer?.kills ?? 0;
  const isSocketDown =
    connectionState.status === "disconnected" || connectionState.status === "error";
  const showConnectionIssue = isSocketDown && !isMatchEnding;

  const barClass =
    healthPercent > 60
      ? "bg-sky-400"
      : healthPercent > 30
        ? "bg-amber-400"
        : "bg-rose-500";

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#030408] selection:bg-transparent text-white font-sans">
      <canvas ref={canvasRef} className="relative z-1 block h-full w-full touch-none bg-transparent" />

      {isAwaitingSpawn && (
        <div className="absolute inset-0 z-7 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-center shadow-2xl">
            <div className="mx-auto mb-2 size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Syncing Arena
            </p>
          </div>
        </div>
      )}

      {isMatchEnding && (
        <div className="absolute inset-0 z-8 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div
            className="size-9 animate-spin rounded-full border-2 border-white/20 border-t-white/90"
            aria-busy
            aria-label="Loading"
          />
        </div>
      )}

      {showConnectionIssue && (
        <div className="absolute inset-0 z-8 flex items-center justify-center bg-black/55">
          <div className="rounded-2xl border border-rose-400/30 bg-black/70 px-5 py-4 text-center shadow-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200/80">
              Connection Lost
            </p>
            <p className="mt-2 text-xs text-white/80">
              {connectionState.reason ?? "Realtime network is unavailable."}
            </p>
          </div>
        </div>
      )}

      {healthPercent <= 30 && health > 0 && (
        <div
          className="pointer-events-none absolute inset-0 z-5 animate-pulse mix-blend-screen"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(220, 38, 38, 0.15) 100%)",
            animationDuration: "2s",
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-8">

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-start gap-4"
        >
          <div className="bg-white/30 backdrop-blur-xl border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl px-5 py-3 sm:px-6 sm:py-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/40 mb-1.5">
              Arena Sector
            </p>
            {currentPlayer ? (
              <div className="flex items-center gap-2.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: currentPlayer.color,
                    boxShadow: `0 0 12px ${currentPlayer.color}`
                  }}
                  aria-hidden
                />
                <span className="text-sm font-medium tracking-wide text-white/90">
                  {currentPlayer.name}
                </span>
              </div>
            ) : (
              <p className="text-sm text-white/40">Initiating splice...</p>
            )}
          </div>

          <div className="flex bg-white/3 backdrop-blur-xl border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl px-5 py-3 sm:px-6 sm:py-4 gap-6 sm:gap-8">
            <div className="flex flex-col items-end">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-0.5">Kills</dt>
              <dd className="text-base font-medium text-white/90">{kills}</dd>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex flex-col items-end">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-0.5">Active</dt>
              <dd className="text-base font-medium text-sky-400">{alivePlayers}</dd>
            </div>
          </div>
        </motion.header>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex flex-col items-center justify-end pb-2"
        >
          <div className="w-full max-w-md mx-auto relative group">
            <div className="flex justify-between items-end mb-2 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Integrity</span>
              <span className="text-[10px] font-mono tracking-wider text-white/60">
                {Math.round(healthPercent)}%
              </span>
            </div>

            <div className="h-1.5 w-full bg-white/6 rounded-full overflow-hidden shadow-inner flex relative">
              <motion.div
                className={`h-full relative rounded-full ${barClass}`}
                initial={{ width: "100%" }}
                animate={{ width: `${healthPercent}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="absolute inset-0 bg-white/20 blur-[2px]" />
              </motion.div>
            </div>

            <div className="absolute top-full left-0 right-0 h-4 mt-1 opacity-40 blur-xl pointer-events-none flex" style={{ mixBlendMode: "screen" }}>
              <motion.div
                className={`${barClass}`}
                animate={{ width: `${healthPercent}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
