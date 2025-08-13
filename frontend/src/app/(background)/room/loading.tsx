'use client';
import { motion } from 'motion/react';

export default function RoomLoading() {
  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 text-blue-400">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <div>
            <h3 className="font-semibold text-white">Connecting to Arena</h3>
            <p className="text-sm text-white/80">Please wait...</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 