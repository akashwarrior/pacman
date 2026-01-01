import { Header } from "@/components/header";
import { PlayerSetupForm } from "@/components/player-setup-form";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="relative z-10 flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-6 sm:min-h-[calc(100vh-80px)] text-white font-sans">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="relative rounded-3xl border border-white/8 bg-[#020306]/60 p-6 sm:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] backdrop-blur-3xl transition-all">
            
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/5 mix-blend-overlay" />
            <p className="font-medium leading-relaxed text-white text-balance mb-6 w-full text-center">
              Engage in highly refined, real-time multiplayer combat.
            </p>
            
            <div className="relative z-10">
              <PlayerSetupForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
