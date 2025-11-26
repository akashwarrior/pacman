"use client";

import Image from "next/image";

export function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between p-3 sm:p-4 sm:px-8 w-full">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Image src="/pacman.png" alt="Pacman" width={24} height={24} className="sm:w-7 sm:h-7" />
        </div>
        <h1 className="text-xl sm:text-3xl font-bold bg-linear-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent">
          Pacman
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/30">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs sm:text-sm text-blue-200 font-medium">Online</span>
      </div>
    </header>
  );
}
