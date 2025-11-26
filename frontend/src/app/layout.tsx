import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import { Background } from "@/components/background";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const font = Host_Grotesk({
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pacman Arena",
  description:
    "Multiplayer Pacman: move, shoot, and survive. Last one standing wins.",
  icons: {
    icon: "/pacman.png",
  },
  keywords: ["pacman", "multiplayer", "shooter", "arena", "ghosts", "survival"],
  openGraph: {
    title: "Pacman Arena",
    description: "Multiplayer Pacman: move, shoot, and survive.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>
        <Background />
        {children}
        <Toaster position="top-right" expand={false} richColors />
      </body>
    </html>
  );
}
