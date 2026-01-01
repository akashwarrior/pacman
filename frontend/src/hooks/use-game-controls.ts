"use client";

import { useEffect, type MutableRefObject } from "react";
import { BULLET, PLAYER, TIMING } from "@/lib/constants/game";
import { onLocalShoot } from "@/lib/game-juice";
import { playShoot, resumeGameAudio } from "@/lib/game-sounds";
import { socketManager } from "@/services/socket-manager";
import type { GameState } from "@/types";

const MOVEMENT_KEYS = new Set([
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "w",
  "a",
  "s",
  "d",
]);

function hasMovementInput(keys: Set<string>): boolean {
  for (const key of MOVEMENT_KEYS) {
    if (keys.has(key)) return true;
  }
  return false;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

function normalizeKey(event: KeyboardEvent): string {
  if (event.code === "Space") {
    return "space";
  }

  return event.key.toLowerCase();
}

export function useGameControls(stateRef: MutableRefObject<GameState>): void {
  useEffect(() => {
    const keysHeld = new Set<string>();
    let moveIntervalId: number | null = null;
    let fireIntervalId: number | null = null;

    const clearIntervals = () => {
      if (moveIntervalId !== null) {
        window.clearInterval(moveIntervalId);
        moveIntervalId = null;
      }

      if (fireIntervalId !== null) {
        window.clearInterval(fireIntervalId);
        fireIntervalId = null;
      }
    };

    const resetInputState = () => {
      keysHeld.clear();
      clearIntervals();
    };

    const sendMovement = () => {
      let x = 0;
      let y = 0;

      if (keysHeld.has("arrowup") || keysHeld.has("w")) {
        y -= PLAYER.SPEED;
      }
      if (keysHeld.has("arrowdown") || keysHeld.has("s")) {
        y += PLAYER.SPEED;
      }
      if (keysHeld.has("arrowleft") || keysHeld.has("a")) {
        x -= PLAYER.SPEED;
      }
      if (keysHeld.has("arrowright") || keysHeld.has("d")) {
        x += PLAYER.SPEED;
      }

      if (x !== 0 || y !== 0) {
        socketManager.send("Move", { position: { x, y } });
      }
    };

    const fire = () => {
      if (!keysHeld.has("space")) {
        return;
      }

      const currentPlayer = stateRef.current.players.get(stateRef.current.playerId);
      if (currentPlayer) {
        onLocalShoot(
          currentPlayer.position.x,
          currentPlayer.position.y,
          currentPlayer.rotation,
        );
        playShoot();
      }

      socketManager.send("Shoot", {});
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }

      resumeGameAudio();

      const key = normalizeKey(event);
      if (keysHeld.has(key)) {
        return;
      }

      keysHeld.add(key);

      if (key === "space") {
        event.preventDefault();

        fire();
        if (fireIntervalId === null) {
          fireIntervalId = window.setInterval(fire, BULLET.FIRE_INTERVAL);
        }
      }

      if (MOVEMENT_KEYS.has(key)) {
        event.preventDefault();

        if (moveIntervalId === null) {
          sendMovement();
          moveIntervalId = window.setInterval(
            sendMovement,
            TIMING.MOVEMENT_INTERVAL,
          );
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = normalizeKey(event);
      keysHeld.delete(key);

      if (key === "space" && fireIntervalId !== null) {
        window.clearInterval(fireIntervalId);
        fireIntervalId = null;
      }

      if (!hasMovementInput(keysHeld) && moveIntervalId !== null) {
        window.clearInterval(moveIntervalId);
        moveIntervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetInputState();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", resetInputState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", resetInputState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resetInputState();
    };
  }, [stateRef]);
}
