'use client'

import { roomManager } from "@/services/roomManager";
import { Crown, Users, X, Sword, Shield } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SOCKET_EVENT } from "@/types";
import { Payload, Player } from "@/types/message";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3
        }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

function handleStart() {
    try {
        roomManager.startGame();
    } catch (error) {
        toast.error('Failed to start the game');
    }
};

function handleKick(ID: number) {
    try {
        if (!ID) return;
        roomManager.kickPlayer(ID);
    } catch (error) {
        toast.error('Failed to kick player');
    }
};

export default function Room() {
    const router = useRouter();
    const params = useParams<{ roomId: string[] }>();
    const [players, setPlayers] = useState<Player[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const roomId = params?.roomId?.[0];

        if (!roomId || roomManager.PlayerId === null || Number.isNaN(Number(roomId))) {
            setError("Invalid room");
            router.replace('/');
            return;
        }

        function handleJoin({ players }: Payload) {
            if (!players) return;
            setPlayers(players);
        };

        function handleReady({ isReady }: Payload, ID?: number) {
            if (!ID) return;
            setPlayers((prev) =>
                prev.map((p) => p.id === ID ? { ...p, isReady: isReady! } : p)
            );
        };

        function handleGameStart() {
            router.replace(`/game/${roomId}`);
        };

        function handlePlayerKick({ }, ID?: number) {
            if (roomManager.PlayerId === ID) {
                roomManager.leaveRoom();
                toast.info('You have been kicked from the room');
                router.replace('/');
                return;
            }
            setPlayers((prev) => prev.filter((p) => p.id !== ID));
            toast.info('A player has been kicked from the room');
        };

        // Setup event listeners
        roomManager.onEvent(SOCKET_EVENT.JOIN, handleJoin);
        roomManager.onEvent(SOCKET_EVENT.READY, handleReady);
        roomManager.onEvent(SOCKET_EVENT.START, handleGameStart);
        roomManager.onEvent(SOCKET_EVENT.KICK, handlePlayerKick);

        // Cleanup
        return () => {
            roomManager.offEvent(SOCKET_EVENT.JOIN);
            roomManager.offEvent(SOCKET_EVENT.READY);
            roomManager.offEvent(SOCKET_EVENT.START);
            roomManager.offEvent(SOCKET_EVENT.KICK);
        };
    }, [router, params]);

    const canStart = players.length >= 2 && players.every((p) => p.isReady || p.id === 0);

    if (error) {
        return (
            <div className="min-h-screen game-bg flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass p-6 rounded-lg text-destructive flex items-center space-x-3"
                >
                    <span>{error}</span>
                </motion.div>
            </div>
        );
    }

    if (players.length === 0) {
        return (
            <div className="min-h-screen game-bg flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass p-6 rounded-lg flex items-center space-x-3 text-glow"
                >
                    <div className="w-6 h-6 border-2 border-primary rounded-full border-t-transparent animate-spin" />
                    <span className="text-primary">Loading game room...</span>
                </motion.div>
            </div>
        );
    }

    function handleReady() {
        try {
            const currentPlayer = players.find(p => p.id === roomManager.PlayerId);
            if (!currentPlayer) return;

            const isReady = !currentPlayer.isReady;
            roomManager.setPlayerReady({ isReady });
        } catch (error) {
            toast.error('Failed to update ready status');
        }
    };

    return (
        <AnimatePresence>
            <div className="min-h-screen game-bg flex items-center justify-center p-4">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="relative max-w-2xl w-full"
                >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--neon-blue)] via-[var(--neon-purple)] to-[var(--neon-pink)] opacity-20 blur-2xl" />
                    <motion.div
                        variants={fadeInUp}
                        className="glass relative rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="p-8 space-y-8">
                            {/* Header */}
                            <div className="text-center space-y-2">
                                <h1 className="game-title text-3xl sm:text-4xl">
                                    {players[0]?.name}'s Arena
                                </h1>
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Shield className="w-4 h-4" />
                                    <span>Room ID: {params.roomId?.[0]}</span>
                                    <Shield className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Players Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {players.map((player) => {

                                    const isHost = player.id === 0;
                                    const isPlayer = player.id === roomManager.PlayerId;

                                    return <motion.div
                                        key={player.id}
                                        variants={fadeInUp}
                                        className={`glass relative rounded-lg transition-all duration-300 
                                            ${isHost || player.isReady ? "neon-border" : "border border-white/10"}
                                            ${isPlayer ? "ring-2 ring-primary/50" : ""}`}
                                    >
                                        <div className={`h-16 px-4 flex items-center justify-between m-auto w-full`}>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-3 h-3 rounded-full`}
                                                    style={{ backgroundColor: player.color! }}
                                                />
                                                <span className="font-medium text-glow">
                                                    {player.name}
                                                </span>
                                                {isHost && (
                                                    <Crown
                                                        size={16}
                                                        className="text-yellow-500 animate-float"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isHost ?
                                                    (!isPlayer && (
                                                        <button
                                                            onClick={() => handleKick(player.id!)}
                                                            className="p-1.5 text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )) : (isPlayer && (
                                                        <Button
                                                            onClick={handleReady}
                                                            className={`game-button text-sm ${player.isReady
                                                                ? "bg-destructive hover:bg-destructive/90"
                                                                : "bg-primary hover:bg-primary/90"
                                                                }`}
                                                        >
                                                            {player.isReady ? "Cancel" : "Ready"}
                                                        </Button>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </motion.div>
                                })}
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users size={20} />
                                    <span>{players.length} / 6 players</span>
                                </div>
                                {roomManager.PlayerId === 0 ? (
                                    <button
                                        onClick={handleStart}
                                        disabled={!canStart}
                                        className={`game-button ${canStart
                                            ? "bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)]"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Sword className={canStart ? "animate-pulse-glow" : ""} size={18} />
                                            <span>Start Battle</span>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="text-muted-foreground animate-pulse">
                                        Waiting for host to start...
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}