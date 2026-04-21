"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Search, Globe, BookOpen, Copy, Flame, Clock, Layers,
  FileText, Tag, Star, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicDeck {
  id: string;
  title: string;
  description?: string;
  sourceType: "PDF" | "TOPIC";
  topic?: string;
  cardCount: number;
  cloneCount: number;
  clonedFrom?: string;
  tags: string[];
  color: string;
  createdAt: string;
  user: { name?: string };
}

type SortOption = "popular" | "newest" | "cards";

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "popular", label: "Popular",    icon: <Flame className="w-3.5 h-3.5" /> },
  { value: "newest",  label: "Newest",     icon: <Clock className="w-3.5 h-3.5" /> },
  { value: "cards",   label: "Most Cards", icon: <Layers className="w-3.5 h-3.5" /> },
];

export default function ExplorePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [decks, setDecks]           = useState<PublicDeck[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState("");
  const [sort, setSort]             = useState<SortOption>("popular");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cloningId, setCloningId]   = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ sort, page: String(page) });
      if (search) params.set("search", search);
      const res  = await fetch(`/api/decks/public?${params}`);
      const json = await res.json();
      if (json.success) {
        setDecks(json.data.decks);
        setTotalPages(json.data.pages);
      }
    } catch {
      toast({ title: "Failed to load decks", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [search, sort, page]);

  useEffect(() => { fetchDecks(); }, [fetchDecks]);

  // Reset to page 1 on search / sort change
  useEffect(() => { setPage(1); }, [search, sort]);

  const handleClone = async (deckId: string) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setCloningId(deckId);
    try {
      const res  = await fetch("/api/decks/clone", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId,
          userId: (session.user as { id?: string }).id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Deck cloned!", description: "Added to your decks. Start studying anytime." });
        setDecks((prev) =>
          prev.map((d) => d.id === deckId ? { ...d, cloneCount: d.cloneCount + 1 } : d)
        );
      } else {
        throw new Error(json.error);
      }
    } catch {
      toast({ title: "Clone failed", variant: "error" });
    } finally {
      setCloningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Explore Decks</h1>
              <p className="text-sm text-gray-500">Browse and clone community flashcard decks</p>
            </div>
          </div>
        </div>

        {/* ── Search + Sort ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, title, or tag..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-600 rounded-xl h-11"
            />
          </div>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSort(opt.value); setPage(1); }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                  sort === opt.value
                    ? "bg-white text-black border-white"
                    : "bg-zinc-900 text-gray-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-24">
            <Globe className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No decks found</p>
            <p className="text-sm text-gray-700 mt-1">Try a different search or be the first to publish!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {decks.map((deck) => (
              <PublicDeckCard
                key={deck.id}
                deck={deck}
                onClone={handleClone}
                isCloningThis={cloningId === deck.id}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-1 bg-transparent border-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-900 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <span className="text-sm font-bold text-gray-500">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="gap-1 bg-transparent border-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-900 rounded-xl"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Public Deck Card ──────────────────────────────────────────────────────────
function PublicDeckCard({
  deck,
  onClone,
  isCloningThis,
}: {
  deck: PublicDeck;
  onClone: (id: string) => void;
  isCloningThis: boolean;
}) {
  const colorStyle = { background: `linear-gradient(90deg, transparent, ${deck.color}, transparent)` };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 overflow-hidden shadow-lg">
      {/* Color strip — dynamic colour kept as inline style (SVG/canvas pattern) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-70 group-hover:opacity-100 transition-opacity" style={colorStyle} />

      <div className="p-5 flex flex-col flex-1">
        {/* Source badge + card count */}
        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border flex items-center gap-1",
            deck.sourceType === "PDF"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
          )}>
            {deck.sourceType === "PDF"
              ? <><FileText className="w-3 h-3" /> PDF</>
              : <><Tag className="w-3 h-3" /> Topic</>
            }
          </span>
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {deck.cardCount}
          </span>
        </div>

        <h3 className="font-bold text-gray-100 text-base leading-tight line-clamp-2 group-hover:text-white transition-colors mb-1">
          {deck.title}
        </h3>

        {deck.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {deck.description}
          </p>
        )}

        <div className="flex-1" />

        {/* Tags */}
        {deck.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {deck.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] font-semibold text-gray-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-2.5 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {deck.cloneCount}
            </span>
            {deck.user.name && (
              <span className="truncate max-w-[80px]">{deck.user.name}</span>
            )}
          </div>

          <button
            onClick={() => onClone(deck.id)}
            disabled={isCloningThis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isCloningThis
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Copy className="w-3.5 h-3.5" />
            }
            Clone
          </button>
        </div>
      </div>
    </div>
  );
}