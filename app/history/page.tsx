"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  Plus, 
  Clock, 
  BookOpen, 
  FileText, 
  Tag, 
  Play, 
  ExternalLink,
  History,
  Sparkles
} from "lucide-react";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import type { Deck } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const userId = (session.user as { id?: string }).id;
    fetch(`/api/decks?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDecks(data.data);
      })
      .catch(() => toast({ title: "Failed to load history", variant: "error" }))
      .finally(() => setIsLoading(false));
  }, [session, status]);

  const studiedDecks = decks.filter((d) => d.lastStudied).sort((a, b) =>
    new Date(b.lastStudied!).getTime() - new Date(a.lastStudied!).getTime()
  );
  const unstudiedDecks = decks.filter((d) => !d.lastStudied);

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-sans selection:bg-orange-500/30 selection:text-white pb-20">
      <Navbar />
      
      {/* Subtle Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-12 relative z-10 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800/50">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <History className="w-8 h-8 text-blue-500" />
              Study History
            </h1>
            <p className="text-base text-gray-400 font-medium">
              Track your learning activity and pick up where you left off.
            </p>
          </div>
          <Link href="/generate">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-400 hover:to-orange-500 shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all duration-300 gap-2 font-bold rounded-xl h-12 px-6">
              <Plus className="w-5 h-5" />
              New Deck
            </Button>
          </Link>
        </div>

        {/* Content States */}
        {!session?.user && status !== "loading" ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5 border border-zinc-800 border-dashed rounded-3xl bg-zinc-900/20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Sign in to view history</h3>
              <p className="text-base text-gray-400 mt-2 max-w-sm mx-auto">Your study history and progress are securely saved to your account.</p>
            </div>
            <Link href="/login" className="mt-2">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8 h-12 rounded-xl">
                Sign In
              </Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="space-y-8">
            <div>
              <div className="h-5 w-32 bg-zinc-800/50 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl border border-zinc-800 bg-zinc-900/30 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        ) : decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5 border border-zinc-800 border-dashed rounded-3xl bg-zinc-900/20">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">No decks yet</h3>
              <p className="text-base text-gray-400 mt-2 max-w-sm mx-auto">Generate your first deck to start building your study history.</p>
            </div>
            <Link href="/generate" className="mt-2">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-400 hover:to-orange-500 font-bold px-8 h-12 rounded-xl gap-2">
                <Sparkles className="w-4 h-4" />
                Create First Deck
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Recently studied */}
            {studiedDecks.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Recently Studied
                </h2>
                <div className="space-y-3">
                  {studiedDecks.map((deck) => (
                    <DeckHistoryRow key={deck.id} deck={deck} />
                  ))}
                </div>
              </div>
            )}

            {/* Not yet studied */}
            {unstudiedDecks.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Not Studied Yet
                </h2>
                <div className="space-y-3">
                  {unstudiedDecks.map((deck) => (
                    <DeckHistoryRow key={deck.id} deck={deck} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function DeckHistoryRow({ deck }: { deck: Deck }) {
  // Determine accent color dynamically based on existing deck color or fallback to blue/orange
  const accentColor = deck.color || (deck.sourceType === "PDF" ? "#3b82f6" : "#f97316");
  
  return (
    <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all group">
      
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border transition-transform group-hover:scale-105"
          style={{ 
            backgroundColor: `${accentColor}15`, 
            borderColor: `${accentColor}30` 
          }}
        >
          {deck.sourceType === "PDF" ? (
            <FileText className="w-5 h-5" style={{ color: accentColor }} />
          ) : (
            <Tag className="w-5 h-5" style={{ color: accentColor }} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-lg font-bold text-gray-100 truncate group-hover:text-white transition-colors">{deck.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              {deck.cardCount} cards
            </span>
            <span className="text-sm text-gray-600 hidden sm:inline-block">
              Created {formatDate(deck.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-shrink-0">
        {/* Last studied (Desktop only) */}
        <div className="text-right hidden md:block">
          {deck.lastStudied ? (
            <>
              <p className="text-sm font-medium text-gray-300">{formatRelativeTime(deck.lastStudied)}</p>
              <p className="text-xs text-gray-500 mt-0.5">last studied</p>
            </>
          ) : (
            <p className="text-sm text-gray-600 font-medium italic">Never studied</p>
          )}
        </div>

        {/* Actions */}
<div className="flex items-center gap-2">
  <Link href={`/decks/${deck.id}`} className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
    <button 
      aria-label="View deck details" /* <-- ADD THIS */
      title="View deck details"      /* <-- OPTIONAL: Adds a nice hover tooltip */
      className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
    >
      <ExternalLink className="w-5 h-5" />
    </button>
  </Link>
        </div>
      </div>
    </div>
  );
}