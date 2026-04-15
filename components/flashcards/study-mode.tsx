"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, RotateCcw, Target, Trophy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FlashcardCard } from "./flashcard-card";
import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StudyModeProps {
  cards: Flashcard[];
  deckId: string;
  onComplete?: () => void;
  onBack?: () => void;
}

interface SessionStats {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

export function StudyMode({ cards: initialCards, deckId, onComplete, onBack }: StudyModeProps) {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<SessionStats>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCard = cards[currentIndex];
  const total = cards.length;
  const reviewed = Object.values(stats).reduce((a, b) => a + b, 0);
  const progress = total > 0 ? (reviewed / total) * 100 : 0;

  const handleRate = useCallback(async (rating: 0 | 1 | 2 | 3) => {
    if (!currentCard || isSubmitting) return;
    setIsSubmitting(true);

    const ratingKey = ["again", "hard", "good", "easy"][rating] as keyof SessionStats;
    setStats((s) => ({ ...s, [ratingKey]: s[ratingKey] + 1 }));

    try {
      await fetch(`/api/flashcards/${currentCard.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, timeSpent: 0 }),
      });
    } catch {
      // Non-blocking — rating will still advance
    }

    if (currentIndex + 1 >= total) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
    setIsSubmitting(false);
  }, [currentCard, currentIndex, total, isSubmitting]);

  const restart = () => {
    setCurrentIndex(0);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setDone(false);
  };

  if (done) {
    const totalReviews = Object.values(stats).reduce((a, b) => a + b, 0);
    const goodPercent = totalReviews > 0 ? Math.round(((stats.good + stats.easy) / totalReviews) * 100) : 0;
    
    // Tailwind hex colors for the SVG stroke
    const scoreColor = goodPercent >= 80 ? "#22c55e" : goodPercent >= 50 ? "#eab308" : "#f97316";

    return (
      <div className="flex flex-col items-center gap-8 py-12 animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto text-center relative">
        {/* Glow behind trophy */}
        <div className="absolute top-10 w-48 h-48 bg-orange-500/20 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500/20 to-blue-500/20 border border-zinc-800 flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <Trophy className="w-12 h-12 text-orange-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-black" />
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Session Complete!</h2>
          <p className="text-gray-400 font-medium mt-2">{totalReviews} cards reviewed successfully</p>
        </div>

        {/* Score ring */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeDasharray={`${goodPercent * 2.64} 264`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{goodPercent}%</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Retention</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-4 gap-3 w-full">
          {[
            { label: "Again", value: stats.again, colorClass: "text-red-500", bgClass: "bg-red-500/10 border-red-500/20" },
            { label: "Hard", value: stats.hard, colorClass: "text-orange-500", bgClass: "bg-orange-500/10 border-orange-500/20" },
            { label: "Good", value: stats.good, colorClass: "text-green-500", bgClass: "bg-green-500/10 border-green-500/20" },
            { label: "Easy", value: stats.easy, colorClass: "text-blue-500", bgClass: "bg-blue-500/10 border-blue-500/20" },
          ].map(({ label, value, colorClass, bgClass }) => (
            <div key={label} className={cn("rounded-2xl border p-4 text-center transition-transform hover:scale-105", bgClass)}>
              <p className={cn("text-2xl font-black", colorClass)}>{value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
          <Button 
            variant="outline" 
            onClick={restart} 
            className="flex-1 gap-2 bg-transparent border-zinc-800 text-white hover:bg-zinc-900 h-14 rounded-xl font-bold"
          >
            <RotateCcw className="w-5 h-5" />
            Study Again
          </Button>
          <Button 
            onClick={onComplete} 
            className="flex-1 gap-2 bg-white text-black hover:bg-gray-200 h-14 rounded-xl font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all"
          >
            <Target className="w-5 h-5 fill-black" />
            Finish & Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="gap-2 text-gray-400 hover:text-white hover:bg-zinc-900 rounded-lg px-3"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Exit</span>
        </Button>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6">
          {/* Card Counter */}
          <span className="text-sm font-bold text-gray-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <span className="text-white">{currentIndex + 1}</span>
            <span className="mx-1.5 opacity-50">/</span>
            {total}
          </span>
          
          {/* Session Stats Tiny Indicators */}
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />{stats.again}</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />{stats.hard}</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />{stats.good}</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />{stats.easy}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-1">
        <Progress value={progress} color="#3b82f6" className="h-1.5 bg-zinc-900" />
      </div>

      {/* Card */}
      {currentCard && (
        <div className="pt-2">
          <FlashcardCard
            key={currentCard.id}
            card={currentCard}
            showControls
            onRate={handleRate}
          />
        </div>
      )}
    </div>
  );
}