"use client";

import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="relative z-10 flex w-full items-center justify-between p-3 sm:p-4 sm:px-8">
      <Link
        href="/"
        prefetch={false}
        className="flex items-center gap-2 sm:gap-4"
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 sm:size-10">
          <Image
            width={24}
            height={24}
            src="/pacman.webp"
            alt="Pacman"
            className="sm:h-7 sm:w-7"
          />
        </div>
        <h1 className="bg-linear-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-xl font-bold text-transparent sm:text-3xl">
          Pacman
        </h1>
      </Link>

      <div className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2">
        <div className="size-1.5 animate-pulse rounded-full bg-green-400 sm:size-2" />
        <span className="text-xs font-medium text-blue-200 sm:text-sm">Online</span>
      </div>
    </header>
  );
}
