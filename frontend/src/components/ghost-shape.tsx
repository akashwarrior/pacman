"use client";

import { cn } from "@/lib/utils";

export function GhostShape({ color, className }: { color: string; className?: string }) {
  return (
    <div className={cn("relative size-full", className)}>
      <div className="absolute inset-x-0 top-0 h-[60%] rounded-t-full" style={{ background: color }} />
      <div className="absolute inset-x-0 bottom-0 flex h-[40%]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-full flex-1">
            <div className="h-full w-full rounded-b-full" style={{ background: color }} />
          </div>
        ))}
      </div>
      <div className="absolute left-[22%] top-[20%] size-2 rounded-full bg-white" />
      <div className="absolute right-[22%] top-[20%] size-2 rounded-full bg-white" />
    </div>
  );
}
