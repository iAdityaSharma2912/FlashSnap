"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { FlashcardGrid } from "@/components/flashcards/flashcard-grid";
import { ExportPanel } from "@/components/decks/export-panel";
import { StatsBar } from "@/components/decks/stats-bar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Play, Loader2, BookOpen, Flame, FileText, Tag } from "lucide-react";
import type { Deck, Flashcard, DeckStats } from "@/lib/types";
import { formatDate, getMasteryColor } from "@/lib/utils";

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/decks/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setDeck(data.data.deck);
          setCards(data.data.deck.cards ?? []);
          setStats(data.data.stats);
        } else {
          toast({ title: "Deck not found", variant: "error" });
          router.push("/decks");
        }
      })
      .catch(() => {
        toast({ title: "Failed to load deck", variant: "error" });
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!deck) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/decks" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            My Decks
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-300 truncate">{deck.title}</span>
        </div>

        {/* Deck header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: deck.color + "25" }}
            >
              {deck.sourceType === "PDF" ? (
                <FileText className="w-7 h-7" style={{ color: deck.color }} />
              ) : (
                <Tag className="w-7 h-7" style={{ color: deck.color }} />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">{deck.title}</h1>
              {deck.description && <p className="text-gray-500 text-sm mt-1">{deck.description}</p>}
              <p className="text-xs text-gray-600 mt-2">Created {formatDate(deck.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ExportPanel deckTitle={deck.title} cards={cards} />
            <Link href={`/study/${deck.id}`}>
              <Button variant="default" className="gap-2 shadow-glow-yellow">
                <Play className="w-4 h-4" />
                Study Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8">
            <StatsBar stats={stats} />
          </div>
        )}

        {/* Mastery breakdown */}
        {stats && (
          <div className="mb-8 rounded-2xl border border-dark-border bg-dark-card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Mastery Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Mastered", count: stats.mastered, color: "#00FF9F" },
                { label: "Reviewing", count: stats.reviewing, color: "#FFD60A" },
                { label: "Learning", count: stats.learning, color: "#FF6B35" },
                { label: "New", count: stats.new, color: "#7878A0" },
              ].map(({ label, count, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{label}</span>
                    <span style={{ color }}>{count} cards</span>
                  </div>
                  <Progress
                    value={stats.total > 0 ? (count / stats.total) * 100 : 0}
                    color={color}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due today alert */}
        {stats && stats.dueToday > 0 && (
          <div className="mb-6 flex items-center justify-between p-4 rounded-xl border border-orange/30 bg-orange/5">
            <div className="flex items-center gap-2 text-sm text-orange">
              <Flame className="w-4 h-4" />
              <span className="font-medium">{stats.dueToday} cards due for review today</span>
            </div>
            <Link href={`/study/${deck.id}`}>
              <Button variant="orange" size="sm" className="gap-2">
                <Play className="w-3.5 h-3.5" />
                Study Now
              </Button>
            </Link>
          </div>
        )}

        {/* Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            All Cards
            <span className="ml-2 text-sm font-normal text-gray-500">({cards.length})</span>
          </h2>
          {cards.length > 0 ? (
            <FlashcardGrid cards={cards} />
          ) : (
            <div className="text-center py-16 text-gray-500">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No cards in this deck</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
