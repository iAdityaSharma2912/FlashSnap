import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const headingFont = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlashSnap | Learn Faster",
  description: "AI-powered flashcards for smart students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} dark`}
    >
      <body className="antialiased bg-black text-white font-sans">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}