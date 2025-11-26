"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { socketManager } from "@/services/socket";
import { leaveRoom, setReady, startGame, kickPlayer } from "@/services/api";
import { toast } from "sonner";

interface RoomPlayer {
  id: number;
  name: string;
  color: string;
  isReady: boolean;
}

export function useRoom() {
  const router = useRouter();
  const [players, setPlayers] = useState<RoomPlayer[]>([]);

  const playerId = socketManager.playerId;
  const roomId = socketManager.roomId;
  const isHost = playerId === 0;
  const currentPlayer = players.find(p => p.id === playerId);

  useEffect(() => {
    if (playerId === null || roomId === null) {
      router.replace("/");
      return;
    }

    const handleJoin = (data: Record<string, unknown>) => {
      const playerList = data.players as Array<{
        id: number;
        name: string;
        color: string;
        isReady: boolean;
      }> | undefined;
      
      if (!playerList) return;
      
      setPlayers(playerList.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        isReady: p.isReady ?? false,
      })));
    };

    const handleReady = (data: Record<string, unknown>, id?: number) => {
      if (id === undefined) return;
      const isReady = data.isReady as boolean | undefined;
      if (isReady === undefined) return;
      
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, isReady } : p));
    };

    const handleStart = () => {
      router.push(`/game/${roomId}`);
    };

    const handleKick = (_: Record<string, unknown>, id?: number) => {
      if (id === playerId) {
        toast.error("You were removed from the room");
        router.replace("/");
        return;
      }
      if (id !== undefined) {
        setPlayers(prev => prev.filter(p => p.id !== id));
      }
    };

    socketManager.on("Join", handleJoin);
    socketManager.on("Ready", handleReady);
    socketManager.on("Start", handleStart);
    socketManager.on("Kick", handleKick);

    return () => {
      socketManager.off("Join");
      socketManager.off("Ready");
      socketManager.off("Start");
      socketManager.off("Kick");
    };
  }, [router, playerId, roomId]);

  const toggleReady = () => {
    const current = players.find(p => p.id === playerId);
    if (current) {
      setReady(!current.isReady);
    }
  };

  const handleStartGame = () => {
    if (!isHost) return;
    const allReady = players.length >= 2 && players.every(p => p.isReady);
    if (allReady) startGame();
  };

  const handleKickPlayer = (id: number) => {
    if (isHost && id !== 0) kickPlayer(id);
  };

  const handleLeave = () => {
    leaveRoom();
    router.replace("/");
  };

  return {
    players,
    roomId,
    isHost,
    currentPlayer,
    toggleReady,
    startGame: handleStartGame,
    kickPlayer: handleKickPlayer,
    leave: handleLeave,
  };
}
