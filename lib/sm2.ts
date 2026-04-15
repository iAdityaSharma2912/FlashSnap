/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo SM-2 algorithm
 * Rating: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
 */

import type { SM2Result } from "./types";

export function calculateSM2(
  rating: 0 | 1 | 2 | 3,
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number
): SM2Result {
  let easeFactor = currentEaseFactor;
  let interval = currentInterval;
  let repetitions = currentRepetitions;

  if (rating < 2) {
    // Again or Hard — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Good or Easy
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor based on quality (0-5 scale mapped from 0-3)
  // Map: 0->0, 1->2, 2->4, 3->5
  const quality = [0, 2, 4, 5][rating];
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, Math.min(2.5, easeFactor));

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  const mastery = getMastery(repetitions, interval);

  return { easeFactor, interval, repetitions, nextReview, mastery };
}

function getMastery(
  repetitions: number,
  interval: number
): SM2Result["mastery"] {
  if (repetitions === 0) return "NEW";
  if (repetitions <= 2) return "LEARNING";
  if (interval < 21) return "REVIEWING";
  return "MASTERED";
}

export function isDueToday(nextReview: Date | string): boolean {
  const reviewDate = new Date(nextReview);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return reviewDate <= today;
}

export function getDaysUntilReview(nextReview: Date | string): number {
  const reviewDate = new Date(nextReview);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = reviewDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
