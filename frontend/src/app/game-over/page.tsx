import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Link } from 'lucide-react';

export default async function GameOver({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { playerId, score } = await searchParams;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 w-full h-fit"
        >
            <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-gray-800/90 border border-gray-700 p-8 rounded-2xl shadow-2xl max-w-md w-full"
            >
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center mb-6"
                    >
                        <Trophy className="w-10 h-10 text-white" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                    <p className="text-gray-400 mb-6">Your final score</p>

                    <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
                        <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 leading-tight">
                            Player ID -  {playerId}<br /> Kills - {Number.isNaN(score) ? 0 : score}
                        </span>
                    </div>

                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium transition-all duration-200 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center justify-center gap-2">
                                <RotateCcw className="w-5 h-5" />
                                <span>Play Again</span>
                            </div>
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}