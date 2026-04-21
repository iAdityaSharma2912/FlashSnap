"use client";

import { useEffect, useState } from "react"; // Removed duplicate import
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { StudyModeSwitcher, type StudyModeType } from "@/components/decks/deck-control";
import { VoiceAnswerMode } from "@/components/flashcards/voice-answer-mode";
import { StudyMode } from "@/components/flashcards/study-mode";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Play, 
  ArrowLeft, 
  Target, 
  Sparkles, 
  Trophy,
  CheckCircle2
} from "lucide-react";
import type { Deck, Flashcard, DeckStats } from "@/lib/types";
import { isDueToday } from "@/lib/sm2";
import Link from "next/link";
import { cn } from "@/lib/utils";

type StudyFilter = "due" | "all" | "new";

export default function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  // New State for Voice Mode toggle
  const [studyMode, setStudyMode] = useState<StudyModeType>("standard");
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [studyCards, setStudyCards] = useState<Flashcard[] | null>(null);
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StudyFilter>("due");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/decks/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setDeck(data.data.deck);
          setAllCards(data.data.deck.cards ?? []);
          setStats(data.data.stats);
        } else {
          toast({ title: "Deck not found", variant: "error" });
          router.push("/decks");
        }
      })
      .catch(() => toast({ title: "Failed to load", variant: "error" }))
      .finally(() => setIsLoading(false));
  }, [id, router]);

  const startStudy = () => {
    let cards: Flashcard[];
    if (filter === "due") {
      cards = allCards.filter((c) => isDueToday(c.nextReview));
      if (cards.length === 0) {
        toast({ title: "No cards due", description: "Switching to all cards study mode." });
        cards = [...allCards];
      }
    } else if (filter === "new") {
      cards = allCards.filter((c) => c.mastery === "NEW");
      if (cards.length === 0) cards = [...allCards];
    } else {
      cards = [...allCards];
    }
    // Shuffle
    cards = cards.sort(() => Math.random() - 0.5);
    setStudyCards(cards);

    // Update lastStudied
    if (deck) {
      fetch(`/api/decks/${deck.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastStudied: new Date().toISOString() }),
      }).catch(() => {});
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-sans selection:bg-orange-500/30 selection:text-white pb-20">
      <Navbar />
      
      {/* Subtle Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pt-12 relative z-10">
        {studyCards ? (
          <div className="space-y-6">
            {/* THIS IS THE MISSING TOGGLE */}
            <div className="flex justify-end">
              <StudyModeSwitcher mode={studyMode} onChange={setStudyMode} deckId={id} />
            </div>

            {/* CONDITIONAL RENDERING FOR VOICE vs STANDARD */}
            {studyMode === "voice" ? (
              <VoiceAnswerMode
                cards={studyCards}
                deckId={id}
                onComplete={() => {
                  router.push(`/decks/${id}`);
                  toast({ title: "Session complete", description: "Great work — keep it up!" });
                }}
                onBack={() => setStudyCards(null)}
              />
            ) : (
              <StudyMode
                cards={studyCards}
                deckId={id}
                onComplete={() => {
                  router.push(`/decks/${id}`);
                  toast({ title: "Session complete", description: "Great work — keep it up!" });
                }}
                onBack={() => setStudyCards(null)}
              />
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
              <Link 
                href={`/decks/${id}`} 
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mb-4 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to deck
              </Link>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
                {deck?.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-gray-300">
                  {allCards.length} cards total
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Due Today", value: stats.dueToday, icon: Target, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                  { label: "New Cards", value: stats.new, icon: Sparkles, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                  { label: "Mastered", value: stats.mastered, icon: Trophy, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
                ].map(({ label, value, icon: Icon, color, bg, border }) => (
                  <div key={label} className={cn("rounded-2xl border p-5 flex flex-col items-center justify-center text-center", border, bg)}>
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-black/20", color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className={cn("text-3xl font-black", color)}>{value}</p>
                    <p className="text-sm font-medium text-gray-300 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Study Mode Filter */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                Select Study Mode
              </h2>
              <div className="space-y-3">
                {[
                  { value: "due" as const, label: "Due for Review", description: `${stats?.dueToday ?? 0} cards scheduled for today`, highlight: "border-orange-500/50 bg-orange-500/10 text-white" },
                  { value: "new" as const, label: "New Cards Only", description: `${stats?.new ?? 0} cards never studied`, highlight: "border-blue-500/50 bg-blue-500/10 text-white" },
                  { value: "all" as const, label: "All Cards (Cram Mode)", description: `Review all ${allCards.length} cards in this deck`, highlight: "border-zinc-500/50 bg-zinc-500/10 text-white" },
                ].map(({ value, label, description, highlight }) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={cn(
                      "w-full flex flex-col text-left px-5 py-4 rounded-xl border transition-all duration-200",
                      filter === value
                        ? highlight
                        : "border-zinc-800 bg-zinc-900/30 text-gray-400 hover:border-zinc-700 hover:bg-zinc-900"
                    )}
                  >
                    <p className={cn("text-base font-bold", filter === value ? "text-white" : "text-gray-300")}>
                      {label}
                    </p>
                    <p className={cn("text-sm mt-1", filter === value ? "text-gray-200" : "text-gray-500")}>
                      {description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Start Button */}
              <div className="pt-4 border-t border-zinc-800">
                <Button
                  size="xl"
                  onClick={startStudy}
                  disabled={allCards.length === 0}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-400 hover:to-orange-500 shadow-[0_0_30px_-10px_rgba(249,115,22,0.5)] hover:-translate-y-1 transition-all duration-300 gap-2 rounded-xl disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Start Session
                </Button>

                {allCards.length === 0 && (
                  <p className="text-center text-sm font-medium text-gray-500 mt-4">
                    This deck has no cards yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}