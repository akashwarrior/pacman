"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PLAYER, BULLET, TIMING } from "@/lib/constants/game";
import { renderGame } from "@/lib/renderer";
import { socketManager } from "@/services/socket";
import type { GameState, Player, Bullet } from "@/types";

const MOVEMENT_KEYS = new Set(["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"]);

function createInitialState(): GameState {
  return {
    players: new Map(),
    bullets: new Map(),
    playerId: -1,
    isGameOver: false,
    time: 0,
  };
}

export function useGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const keysRef = useRef<Set<string>>(new Set());
  const [state, setState] = useState<GameState>(createInitialState);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const playerId = socketManager.playerId;
    if (playerId === null) {
      router.replace("/");
      return;
    }

    stateRef.current.playerId = playerId;

    const handleSpawn = (data: { players?: unknown[] }) => {
      if (!data.players) return;

      const players = new Map<number, Player>();
      for (const player of data.players as Player[]) {
        players.set(player.id, player);
        if (player.id === playerId) setCurrentPlayer(player);
      }

      stateRef.current = {
        ...stateRef.current,
        players,
        bullets: new Map(),
      };
      setState({ ...stateRef.current });
    };

    const handleMove = (data: { position?: { x: number; y: number }; rotation?: number }, id?: number) => {
      if (id === undefined || !data.position) return;

      const player = stateRef.current.players.get(id);
      if (!player) return;

      const updated = {
        ...player,
        position: data.position,
        rotation: data.rotation ?? player.rotation,
      };
      stateRef.current.players.set(id, updated);
      if (id === playerId) setCurrentPlayer(updated);
      setState({ ...stateRef.current });
    };

    const handleShoot = (data: { bullet?: Bullet }) => {
      if (!data.bullet?.position) return;

      const bullet: Bullet = {
        id: data.bullet.id,
        position: data.bullet.position,
        rotation: data.bullet.rotation,
        expired: data.bullet.expired,
        ownerId: playerId,
      };

      if (bullet.expired) {
        stateRef.current.bullets.delete(bullet.id);
      } else {
        stateRef.current.bullets.set(bullet.id, bullet);
      }
      setState({ ...stateRef.current });
    };

    const handleHit = (data: { health?: number }, id?: number) => {
      if (id === undefined || data.health === undefined) return;

      const player = stateRef.current.players.get(id);
      if (!player) return;

      const updated = { ...player, health: data.health };
      stateRef.current.players.set(id, updated);
      if (id === playerId) setCurrentPlayer(updated);
      setState({ ...stateRef.current });
    };

    const handleKick = (data: { kills?: number }, id?: number) => {
      if (id === undefined) return;

      if (id === playerId) {
        const score = (data.kills ?? 0) * 10;
        setTimeout(() => router.replace(`/game-over?score=${score}`), 500);
        return;
      }

      stateRef.current.players.delete(id);
      setState({ ...stateRef.current });
    };

    const handleKills = (data: { kills?: number }, id?: number) => {
      if (id === undefined || data.kills === undefined) return;

      const player = stateRef.current.players.get(id);
      if (!player) return;

      const updated = { ...player, kills: data.kills };
      stateRef.current.players.set(id, updated);
      if (id === playerId) setCurrentPlayer(updated);
      setState({ ...stateRef.current });
    };

    socketManager.on("Spawn", handleSpawn);
    socketManager.on("Move", handleMove);
    socketManager.on("Shoot", handleShoot);
    socketManager.on("Hit", handleHit);
    socketManager.on("Kick", handleKick);
    socketManager.on("Kills", handleKills);

    return () => {
      socketManager.off("Spawn");
      socketManager.off("Move");
      socketManager.off("Shoot");
      socketManager.off("Hit");
      socketManager.off("Kick");
      socketManager.off("Kills");
    };
  }, [router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    const render = () => {
      renderGame(ctx, stateRef.current, canvas.width, canvas.height);
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    let moveInterval: number | null = null;
    let fireInterval: number | null = null;

    const updateMovement = () => {
      const keys = keysRef.current;
      let x = 0, y = 0;

      if (keys.has("arrowup") || keys.has("w")) y -= PLAYER.SPEED;
      if (keys.has("arrowdown") || keys.has("s")) y += PLAYER.SPEED;
      if (keys.has("arrowleft") || keys.has("a")) x -= PLAYER.SPEED;
      if (keys.has("arrowright") || keys.has("d")) x += PLAYER.SPEED;

      if (x !== 0 || y !== 0) {
        socketManager.send("Move", { position: { x, y } });
      }
    };

    const fire = () => {
      if (keysRef.current.has(" ")) {
        socketManager.send("Shoot", {});
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keysRef.current.has(key)) return;
      keysRef.current.add(key);

      if (key === " ") {
        e.preventDefault();
        fire();
        fireInterval = window.setInterval(fire, BULLET.FIRE_INTERVAL);
      }

      if (MOVEMENT_KEYS.has(key) && moveInterval === null) {
        updateMovement();
        moveInterval = window.setInterval(updateMovement, TIMING.MOVEMENT_INTERVAL);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.delete(key);

      if (key === " " && fireInterval !== null) {
        clearInterval(fireInterval);
        fireInterval = null;
      }

      const hasMovement = Array.from(MOVEMENT_KEYS).some(k => keysRef.current.has(k));
      if (!hasMovement && moveInterval !== null) {
        clearInterval(moveInterval);
        moveInterval = null;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (moveInterval) clearInterval(moveInterval);
      if (fireInterval) clearInterval(fireInterval);
      keysRef.current.clear();
    };
  }, []);

  return { canvasRef, state, currentPlayer };
}