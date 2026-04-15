"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, FileText, Tag, Play, Download, Trash2, MoreVertical, Target } from "lucide-react";
import { useState } from "react";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { Deck, DeckStats } from "@/lib/types";

interface DeckCardProps {
  deck: Deck;
  stats?: DeckStats;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function DeckCard({ deck, stats, onDelete, onExport }: DeckCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const masteryPct = stats?.masteryPercent ?? 0;
  
  // Using standard Tailwind hex colors to match the new theme
  const progressColor = masteryPct >= 70 ? "#22c55e" : masteryPct >= 40 ? "#eab308" : "#f97316";

  const handleCardClick = () => {
    router.push(`/decks/${deck.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl"
    >
      {/* Dynamic Top Glow Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-70 transition-opacity group-hover:opacity-100"
        style={{ 
          background: deck.color ? `linear-gradient(90deg, transparent, ${deck.color}, transparent)` : 'linear-gradient(90deg, transparent, #3b82f6, transparent)' 
        }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={cn(
                "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border",
                deck.sourceType === "PDF"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-orange-500/10 text-orange-400 border-orange-500/20"
              )}>
                {deck.sourceType === "PDF" ? (
                  <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> PDF</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> Topic</span>
                )}
              </span>
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {deck.cardCount} cards
              </span>
            </div>
            
            <h3 className="font-bold text-gray-100 text-lg leading-tight truncate group-hover:text-white transition-colors">
              {deck.title}
            </h3>
            
            {deck.description && (
              <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {truncate(deck.description, 80)}
              </p>
            )}
          </div>

          {/* Kebab Menu */}
          <div className="relative flex-shrink-0">
            <button aria-label="Edit deck"
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                setMenuOpen((o) => !o); 
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} 
                />
                <div
                  className="absolute right-0 top-8 z-20 bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-800 min-w-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                >
                  {onExport && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onExport(deck.id); setMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Deck
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(deck.id); setMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border-t border-zinc-800"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Deck
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Spacer to push footer to bottom if descriptions vary in length */}
        <div className="flex-1" />

        {/* Mastery Progress */}
        {stats && (
          <div className="space-y-2 mb-5 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-400">Mastery</span>
              <span style={{ color: progressColor }}>
                {masteryPct}%
              </span>
            </div>
            <Progress
              value={masteryPct}
              color={progressColor}
              className="h-1.5 bg-zinc-800"
            />
            {stats.dueToday > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <Target className="w-3.5 h-3.5 text-orange-500" />
                <p className="text-xs font-bold text-orange-500">
                  {stats.dueToday} card{stats.dueToday !== 1 ? "s" : ""} due today
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            {deck.lastStudied ? formatRelativeTime(deck.lastStudied) : "Not studied yet"}
          </div>
          
          <Link 
            href={`/study/${deck.id}`}
            onClick={(e) => e.stopPropagation()} // Critical to prevent parent onClick
          >
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)]">
              <Play className="w-3.5 h-3.5 fill-black" />
              Study
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}