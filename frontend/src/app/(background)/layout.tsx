import { GameBackground } from "@/components/GameBackground";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-black relative min-h-screen flex flex-col items-center justify-center">
      <GameBackground />
      {children}
    </div>
  );
}
