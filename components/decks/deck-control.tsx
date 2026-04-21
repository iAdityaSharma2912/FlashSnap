"use client";

import { useState } from "react";
import { Globe, Lock, Loader2, Mic, BookOpen, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// PublishToggle
// ─────────────────────────────────────────────────────────────────────────────
export function PublishToggle({
  deckId,
  initialIsPublic,
}: {
  deckId: string;
  initialIsPublic: boolean;
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = async () => {
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/decks/${deckId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      const json = await res.json();
      if (json.success) {
        setIsPublic(!isPublic);
        toast({
          title: !isPublic ? "Deck published! 🌍" : "Deck made private",
          description: !isPublic
            ? "Others can now find and clone your deck in Explore."
            : "Your deck is now private.",
        });
      } else {
        throw new Error(json.error);
      }
    } catch {
      toast({ title: "Failed to update", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:pointer-events-none",
        isPublic
          ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
          : "bg-zinc-900 text-gray-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
      )}
    >
      {isLoading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : isPublic
          ? <Globe className="w-4 h-4" />
          : <Lock className="w-4 h-4" />
      }
      {isPublic ? "Public" : "Private"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StudyModeSwitcher
// ─────────────────────────────────────────────────────────────────────────────
export type StudyModeType = "standard" | "voice" | "exam";

interface ModeConfig {
  value: StudyModeType;
  label: string;
  icon: React.ReactNode;
}

const MODES: ModeConfig[] = [
  { value: "standard", label: "Standard", icon: <BookOpen className="w-4 h-4" /> },
  { value: "voice",    label: "Voice",    icon: <Mic className="w-4 h-4" /> },
  { value: "exam",     label: "Exam",     icon: <Zap className="w-4 h-4" /> },
];

export function StudyModeSwitcher({
  mode,
  onChange,
  deckId,
}: {
  mode: StudyModeType;
  onChange: (m: StudyModeType) => void;
  deckId: string;
}) {
  return (
    <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => {
            if (m.value === "exam") {
              window.location.href = `/exam/${deckId}`;
              return;
            }
            onChange(m.value);
          }}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
            mode === m.value && m.value !== "exam"
              ? "bg-white text-black shadow-md"
              : "text-gray-400 hover:text-white hover:bg-zinc-800"
          )}
        >
          {m.icon}
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}