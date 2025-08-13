import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Users, Plus, Loader2, Sparkles, Zap } from "lucide-react";

interface GameActionsProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  roomIdRef: React.RefObject<HTMLInputElement | null>;
  isLoading: boolean;
  isCreating: boolean;
  isJoining: boolean;
}

export function GameActions({
  onCreateRoom,
  onJoinRoom,
  roomIdRef,
  isLoading,
  isCreating,
  isJoining
}: GameActionsProps) {
  return (
    <div className="space-y-4">
      <Button
        onClick={onCreateRoom}
        disabled={isLoading}
        size="lg"
        className={`w-full transition-all duration-300 ${isCreating
            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
            : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
          } text-white border-0 shadow-lg ${isCreating ? "shadow-green-500/30" : "shadow-cyan-500/30"
          }`}
      >
        {isCreating ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span className="font-semibold">Creating Arena...</span>
            <Sparkles className="animate-pulse" size={16} />
          </>
        ) : (
          <>
            <Plus size={20} />
            <span className="font-semibold">Create New Arena</span>
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-black/80 backdrop-blur-sm px-4 py-1 rounded-full text-cyan-300/80 text-xs border border-cyan-400/20">
            or join existing arena
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <label htmlFor="lobbyCode" className="text-sm font-medium text-white/90">
            Arena Code
          </label>
        </div>

        <div className="flex gap-3">
          <Input
            id="lobbyCode"
            ref={roomIdRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter arena code"
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={onJoinRoom}
            disabled={isLoading}
            variant="secondary"
            className={`transition-all duration-300 ${isJoining
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white border-0"
                : "bg-white/10 border-white/20 text-white/90 hover:bg-white/20"
              }`}
          >
            {isJoining ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span className="font-medium">Joining...</span>
                <Zap className="animate-pulse" size={14} />
              </>
            ) : (
              <>
                <Users size={18} />
                <span className="font-medium">Join</span>
              </>
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-cyan-300 text-sm">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>
                {isCreating ? "Setting up your battle arena..." : "Connecting to arena..."}
              </span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}