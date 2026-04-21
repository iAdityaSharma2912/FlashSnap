"use client";

import { useState } from "react";
import { RotateCw, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/lib/types";

interface FlashcardCardProps {
  card: Flashcard;
  showControls?: boolean;
  onRate?: (rating: 0 | 1 | 2 | 3) => void;
}

export function FlashcardCard({ card, showControls, onRate }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Helper to color-code difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toUpperCase()) {
      case "EASY": return "text-green-400 border-green-400/20 bg-green-400/10";
      case "MEDIUM": return "text-yellow-400 border-yellow-400/20 bg-yellow-400/10";
      case "HARD": return "text-red-400 border-red-400/20 bg-red-400/10";
      default: return "text-blue-400 border-blue-400/20 bg-blue-400/10";
    }
  };

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 cursor-pointer min-h-[260px] shadow-lg w-full"
    >
      {!isFlipped ? (
        // FRONT OF CARD (Question)
        <div className="flex flex-col h-full animate-in fade-in duration-300">
          <div className="flex items-start justify-between mb-4">
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-md border", getDifficultyColor(card.difficulty))}>
              {card.difficulty || "MEDIUM"}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              Flip
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <h3 className="text-xl md:text-2xl font-bold text-white text-center leading-relaxed">
              {card.question}
            </h3>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {card.hint ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-orange-400 transition-colors"
              >
                <Lightbulb className={cn("w-4 h-4", showHint && "text-orange-400")} />
                {showHint ? "Hide hint" : "Show hint"}
              </button>
            ) : <div />} {/* Empty div to keep alignment if no hint */}
            
            <div className="w-2 h-2 rounded-full bg-blue-500/50" />
          </div>

          {showHint && card.hint && (
            <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-orange-200">{card.hint}</p>
            </div>
          )}
        </div>
      ) : (
        // BACK OF CARD (Answer)
        <div className="flex flex-col h-full animate-in fade-in duration-300">
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md border text-orange-400 border-orange-400/20 bg-orange-400/10">
              Answer
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md border text-zinc-300 border-zinc-700 bg-zinc-800">
              {card.mastery || "NEW"}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-4 space-y-4">
            <p className="text-lg md:text-xl font-medium text-gray-200 text-center leading-relaxed">
              {card.answer}
            </p>
            
            {card.explanation && (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-gray-400 text-center">
                {card.explanation}
              </div>
            )}
          </div>

          {/* If in Study Mode, show the rating controls on the back of the card */}
          {showControls && onRate ? (
            <div 
              className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-zinc-800"
              onClick={(e) => e.stopPropagation()} // Prevent flipping when rating
            >
              <button onClick={() => onRate(0)} className="py-2 rounded-lg text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors">Again</button>
              <button onClick={() => onRate(1)} className="py-2 rounded-lg text-xs font-bold text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 transition-colors">Hard</button>
              <button onClick={() => onRate(2)} className="py-2 rounded-lg text-xs font-bold text-green-400 bg-green-400/10 hover:bg-green-400/20 transition-colors">Good</button>
              <button onClick={() => onRate(3)} className="py-2 rounded-lg text-xs font-bold text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 transition-colors">Easy</button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-end">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                <RotateCw className="w-3.5 h-3.5" />
                Flip back
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}