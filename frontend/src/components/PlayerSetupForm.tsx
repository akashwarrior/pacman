"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createRoom, joinRoom } from "@/services/api";
import { PACMAN_COLORS } from "@/lib/constants/colors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, Loader2, Plus, Users } from "lucide-react";

type LoadingState = "idle" | "creating" | "joining";

export function PlayerSetupForm() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const roomIdRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<LoadingState>("idle");
  const [colorIndex, setColorIndex] = useState(0);

  const selectedColor = PACMAN_COLORS[colorIndex];
  const isLoading = loading !== "idle";

  const validateName = () => {
    const name = nameRef.current?.value?.trim();
    if (!name) {
      toast.error("Please enter your name");
      return null;
    }
    return name;
  };

  const handleCreate = async () => {
    const name = validateName();
    if (!name) return;

    setLoading("creating");
    const roomId = await createRoom(name, selectedColor.hex);

    if (roomId === null) {
      toast.error("Failed to create room");
      setLoading("idle");
      return;
    }

    toast.success("Room created!");
    router.push(`/room/${roomId}`);
  };

  const handleJoin = async () => {
    const name = validateName();
    if (!name) return;

    const roomIdValue = roomIdRef.current?.value?.trim();
    const roomId = roomIdValue ? parseInt(roomIdValue, 10) : NaN;

    if (!roomIdValue || isNaN(roomId)) {
      toast.error("Please enter a valid room ID");
      return;
    }

    setLoading("joining");
    const id = await joinRoom(name, selectedColor.hex, roomId);

    if (id === null) {
      toast.error("Room not found or is full");
      setLoading("idle");
      return;
    }

    toast.success("Joined room!");
    router.push(`/room/${id}`);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-2 sm:space-y-3">
        <label htmlFor="name" className="text-xs sm:text-sm font-medium text-white/90 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Player Name
        </label>
        <Input
          id="name"
          ref={nameRef}
          placeholder="Enter your name"
          maxLength={20}
          autoComplete="off"
          autoFocus
          disabled={isLoading}
          className="h-11 sm:h-12"
        />
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-white/80">Choose Color</span>
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg bg-black/30 border border-white/10">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor.hex }} />
            <span className="text-[10px] sm:text-xs text-white/70">{selectedColor.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {PACMAN_COLORS.map((color, i) => (
            <button
              key={color.hex}
              onClick={() => setColorIndex(i)}
              disabled={isLoading}
              className={cn(
                "h-11 sm:h-14 rounded-xl transition-all shadow-lg disabled:opacity-50",
                colorIndex === i
                  ? "ring-2 ring-blue-400/60 shadow-blue-500/25"
                  : "ring-1 ring-white/20 hover:ring-white/60"
              )}
              style={{ background: color.gradient }}
            >
              {colorIndex === i && (
                <div className="size-5 sm:size-7 rounded-full bg-black/40 flex items-center justify-center m-auto">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <Button 
          size="lg" 
          onClick={handleCreate} 
          disabled={isLoading} 
          className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base"
        >
          {loading === "creating" ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span className="font-semibold">{loading === "creating" ? "Creating..." : "Create Arena"}</span>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-black/80 px-3 sm:px-4 py-1 rounded-full text-white/50 text-[10px] sm:text-xs border border-white/10">
              or join existing
            </span>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <label htmlFor="roomId" className="text-xs sm:text-sm font-medium text-white/90 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Room Code
          </label>

          <div className="flex gap-2 sm:gap-3">
            <Input
              id="roomId"
              ref={roomIdRef}
              type="number"
              inputMode="numeric"
              placeholder="Room ID"
              disabled={isLoading}
              className="flex-1 h-11 sm:h-12 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button 
              variant="secondary" 
              onClick={handleJoin} 
              disabled={isLoading} 
              className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl"
            >
              {loading === "joining" ? <Loader2 className="animate-spin w-4 h-4" /> : <Users className="w-4 h-4" />}
              <span className="font-medium hidden sm:inline">{loading === "joining" ? "Joining..." : "Join"}</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isLoading}>
        <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent max-w-[280px] sm:max-w-sm">
          <DialogTitle className="sr-only">{loading === "creating" ? "Creating arena" : "Joining arena"}</DialogTitle>
          <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-white/10 px-4 sm:px-6 py-3 sm:py-4 shadow-2xl">
            <div className="flex items-center gap-3 text-white">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs sm:text-sm font-medium">{loading === "creating" ? "Creating arena..." : "Joining arena..."}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
