import { LazyMotion, domAnimation } from "motion/react";
import * as motion from "motion/react-m";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import { ColorPicker } from "@/components/ColorPicker";
import { Users, GamepadIcon } from "lucide-react";

interface PlayerPreviewProps {
  nameRef: React.RefObject<HTMLInputElement | null>;
  colorRef: React.RefObject<string>;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export function PlayerPreview({ nameRef, colorRef }: PlayerPreviewProps) {
  const handleColorChange = (color: string) => {
    if (colorRef.current) {
      colorRef.current = color;
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-10 max-w-xl mx-auto">
        <motion.div
          variants={fadeInUp}
          className="space-y-4"
        >
          <label htmlFor="playerName" className="flex items-center gap-2 text-base">
            Your Name
            <div className="size-2 rounded-full bg-[var(--neon-blue)] animate-pulse-glow" />
          </label>
          <Input
            id="playerName"
            ref={nameRef as React.RefObject<HTMLInputElement>}
            type="text"
            autoComplete="off"
            placeholder="Enter your name to begin"
            className="h-14 text-base font-medium tracking-wide bg-transparent!"
            maxLength={20}
            autoFocus
          />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="space-y-8"
        >
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-lg">
              Choose Your Color
              <div className="size-2 rounded-full bg-[var(--neon-purple)] animate-pulse-glow" />
            </label>
            <ColorPicker onChange={handleColorChange} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="glass flex items-center gap-3 p-4 hover:neon-border transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[var(--gradient-2)] animate-pulse-slow animate-ping" />
                <span className="text-sm text-muted-foreground font-medium">Online</span>
              </div>
              <span className="text-lg font-bold flex items-center gap-2">
                <Users size={18} />
                <span className="text-[var(--neon-blue)]">{1}</span>
                <span className="text-base font-medium">Players</span>
              </span>
            </Card>

            <Card className="glass flex items-center gap-3 p-4 hover:neon-border transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[var(--gradient-4)] animate-pulse-slow animate-ping" />
                <span className="text-sm text-muted-foreground font-medium">Active</span>
              </div>
              <span className="text-lg font-bold flex items-center gap-2">
                <GamepadIcon size={18} />
                <span className="text-[var(--neon-purple)]">0</span>
                <span className="text-base font-medium">Games</span>
              </span>
            </Card>
          </div>
        </motion.div>
      </div>
    </LazyMotion>
  );
}
