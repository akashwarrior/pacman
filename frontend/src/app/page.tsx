import { Header } from "@/components/header";
import { PlayerSetupForm } from "@/components/PlayerSetupForm";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="relative z-10 flex items-center justify-center px-4 py-6 min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-8 shadow-2xl">
            <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                  Pacman Arena
                </h2>
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              </div>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed px-2">
                Battle other Pacmen in real-time multiplayer arenas
              </p>
            </div>
            <PlayerSetupForm />
          </div>
        </div>
      </main>
    </>
  );
}
