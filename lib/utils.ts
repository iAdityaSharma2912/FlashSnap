import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getMasteryColor(mastery: string): string {
  switch (mastery) {
    case "NEW": return "#7878A0";
    case "LEARNING": return "#FF6B35";
    case "REVIEWING": return "#FFD60A";
    case "MASTERED": return "#00FF9F";
    default: return "#7878A0";
  }
}

export function getMasteryLabel(mastery: string): string {
  switch (mastery) {
    case "NEW": return "New";
    case "LEARNING": return "Learning";
    case "REVIEWING": return "Reviewing";
    case "MASTERED": return "Mastered";
    default: return "New";
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "EASY": return "#00FF9F";
    case "MEDIUM": return "#FFD60A";
    case "HARD": return "#FF6B35";
    default: return "#FFD60A";
  }
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function generateDeckColor(): string {
  const colors = [
    "#FFD60A", "#FF6B35", "#00FF9F", "#7B61FF",
    "#FF3D71", "#00D9FF", "#FF9F00", "#4CAF50",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
