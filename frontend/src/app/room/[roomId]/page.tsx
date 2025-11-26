"use client";

import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useRoom } from "@/hooks/useRoom";
import { Button } from "@/components/ui/button";
import { MIN_PLAYERS_TO_START } from "@/lib/constants/game";
import { Crown, Check, X, Users, Play, LogOut, Copy } from "lucide-react";

export default function RoomPage() {
  const { players, roomId, isHost, currentPlayer, toggleReady, startGame, kickPlayer, leave } = useRoom();

  const readyPlayers = players.filter(p => p.isReady).length;
  const allReady = readyPlayers === players.length;

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId.toString());
      toast.success("Room ID copied!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h1 className="text-lg sm:text-xl font-bold text-white">Game Lobby</h1>
              <button
                onClick={copyRoomId}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
              >
                <span className="text-blue-400 font-mono text-xs sm:text-sm">#{roomId}</span>
                <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/50" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{players.length}/{Math.max(players.length, MIN_PLAYERS_TO_START)} players</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 space-y-2 max-h-60 sm:max-h-80 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl border ${player.id === currentPlayer?.id
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-white/5 border-white/10"
                    }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.id === 0 && <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-white font-medium text-sm sm:text-base">{player.name}</span>
                        {player.id === currentPlayer?.id && (
                          <span className="text-[8px] sm:text-[10px] text-blue-400 bg-blue-500/20 px-1 sm:px-1.5 py-0.5 rounded">YOU</span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs text-white/40">{player.id === 0 ? "Host" : `Player ${player.id + 1}`}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs ${player.isReady
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/10 text-white/50"
                      }`}>
                      {player.isReady ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current animate-pulse" />}
                      <span className="hidden sm:inline">{player.isReady ? "Ready" : "Waiting"}</span>
                    </div>

                    {isHost && player.id !== 0 && (
                      <button
                        onClick={() => kickPlayer(player.id)}
                        className="p-1 sm:p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {players.length === 0 && (
              <div className="text-center py-8 text-white/30 text-sm">
                Waiting for players...
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t border-white/10 space-y-2 sm:space-y-3">
            {isHost ? (
              <Button
                onClick={startGame}
                disabled={!allReady}
                className="w-full h-10 sm:h-12 text-sm sm:text-base"
                size="lg"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                {allReady ? "Start Game" : `Need ${players.length - readyPlayers} more ready`}
              </Button>
            ) : (
              <Button
                onClick={toggleReady}
                variant={currentPlayer?.isReady ? "secondary" : "default"}
                className="w-full h-10 sm:h-12 text-sm sm:text-base"
                size="lg"
              >
                {currentPlayer?.isReady ? (
                  <>
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    Cancel Ready
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    Ready Up
                  </>
                )}
              </Button>
            )}

            {isHost && (
              <Button onClick={toggleReady} variant="secondary" className="w-full h-9 sm:h-10 text-sm">
                {currentPlayer?.isReady ? "Cancel Ready" : "Ready Up"}
              </Button>
            )}

            <Button
              onClick={leave}
              variant="ghost"
              className="w-full h-9 sm:h-10 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Leave Room
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
