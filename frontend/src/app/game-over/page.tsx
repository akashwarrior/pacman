import GameOver from "@/components/GameOver";
import { redirect } from "next/navigation";

export default async function GameOverPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const { ID: playerId, score } = await searchParams;

    if (!playerId || !score || Number.isNaN(Number(score)) || Number.isNaN(Number(playerId))) {
        redirect('/');
    }

    return <GameOver playerId={playerId} score={score} />
}