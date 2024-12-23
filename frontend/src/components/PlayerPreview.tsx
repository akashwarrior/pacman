import { useEffect, useRef } from "react";
import { ColorPicker } from "./ColorPicker";
import { Input } from "./ui/Input";

export function PlayerPreview({ nameRef, colorRef }: { nameRef: React.RefObject<HTMLInputElement | null>, colorRef: React.RefObject<string> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const fireIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bulletsRef = useRef<{ x: number; y: number }[]>([]);

  const renderPlayer = (ctx: CanvasRenderingContext2D) => {
    const color = colorRef.current;
    const name = nameRef.current?.value || "Player";

    ctx.clearRect(0, 0, ctx.canvas.width, 80);

    // Draw player body
    ctx.beginPath()
    ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2 + 10, 20, 0, Math.PI * 2)
    ctx.fillStyle = color;
    ctx.fill()

    // Draw line for mouth
    ctx.beginPath()
    ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2 + 10)
    ctx.lineTo(ctx.canvas.width / 2 + 20, ctx.canvas.height / 2 + 10)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // remove bullets that are out of the canvas
    bulletsRef.current = bulletsRef.current.filter((b) => b.x < ctx.canvas.width);

    // Draw bullets
    bulletsRef.current.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      b.x += 2;
    });

    // Draw player name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillText(name, ctx.canvas.width / 2, ctx.canvas.height / 2 + 10 - 30);
    ctx.shadowBlur = 0;

    if (bulletsRef.current.length) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(() => renderPlayer(ctx));
    }
  };

  const handleMouseEnter = () => {
    if (fireIntervalRef.current) return;

    const canvas = canvasRef.current;
    let ctx = null;
    if (canvas) {
      ctx = canvas.getContext("2d");
    }
    fireIntervalRef.current = setInterval(() => {
      if (!ctx) return;
      bulletsRef.current.push({ x: ctx.canvas.width / 2 + 30, y: ctx.canvas.height / 2 + 10 });
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(() => renderPlayer(ctx));
    }, 120);
  };

  const handleMouseLeave = () => {
    if (fireIntervalRef.current) {
      clearInterval(fireIntervalRef.current);
      fireIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    animationRef.current = requestAnimationFrame(() => renderPlayer(ctx));

    return () => {
      handleMouseLeave();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (fireIntervalRef.current) {
        clearInterval(fireIntervalRef.current);
      }
      canvasRef.current?.remove();
      canvasRef.current = null;
      bulletsRef.current = [];
      animationRef.current = 0;
      fireIntervalRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-200" />
        <canvas
          ref={canvasRef}
          height={80}
          className="w-full rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl"
        />
      </div>
      <Input
        label="Your Name"
        ref={nameRef}
        onChange={() => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          animationRef.current = requestAnimationFrame(() => renderPlayer(ctx));
        }}
        className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 placeholder-white/20"
        placeholder="Enter your name"
      />
      <ColorPicker
        onChange={(color) => {
          colorRef.current = color;
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          animationRef.current = requestAnimationFrame(() => renderPlayer(ctx));
        }}
      />
    </div>
  );
}
