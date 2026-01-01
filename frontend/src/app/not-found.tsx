import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/70 p-6 text-center backdrop-blur-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
          404 Not Found
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-white/70">
          The page you requested does not exist.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
