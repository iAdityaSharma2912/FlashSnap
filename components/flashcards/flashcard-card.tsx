"use client";

import { useState } from "react";
import { RotateCcw, Lightbulb, BookOpen } from "lucide-react";
import { cn, getDifficultyColor, getMasteryColor, getMasteryLabel } from "@/lib/utils";
import type { Flashcard } from "@/lib/types";

interface FlashcardCardProps {
  card: Flashcard;
  showControls?: boolean;
  onRate?: (rating: 0 | 1 | 2 | 3) => void;
  className?: string;
}

const RATING_BUTTONS = [
  { rating: 0 as const, label: "Again", color: "#FF4040", bgClass: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" },
  { rating: 1 as const, label: "Hard", color: "#FF6B35", bgClass: "bg-orange/10 border-orange/30 text-orange hover:bg-orange/20" },
  { rating: 2 as const, label: "Good", color: "#FFD60A", bgClass: "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20" },
  { rating: 3 as const, label: "Easy", color: "#00FF9F", bgClass: "bg-accent/10 border-accent/30 text-accent hover:bg-accent/20" },
];

export function FlashcardCard({ card, showControls = false, onRate, className }: FlashcardCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleFlip = () => {
    setFlipped((f) => !f);
    setShowHint(false);
  };

  const handleRate = (rating: 0 | 1 | 2 | 3) => {
    onRate?.(rating);
    setFlipped(false);
    setShowHint(false);
    setShowExplanation(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Flip card */}
      <div
        className={cn("flip-card w-full cursor-pointer", flipped && "flipped")}
        style={{ height: 280 }}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === " " && handleFlip()}
      >
        <div className="flip-card-inner">
          {/* Front */}
          <div className="flip-card-front">
            <div className="w-full h-full rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {card.topic && (
                    <span className="text-xs text-gray-500 bg-dark-muted px-2 py-1 rounded-md">
                      {card.topic}
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-1 rounded-md border"
                    style={{
                      color: getDifficultyColor(card.difficulty),
                      borderColor: getDifficultyColor(card.difficulty) + "40",
                      backgroundColor: getDifficultyColor(card.difficulty) + "15",
                    }}
                  >
                    {card.difficulty.charAt(0) + card.difficulty.slice(1).toLowerCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  flip
                </span>
              </div>

              {/* Question */}
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-base sm:text-lg font-medium text-gray-100 leading-relaxed">
                  {card.question}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4">
                {card.hint && !showHint && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    Show hint
                  </button>
                )}
                {showHint && card.hint && (
                  <p className="text-xs text-primary/80 italic">{card.hint}</p>
                )}
                <div
                  className="ml-auto w-2 h-2 rounded-full"
                  style={{ backgroundColor: getMasteryColor(card.mastery) }}
                />
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="flip-card-back">
            <div className="w-full h-full rounded-2xl border border-primary/30 bg-dark-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-primary font-medium">Answer</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    color: getMasteryColor(card.mastery),
                    backgroundColor: getMasteryColor(card.mastery) + "20",
                  }}
                >
                  {getMasteryLabel(card.mastery)}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center text-center overflow-y-auto">
                <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
                  {card.answer}
                </p>
              </div>

              {card.explanation && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowExplanation((s) => !s); }}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-accent transition-colors mt-3"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {showExplanation ? "Hide" : "Show"} explanation
                </button>
              )}
              {showExplanation && card.explanation && (
                <p className="text-xs text-gray-400 mt-2 p-3 rounded-xl bg-dark-muted border border-dark-border leading-relaxed">
                  {card.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons — only when flipped and controls enabled */}
      {showControls && flipped && onRate && (
        <div className="grid grid-cols-4 gap-2 mt-4 animate-slide-up">
          {RATING_BUTTONS.map(({ rating, label, bgClass }) => (
            <button
              key={rating}
              onClick={() => handleRate(rating)}
              className={cn(
                "py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 active:scale-95",
                bgClass
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Instruction */}
      {showControls && !flipped && (
        <p className="text-center text-xs text-gray-600 mt-3">
          Click the card to reveal the answer
        </p>
      )}
    </div>
  );
}
