import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { SwRegister } from "./sw-register";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",   // notch / Dynamic Island safe area
  themeColor: "#05030b",
};

export const metadata: Metadata = {
  title: "FPL//AI — Gameweek Intelligence",
  description:
    "Enter your public FPL entry ID and get a structured weekly briefing: captaincy, transfer moves, fixture swings and a hard injury filter. No passwords. Unofficial.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FPL//AI",
  },
  icons: {
    apple: "/icons/icon-192.png",
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  keywords: [
    "Fantasy Premier League",
    "FPL",
    "FPL AI",
    "FPL advice",
    "FPL captaincy",
    "FPL transfers",
    "gameweek intelligence",
  ],
  openGraph: {
    title: "FPL//AI — Gameweek Intelligence",
    description:
      "Structured weekly FPL briefings: captaincy, transfers, fixture swings, hard injury filter. Public data only.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "FPL//AI — Gameweek Intelligence",
    description: "AI-powered FPL briefings. Paste your entry ID and go.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#07090e] text-[#f1f5f9] antialiased selection:bg-[#00f59b] selection:text-[#051a10]">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
