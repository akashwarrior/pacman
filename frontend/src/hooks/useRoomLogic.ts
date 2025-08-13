'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { roomManager } from '@/services/roomManager';
import { SOCKET_EVENT } from '@/types';
import { Payload, Player } from '@/types/message';
import { toast } from 'react-toastify';

export function useRoomLogic() {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = ({ players }: Payload) => {
    if (!players) return;
    setPlayers(players);
  };

  const handleReady = ({ isReady }: Payload, ID?: number) => {
    if (typeof ID !== 'number') return;
    setPlayers((prev) =>
      prev.map((p) => p.id === ID ? { ...p, isReady: isReady! } : p)
    );
  };

  const handleGameStart = () => {
    const roomId = params.roomId;
    if (roomId) {
      router.replace(`/game/${roomId}`);
    }
  };

  const handlePlayerKick = (_: Payload, ID?: number) => {
    if (roomManager.PlayerId === ID) {
      roomManager.leaveRoom();
      toast.info('You have been kicked from the room');
      router.replace('/');
      return;
    }
    setPlayers((prev) => prev.filter((p) => p.id !== ID));
    toast.info('A player has been kicked from the room');
  };

  const startGame = () => {
    try {
      roomManager.startGame();
    } catch (error) {
      console.error('Failed to start game:', error);
      toast.error('Failed to start the game');
    }
  };

  const kickPlayer = (playerId: number) => {
    try {
      if (!playerId) return;
      roomManager.kickPlayer(playerId);
    } catch (error) {
      console.error('Failed to kick player:', error);
      toast.error('Failed to kick player');
    }
  };

  const toggleReady = () => {
    try {
      const currentPlayer = players.find(p => p.id === roomManager.PlayerId);
      if (!currentPlayer) return;

      const isReady = !currentPlayer.isReady;
      roomManager.setPlayerReady({ isReady });
    } catch (error) {
      console.error('Failed to update ready status:', error);
      toast.error('Failed to update ready status');
    }
  };

  const leaveRoom = () => {
    roomManager.leaveRoom();
    router.push('/');
  };

  const backToHome = () => {
    router.replace('/');
  };

  useEffect(() => {
    const roomId = params?.roomId;

    if (!roomId || roomManager.PlayerId === null || Number.isNaN(Number(roomId))) {
      setError("Invalid room");
      return;
    }

    roomManager.onEvent(SOCKET_EVENT.JOIN, handleJoin);
    roomManager.onEvent(SOCKET_EVENT.READY, handleReady);
    roomManager.onEvent(SOCKET_EVENT.START, handleGameStart);
    roomManager.onEvent(SOCKET_EVENT.KICK, handlePlayerKick);

    return () => {
      roomManager.offEvent(SOCKET_EVENT.JOIN);
      roomManager.offEvent(SOCKET_EVENT.READY);
      roomManager.offEvent(SOCKET_EVENT.START);
      roomManager.offEvent(SOCKET_EVENT.KICK);
    };
  }, [params]);

  const roomId = params?.roomId || '';
  const hostPlayer = players.find(p => p.id === 0);
  const currentPlayer = players.find(p => p.id === roomManager.PlayerId);
  const readyCount = players.filter(p => p.isReady || p.id === 0).length;
  const canStart = players.length >= 2 && players.every((p) => p.isReady || p.id === 0);
  const isHost = roomManager.PlayerId === 0;

  return {
    players,
    error,
    roomId,
    hostPlayer,
    currentPlayer,
    readyCount,
    canStart,
    isHost,
    startGame,
    kickPlayer,
    toggleReady,
    leaveRoom,
    backToHome,
  };
}
