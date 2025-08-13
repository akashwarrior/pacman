'use client'

import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/lib/constants/gameConfig";
import { useGameControls } from "@/hooks/useGameControls";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useGameState } from "@/hooks/useGameState";
import { useResponsiveCanvas } from "@/hooks/useResponsiveCanvas";
import { Button } from "@/components/ui/button";
import { roomManager } from "@/services/roomManager";
import { Volume2, VolumeX, Skull, Heart, Shield } from "lucide-react"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Game() {
    const { gameState } = useGameState();
    const canvasRef = useGameLoop(gameState);
    const viewport = useResponsiveCanvas();
    const [isPortrait, setIsPortrait] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const router = useRouter();
    useGameControls();

    useEffect(() => {
        if (roomManager.PlayerId === null) {
            router.replace('/');
        }
    }, [router])

    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    if (isPortrait) {
        return (
            <div className="min-h-screen game-bg flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass p-8 rounded-xl text-center space-y-4"
                >
                    <p className="text-xl text-foreground">Please rotate your device to landscape mode</p>
                    <div className="animate-[spin_4s_linear_infinite] text-4xl">📱</div>
                </motion.div>
            </div>
        );
    }

    const currentPlayer = gameState.players.find(p => p.id === roomManager.PlayerId);
    const healthPercentage = currentPlayer ? (currentPlayer.health / 100) * 100 : 0;

    return (
        <div className="game-bg fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden">
            <div
                className="relative rounded-md overflow-hidden"
                style={{
                    width: `${viewport.width}px`,
                    height: '95%',
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={VIEWPORT_WIDTH}
                    height={VIEWPORT_HEIGHT}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />

                <div
                    className="absolute inset-0 pointer-events-none"
                >
                    {/* Top HUD */}
                    <div className="flex justify-between items-center p-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass rounded-lg p-3 flex items-center gap-3"
                        >
                            <Skull className="w-5 h-5 text-red-500" />
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm text-muted-foreground">Kills</span>
                                <span className="text-xl font-bold text-red-500">
                                    {gameState.players.find(p => p.id === roomManager.PlayerId)?.kills || 0}
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-lg p-3 flex items-center gap-3"
                        >
                            <Shield className="w-5 h-5 text-green-500" />
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm text-muted-foreground">Alive</span>
                                <span className="text-xl font-bold text-green-500">
                                    {gameState.players.length}
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="pointer-events-auto glass hover:neon-border h-11 w-11 cursor-pointer transition-all duration-300"
                                onClick={() => setIsMuted(!isMuted)}
                            >
                                {isMuted ? (
                                    <VolumeX className="h-5 w-5 text-destructive" />
                                ) : (
                                    <Volume2 className="h-5 w-5 text-primary" />
                                )}
                            </Button>
                        </motion.div>
                    </div>

                    {/* Bottom HUD */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-0 left-0 right-0 p-4"
                    >
                        {/* Health bar */}
                        <div className="glass rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Heart fill="currentColor" className={`w-5 h-5 ${healthPercentage > 50 ? 'text-green-500' : healthPercentage > 25 ? 'text-yellow-500' : 'text-red-500'} ${healthPercentage <= 25 ? 'animate-pulse' : ''}`} />
                                    <span className="text-sm font-medium text-muted-foreground">Health</span>
                                </div>
                                <span className="text-sm font-bold">
                                    {currentPlayer?.health || 0}/100
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${healthPercentage}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        backgroundColor:
                                            healthPercentage > 50 ? "hsl(var(--neon-blue))" : healthPercentage > 25 ? "hsl(var(--neon-yellow))" : "hsl(var(--destructive))",
                                        boxShadow: `0 0 10px ${healthPercentage > 50 ? "hsl(var(--neon-blue))" :
                                            healthPercentage > 25 ? "hsl(var(--neon-yellow))" :
                                                "hsl(var(--destructive))"
                                            }`
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}