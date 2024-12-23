'use client'

import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/app/constants/gameConfig";
import { useGameControls } from "@/app/hooks/useGameControls";
import { useGameLoop } from "@/app/hooks/useGameLoop";
import { useGameState } from "@/app/hooks/useGameState";
import { useResponsiveCanvas } from "@/app/hooks/useResponsiveCanvas";
import { roomManager } from "@/services/roomManager";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Game() {
    const { gameState } = useGameState();
    const canvasRef = useGameLoop(gameState);
    const scale = useResponsiveCanvas();
    const router = useRouter();
    useGameControls();

    useEffect(() => {
        if (roomManager.PlayerId === null) {
            router.replace('/');
        }
    }, [router])

    const isPortrait = window.innerHeight > window.innerWidth;

    if (isPortrait) {
        return (
            <div className="inset-0 bg-gray-900 flex items-center justify-center w-full h-full">
                <div className="text-white text-center p-4">
                    <p className="text-xl mb-4">Please rotate your device to landscape mode</p>
                    <div className="animate-[spin_4s_linear_infinite] text-4xl">📱</div>
                </div>
            </div>
        );
    }

    return (
        <div className="inset-0 bg-gray-900 flex items-center justify-center p-4 overflow-hidden w-full h-full">
            <canvas
                ref={canvasRef}
                width={VIEWPORT_WIDTH}
                height={VIEWPORT_HEIGHT}
                style={{ transform: `scale(${scale})` }}
                className="rounded-lg"
            />
        </div>
    );
}