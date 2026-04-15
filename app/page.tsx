"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar"; 
import { Button } from "@/components/ui/button";
import {
  Zap,
  Upload,
  Sparkles,
  BarChart2,
  Download,
  RefreshCw,
  ArrowRight,
  Brain,
  Target,
  Layers,
  UserPlus,
  LogIn,
  LucideIcon
} from "lucide-react";

// --- Types & Constants ---

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Upload,
    title: "PDF to Flashcards",
    description: "Drop any PDF and get a comprehensive, teacher-quality deck in seconds.",
    color: "#3B82F6", // Blue
  },
  {
    icon: Brain,
    title: "Topic Generation",
    description: "No PDF? Type any topic and get structured cards covering the full subject.",
    color: "#F97316", // Orange
  },
  {
    icon: RefreshCw,
    title: "Spaced Repetition",
    description: "SM-2 algorithm surfaces hard cards more often, easy ones less. Science-backed.",
    color: "#9CA3AF", // Grey
  },
  {
    icon: BarChart2,
    title: "Progress Tracking",
    description: "See mastery across decks. Know exactly what to study today.",
    color: "#60A5FA", // Light Blue
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "Download as PDF, CSV (Anki-compatible), or JSON. Own your data.",
    color: "#FB923C", // Light Orange
  },
  {
    icon: Sparkles,
    title: "AI-Quality Cards",
    description: "Deep concept extraction — not keyword scraping. Cards a great teacher would write.",
    color: "#F3F4F6", // White/Light Grey
  },
];

const STEPS: Step[] = [
  { number: "01", title: "Upload or type", description: "Drop a PDF or describe a topic" },
  { number: "02", title: "AI generates", description: "Deep analysis, high-quality Q&A cards" },
  { number: "03", title: "Study smart", description: "Spaced repetition tracks your progress" },
  { number: "04", title: "Export", description: "PDF, CSV, JSON — ready to use anywhere" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100 font-sans selection:bg-orange-500/30 selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background: linear-gradient(-45deg, #000000, #0f172a, #1e3a8a, #ea580c, #000000);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
      `}} />

      <Navbar />

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 text-center overflow-hidden animate-gradient-bg">
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black z-0" />

       <div className="relative z-10 max-w-5xl mx-auto space-y-8">
  
  {/* The Badge - Use Mono for a "Pro" feel */}
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-[11px] font-mono font-bold tracking-wider uppercase">
    <Zap className="w-3.5 h-3.5" />
    Next-Gen AI Engine
  </div>

  {/* Heading - Outfit ExtraBold is very friendly and "bubbly" */}
  <h1 className="text-6xl sm:text-7xl md:text-8xl font-heading font-extrabold tracking-tight leading-[1.1] text-white">
    Learn faster with <br />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-orange-500">
      smart flashcards
    </span>
  </h1>

  <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
    Level up your study game. <span className="text-white">FlashSnap</span> uses AI to turn your messy notes into perfect study decks instantly.
  </p>

  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
    <Link href="/generate">
      <Button size="xl" className="h-16 px-10 text-xl font-heading font-bold bg-orange-500 text-white hover:bg-orange-400 shadow-[0_20px_50px_rgba(234,88,12,0.3)] hover:-translate-y-1 transition-all duration-300 rounded-2xl gap-3">
        <Sparkles className="w-6 h-6" />
        Get Started
        <ArrowRight className="w-5 h-5" />
      </Button>
    </Link>
    
    <Link href="/register">
      <Button size="xl" className="h-16 px-10 text-xl font-heading font-bold bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-all duration-300 rounded-2xl">
        Sign Up Free
      </Button>
    </Link>
  </div>
</div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-zinc-950 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">How it works</h2>
            <p className="text-gray-400 mt-4 text-lg">From document to mastery in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step: Step, i: number) => (
              <div 
                key={i} 
                className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-blue-500/50 hover:bg-zinc-900 transition-all duration-300 group"
              >
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-zinc-800 group-hover:bg-orange-500/50 transition-colors" />
                )}
                <span className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 to-zinc-800 group-hover:from-blue-400 group-hover:to-orange-500 transition-all duration-500">
                  {step.number}
                </span>
                <h3 className="text-xl font-heading font-bold text-gray-100 mt-6 group-hover:text-blue-400 transition-colors">{step.title}</h3>
                <p className="text-base text-gray-400 mt-2 leading-relaxed font-light">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-black relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">Engineered for learning</h2>
            <p className="text-gray-400 mt-4 text-lg">Built on cognitive science, designed for top-tier students</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color }: Feature, i: number) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 hover:border-orange-500/30 hover:shadow-[0_0_30px_-15px_rgba(249,115,22,0.3)] transition-all duration-300 group hover:-translate-y-2"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-100 mb-3 group-hover:text-white transition-colors">{title}</h3>
                <p className="text-base text-gray-400 leading-relaxed font-light">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 p-[1px]">
              <div className="w-full h-full rounded-md bg-black flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-xl font-heading font-black tracking-tight text-white">
              Flash<span className="text-orange-500">Snap</span>
            </span>
          </div>

          <div className="flex gap-6 font-mono text-[10px] tracking-widest uppercase">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="text-gray-400">
              Built by <span className="text-white font-semibold">Aditya</span>
            </p>
            <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase tracking-tighter">
              © {new Date().getFullYear()} FlashSnap // v2.0.42
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}