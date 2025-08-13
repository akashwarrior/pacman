"use client";

import { GameHeader } from "@/components/GameHeader";
import { PlayerSetupForm } from "@/components/home/PlayerSetupForm";
import { GameActions } from "@/components/home/GameActions";
import { useHomePageLogic } from "@/hooks/useHomePageLogic";

export default function HomePage() {
  const {
    nameRef,
    colorRef,
    roomIdRef,
    isLoading,
    isCreating,
    isJoining,
    handleCreateRoom,
    handleJoinRoom,
  } = useHomePageLogic();

  return (
    <>
      <GameHeader msg="Let's Go" />

      <main className="relative z-10 flex items-center justify-center px-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center space-y-3 mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  Pacman Arena
                </h2>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                Chomp through mazes, customize your Pacman, and outlast the ghosts.
              </p>
            </div>

            <div className={`space-y-6 transition-opacity duration-300 ${isLoading ? 'opacity-75' : 'opacity-100'}`}>
              <PlayerSetupForm 
                nameRef={nameRef} 
                colorRef={colorRef} 
                disabled={isLoading}
              />

              <GameActions
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                roomIdRef={roomIdRef}
                isLoading={isLoading}
                isCreating={isCreating}
                isJoining={isJoining}
              />
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-2xl flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm rounded-xl border border-white/10 px-6 py-4 shadow-2xl">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">
                      {isCreating ? 'Creating your arena...' : 'Joining arena...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}