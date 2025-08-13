'use client';

import { Suspense } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GameHeader } from '@/components/GameHeader';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';
import GameOverLoading from './loading';

export default function GameOverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerId = searchParams.get('ID');
  const playerScore = searchParams.get('score');

  const isValidParams = playerId && playerScore &&
    !Number.isNaN(Number(playerId)) &&
    !Number.isNaN(Number(playerScore));

  if (!isValidParams) {
    router.replace('/');
    return null;
  }

  const returnHome = () => router.push('/');

  return (
    <Suspense fallback={<GameOverLoading />}>
      <GameHeader
        msg="Game Over"
      />

      <main className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 15,
                bounce: 0.5
              }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30"
            >
              <Trophy className="w-10 h-10 text-white drop-shadow-lg" />
            </motion.div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  Battle Complete!
                </h1>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
                Your cosmic battle has ended. Review your performance and challenge yourself again!
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Medal size={18} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Battle Statistics</h2>
            </div>

            <div className="space-y-5 text-lg">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80 font-medium">Warrior ID</span>
                <span className="font-bold text-white font-mono">#{playerId}</span>
              </div>

              <div className="relative">
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                <span className="text-white/80 font-medium">Final Score</span>
                <span className="font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                  {playerScore}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <Button
              variant="outline"
              onClick={returnHome}
              className="w-full bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 transition-all duration-300 py-5.5"
            >
              <ArrowLeft size={16} />
              <span>Return to Arena</span>
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </Suspense>
  );
}