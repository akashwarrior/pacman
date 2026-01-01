"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white">
        <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/20 bg-black/75 p-6 text-center backdrop-blur-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200/80">
              Application Error
            </p>
            <p className="mt-3 text-sm text-white/85">
              Something went wrong while rendering this page.
            </p>
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={reset}
                className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                Retry
              </button>
              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/15 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Return Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
