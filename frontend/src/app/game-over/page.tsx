"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Skull, Zap } from "lucide-react";

export default function GameOverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const scoreParam = searchParams.get("score");

  const finalScore = Number(scoreParam) || 0;
  const kills = Math.floor(finalScore / 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 w-full max-w-sm m-4 bg-black/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden">
      <div className="bg-linear-to-r from-cyan-500/20 via-cyan-500/20 to-cyan-500/20 p-4 sm:p-6 text-center border-b border-white/10">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl sm:text-2xl font-bold text-white mb-1"
        >
          Game Over
        </motion.h1>
        <p className="text-white/50 text-sm">Battle Complete</p>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-4 sm:py-6"
        >
          <p className="text-xs sm:text-sm text-white/40 uppercase tracking-wider mb-2">Final Score</p>
          <div className="text-5xl sm:text-6xl font-bold tabular-nums bg-linear-to-r from-cyan-300 via-cyan-200 to-cyan-300 bg-clip-text text-transparent">
            {finalScore}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3 sm:gap-4"
        >
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center border border-white/5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{kills}</p>
            <p className="text-[10px] sm:text-xs text-white/40 uppercase">Eliminations</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center border border-white/5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{kills * 10}</p>
            <p className="text-[10px] sm:text-xs text-white/40 uppercase">Damage</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={() => router.push("/")}
            size="lg"
            className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-xl"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            Play Again
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}