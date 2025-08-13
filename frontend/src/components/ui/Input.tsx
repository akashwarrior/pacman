import { cn } from "@/lib/utils"
import { forwardRef } from "react"

const CornerBorder = ({ className }: { className: string }) => {
  return (
    <div className={cn(
      "absolute w-3 h-3 border-cyan-400/0 transition-[border-color] duration-300",
      className
    )} />
  )
}

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative group">
        <div className={cn(
          "absolute -inset-0.5 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-50",
          "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-sm",
          "group-focus-within:opacity-75 group-focus-within:from-cyan-500/20 group-focus-within:via-blue-500/20 group-focus-within:to-indigo-500/20 group-hover:blur-sm"
        )} />

        <input
          type={type}
          className={cn(
            "relative flex w-full h-12 rounded-xl px-4 py-3 text-base font-medium",
            "bg-black/40 backdrop-blur-sm",
            "border border-white/20 hover:border-white/30",
            "text-white placeholder:text-white/50",
            "transition-all duration-300 transform-gpu",
            "focus-visible:outline-none focus-visible:border-cyan-400/60 focus-visible:ring-2 focus-visible:ring-cyan-400/20",
            "focus-visible:bg-black/60 focus-visible:scale-[1.01]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/20",
            "shadow-lg shadow-black/20",
            className
          )}
          ref={ref}
          {...props}
        />

        <CornerBorder className={cn(
          "top-0 left-0 border-l-2 border-t-2 rounded-tl-xl",
          "group-focus-within:border-cyan-400/60"
        )} />
        <CornerBorder className={cn(
          "top-0 right-0 border-r-2 border-t-2 rounded-tr-xl",
          "group-focus-within:border-cyan-400/60"
        )} />
        <CornerBorder className={cn(
          "bottom-0 left-0 border-l-2 border-b-2 rounded-bl-xl",
          "group-focus-within:border-cyan-400/60"
        )} />
        <CornerBorder className={cn(
          "bottom-0 right-0 border-r-2 border-b-2 rounded-br-xl",
          "group-focus-within:border-cyan-400/60"
        )} />
      </div>
    )
  }
)

Input.displayName = "Input";
export { Input };