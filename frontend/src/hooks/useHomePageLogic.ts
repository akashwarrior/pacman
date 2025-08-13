import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { roomManager } from "@/services/roomManager";
import { toast } from "react-toastify";

type LoadingState = 'idle' | 'creating' | 'joining';

export function useHomePageLogic() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<string>("#3b82f6");
  const roomIdRef = useRef<HTMLInputElement>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  const handleCreateRoom = async () => {
    const name = nameRef.current?.value || "";
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoadingState('creating');
    try {
      const player = { Name: name.trim(), Color: colorRef.current };
      const roomId = await roomManager.createRoom(player, 0);
      if (roomId === null) {
        toast.error("Failed to create room. Please try again.");
        return;
      }
      toast.success("Room created successfully!");
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error('Create room error:', error);
      toast.error("An error occurred while creating the room");
      setLoadingState('idle');
    }
  };

  const handleJoinRoom = async () => {
    const name = nameRef.current?.value || "";
    const roomId = roomIdRef.current?.value || "";

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!roomId.trim() || isNaN(parseInt(roomId))) {
      toast.error("Please enter a valid room ID");
      return;
    }

    setLoadingState('joining');
    try {
      const player = { Name: name.trim(), Color: colorRef.current };
      const id = await roomManager.joinRoom(player, parseInt(roomId), 0);
      if (id === null) {
        toast.error("Room ID does not exist or is full");
      } else {
        toast.success("Successfully joined the room!");
        router.push(`/room/${id}`);
      }
    } catch (error) {
      console.error('Join room error:', error);
      toast.error("An error occurred while joining the room");
      setLoadingState('idle');
    }
  };

  return {
    nameRef,
    colorRef,
    roomIdRef,
    isLoading: loadingState !== 'idle',
    isCreating: loadingState === 'creating',
    isJoining: loadingState === 'joining',
    handleCreateRoom,
    handleJoinRoom,
  };
}
