import { useState, useEffect } from 'react';
import { roomManager } from '@/services/roomManager';
import { GameState, SOCKET_EVENT } from '@/types';
import { useRouter } from 'next/navigation';
import { Payload } from '@/types/message';

export function useGameState() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    bullets: [],
    map: {
      grassPatches: [],
      obstacles: [],
    }
  });

  useEffect(() => {
    // SPAWN event
    roomManager.onEvent(SOCKET_EVENT.SPAWN, ({ map, players }: Payload) => {
      setGameState({
        map: map!,
        players: players!,
        bullets: [],
      });
    });

    // LEAVE event
    roomManager.onEvent(SOCKET_EVENT.KICK, (data, id) => {
      if (id === roomManager.PlayerId) {
        router.replace(`/game-over?ID=${id}&Kills=${data?.kills ?? 0}`);
        return;
      }
      setGameState((prev) => ({
        ...prev,
        players: prev.players.filter((player) => player.id !== Number(id)),
      }));
    });

    // SHOOT event
    roomManager.onEvent(SOCKET_EVENT.SHOOT, ({ bullet }: Payload) => {
      setGameState((prev) => {
        if (bullet?.expired) {
          return {
            ...prev,
            bullets: prev.bullets.filter((b) => b.id !== bullet.id),
          }
        }
        return {
          ...prev,
          bullets: prev.bullets.filter((b) => b.id !== bullet?.id).concat(bullet!),
        }
      });
    });

    // MOVE event
    roomManager.onEvent(SOCKET_EVENT.MOVE, ({ position, rotation, inGrass }: Payload, ID) => {
      if (rotation === undefined || inGrass === undefined) return;
      setGameState((prev) => {
        return { ...prev, players: prev.players.map((p) => p.id === ID ? { ...p, position, rotation, inGrass } : p) };
      });
    });

    // HIT event
    roomManager.onEvent(SOCKET_EVENT.HIT, ({ health }: Payload, ID) => {
      if (health === undefined) return;
      setGameState((prev) => {
        return { ...prev, players: prev.players.map((p) => p.id === ID ? { ...p, health } : p) };
      });
    });

    return () => {
      roomManager.offEvent(SOCKET_EVENT.SPAWN);
      roomManager.offEvent(SOCKET_EVENT.KICK);
      roomManager.offEvent(SOCKET_EVENT.SHOOT);
      roomManager.offEvent(SOCKET_EVENT.MOVE);
      roomManager.offEvent(SOCKET_EVENT.HIT);
    };
  }, [router]);

  return { gameState };
}