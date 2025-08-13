'use client'

import { Button } from '@/components/ui/button';
import { X, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorDisplayProps {
  error: string;
  onBackToHome: () => void;
}

export function ErrorDisplay({ error, onBackToHome }: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 shadow-2xl max-w-md w-full"
    >
      <div className="flex items-center gap-3 text-red-400 mb-4">
        <X size={24} />
        <div>
          <h3 className="font-semibold text-white">Connection Error</h3>
          <p className="text-sm text-white/80">{error}</p>
        </div>
      </div>
      <Button
        onClick={onBackToHome}
        className="w-full"
        variant="outline"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Button>
    </motion.div>
  );
}
