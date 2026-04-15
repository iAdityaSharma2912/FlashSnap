"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Brain,
  Sparkles,
  BookOpen,
  Clock,
  Target,
  Flame,
  ArrowRight,
  MoreVertical,
  Play,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalDecks: number;
    cardsMastered: number;
    studyStreak: number;
  };
  recentDecks: Array<{
    id: string;
    title: string;
    cardsCount: number;
    dueCount: number;
    lastStudied: string;
    progress: number;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const firstName = session?.user?.name?.split(" ")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    // Only fetch if the user is authenticated
    if (status !== "authenticated") return;

    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        
        if (!json.success) throw new Error(json.error);
        
        setData(json.data);
      } catch (err) {
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [status]);

  // Calculate total due cards across all recent decks (or you can fetch a global due count from the API)
  const totalDueCards = data?.recentDecks.reduce((acc, deck) => acc + deck.dueCount, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-sans selection:bg-orange-500/30 selection:text-white pb-20">
      <Navbar />
      
      {/* Subtle Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-12 relative z-10 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-500">{firstName}</span>
            </h1>
            {isLoading ? (
              <div className="h-6 w-48 bg-zinc-800/50 rounded animate-pulse" />
            ) : (
              <p className="text-gray-400 text-lg">
                You have <strong className="text-white">{totalDueCards} cards</strong> due for review today.
              </p>
            )}
          </div>
          <Link href="/study/due">
            <Button className="bg-white text-black hover:bg-gray-200 font-bold gap-2 px-6 h-12 rounded-xl shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all">
              <Play className="w-4 h-4 fill-black" />
              Review Due Cards
            </Button>
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Decks", value: data?.stats.totalDecks, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Cards Mastered", value: data?.stats.cardsMastered, icon: Target, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Study Streak", value: `${data?.stats.studyStreak || 0} Days`, icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-700 transition-colors">
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-7 h-7", stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-zinc-800/50 rounded mt-1 animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/generate?mode=pdf" className="block group">
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between min-h-[160px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] group-hover:bg-blue-500/10 transition-colors" />
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Generate from PDF</h3>
                  <p className="text-sm text-gray-400">Upload a document and let AI extract the key concepts.</p>
                </div>
                <div className="flex items-center text-blue-400 text-sm font-bold mt-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Upload file <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/generate?mode=topic" className="block group">
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-orange-500/50 transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between min-h-[160px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-[40px] group-hover:bg-orange-500/10 transition-colors" />
                <div>
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Generate from Topic</h3>
                  <p className="text-sm text-gray-400">Type a subject and get a comprehensive study deck instantly.</p>
                </div>
                <div className="flex items-center text-orange-400 text-sm font-bold mt-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Enter topic <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Decks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Jump Back In
            </h2>
            <Link href="/decks" className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline">
              View all decks
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {isLoading ? (
              // Loading Skeletons
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl border border-zinc-800 bg-zinc-900/30 animate-pulse" />
              ))
            ) : data?.recentDecks.length === 0 ? (
              // Empty State
              <div className="text-center py-12 border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/20">
                <p className="text-gray-400 mb-4">You haven't created any decks yet.</p>
                <Link href="/generate">
                  <Button className="bg-zinc-800 hover:bg-zinc-700 text-white">Create your first deck</Button>
                </Link>
              </div>
            ) : (
              // Actual Data
              data?.recentDecks.map((deck) => (
                <div key={deck.id} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/80 transition-colors group">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="relative w-12 h-12 flex items-center justify-center bg-zinc-950 rounded-full border border-zinc-800 flex-shrink-0 hidden sm:flex">
                      <span className="text-xs font-bold text-white">{deck.progress}%</span>
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-zinc-800"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={deck.progress === 100 ? "text-green-500" : "text-blue-500"}
                          strokeDasharray={`${deck.progress}, 100`}
                          strokeWidth="3"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-gray-100 text-base sm:text-lg group-hover:text-white transition-colors">{deck.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {deck.cardsCount} cards</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span className={cn("flex items-center gap-1", deck.dueCount > 0 ? "text-orange-400" : "text-green-400")}>
                          <Target className="w-3.5 h-3.5" /> {deck.dueCount} due
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block mr-4 text-sm text-gray-500">
                      Last studied: {deck.lastStudied}
                    </div>
                    <Link href={`/study/${deck.id}`}>
                      <Button variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white border-0 hidden sm:flex">
                        Study Now
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-zinc-800">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}