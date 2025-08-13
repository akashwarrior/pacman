import Image from "next/image";

export function GameHeader({ msg }: { msg: string }) {
  return (
    <header className="relative z-10 flex items-center justify-between px-8 py-4 w-full">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70">
          <Image src="/pacman.png" alt="Pacman" width={28} height={28} />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent tracking-tight">
          Pacman
        </h1>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 backdrop-blur-sm rounded-full border border-blue-500/30">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <span className="text-sm text-cyan-300 font-medium">{msg}</span>
      </div>
    </header>
  );
}
