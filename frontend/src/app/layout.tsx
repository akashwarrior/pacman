import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";

const font = Host_Grotesk({
  subsets: ["latin"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Pacman Arena",
  description: "Multiplayer Pacman: move, shoot, and survive. Last one standing wins.",
  icons: {
    icon: "/pacman.png",
  },
  keywords: ["pacman", "multiplayer", "shooter", "arena", "ghosts", "survival"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased`}>
        {children}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          theme="dark"
          stacked
          className='max-w-[90%] !mx-auto'
        />
      </body>
    </html>
  );
}
