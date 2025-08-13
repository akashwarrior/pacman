'use client'

import { Player } from '@/types/message';
import { roomManager } from '@/services/roomManager';
import { Button } from '@/components/ui/button';
import { Crown, X } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-toastify';

interface PlayerListProps {
  players: Player[];
  onKickPlayer: (playerId: number) => void;
  onToggleReady: () => void;
}

export function PlayerList({ players, onKickPlayer, onToggleReady }: PlayerListProps) {
  const currentPlayerId = roomManager.PlayerId;

  const handleKick = (playerId: number) => {
    try {
      onKickPlayer(playerId);
    } catch (error) {
      console.error('Failed to kick player:', error);
      toast.error('Failed to kick player');
    }
  };

  return (
    <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Crown size={20} className="text-cyan-400" />
        Players ({players.length}/6)
      </h3>

      <div className="space-y-3">
        {players.map((player, index) => {
          const isHost = player.id === 0;
          const isCurrentPlayer = player.id === currentPlayerId;
          const canKick = currentPlayerId === 0 && !isCurrentPlayer;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 transition-colors duration-150 hover:bg-black/40 hover:border-white/20 px-3 py-2.5
                ${isCurrentPlayer ? "ring-1 ring-cyan-400/35" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base ring-1 ring-white/15"
                    style={{ backgroundColor: player.color }}
                    title={isCurrentPlayer ? "You" : player.name}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white text-sm">
                        {player.name}
                      </h4>
                      {isHost && (
                        <div title="Host">
                          <Crown size={14} className="text-yellow-300/90" />
                        </div>
                      )}
                      {isCurrentPlayer && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${player.isReady || isHost ? 'bg-emerald-400' : 'bg-white/30'
                      }`}
                    role="status"
                    title={player.isReady || isHost ? 'Ready' : 'Not ready'}
                  />

                  <div className="flex items-center gap-2">
                    {isCurrentPlayer && !isHost && (
                      <Button
                        onClick={onToggleReady}
                        size="sm"
                        className={
                          player.isReady
                            ? "bg-red-500/80 hover:bg-red-500 text-white border-0"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white border-0"
                        }
                      >
                        {player.isReady ? 'Cancel' : 'Ready'}
                      </Button>
                    )}

                    {canKick && (
                      <button
                        onClick={() => handleKick(player.id!)}
                        className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                        title={`Kick ${player.name}`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}