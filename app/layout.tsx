import type { Metadata } from "next";
import {Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

// app/layout.tsx
export const metadata = {
  manifest: '/manifest.json', // Next.js otomatis memetakan manifest.ts ke /manifest.json
  themeColor: '#1e293b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Showroomly',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={jakarta.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}