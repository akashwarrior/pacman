"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2, Target, Trophy, Sparkles, Users2 } from "lucide-react";
import { PlayerPreview } from "../components/PlayerPreview";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { roomManager } from "@/services/roomManager";
import { Input } from "@/components/ui/Input";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<string>("#eab308");
  const roomIdRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    roomManager.leaveRoom();
    return () => {
      nameRef.current = null;
      roomIdRef.current = null;
    }
  }, []);

  const handleStartGame = async () => {
    const name = nameRef.current?.value || "";

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    const player = {
      Name: name.trim(),
      Color: colorRef.current
    };

    const roomId = await roomManager.createRoom(player, 0);
    if (roomId === null) {
      setError('Failed to create room at the moment');
      return;
    }
    router.push(`/room/${roomId}`);
  };

  const handleJoinRoom = async () => {
    const name = nameRef.current?.value || "";
    const roomId = roomIdRef.current?.value || "";

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomId.trim() || isNaN(parseInt(roomId))) {
      setError('Please enter a room ID');
      return;
    }

    const player = {
      Name: name.trim(),
      Color: colorRef.current,
    };

    const id = await roomManager.joinRoom(player, parseInt(roomId), 0);
    if (id === null) {
      setError('Invalid room ID');
    } else {
      router.push(`/room/${id}`);
    }
  }

  return (
    <div className="relative bg-[#0A0F1C] flex items-center justify-center p-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-lg w-full relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl"
        />
        <motion.div
          variants={item}
          className="bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6"
        >
          <motion.div variants={item}>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 pb-2 text-center">
              Battle Arena
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3 text-indigo-300/80">
              <Sparkles className="w-4 h-4" />
              <p>Enter the battlefield in style</p>
              <Sparkles className="w-4 h-4" />
            </div>
          </motion.div>

          {error && (
            <motion.div
              variants={item}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl animate-shake"
            >
              {error}
            </motion.div>
          )}

          <motion.div variants={item}>
            <PlayerPreview nameRef={nameRef} colorRef={colorRef} />
          </motion.div>

          <motion.button
            onClick={handleStartGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full group relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-200 group-hover:scale-110" />
            <div className="relative flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 group-hover:animate-bounce" />
              <span className="text-lg">Start Game</span>
            </div>
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>

          <Input
            type="text"
            label="Room ID"
            ref={roomIdRef}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 placeholder-white/20"
            placeholder="Enter room ID"
          />

          <motion.button
            onClick={handleJoinRoom}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full group relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-200 group-hover:scale-110" />
            <div className="relative flex items-center gap-2">
              <Users2 className="w-5 h-5 group-hover:scale-105 " />
              <span className="text-lg">Join Room</span>
            </div>
          </motion.button>

          <motion.div
            variants={item}
            className="grid sm:grid-cols-2 gap-4 pt-4"
          >
            <div className="flex items-center gap-2 text-indigo-300/60 bg-white/[0.03] rounded-xl p-3">
              <Target className="w-5 h-5" />
              <span>Multi Player</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300/60 bg-white/[0.03] rounded-xl p-3">
              <Trophy className="w-5 h-5" />
              <span>Compete In Group</span>
            </div>
          </motion.div>

        </motion.div>

      </motion.div>
    </div>
  );
}