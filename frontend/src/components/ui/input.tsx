import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function CornerBorder({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "absolute size-3 border-transparent transition-all duration-300 group-focus-within:border-cyan-400/60",
        className
      )}
    />
  );
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        <div
          className={cn(
            "absolute -inset-0.5 rounded-xl transition-all duration-300 opacity-0",
            "bg-linear-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-sm",
            "group-hover:opacity-50 group-focus-within:opacity-75",
            "group-focus-within:from-cyan-500/20 group-focus-within:via-blue-500/20 group-focus-within:to-indigo-500/20"
          )}
        />
        
        <input
          type={type}
          ref={ref}
          data-slot="input"
          className={cn(
            "relative flex w-full h-12 rounded-xl px-4 py-3",
            "bg-black/40 backdrop-blur-sm",
            "border border-white/20 hover:border-white/30",
            "text-white placeholder:text-white/50",
            "transition-all duration-300",
            "focus-visible:bg-black/60 focus-visible:scale-[1.01]",
            "focus-visible:outline-none focus-visible:border-cyan-400/60",
            "focus-visible:ring-2 focus-visible:ring-cyan-400/20",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/20",
            "shadow-lg shadow-black/20",
            className
          )}
          {...props}
        />

        <CornerBorder className="top-0 left-0 border-l-2 border-t-2 rounded-tl-full" />
        <CornerBorder className="top-0 right-0 border-r-2 border-t-2 rounded-tr-full" />
        <CornerBorder className="bottom-0 left-0 border-l-2 border-b-2 rounded-bl-full" />
        <CornerBorder className="bottom-0 right-0 border-r-2 border-b-2 rounded-br-full" />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
