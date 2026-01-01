"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PLAYER_COLOR_OPTIONS } from "@/lib/constants/colors";
import { cn } from "@/lib/utils";
import { createRoom, joinRoom, type RoomActionResult } from "@/services/room-api";

type LoadingState = "idle" | "creating" | "joining";

const VALID_NAME_REGEX = /^[A-Za-z0-9 _-]+$/;

export function PlayerSetupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<LoadingState>("idle");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");

  const selectedColor = PLAYER_COLOR_OPTIONS[selectedColorIndex];
  const isLoading = loading !== "idle";

  const trimmedName = useMemo(() => playerName.trim(), [playerName]);

  function getValidatedName(): string | null {
    if (!trimmedName) {
      toast.error("Please enter your name.");
      return null;
    }

    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters.");
      return null;
    }

    if (!VALID_NAME_REGEX.test(trimmedName)) {
      toast.error("Name can only contain letters, numbers, spaces, _ and -.");
      return null;
    }

    return trimmedName;
  }

  function getValidatedRoomId(): number | null {
    const roomId = Number.parseInt(roomIdInput.trim(), 10);

    if (!Number.isFinite(roomId) || roomId <= 0) {
      toast.error("Please enter a valid room ID.");
      return null;
    }

    return roomId;
  }

  async function runRoomAction(
    nextLoadingState: Exclude<LoadingState, "idle">,
    request: () => Promise<RoomActionResult>,
    successMessage: string,
  ): Promise<void> {
    if (isLoading) {
      return;
    }

    setLoading(nextLoadingState);

    try {
      const result = await request();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(successMessage);
      router.push(`/room/${result.roomId}`);
    } finally {
      setLoading("idle");
    }
  }

  async function handleCreate(): Promise<void> {
    const name = getValidatedName();
    if (!name) {
      return;
    }

    await runRoomAction(
      "creating",
      () => createRoom(name, selectedColor.hex),
      "Room created!",
    );
  }

  async function handleJoin(): Promise<void> {
    const name = getValidatedName();
    const roomId = getValidatedRoomId();

    if (!name || roomId === null) {
      return;
    }

    await runRoomAction(
      "joining",
      () => joinRoom(name, selectedColor.hex, roomId),
      "Joined room!",
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-2 sm:space-y-3">
        <label
          htmlFor="name"
          className="flex items-center gap-2 text-xs font-medium text-white/90 sm:text-sm"
        >
          <div className="size-1.5 rounded-full bg-blue-400" />
          Player Name
        </label>
        <Input
          id="name"
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleCreate();
            }
          }}
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
          <span className="text-xs font-medium text-white/80 sm:text-sm">
            Choose Color
          </span>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-2 py-1 sm:gap-2 sm:px-3">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <span className="text-[10px] text-white/70 sm:text-xs">
              {selectedColor.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {PLAYER_COLOR_OPTIONS.map((color, index) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => setSelectedColorIndex(index)}
              disabled={isLoading}
              className={cn(
                "h-11 rounded-xl shadow-lg transition-all disabled:opacity-50 sm:h-14",
                selectedColorIndex === index
                  ? "ring-2 ring-blue-400/60 shadow-blue-500/25"
                  : "ring-1 ring-white/20 hover:ring-white/60",
              )}
              style={{ background: color.gradient }}
            >
              {selectedColorIndex === index && (
                <div className="m-auto flex size-5 items-center justify-center rounded-full bg-black/40 sm:size-7">
                  <Check className="size-3 text-white sm:size-4" />
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
          disabled={isLoading || !trimmedName}
          className="h-12 w-full rounded-xl text-sm sm:h-14 sm:rounded-2xl sm:text-base"
        >
          {loading === "creating" ? (
            <Loader2 className="size-4 animate-spin sm:size-5" />
          ) : (
            <Plus className="size-4 sm:size-5" />
          )}
          <span className="font-semibold">
            {loading === "creating" ? "Creating..." : "Create Arena"}
          </span>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="relative flex justify-center">
            <span className="rounded-full border border-white/10 bg-black/80 px-3 py-1 text-[10px] text-white/50 sm:px-4 sm:text-xs">
              or join existing
            </span>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <label
            htmlFor="roomId"
            className="flex items-center gap-2 text-xs font-medium text-white/90 sm:text-sm"
          >
            <div className="size-1.5 rounded-full bg-blue-400" />
            Room ID
          </label>

          <div className="flex gap-2 sm:gap-3">
            <Input
              id="roomId"
              value={roomIdInput}
              onChange={(event) => setRoomIdInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleJoin();
                }
              }}
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Room ID"
              disabled={isLoading}
              className="h-11 flex-1 sm:h-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              variant="secondary"
              onClick={handleJoin}
              disabled={isLoading || !trimmedName || !roomIdInput.trim()}
              className="h-11 rounded-xl px-4 sm:h-12 sm:rounded-2xl sm:px-6"
            >
              {loading === "joining" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Users className="size-4" />
              )}
              <span className="hidden font-medium sm:inline">
                {loading === "joining" ? "Joining..." : "Join"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isLoading}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[280px] border-none bg-transparent p-0 sm:max-w-sm"
        >
          <DialogTitle className="sr-only">
            {loading === "creating" ? "Creating arena" : "Joining arena"}
          </DialogTitle>
          <div className="rounded-xl border border-white/10 bg-black/80 px-4 py-3 shadow-2xl backdrop-blur-sm sm:px-6 sm:py-4">
            <div className="flex items-center gap-3 text-white">
              <div className="size-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              <span className="text-xs font-medium sm:text-sm">
                {loading === "creating" ? "Creating arena..." : "Joining arena..."}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
