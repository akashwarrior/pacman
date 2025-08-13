import { GameHeader } from "@/components/GameHeader";
import { Trophy } from 'lucide-react';

export default function GameOverLoading() {
  return (
    <>
      <GameHeader msg="Game Over" />
      <main className="relative z-10 flex items-center justify-center px-4 min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="w-10 h-10 text-white drop-shadow-glow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                Loading Results...
              </h2>
              <p className="text-white/60 text-sm">Please wait while we fetch your battle stats</p>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-white/20 rounded w-3/4" />
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              <div className="flex justify-between items-center">
                <div className="h-4 bg-white/20 rounded w-1/3" />
                <div className="h-8 bg-white/20 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}