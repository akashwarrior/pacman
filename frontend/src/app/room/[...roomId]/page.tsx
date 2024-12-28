'use client'

import { roomManager } from "@/services/roomManager";
import { Crown, Users, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SOCKET_EVENT } from "@/types";
import { Payload, Player } from "../../../types/message";

export default function Room() {
    const router = useRouter();
    const { roomId } = useParams<{ roomId: string }>()
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        if (roomManager.PlayerId === null || Number.isNaN(Number(roomId[0]))) {
            router.replace('/');
        }

        const handleJoin = ({ players }: Payload) => {
            if (!players) return;
            setPlayers(players);
        };

        const handleReady = ({ isReady }: Payload, ID?: number) => {
            if (!ID || !isReady) return;
            setPlayers((prev) =>
                prev.map((p) => p.id === ID ? { ...p, isReady } : p)
            );
        };

        const handleGameStart = () => {
            router.replace(`/game/${roomId}`);
        };

        const handlePlayerKick = ({ }, ID?: number) => {
            if (roomManager.PlayerId === ID) {
                roomManager.leaveRoom();
                router.replace('/');
                return;
            }
            setPlayers((prev) => prev.filter((p) => p.id !== ID));
        };

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
    }, [router, roomId]);

    const handleReady = ({ isReady }: { isReady: boolean }) => {
        roomManager.setPlayerReady({ isReady });
    };

    const handleStart = () => {
        roomManager.startGame();
    };

    const handleKick = (ID: number) => {
        if (!ID) return;
        roomManager.kickPlayer(ID);
    };

    const canStart = players.length >= 2 && players.every((p) => p.isReady || p.id === 0);

    if (players.length === 0 && players !== null) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded">
                    {players === null ? "Room not found" : "Loading..."}
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
            <div className="relative max-w-2xl w-full">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-blue-500/20 to-blue-500/10 blur-xl" />
                <div className="backdrop-blur-2xl bg-white/[0.03] p-8 rounded-lg shadow-2xl w-full border-white/10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {players[0]?.name}
                        </h1>
                        <p className="text-gray-400">Room ID: {roomId}</p>
                    </div >

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {players.map((player, index) => (
                            <div
                                key={index}
                                className={`bg-white/[0.1] p-4 rounded-lg flex items-center justify-between ${player.isReady && "ring-2 ring-green-500"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full`}
                                        style={{ backgroundColor: player.color! }} />
                                    <span className="text-white font-medium">
                                        {player.name}
                                    </span>
                                    {player.id === 0 && (
                                        <Crown
                                            size={16}
                                            className="text-yellow-500"
                                        />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {player.id !== 0 && roomManager.PlayerId === 0 && (
                                        <button
                                            onClick={() => handleKick(player.id!)}
                                            className="p-1 text-red-500 hover:bg-red-500/10 rounded-full"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    {player.id === roomManager.PlayerId && player.id !== 0 && (
                                        <button
                                            onClick={() => handleReady({ isReady: !player.isReady })}
                                            className={`px-3 py-1 ${player.isReady
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-green-600 hover:bg-green-700"
                                                } text-white text-sm rounded`}
                                        >
                                            {player.isReady ? "Cancel" : "Ready"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-gray-400">
                            <Users size={20} className="inline mr-2" />
                            {players.length} / {6} players
                        </div>
                        {roomManager.PlayerId === 0 ? (
                            <button
                                onClick={handleStart}
                                disabled={!canStart}
                                className={`px-6 py-2 rounded font-medium 
                                        ${canStart
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Start Game
                            </button>
                        ) : (
                            <div className="text-gray-400">
                                Waiting for host to start...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}