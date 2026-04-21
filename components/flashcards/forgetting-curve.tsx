"use client";

import { useMemo } from "react";
import { Brain, TrendingDown, Calendar, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/lib/types";

interface ForgettingCurveProps {
  cards: Flashcard[];
  deckColor?: string;
}

// Ebbinghaus: R = e^(-t/S) × 100
function getRetention(daysSinceReview: number, stability: number): number {
  return Math.exp(-daysSinceReview / Math.max(stability, 1)) * 100;
}

function getStability(card: Flashcard): number {
  return Math.max(card.interval ?? 1, 1);
}

function getDaysSinceLastReview(card: Flashcard): number {
  const nextReview = new Date(card.nextReview);
  const interval   = card.interval ?? 1;
  const lastReview = new Date(nextReview.getTime() - interval * 86400000);
  return Math.max(0, (Date.now() - lastReview.getTime()) / 86400000);
}

interface CardWithCurve {
  card: Flashcard;
  currentRetention: number;
  stability: number;
  daysSince: number;
  daysUntilForgotten: number;
}

// Tailwind-safe colour classes derived from retention value
function retentionColorClass(value: number): string {
  if (value >= 75) return "text-green-400";
  if (value >= 50) return "text-yellow-400";
  return "text-red-400";
}

// Hex colours still needed for SVG strokes (cannot be done with Tailwind)
function retentionHex(value: number): string {
  if (value >= 75) return "#22c55e";
  if (value >= 50) return "#eab308";
  return "#ef4444";
}

export function ForgettingCurveVisualizer({ cards, deckColor = "#3b82f6" }: ForgettingCurveProps) {
  const cardData = useMemo<CardWithCurve[]>(() => {
    return cards.map((card) => {
      const stability         = getStability(card);
      const daysSince         = getDaysSinceLastReview(card);
      const currentRetention  = getRetention(daysSince, stability);
      const daysUntilForgotten = Math.max(0, stability * Math.LN2 - daysSince);
      return { card, currentRetention, stability, daysSince, daysUntilForgotten };
    });
  }, [cards]);

  const sorted = useMemo(
    () => [...cardData].sort((a, b) => a.currentRetention - b.currentRetention),
    [cardData]
  );

  const avgRetention = useMemo(() =>
    cardData.length > 0
      ? Math.round(cardData.reduce((s, c) => s + c.currentRetention, 0) / cardData.length)
      : 0,
    [cardData]
  );

  const atRisk       = cardData.filter((c) => c.currentRetention < 50).length;
  const strongMemory = cardData.filter((c) => c.currentRetention >= 80).length;

  // SVG curve points for aggregate forgetting curve
  const curvePoints = useMemo(() => {
    const avgStability = cardData.length > 0
      ? cardData.reduce((s, c) => s + c.stability, 0) / cardData.length
      : 7;
    const W = 400, H = 120, days = 30;
    return Array.from({ length: days + 1 }, (_, d) => {
      const retention = getRetention(d, avgStability);
      return `${(d / days) * W},${H - (retention / 100) * H}`;
    }).join(" ");
  }, [cardData]);

  if (cards.length === 0) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 text-center">
        <Brain className="w-10 h-10 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 font-medium text-sm">Study some cards to see your forgetting curve</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-black text-white text-base">Memory Retention</h3>
            <p className="text-xs text-gray-500">Based on Ebbinghaus forgetting curve</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-3xl font-black", retentionColorClass(avgRetention))}>{avgRetention}%</p>
          <p className="text-xs text-gray-600 font-semibold">avg retention</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "At Risk",        value: atRisk,        sublabel: "< 50% retention",   colorClass: "text-red-400",   bg: "bg-red-500/10 border-red-500/20" },
          { label: "Avg Retention",  value: `${avgRetention}%`, sublabel: "across all cards", colorClass: retentionColorClass(avgRetention), bg: "bg-zinc-800 border-zinc-700" },
          { label: "Strong",         value: strongMemory,  sublabel: ">= 80% retention",  colorClass: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
        ].map(({ label, value, sublabel, colorClass, bg }) => (
          <div key={label} className={cn("rounded-2xl border p-4 text-center", bg)}>
            <p className={cn("text-xl font-black", colorClass)}>{value}</p>
            <p className="text-xs font-bold text-gray-400 mt-0.5">{label}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{sublabel}</p>
          </div>
        ))}
      </div>

      {/* SVG Curve — stroke colours must be inline (SVG has no Tailwind support) */}
      <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Forgetting Curve</p>
          <span className="text-xs text-gray-600 font-medium">30 days</span>
        </div>
        <div className="relative">
          <svg viewBox="0 0 400 140" className="w-full h-28" preserveAspectRatio="none">
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = 120 - (pct / 100) * 120;
              return (
                <g key={pct}>
                  <line x1="0" y1={y} x2="400" y2={y} stroke="#27272a" strokeWidth="1" />
                  <text x="2" y={y - 2} fontSize="8" fill="#52525b" fontFamily="monospace">{pct}%</text>
                </g>
              );
            })}
            {/* Today marker — dynamic deckColor, must be inline for SVG */}
            <line x1="0" y1="0" x2="0" y2="120" stroke={deckColor} strokeWidth="2" strokeDasharray="4,2" opacity="0.5" />
            {/* Danger zone */}
            <rect x="0" y="60" width="400" height="60" fill="#ef4444" opacity="0.04" />
            {/* Curve — dynamic deckColor, must be inline for SVG */}
            <polyline
              points={curvePoints}
              fill="none"
              stroke={deckColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>
          <div className="flex justify-between text-[10px] text-gray-700 font-medium mt-1">
            <span>Today</span>
            <span>15 days</span>
            <span>30 days</span>
          </div>
        </div>
      </div>

      {/* At-risk cards list */}
      {atRisk > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-sm font-bold text-red-400">Cards Fading Fast</p>
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
              {atRisk}
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {sorted
              .filter((c) => c.currentRetention < 50)
              .slice(0, 8)
              .map(({ card, currentRetention, daysUntilForgotten }) => (
                <div
                  key={card.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                >
                  <p className="text-sm text-gray-300 font-medium line-clamp-1 flex-1">{card.question}</p>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <RetentionBar value={currentRetention} />
                    <div className="text-right">
                      <p className={cn("text-xs font-black", retentionColorClass(currentRetention))}>
                        {Math.round(currentRetention)}%
                      </p>
                      {daysUntilForgotten < 1 ? (
                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" /> Study now!
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-600 flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {Math.round(daysUntilForgotten)}d left
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {atRisk === 0 && (
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 text-center">
          <p className="text-green-400 font-bold text-sm">
            🧠 All {cards.length} cards have strong memory retention!
          </p>
          <p className="text-xs text-gray-500 mt-1">Keep reviewing to maintain your mastery</p>
        </div>
      )}
    </div>
  );
}

// Mini retention bar — hex colour needed for style, Tailwind can't do runtime %
function RetentionBar({ value }: { value: number }) {
  return (
    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(2, value)}%`, backgroundColor: retentionHex(value) }}
      />
    </div>
  );
}