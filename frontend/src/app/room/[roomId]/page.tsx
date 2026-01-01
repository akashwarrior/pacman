"use client";

import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRoom } from "@/hooks/use-room";
import { Button } from "@/components/ui/button";
import { MAX_PLAYERS, MIN_PLAYERS_TO_START } from "@/lib/constants/game";
import {
  Crown,
  Check,
  X,
  Users,
  Play,
  LogOut,
  Copy,
  ChevronLeft,
  Hash,
  Loader2,
} from "lucide-react";

export default function RoomPage() {
  const {
    players,
    roomId,
    isHost,
    currentPlayer,
    connectionState,
    isTogglingReady,
    isStartingGame,
    canStartGame,
    toggleReady,
    startGame,
    kickPlayer,
    leave,
  } = useRoom();

  const readyPlayers = players.filter((p) => p.isReady).length;
  const missingReadyPlayers = Math.max(0, players.length - readyPlayers);
  const isConnected = connectionState.status === "connected";
  const missingPlayersToStart = Math.max(0, MIN_PLAYERS_TO_START - players.length);

  const copyRoomId = async () => {
    if (roomId) {
      try {
        await navigator.clipboard.writeText(roomId.toString());
        toast.success("Room ID copied!");
      } catch {
        toast.error("Failed to copy room ID");
      }
    }
  };

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-60px)] w-full flex-col items-center justify-center px-4 py-8 sm:min-h-[calc(100vh-80px)] text-white font-sans">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/50 transition-colors hover:text-white"
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
            Back to Base
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full overflow-hidden rounded-4xl border border-white/8 bg-[#020306]/80 shadow-[0_32px_64px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
        >
          <div className="pointer-events-none absolute inset-0 rounded-4xl border border-white/5 mix-blend-overlay" />

          <div className="relative border-b border-white/5 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
                  <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    Arena Lobby
                  </h1>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-white/40">
                  <Users className="size-4 text-white/30" strokeWidth={2} />
                  <span>
                    {players.length}/{MAX_PLAYERS} Enrolled <span className="mx-1.5 opacity-30">|</span> Min {MIN_PLAYERS_TO_START}
                  </span>
                </div>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Network: {connectionState.status}
                </p>
              </div>
              
              <button
                type="button"
                onClick={copyRoomId}
                className="group flex flex-col items-end gap-1"
              >
                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/2 px-3 py-1.5 transition-colors group-hover:bg-white/6">
                  <Hash className="size-3 text-white/30" strokeWidth={2.5} />
                  <span className="font-mono text-sm font-semibold tracking-wider text-white/90">{roomId}</span>
                </div>
                <div className="flex items-center gap-1.5 pr-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">Copy ID</span>
                  <Copy className="size-3 text-white/30" strokeWidth={2} />
                </div>
              </button>
            </div>
          </div>

          <div className="relative max-h-[45vh] space-y-2.5 overflow-y-auto p-4 sm:max-h-88 sm:p-6">
            <AnimatePresence mode="popLayout">
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: "easeOut" }}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 sm:p-4 transition-colors ${
                    player.id === currentPlayer?.id
                      ? "border-sky-500/30 bg-sky-500/4"
                      : "border-white/4 bg-white/2"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-white/10 sm:size-11 shadow-inner"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.id === 0 && <Crown className="size-4 text-white/90 drop-shadow-md" strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2.5">
                        <span className="truncate text-sm font-semibold text-white/90">{player.name}</span>
                        {player.id === currentPlayer?.id && (
                          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-sky-300">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-white/30 mt-0.5 font-medium">
                        {player.id === 0 ? "Host Commander" : `Operative ${player.id + 1}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {player.id === 0 && <div className="flex flex-col items-end gap-1">
                      {player.isReady ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="size-4" strokeWidth={2.5} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-white/30">
                          <span className="size-1.5 animate-pulse rounded-full bg-current" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Waiting</span>
                        </div>
                      )}
                    </div>}

                    {isHost && player.id !== 0 && (
                      <div className="ml-1 h-8 w-px bg-white/5" />
                    )}

                    {isHost && player.id !== 0 && (
                      <button
                        type="button"
                        onClick={() => kickPlayer(player.id)}
                        className="rounded-xl p-2 text-white/20 transition-colors hover:bg-rose-500/15 hover:text-rose-400"
                        aria-label="Remove player"
                      >
                        <X className="size-4" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {players.length === 0 && (
              <div className="py-14 text-center">
                <div className="mx-auto mb-3 size-6 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">Awaiting Connections</p>
              </div>
            )}
          </div>

          <div className="relative space-y-3 border-t border-white/5 p-5 sm:p-6 bg-white/1">
            {isHost ? (
              <Button 
                onClick={startGame} 
                disabled={!canStartGame || !isConnected || isStartingGame}
                className={`h-14 w-full rounded-xl text-sm font-semibold tracking-wide transition-all ${canStartGame && isConnected ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "bg-white/5 text-white/30"}`}
              >
                {isStartingGame ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" strokeWidth={2.5} />
                    Syncing Match
                  </>
                ) : canStartGame ? (
                  <>
                    <Play className="mr-2 size-4" strokeWidth={2.5} fill="currentColor" />
                    Commence Match
                  </>
                ) : (
                  missingPlayersToStart > 0
                    ? `Need ${missingPlayersToStart} More Operative${missingPlayersToStart > 1 ? "s" : ""}`
                    : `Waiting on ${missingReadyPlayers} Operatives`
                )}
              </Button>
            ) : (
              <Button
                onClick={toggleReady}
                disabled={!isConnected || isTogglingReady}
                className={`h-14 w-full rounded-xl text-sm font-semibold tracking-wide transition-all ${currentPlayer?.isReady ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"}`}
              >
                {isTogglingReady ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" strokeWidth={2.5} />
                    Updating Status
                  </>
                ) : currentPlayer?.isReady ? (
                  <>
                    <X className="mr-2 size-4" strokeWidth={2.5} />
                    Stand Down
                  </>
                ) : (
                  <>
                    <Check className="mr-2 size-4" strokeWidth={2.5} />
                    Ready Execution
                  </>
                )}
              </Button>
            )}

            {!isConnected && (
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-300/70">
                {connectionState.reason ?? "Realtime connection unavailable"}
              </p>
            )}

            <Button
              onClick={leave}
              variant="ghost"
              className="h-12 w-full text-xs font-semibold uppercase tracking-widest text-white/30 hover:bg-white/5 hover:text-white/70"
            >
              <LogOut className="mr-2 size-3.5" strokeWidth={2} />
              Disconnect
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
