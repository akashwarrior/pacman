import type { Metadata } from "next";
import localFont from "next/font/local";
import { ToastContainer } from "react-toastify";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Battle Arena",
  description: "Pacman shooter game with a twist",
  icons: {
    icon: "/pacman.png",
  },
  keywords: ["pacman", "shooter", "game", "battle", "arena"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}>
        {children}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          theme="dark"
          stacked
          className='max-w-[90%] mx-auto!'
        />
      </body>
    </html>
  );
}
