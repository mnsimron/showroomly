import type { Metadata } from "next";
import {Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Showroomly - Katalog Mobil Modern",
  description: "Platform katalog mobil bekas terpercaya",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={jakarta.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}