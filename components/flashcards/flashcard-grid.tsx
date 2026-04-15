"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FlashcardCard } from "./flashcard-card";
import type { Flashcard } from "@/lib/types";

interface FlashcardGridProps {
  cards: Flashcard[];
  showFilters?: boolean;
}

const DIFFICULTIES = ["All", "EASY", "MEDIUM", "HARD"];
const MASTERIES = ["All", "NEW", "LEARNING", "REVIEWING", "MASTERED"];

export function FlashcardGrid({ cards, showFilters = true }: FlashcardGridProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [mastery, setMastery] = useState("All");
  const [topic, setTopic] = useState("All");

  const topics = ["All", ...Array.from(new Set(cards.map((c) => c.topic).filter(Boolean) as string[]))];

  const filtered = cards.filter((c) => {
    const matchSearch = !search || c.question.toLowerCase().includes(search.toLowerCase()) || c.answer.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficulty === "All" || c.difficulty === difficulty;
    const matchMastery = mastery === "All" || c.mastery === mastery;
    const matchTopic = topic === "All" || c.topic === topic;
    return matchSearch && matchDiff && matchMastery && matchTopic;
  });

  return (
    <div className="space-y-5">
      {showFilters && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* Filter row */}
          <div className="flex flex-wrap gap-2 items-center">
            <SlidersHorizontal className="w-4 h-4 text-gray-500 flex-shrink-0" />
            {/* Difficulty */}
            <div className="flex gap-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    difficulty === d
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-dark-muted text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {d === "All" ? "All difficulty" : d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {/* Mastery */}
            <div className="flex gap-1">
              {MASTERIES.map((m) => (
                <button
                  key={m}
                  onClick={() => setMastery(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    mastery === m
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "bg-dark-muted text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {m === "All" ? "All mastery" : m.charAt(0) + m.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="text-gray-200 font-medium">{filtered.length}</span> cards
          {filtered.length !== cards.length && ` of ${cards.length}`}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No cards match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((card) => (
            <FlashcardCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
