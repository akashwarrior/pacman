'use client'

import Image from 'next/image';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useRoomLogic } from '@/hooks/useRoomLogic';
import { ErrorDisplay } from '@/components/room/ErrorDisplay';
import { PlayerList } from '@/components/room/PlayerList';
import { BattleControl } from '@/components/room/BattleControl';
import { Copy, Check, Gamepad2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

export default function Room() {
  const [copied, setCopied] = useState(false);
  const {
    players,
    error,
    roomId,
    hostPlayer,
    readyCount,
    canStart,
    isHost,
    startGame,
    kickPlayer,
    toggleReady,
    leaveRoom,
    backToHome,
  } = useRoomLogic();

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success('Room ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy room ID');
    }
  };

  if (error) {
    return <ErrorDisplay error={error} onBackToHome={backToHome} />;
  }

  return (
    <>
      <header className="relative z-10 flex items-center justify-between px-8 py-4 w-full">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70">
            <Image src="/pacman.png" alt="Pacman" width={28} height={28} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent tracking-tight">
            {hostPlayer?.name ? `${hostPlayer.name}'s Arena` : 'Battle Arena'}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button
            title="Copy room ID"
            onClick={copyRoomId}
            className="flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm rounded-full border border-blue-500/30 px-4 py-2"
          >
            <span className="font-mono text-cyan-300 font-medium">
              Room: {roomId}
            </span>
            <div className="text-cyan-300 hover:text-cyan-200 transition-colors">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </div>
          </button>
          <div className="flex items-center gap-2 bg-green-600/20 backdrop-blur-sm rounded-full border border-green-500/30 px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 font-medium">
              {players.length}/6 players
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                Cosmic Battle Arena
              </h2>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              {readyCount} of {players.length} warriors ready for battle
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PlayerList
                players={players}
                onKickPlayer={kickPlayer}
                onToggleReady={toggleReady}
              />
            </div>

            <div className="space-y-6">
              <BattleControl
                players={players}
                isHost={isHost}
                canStart={canStart}
                onStartGame={startGame}
              />

              <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                <Button
                  onClick={leaveRoom}
                  variant="outline"
                  className="w-full bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                >
                  <ArrowLeft size={16} />
                  Leave Arena
                </Button>
              </div>

              <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Gamepad2 size={20} className="text-cyan-400" />
                  How to Play
                </h3>
                <div className="space-y-3 text-sm text-white/80">
                  <p>🎮 Use WASD or arrow keys to move</p>
                  <p>⚡ Collect power-ups to grow stronger</p>
                  <p>🏆 Survive and defeat other players</p>
                  <p>👑 Last warrior standing wins!</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}