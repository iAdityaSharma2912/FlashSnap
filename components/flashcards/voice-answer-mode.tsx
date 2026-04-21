"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ChevronLeft, Mic, MicOff, Volume2, Loader2,
  CheckCircle2, XCircle, RotateCcw, Trophy, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Web Speech API type shims ─────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

interface VoiceModeProps {
  cards: Flashcard[];
  deckId: string;
  onComplete?: () => void;
  onBack?: () => void;
}

interface GradeResult {
  score: 0 | 1 | 2 | 3;
  rating: "again" | "hard" | "good" | "easy";
  feedback: string;
}

interface SessionStats {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

const RATING_CONFIG = {
  again: { label: "Again", colorClass: "text-red-400",    bgClass: "bg-red-500/10 border-red-500/20",     activeRing: "ring-red-500" },
  hard:  { label: "Hard",  colorClass: "text-orange-400", bgClass: "bg-orange-500/10 border-orange-500/20", activeRing: "ring-orange-500" },
  good:  { label: "Good",  colorClass: "text-green-400",  bgClass: "bg-green-500/10 border-green-500/20",  activeRing: "ring-green-500" },
  easy:  { label: "Easy",  colorClass: "text-blue-400",   bgClass: "bg-blue-500/10 border-blue-500/20",   activeRing: "ring-blue-500" },
} as const;

// Score-circle colour — kept as inline style because it's a runtime value from the API
const SCORE_COLORS: Record<string, string> = {
  again: "#ef4444",
  hard:  "#f97316",
  good:  "#22c55e",
  easy:  "#3b82f6",
};

export function VoiceAnswerMode({ cards, deckId, onComplete, onBack }: VoiceModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase]   = useState<"question" | "listening" | "grading" | "result" | "done">("question");
  const [transcript, setTranscript] = useState("");
  const [grade, setGrade]   = useState<GradeResult | null>(null);
  const [stats, setStats]   = useState<SessionStats>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [isSupported, setIsSupported] = useState(true);
  const [micError, setMicError] = useState("");

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const card  = cards[currentIndex];
  const total = cards.length;
  const reviewed = Object.values(stats).reduce((a, b) => a + b, 0);
  const progress = total > 0 ? (reviewed / total) * 100 : 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!SR) setIsSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    setMicError("");
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { setIsSupported(false); return; }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      setTranscript(e.results[0][0].transcript);
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setMicError(
        e.error === "not-allowed"
          ? "Microphone access denied. Please allow microphone access."
          : "Could not capture audio. Please try again."
      );
      setPhase("question");
    };
    recognition.onend = () => { setPhase("grading"); };

    recognitionRef.current = recognition;
    setPhase("listening");
    recognition.start();
  }, []);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); }, []);

  // Auto-grade when transcript arrives
  useEffect(() => {
    if (phase !== "grading" || !transcript || !card) return;
    const doGrade = async () => {
      try {
        const res  = await fetch("/api/grade-voice", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: card.question,
            correctAnswer: card.answer,
            spokenAnswer: transcript,
          }),
        });
        const json = await res.json();
        if (json.success) { setGrade(json.data); setPhase("result"); }
      } catch {
        setGrade({ score: 2, rating: "good", feedback: "AI grading failed — mark yourself." });
        setPhase("result");
      }
    };
    doGrade();
  }, [phase, transcript, card]);

  const acceptGrade = useCallback(async (overrideRating?: GradeResult["rating"]) => {
    const finalRating = overrideRating ?? grade?.rating ?? "good";
    const ratingToScore: Record<string, 0 | 1 | 2 | 3> = { again: 0, hard: 1, good: 2, easy: 3 };
    const score = ratingToScore[finalRating];

    setStats((s) => ({ ...s, [finalRating]: s[finalRating as keyof SessionStats] + 1 }));

    try {
      await fetch(`/api/flashcards/${card.id}/review`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: score, timeSpent: 0 }),
      });
    } catch { /* non-blocking */ }

    if (currentIndex + 1 >= total) {
      setPhase("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setTranscript("");
      setGrade(null);
      setPhase("question");
    }
  }, [grade, card, currentIndex, total]);

  const speakQuestion = useCallback(() => {
    if (!card) return;
    const u = new SpeechSynthesisUtterance(card.question);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  }, [card]);

  const restart = () => {
    setCurrentIndex(0);
    setPhase("question");
    setTranscript("");
    setGrade(null);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  // ── DONE ────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const totalReviews = Object.values(stats).reduce((a, b) => a + b, 0);
    const goodPercent  = totalReviews > 0
      ? Math.round(((stats.good + stats.easy) / totalReviews) * 100) : 0;
    // Dynamic colour for the SVG ring — must be inline
    const scoreColor = goodPercent >= 80 ? "#22c55e" : goodPercent >= 50 ? "#eab308" : "#f97316";

    return (
      <div className="flex flex-col items-center gap-8 py-12 animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-zinc-800 flex items-center justify-center shadow-2xl">
          <Trophy className="w-12 h-12 text-purple-400" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Voice Session Complete!</h2>
          <p className="text-gray-400 font-medium mt-2">{totalReviews} cards answered by voice</p>
        </div>

        {/* Score ring — stroke colour is runtime, inline style is intentional */}
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
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Voice Score</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 w-full">
          {(["again", "hard", "good", "easy"] as const).map((key) => {
            const cfg = RATING_CONFIG[key];
            return (
              <div key={key} className={cn("rounded-2xl border p-4 text-center", cfg.bgClass)}>
                <p className={cn("text-2xl font-black", cfg.colorClass)}>{stats[key]}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 w-full">
          <Button
            variant="outline" onClick={restart}
            className="flex-1 gap-2 bg-transparent border-zinc-800 text-white hover:bg-zinc-900 h-14 rounded-xl font-bold"
          >
            <RotateCcw className="w-5 h-5" /> Try Again
          </Button>
          <Button
            onClick={onComplete}
            className="flex-1 gap-2 bg-white text-black hover:bg-gray-200 h-14 rounded-xl font-bold"
          >
            <Target className="w-5 h-5" /> Finish
          </Button>
        </div>
      </div>
    );
  }

  // ── MAIN VOICE UI ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
        <Button
          variant="ghost" size="sm" onClick={onBack}
          className="gap-2 text-gray-400 hover:text-white hover:bg-zinc-900 rounded-lg px-3"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Exit</span>
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <span className="text-white">{currentIndex + 1}</span>
            <span className="mx-1.5 opacity-50">/</span>
            {total}
          </span>
          <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Mic className="w-3 h-3" /> Voice Mode
          </span>
        </div>
      </div>

      <div className="px-1">
        <Progress value={progress} color="#a855f7" className="h-1.5 bg-zinc-900" />
      </div>

      {/* Card */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 shadow-2xl min-h-[320px] flex flex-col">
        {/* Question */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Question</span>
            <button
              onClick={speakQuestion}
              aria-label="Read question aloud"
              title="Read question aloud"
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xl font-bold text-white leading-relaxed">{card?.question}</p>
        </div>

        {/* Phase UI */}
        <div className="mt-8">

          {phase === "question" && (
            <div className="space-y-3">
              {!isSupported && (
                <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center font-medium">
                  Your browser doesn&apos;t support voice recognition. Use Chrome or Edge.
                </p>
              )}
              {micError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center font-medium">
                  {micError}
                </p>
              )}
              <button
                onClick={startListening}
                disabled={!isSupported}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-base flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Mic className="w-5 h-5" />
                Speak Your Answer
              </button>
            </div>
          )}

          {phase === "listening" && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                <button
                  onClick={stopListening}
                  aria-label="Stop recording"
                  className="relative w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center transition-all"
                >
                  <MicOff className="w-7 h-7" />
                </button>
              </div>
              <p className="text-sm font-bold text-red-400 animate-pulse">Listening… tap to stop</p>
            </div>
          )}

          {phase === "grading" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
              <p className="text-sm font-bold text-gray-400">AI is grading your answer…</p>
              {transcript && (
                <p className="text-xs text-gray-500 italic text-center max-w-xs">
                  &ldquo;{transcript}&rdquo;
                </p>
              )}
            </div>
          )}

          {phase === "result" && grade && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {transcript && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">You said</p>
                  <p className="text-sm text-gray-200 italic">&ldquo;{transcript}&rdquo;</p>
                </div>
              )}

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Correct Answer</p>
                <p className="text-sm text-green-200">{card?.answer}</p>
              </div>

              {/* AI feedback — colour driven by rating at runtime */}
              <div className={cn("rounded-xl p-4 border", RATING_CONFIG[grade.rating].bgClass)}>
                <div className="flex items-center gap-2 mb-1">
                  {grade.score >= 2
                    ? <CheckCircle2 className={cn("w-4 h-4", RATING_CONFIG[grade.rating].colorClass)} />
                    : <XCircle      className={cn("w-4 h-4", RATING_CONFIG[grade.rating].colorClass)} />
                  }
                  <p className={cn("text-xs font-black uppercase tracking-wider", RATING_CONFIG[grade.rating].colorClass)}>
                    AI Rating: {grade.rating.toUpperCase()}
                  </p>
                </div>
                <p className="text-xs text-gray-300">{grade.feedback}</p>
              </div>

              {/* Override buttons — active ring uses Tailwind class, not inline ringColor */}
              <div>
                <p className="text-xs text-center text-gray-600 mb-2 font-semibold">Override rating if needed:</p>
                <div className="grid grid-cols-4 gap-2">
                  {(["again", "hard", "good", "easy"] as const).map((r) => {
                    const cfg       = RATING_CONFIG[r];
                    const isActive  = r === grade.rating;
                    return (
                      <button
                        key={r}
                        onClick={() => acceptGrade(r)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-black border transition-all hover:scale-105 active:scale-95",
                          isActive
                            ? cn(cfg.bgClass, cfg.colorClass, "ring-2 ring-offset-1 ring-offset-zinc-900", cfg.activeRing)
                            : "bg-zinc-900 border-zinc-800 text-gray-400 hover:border-zinc-600"
                        )}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={() => acceptGrade()}
                className="w-full h-12 bg-white text-black font-bold rounded-xl hover:bg-gray-200"
              >
                Accept &amp; Next →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}