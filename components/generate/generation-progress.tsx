"use client";

import { useEffect, useState } from "react";
import { Sparkles, Brain, Layers, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { icon: Layers, label: "Extracting content from your document", duration: 1200 },
  { icon: Brain, label: "Analyzing key concepts and relationships", duration: 2000 },
  { icon: Sparkles, label: "Generating intelligent flashcards", duration: 2500 },
  { icon: CheckCircle, label: "Formatting and organizing cards", duration: 800 },
];

interface GenerationProgressProps {
  isGenerating: boolean;
  cardCount?: number;
}

export function GenerationProgress({ isGenerating, cardCount }: GenerationProgressProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (!isGenerating) {
      setStep(0);
      setProgress(0);
      return;
    }

    let elapsed = 0;
    const totalDuration = STEPS.reduce((acc, s) => acc + s.duration, 0);
    let currentStep = 0;
    let stepStart = 0;

    const interval = setInterval(() => {
      elapsed += 50;
      const pct = Math.min((elapsed / totalDuration) * 95, 95);
      setProgress(pct);

      let cumulative = 0;
      for (let i = 0; i < STEPS.length; i++) {
        cumulative += STEPS[i].duration;
        if (elapsed < cumulative) {
          if (currentStep !== i) {
            currentStep = i;
            stepStart = elapsed;
          }
          setStep(i);
          break;
        }
      }
    }, 50);

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 400);

    return () => {
      clearInterval(interval);
      clearInterval(dotInterval);
    };
  }, [isGenerating]);

  if (!isGenerating) return null;

  const StepIcon = STEPS[step]?.icon ?? Sparkles;

  return (
    <div className="flex flex-col items-center gap-6 py-10 animate-fade-in">
      {/* Animated icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse-glow">
          <StepIcon className="w-9 h-9 text-primary" />
        </div>
        {/* Orbiting dot */}
        <div
          className="absolute top-0 right-0 w-3 h-3 rounded-full bg-accent"
          style={{ animation: "orbit 2s linear infinite" }}
        />
      </div>

      <div className="text-center space-y-1">
        <p className="text-base font-medium text-gray-100">
          {STEPS[step]?.label}
          <span className="text-primary">{dots}</span>
        </p>
        {cardCount && (
          <p className="text-sm text-gray-500">
            Generating {cardCount} flashcards
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm space-y-2">
        <Progress value={progress} color="#FFD60A" />
        <div className="flex justify-between text-xs text-gray-600">
          <span>Processing</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                i < step
                  ? "bg-accent/20 text-accent"
                  : i === step
                  ? "bg-primary/20 text-primary scale-110"
                  : "bg-dark-muted text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(36px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(36px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
