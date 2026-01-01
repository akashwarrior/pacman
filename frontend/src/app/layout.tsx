import type { Metadata } from "next";
import { AnimatedBackground } from "@/components/animated-background";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pacman Arena",
  description:
    "Multiplayer Pacman: move, shoot, and survive. Last one standing wins.",
  icons: {
    icon: "/pacman.webp",
  },
  keywords: ["pacman", "multiplayer", "shooter", "arena", "ghosts", "survival"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AnimatedBackground />
        {children}
        <Toaster position="top-right" expand={false} richColors />
      </body>
    </html>
  );
}
