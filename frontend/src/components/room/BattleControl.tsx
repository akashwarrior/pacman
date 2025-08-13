'use client'

import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Player } from '@/types/message';

interface BattleControlProps {
  players: Player[];
  isHost: boolean;
  canStart: boolean;
  onStartGame: () => void;
}

export function BattleControl({ players, isHost, canStart, onStartGame }: BattleControlProps) {
  const readyCount = players.filter(p => p.isReady || p.id === 0).length;

  if (isHost) {
    return (
      <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Play size={20} className="text-cyan-400" />
          Battle Control
        </h3>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{readyCount}/{players.length}</div>
            <div className="text-sm text-white/60">Warriors Ready</div>
          </div>

          <Button
            onClick={onStartGame}
            disabled={!canStart}
            size="lg"
            className={
              canStart
                ? "w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/30"
                : "w-full bg-white/10 text-white/40 cursor-not-allowed border-0"
            }
          >
            <Play size={18} />
            <span>Launch Battle</span>
          </Button>

          {!canStart && (
            <p className="text-xs text-white/60 text-center">
              Need at least 2 players and all must be ready
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Play size={20} className="text-cyan-400" />
        Battle Control
      </h3>

      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
        </div>
        <div>
          <p className="text-white font-medium">Waiting for Host</p>
          <p className="text-xs text-white/60">Host will launch when ready</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{readyCount}/{players.length}</div>
          <div className="text-sm text-white/60">Warriors Ready</div>
        </div>
      </div>
    </div>
  );
}