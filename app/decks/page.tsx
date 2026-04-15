"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { DeckCard } from "@/components/decks/deck-card";
// Ensure these components exist at these exact paths!
import { PageHeader } from "@/components/layout/page-header";
import { StatsBar } from "@/components/decks/stats-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, BookOpen, Loader2, Sparkles } from "lucide-react";
import type { Deck, DeckStats } from "@/lib/types";

type DeckWithStats = Deck & { stats: DeckStats };

const DEMO_DECKS: DeckWithStats[] = [
  {
    id: "demo-1",
    tags: [],
    title: "Introduction to Biology",
    description: "Cell structure, DNA, photosynthesis, and more",
    sourceType: "PDF",
    cardCount: 24,
    userId: "demo",
    color: "#3b82f6", // Blue
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    lastStudied: new Date(Date.now() - 86400000).toISOString(),
    stats: { total: 24, mastered: 8, learning: 10, reviewing: 4, new: 2, dueToday: 6, masteryPercent: 33 },
  },
  {
    id: "demo-2",
    tags: [],
    title: "World War II — Key Events",
    description: "Causes, battles, turning points, and aftermath",
    sourceType: "TOPIC",
    topic: "World War II",
    cardCount: 18,
    userId: "demo",
    color: "#f97316", // Orange
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
    lastStudied: new Date(Date.now() - 86400000 * 2).toISOString(),
    stats: { total: 18, mastered: 14, learning: 2, reviewing: 2, new: 0, dueToday: 2, masteryPercent: 78 },
  },
];

export default function DecksPage() {
  const { data: session, status } = useSession();
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDecks = useCallback(async () => {
    if (status === "loading") return;
    setIsLoading(true);

    if (!session?.user) {
      setDecks(DEMO_DECKS);
      setIsLoading(false);
      return;
    }

    try {
      const userId = (session.user as { id?: string }).id;
      const res = await fetch(`/api/decks?userId=${userId}`);
      const data = await res.json();
      if (data.success) setDecks(data.data);
    } catch {
      toast({ title: "Failed to load decks", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  useEffect(() => { fetchDecks(); }, [fetchDecks]);

  const handleDelete = async (deckId: string) => {
    if (!confirm("Delete this deck and all its cards?")) return;
    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDecks((d) => d.filter((deck) => deck.id !== deckId));
      toast({ title: "Deck deleted" });
    } catch {
      toast({ title: "Failed to delete deck", variant: "error" });
    }
  };

  const filtered = decks.filter((d) =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalStats: DeckStats = decks.reduce((acc, d) => ({
    total: acc.total + d.stats.total,
    mastered: acc.mastered + d.stats.mastered,
    learning: acc.learning + d.stats.learning,
    reviewing: acc.reviewing + d.stats.reviewing,
    new: acc.new + d.stats.new,
    dueToday: acc.dueToday + d.stats.dueToday,
    masteryPercent: 0,
  }), { total: 0, mastered: 0, learning: 0, reviewing: 0, new: 0, dueToday: 0, masteryPercent: 0 });
  
  totalStats.masteryPercent = totalStats.total > 0 ? Math.round((totalStats.mastered / totalStats.total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-sans selection:bg-orange-500/30 selection:text-white pb-20">
      <Navbar />
      
      {/* Subtle Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-12 relative z-10 space-y-8">
        
        {/* Header (Ensuring PageHeader works by replacing it with direct HTML if the component is broken) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800/50">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-500" />
              My Decks
            </h1>
            <p className="text-base text-gray-400 font-medium">
              Manage your study materials and track your mastery.
            </p>
          </div>
          <Link href="/generate">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-400 hover:to-orange-500 shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all duration-300 gap-2 font-bold rounded-xl h-12 px-6">
              <Plus className="w-5 h-5" />
              New Deck
            </Button>
          </Link>
        </div>

        {!session?.user && status !== "loading" && (
          <div className="p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 text-sm text-gray-300 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p>
              Showing demo decks.{" "}
              <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition-colors">
                Sign in
              </Link>{" "}
              to save and manage your own custom flashcards.
            </p>
          </div>
        )}

        {/* Global Stats */}
        {decks.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <StatsBar stats={totalStats} />
          </div>
        )}

        {/* Search Bar */}
        {decks.length > 0 && (
          <div className="relative max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search your decks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-blue-500/50 focus-visible:border-blue-500"
            />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[280px] rounded-2xl bg-zinc-900/30 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5 border border-zinc-800 border-dashed rounded-3xl bg-zinc-900/20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
              <BookOpen className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {search ? "No decks match your search" : "No decks yet"}
              </h3>
              <p className="text-base text-gray-400 mt-2 max-w-sm mx-auto">
                {search ? "Try a different keyword." : "Generate your first flashcard deck to get started."}
              </p>
            </div>
            {!search && (
              <Link href="/generate" className="mt-2">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-400 hover:to-orange-500 font-bold px-8 h-12 rounded-xl gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Deck
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {filtered.map((deck) => (
              // IMPORTANT: Render the DeckCard directly, do NOT wrap it in a <Link>
              <DeckCard
                key={deck.id}
                deck={deck}
                stats={deck.stats}
                onDelete={session?.user ? handleDelete : undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}