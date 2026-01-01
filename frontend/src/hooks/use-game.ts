"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { onLocalKill, onPlayerDamaged } from "@/lib/game-juice";
import { playHit, playHurt, playKill } from "@/lib/game-sounds";
import { socketManager } from "@/services/socket-manager";
import {
  createEmptyGameState,
  type GameState,
  type Player,
  type SocketConnectionState,
} from "@/types";
import { useGameControls } from "./use-game-controls";
import { useGameRenderLoop } from "./use-game-render-loop";

interface GameHudState {
  alivePlayers: number;
  currentPlayer: Player | null;
  isAwaitingSpawn: boolean;
  isMatchEnding: boolean;
  connectionState: SocketConnectionState;
}

const initialHudState: GameHudState = {
  alivePlayers: 0,
  currentPlayer: null,
  isAwaitingSpawn: true,
  isMatchEnding: false,
  connectionState: socketManager.connectionState,
};

export function useGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createEmptyGameState());
  const gameOverTimeoutRef = useRef<number | null>(null);
  const hasFinalizedRouteRef = useRef(false);
  const [hudState, setHudState] = useState<GameHudState>(initialHudState);

  useGameRenderLoop(canvasRef, stateRef);
  useGameControls(stateRef);

  useEffect(() => {
    const playerId = socketManager.playerId;
    if (playerId === null) {
      router.replace("/");
      return;
    }

    const syncHud = () => {
      const currentPlayer = stateRef.current.players.get(playerId) ?? null;
      const alivePlayers = Array.from(stateRef.current.players.values()).filter(
        (player) => player.health > 0,
      ).length;

      setHudState((previousState) => {
        if (
          previousState.currentPlayer === currentPlayer &&
          previousState.alivePlayers === alivePlayers
        ) {
          return previousState;
        }

        return {
          ...previousState,
          currentPlayer,
          alivePlayers,
        };
      });
    };

    stateRef.current = createEmptyGameState(playerId);

    const stopListeningToConnection = socketManager.onConnectionChange((state) => {
      setHudState((previousState) => {
        if (
          previousState.connectionState.status === state.status &&
          previousState.connectionState.reason === state.reason
        ) {
          return previousState;
        }

        const next: GameHudState = {
          ...previousState,
          connectionState: state,
        };

        if (
          hasFinalizedRouteRef.current &&
          (state.status === "disconnected" || state.status === "error")
        ) {
          next.isMatchEnding = true;
        }

        return next;
      });

      if (
        !hasFinalizedRouteRef.current &&
        (state.status === "disconnected" || state.status === "error")
      ) {
        hasFinalizedRouteRef.current = true;
        toast.error(state.reason ?? "Lost connection to match.");
        router.replace("/");
      }
    });

    const stopListeningToSpawn = socketManager.on("Spawn", ({ players }) => {
      stateRef.current = {
        playerId,
        players: new Map(players.map((p) => [p.id, p])),
        bullets: new Map(),
      };

      setHudState((previousState) => ({
        ...previousState,
        isAwaitingSpawn: false,
      }));

      syncHud();
    });

    const stopListeningToMove = socketManager.on("Move", ({ position, rotation }, id) => {
      if (typeof id !== "number") return;

      const player = stateRef.current.players.get(id);
      if (!player) return;

      const updatedPlayer = {
        ...player,
        ...(position ? { position } : {}),
        rotation: rotation ?? player.rotation,
      };

      stateRef.current.players.set(id, updatedPlayer);
      if (id === playerId) {
        syncHud();
      }
    });

    const stopListeningToShoot = socketManager.on("Shoot", ({ bullet }) => {
      if (bullet.expired) {
        stateRef.current.bullets.delete(bullet.id);
        return;
      }

      stateRef.current.bullets.set(bullet.id, bullet);
    });

    const stopListeningToHit = socketManager.on("Hit", ({ health }, id) => {
      if (typeof id !== "number") return;

      const player = stateRef.current.players.get(id);
      if (!player) return;

      const updatedPlayer = { ...player, health };
      stateRef.current.players.set(id, updatedPlayer);

      if (player.health > health) {
        const damage = player.health - health;
        const isCurrentPlayer = id === playerId;
        onPlayerDamaged(player.position.x, player.position.y, isCurrentPlayer, damage);

        if (isCurrentPlayer) {
          playHurt();
        } else {
          playHit();
        }
      }

      syncHud();
    });

    const stopListeningToKick = socketManager.on("Kick", ({ kills }, id) => {
      if (typeof id !== "number") return;

      if (id === playerId) {
        const score = (kills ?? 0) * 10;
        hasFinalizedRouteRef.current = true;
        setHudState((previousState) => ({
          ...previousState,
          isMatchEnding: true,
        }));
        gameOverTimeoutRef.current = window.setTimeout(() => {
          router.replace(`/game-over?score=${score}`);
        }, 500);
        return;
      }

      stateRef.current.players.delete(id);
      syncHud();
    });

    const stopListeningToKills = socketManager.on("Kills", ({ kills }, id) => {
      if (typeof id !== "number") return;

      const player = stateRef.current.players.get(id);
      if (!player) return;

      const updatedPlayer = { ...player, kills };
      stateRef.current.players.set(id, updatedPlayer);

      if (id === playerId && kills > player.kills) {
        onLocalKill(updatedPlayer.position.x, updatedPlayer.position.y);
        playKill();
      }

      if (id === playerId) {
        syncHud();
      }
    });

    return () => {
      if (gameOverTimeoutRef.current !== null) {
        window.clearTimeout(gameOverTimeoutRef.current);
      }

      stopListeningToConnection();
      stopListeningToSpawn();
      stopListeningToMove();
      stopListeningToShoot();
      stopListeningToHit();
      stopListeningToKick();
      stopListeningToKills();
    };
  }, [router]);

  return {
    canvasRef,
    alivePlayers: hudState.alivePlayers,
    currentPlayer: hudState.currentPlayer,
    isAwaitingSpawn: hudState.isAwaitingSpawn,
    connectionState: hudState.connectionState,
    isMatchEnding: hudState.isMatchEnding,
  };
}
