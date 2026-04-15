export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string | null;
  explanation?: string | null;
  topic?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  deckId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date | string;
  mastery: "NEW" | "LEARNING" | "REVIEWING" | "MASTERED";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Deck {
  id: string;
  title: string;
  description?: string | null;
  sourceType: "PDF" | "TOPIC";
  sourceFile?: string | null;
  topic?: string | null;
  cardCount: number;
  userId: string;
  cards?: Flashcard[];
  createdAt: Date | string;
  updatedAt: Date | string;
  lastStudied?: Date | string | null;
  tags: string[];
  color: string;
}

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  hint?: string;
  explanation?: string;
  topic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}

export interface GenerateRequest {
  type: "pdf" | "topic";
  topic?: string;
  description?: string;
  pdfText?: string;
  fileName?: string;
  cardCount?: number;
}

export interface ReviewRating {
  flashcardId: string;
  rating: 0 | 1 | 2 | 3;
  timeSpent?: number;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  mastery: "NEW" | "LEARNING" | "REVIEWING" | "MASTERED";
}

export interface StudySession {
  deckId: string;
  cards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  sessionStats: {
    again: number;
    hard: number;
    good: number;
    easy: number;
    total: number;
  };
}

export interface ExportOptions {
  format: "pdf" | "csv" | "json";
  deckId: string;
  deckTitle: string;
  cards: Flashcard[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DeckStats {
  total: number;
  new: number;
  learning: number;
  reviewing: number;
  mastered: number;
  dueToday: number;
  masteryPercent: number;
}
