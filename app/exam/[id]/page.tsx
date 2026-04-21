"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  CalendarDays, Target, Trophy, RotateCcw, ChevronLeft,
  CheckCircle2, XCircle, Clock, BookOpen, Loader2, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/lib/types";

interface ExamSchedule {
  daysUntilExam: number | null;
  totalCards: number;
  masteredCards: number;
  unmasteredCards: number;
  recommendedPerDay: number;
}

interface ExamDeck {
  id: string;
  title: string;
  examDate: string | null;
  color: string;
}

type ExamPhase = "setup" | "active" | "results";

interface AnswerRecord {
  card: Flashcard;
  userAnswer: string;
  isCorrect: boolean | null;
}

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [deck, setDeck]         = useState<ExamDeck | null>(null);
  const [cards, setCards]       = useState<Flashcard[]>([]);
  const [schedule, setSchedule] = useState<ExamSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [phase, setPhase]           = useState<ExamPhase>("setup");
  const [examDate, setExamDate]     = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers]       = useState<AnswerRecord[]>([]);
  const [timeLeft, setTimeLeft]     = useState(0);
  const [isSavingDate, setIsSavingDate] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch(`/api/exam/${id}`);
      const json = await res.json();
      if (json.success) {
        setDeck(json.data.deck);
        setCards(json.data.cards);
        setSchedule(json.data.schedule);
        if (json.data.deck.examDate) {
          setExamDate(new Date(json.data.deck.examDate).toISOString().split("T")[0]);
        }
      }
    } catch {
      toast({ title: "Failed to load exam data", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Per-card 30 s timer
  useEffect(() => {
    if (phase !== "active" || showAnswer) return;
    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); setShowAnswer(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, currentIndex, showAnswer]);

  const saveExamDate = async () => {
    setIsSavingDate(true);
    try {
      await fetch(`/api/exam/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examDate }),
      });
      await fetchData();
      toast({ title: "Exam date saved!" });
    } catch {
      toast({ title: "Failed to save date", variant: "error" });
    } finally {
      setIsSavingDate(false);
    }
  };

  const startExam = () => {
    setPhase("active");
    setCurrentIndex(0);
    setAnswers([]);
    setUserAnswer("");
    setShowAnswer(false);
  };

  const markAnswer = (isCorrect: boolean) => {
    const card = cards[currentIndex];
    setAnswers((prev) => [...prev, { card, userAnswer, isCorrect }]);
    setUserAnswer("");
    setShowAnswer(false);
    if (currentIndex + 1 >= cards.length) {
      setPhase("results");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────
  if (phase === "results") {
    const correct  = answers.filter((a) => a.isCorrect === true).length;
    const wrong    = answers.filter((a) => a.isCorrect === false).length;
    const skipped  = answers.filter((a) => a.isCorrect === null).length;
    const score    = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;
    const grade =
      score >= 90 ? { label: "A", color: "#22c55e" }
      : score >= 75 ? { label: "B", color: "#84cc16" }
      : score >= 60 ? { label: "C", color: "#eab308" }
      : score >= 45 ? { label: "D", color: "#f97316" }
      : { label: "F", color: "#ef4444" };

    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in-95 duration-500">

            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-zinc-800 flex items-center justify-center shadow-2xl">
              <Trophy className="w-12 h-12 text-orange-400" />
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-tight">Exam Complete!</h2>
              <p className="text-gray-400 mt-1">{deck?.title}</p>
            </div>

            {/* Grade ring */}
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={grade.color}
                  strokeWidth="10"
                  strokeDasharray={`${score * 2.64} 264`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black" style={{ color: grade.color }}>{grade.label}</span>
                <span className="text-sm font-bold text-gray-500">{score}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
              {[
                { label: "Correct", value: correct, color: "#22c55e", bg: "bg-green-500/10 border-green-500/20" },
                { label: "Wrong",   value: wrong,   color: "#ef4444", bg: "bg-red-500/10 border-red-500/20" },
                { label: "Skipped", value: skipped, color: "#6b7280", bg: "bg-zinc-800/50 border-zinc-700" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={cn("rounded-2xl border p-4 text-center", bg)}>
                  <p className="text-2xl font-black" style={{ color }}>{value}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Missed cards */}
            {wrong > 0 && (
              <div className="w-full text-left">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Missed Cards</h3>
                <div className="space-y-2">
                  {answers.filter((a) => !a.isCorrect).map((a, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-200">{a.card.question}</p>
                      <p className="text-xs text-green-400 mt-1.5 font-medium">✓ {a.card.answer}</p>
                      {a.userAnswer && (
                        <p className="text-xs text-red-400 mt-0.5 font-medium">✗ You wrote: {a.userAnswer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={startExam}
                className="flex-1 gap-2 bg-transparent border-zinc-800 text-white hover:bg-zinc-900 h-12 rounded-xl font-bold"
              >
                <RotateCcw className="w-4 h-4" /> Retry
              </Button>
              <Button
                onClick={() => router.push(`/decks/${id}`)}
                className="flex-1 gap-2 bg-white text-black hover:bg-gray-200 h-12 rounded-xl font-bold"
              >
                <Target className="w-4 h-4" /> Back to Deck
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── ACTIVE EXAM ───────────────────────────────────────────────────────────
  if (phase === "active") {
    const card        = cards[currentIndex];
    const progress    = (currentIndex / cards.length) * 100;
    const timerColor  =
      timeLeft > 15 ? "#22c55e" : timeLeft > 7 ? "#eab308" : "#ef4444";

    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          {/* Exam header */}
          <div className="flex items-center justify-between mb-6 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
            <Button
              variant="ghost" size="sm"
              onClick={() => setPhase("setup")}
              className="gap-2 text-gray-400 hover:text-white hover:bg-zinc-900 rounded-lg px-3"
            >
              <ChevronLeft className="w-4 h-4" /> Exit
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                <span className="text-white">{currentIndex + 1}</span>
                <span className="mx-1.5 opacity-50">/</span>
                {cards.length}
              </span>
              <span
                className="flex items-center gap-1.5 text-sm font-black bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800"
                style={{ color: timerColor }}
              >
                <Clock className="w-4 h-4" />
                {timeLeft}s
              </span>
            </div>
          </div>

          <div className="mb-4">
            <Progress value={progress} color={deck?.color ?? "#3b82f6"} className="h-1.5 bg-zinc-900" />
          </div>

          {/* Card */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Exam Mode</span>
            </div>

            <p className="text-xl font-bold text-white leading-relaxed mb-8">{card.question}</p>

            {!showAnswer ? (
              <>
                <label htmlFor="exam-answer" className="sr-only">Your answer</label>
                <textarea
                  id="exam-answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  autoFocus
                  rows={3}
                  className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-zinc-500 transition-colors text-sm font-medium mb-4"
                />
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="w-full h-12 bg-white text-black font-bold rounded-xl hover:bg-gray-200"
                >
                  Show Answer
                </Button>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                {userAnswer && (
                  <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Your Answer</p>
                    <p className="text-sm text-gray-200 font-medium">{userAnswer}</p>
                  </div>
                )}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1.5">Correct Answer</p>
                  <p className="text-sm text-green-200 font-medium">{card.answer}</p>
                  {card.explanation && (
                    <p className="text-xs text-gray-400 mt-2">{card.explanation}</p>
                  )}
                </div>

                <p className="text-center text-sm font-bold text-gray-400">Was your answer correct?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => markAnswer(false)}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Incorrect
                  </button>
                  <button
                    onClick={() => markAnswer(true)}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Correct
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ── SETUP ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => router.push(`/decks/${id}`)}
          className="gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Deck
        </Button>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Exam Mode</h1>
              <p className="text-sm text-gray-500">{deck?.title}</p>
            </div>
          </div>

          {/* Stats */}
          {schedule && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total Cards",  value: schedule.totalCards,       icon: <BookOpen className="w-4 h-4" /> },
                { label: "Mastered",     value: schedule.masteredCards,    icon: <CheckCircle2 className="w-4 h-4 text-green-400" /> },
                { label: "To Review",    value: schedule.unmasteredCards,  icon: <Target className="w-4 h-4 text-orange-400" /> },
                {
                  label: schedule.daysUntilExam !== null ? "Days Left" : "Per Day",
                  value: schedule.daysUntilExam ?? schedule.recommendedPerDay,
                  icon: <CalendarDays className="w-4 h-4 text-blue-400" />,
                },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2 text-gray-400">{icon}</div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Exam date setter */}
          <div className="mb-8">
            <label htmlFor="exam-date-input" className="block text-sm font-bold text-gray-400 mb-2">
              Set Exam Date <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="exam-date-input"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                title="Select your exam date"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <Button
                onClick={saveExamDate}
                disabled={!examDate || isSavingDate}
                className="bg-zinc-700 text-white hover:bg-zinc-600 rounded-xl px-4 font-bold"
              >
                {isSavingDate ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
            {schedule?.daysUntilExam !== null && schedule?.daysUntilExam !== undefined && (
              <p className="text-xs text-blue-400 font-semibold mt-2">
                📅 {schedule.daysUntilExam} days until exam — study {schedule.recommendedPerDay} cards/day to be ready
              </p>
            )}
          </div>

          {/* How it works */}
          <div className="space-y-3 mb-8 bg-zinc-800/30 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-gray-300">How Exam Mode works</h3>
            <ul className="space-y-2">
              {[
                "No hints — write your answer before seeing the correct one",
                "30 seconds per card to simulate real exam pressure",
                "Self-mark each answer as correct or incorrect",
                "Get a grade (A–F) with a missed-cards review at the end",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-orange-400 font-bold mt-0.5">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={startExam}
            disabled={cards.length === 0}
            className="w-full h-14 bg-white text-black font-black text-base rounded-2xl hover:bg-gray-200 hover:-translate-y-0.5 transition-all"
          >
            <Zap className="w-5 h-5 mr-2 fill-black" />
            Start Exam ({cards.length} cards)
          </Button>
        </div>
      </main>
    </div>
  );
}