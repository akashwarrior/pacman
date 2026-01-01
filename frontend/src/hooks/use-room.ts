"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RoomPlayer, SocketConnectionState } from "@/types";
import {
  kickPlayer,
  leaveRoom,
  setReady,
  startGame,
} from "@/services/room-api";
import { socketManager } from "@/services/socket-manager";
import { MIN_PLAYERS_TO_START } from "@/lib/constants/game";

const ACTION_GUARD_MS = 800;

export function useRoom() {
  const router = useRouter();
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [connectionState, setConnectionState] = useState<SocketConnectionState>(
    socketManager.connectionState,
  );
  const [isTogglingReady, setIsTogglingReady] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const disconnectHandledRef = useRef(false);
  const readyResetTimerRef = useRef<number | null>(null);
  const startResetTimerRef = useRef<number | null>(null);

  const playerId = socketManager.playerId;
  const roomId = socketManager.roomId;
  const isHost = playerId === 0;

  const currentPlayer = useMemo(
    () => players.find((player) => player.id === playerId) ?? null,
    [playerId, players],
  );

  useEffect(() => {
    if (playerId === null || roomId === null) {
      router.replace("/");
      return;
    }

    const stopListeningToConnection = socketManager.onConnectionChange((state) => {
      setConnectionState(state);

      if (state.status === "connected") {
        disconnectHandledRef.current = false;
        return;
      }

      if (
        (state.status === "disconnected" || state.status === "error") &&
        !disconnectHandledRef.current
      ) {
        disconnectHandledRef.current = true;
        toast.error(state.reason ?? "Lost connection to room.");
        router.replace("/");
      }
    });

    const stopListeningToJoin = socketManager.on("Join", ({ players: nextPlayers }) => {
      setPlayers(nextPlayers);
    });

    const stopListeningToReady = socketManager.on("Ready", ({ isReady }, id) => {
      if (typeof id !== "number") return;

      if (readyResetTimerRef.current !== null && id === playerId) {
        window.clearTimeout(readyResetTimerRef.current);
        readyResetTimerRef.current = null;
        setIsTogglingReady(false);
      }

      setPlayers((previousPlayers) =>
        previousPlayers.map((player) =>
          player.id === id ? { ...player, isReady } : player,
        ),
      );
    });

    const stopListeningToStart = socketManager.on("Start", () => {
      if (startResetTimerRef.current !== null) {
        window.clearTimeout(startResetTimerRef.current);
        startResetTimerRef.current = null;
      }

      setIsStartingGame(false);
      router.push(`/game/${roomId}`);
    });

    const stopListeningToKick = socketManager.on("Kick", (_, id) => {
      if (typeof id !== "number") return;

      if (id === playerId) {
        toast.error("You were removed from the room");
        router.replace("/");
        return;
      }

      setPlayers((previousPlayers) =>
        previousPlayers.filter((player) => player.id !== id),
      );
    });

    return () => {
      if (readyResetTimerRef.current !== null) {
        window.clearTimeout(readyResetTimerRef.current);
      }

      if (startResetTimerRef.current !== null) {
        window.clearTimeout(startResetTimerRef.current);
      }

      stopListeningToConnection();
      stopListeningToJoin();
      stopListeningToReady();
      stopListeningToStart();
      stopListeningToKick();
    };
  }, [playerId, roomId]);

  const canStartGame =
    isHost &&
    players.length >= MIN_PLAYERS_TO_START &&
    players.every((player) => player.isReady);

  function toggleReady(): void {
    if (!currentPlayer || isTogglingReady || connectionState.status !== "connected") {
      return;
    }

    setIsTogglingReady(true);
    setReady(!currentPlayer.isReady);

    readyResetTimerRef.current = window.setTimeout(() => {
      setIsTogglingReady(false);
      readyResetTimerRef.current = null;
    }, ACTION_GUARD_MS);
  }

  function handleStartGame(): void {
    if (!canStartGame || isStartingGame || connectionState.status !== "connected") {
      return;
    }

    setIsStartingGame(true);
    startGame();

    startResetTimerRef.current = window.setTimeout(() => {
      setIsStartingGame(false);
      startResetTimerRef.current = null;
    }, ACTION_GUARD_MS);
  }

  function handleKickPlayer(id: number): void {
    if (!isHost || id === 0 || connectionState.status !== "connected") {
      return;
    }

    kickPlayer(id);
  }

  function handleLeave(): void {
    leaveRoom();
    router.replace("/");
  }

  return {
    players,
    roomId,
    isHost,
    currentPlayer,
    connectionState,
    isTogglingReady,
    isStartingGame,
    canStartGame,
    toggleReady,
    startGame: handleStartGame,
    kickPlayer: handleKickPlayer,
    leave: handleLeave,
  };
}
