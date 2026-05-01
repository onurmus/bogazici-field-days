import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BÜ Field Days – Yarışma Programı ve Sonuçları",
  description: "Boğaziçi Üniversitesi Atletizm Günleri canlı sonuçlar ve yarışma programı",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      {/* Material Symbols for icons */}
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen bg-[#f5f0e8]" suppressHydrationWarning>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
