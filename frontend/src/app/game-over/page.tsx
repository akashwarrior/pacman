"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Skull, Zap } from "lucide-react";
import { Suspense } from "react";

function GameOverContent() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const scoreParam = searchParams.get("score");
  const parsedScore = Number.parseInt(scoreParam ?? "", 10);
  const finalScore = Number.isFinite(parsedScore) && parsedScore > 0 ? parsedScore : 0;
  const kills = Math.floor(finalScore / 10);

  return (
    <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-10 text-white font-sans selection:bg-transparent sm:py-14">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm overflow-hidden rounded-4xl border border-white/8 bg-[#020306]/80 shadow-[0_32px_64px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
      >
        <div className="pointer-events-none absolute inset-0 rounded-4xl border border-white/5 mix-blend-overlay" />

        <div className="relative border-b border-white/5 px-6 pb-6 pt-10 text-center sm:px-8 sm:pb-8 sm:pt-12">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="size-1.5 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.75)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
              Match Ended
            </span>
            <div className="size-1.5 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.75)]" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Game Over
          </motion.h1>
          <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-white/45">
            Your signal was lost in the arena.
          </p>
        </div>

        <div className="relative space-y-8 px-6 py-8 sm:px-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Total Score
            </p>
            <p className="text-5xl font-bold tabular-nums tracking-tight text-white sm:text-6xl">
              {finalScore}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            <div className="flex flex-col items-center rounded-2xl border border-white/8 bg-white/3 p-5 text-center">
              <Skull className="mb-3 size-5 text-rose-400/50" strokeWidth={1.5} />
              <p className="text-2xl font-semibold tabular-nums text-white/95">{kills}</p>
              <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">
                Eliminations
              </p>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-white/8 bg-white/3 p-5 text-center">
              <Zap className="mb-3 size-5 text-sky-400/60" strokeWidth={1.5} />
              <p className="text-2xl font-semibold tabular-nums text-sky-400">{finalScore}</p>
              <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">
                Points
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button
              onClick={() => router.push("/")}
              className="h-14 w-full rounded-xl text-[15px] font-semibold tracking-wide text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-colors bg-white hover:bg-white/90"
            >
              <Home className="mr-2 size-4" strokeWidth={2.5} />
              Return to Base
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function GameOverFallback() {
  return (
    <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-10 sm:py-14">
      <div className="h-44 w-full max-w-sm animate-pulse rounded-4xl border border-white/8 bg-white/4" />
    </div>
  );
}

export default function GameOverPage() {
  return (
    <Suspense fallback={<GameOverFallback />}>
      <GameOverContent />
    </Suspense>
  );
}
