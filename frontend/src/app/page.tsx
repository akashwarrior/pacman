"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2, Users2, Loader2, Sparkles, Sword, Shield } from "lucide-react";
import { PlayerPreview } from "@/components/PlayerPreview";
import { LazyMotion, domAnimation } from "motion/react";
import * as motion from "motion/react-m";
import { useRouter } from "next/navigation";
import { roomManager } from "@/services/roomManager";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "react-toastify";

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

export default function Home() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<string>("#3b82f6");
  const roomIdRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      const player = {
        Name: name.trim(),
        Color: colorRef.current
      };

      const roomId = await roomManager.createRoom(player, 0);
      if (roomId === null) {
        toast.error('Failed to create room');
        return;
      }
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.log(error);
      toast.error('An error occurred while creating the room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const name = nameRef.current?.value || "";
    const roomId = roomIdRef.current?.value || "";

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!roomId.trim() || isNaN(parseInt(roomId))) {
      toast.error('Please enter a valid room ID');
      return;
    }

    setIsLoading(true);
    try {
      const player = {
        Name: name.trim(),
        Color: colorRef.current,
      };

      const id = await roomManager.joinRoom(player, parseInt(roomId), 0);
      if (id === null) {
        toast.error('room ID does not exist');
      } else {
        router.push(`/room/${id}`);
      }
    } catch (error) {
      console.log(error);
      toast.error('An error occurred while joining the room');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen game-bg flex items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--neon-blue)] via-[var(--neon-purple)] to-[var(--neon-pink)] opacity-20 blur-2xl" />
          <Card className="glass relative border-0 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="space-y-3 text-center pb-6">
              <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3">
                <Sword className="w-8 h-8 text-[var(--neon-blue)] animate-pulse-glow" />
                <h1 className="game-title text-4xl sm:text-5xl">Battle Arena</h1>
                <Shield className="w-8 h-8 text-[var(--neon-purple)] animate-pulse-glow" />
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="flex items-center justify-center gap-2 text-muted-foreground"
              >
                <Sparkles className="w-4 h-4 text-[var(--neon-pink)] animate-pulse-glow" />
                <span className="animate-pulse">Enter the battlefield in style</span>
                <Sparkles className="w-4 h-4 text-[var(--neon-pink)] animate-pulse-glow" />
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              <motion.div variants={fadeInUp}>
                <PlayerPreview nameRef={nameRef} colorRef={colorRef} />
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-4">
                <Button
                  onClick={handleStartGame}
                  disabled={isLoading}
                  className="game-button w-full h-12 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Game...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Gamepad2 className="w-5 h-5 animate-pulse-glow" />
                      <span>Create Battle Arena</span>
                    </div>
                  )}
                </Button>

                <div className="relative flex items-center justify-center">
                  <hr className="flex-1 h-1 bg-border" />
                  <span className="px-2 text-muted-foreground z-10">or join existing battle</span>
                  <hr className="flex-1 h-1 bg-border" />
                </div>

                <div className="flex gap-3">
                  <Input
                    ref={roomIdRef}
                    type="text"
                    placeholder="Enter Room ID"
                    className="h-12 bg-transparent!"
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={isLoading}
                    className="game-button h-12 px-8 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-pink)] min-w-[120px]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Users2 className="w-5 h-5 animate-pulse-glow" />
                        <span>Join Now</span>
                      </div>
                    )}
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </LazyMotion>
  );
}