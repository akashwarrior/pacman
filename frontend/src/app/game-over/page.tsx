import { LazyMotion, domAnimation } from 'motion/react';
import * as motion from 'motion/react-m';
import { Trophy, RotateCcw } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function GameOverPage({ searchParams }: { searchParams: Promise<{ ID: string, score: string }> }) {
    const searchParam = await searchParams;
    const playerId = searchParam.ID;
    const score = searchParam.score;

    if (!playerId || !score || Number.isNaN(playerId) || Number.isNaN(score)) {
        redirect('/');
    }

    return (
        <LazyMotion features={domAnimation}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 z-50"
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
                    className="relative max-w-md w-full"
                >
                    {/* Glowing background effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--neon-blue)] via-[var(--neon-purple)] to-[var(--neon-pink)] opacity-20 blur-2xl animate-pulse-slow" />

                    <div className="glass border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                        {/* Trophy animation container */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                delay: 0.3,
                                type: 'spring',
                                bounce: 0.5
                            }}
                            className="relative w-24 h-24 mx-auto mb-8"
                        >
                            {/* Glowing circle behind trophy */}
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full blur-md animate-pulse-slow" />

                            {/* Trophy container */}
                            <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <Trophy className="w-12 h-12 text-white drop-shadow-glow" />
                            </div>
                        </motion.div>

                        {/* Game Over Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-2">
                                Game Over!
                            </h2>
                            <p className="text-purple-200/80">Your battle has ended</p>
                        </motion.div>

                        {/* Score Display */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 }}
                            className="bg-black/40 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/5"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-purple-200/80">Player ID</span>
                                    <span className="text-2xl font-bold text-white">{playerId}</span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                                <div className="flex items-center justify-between">
                                    <span className="text-purple-200/80">Final Score</span>
                                    <motion.span
                                        initial={{ scale: 1 }}
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{
                                            delay: 1,
                                            duration: 0.5,
                                            times: [0, 0.5, 1]
                                        }}
                                        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))]"
                                    >
                                        {score} Kills
                                    </motion.span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Play Again Button */}
                        <Link href="/">
                            <Button
                                variant="outline"
                                className="relative w-full group transition-all duration-300 border-white/50! hover:bg-white/5! p-5.5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] rounded-xl px-6 py-3 flex items-center justify-center gap-2 text-white font-medium">
                                    <RotateCcw className="w-5 h-5" />
                                    <span>Play Again</span>
                                </div>
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </LazyMotion>
    );
}