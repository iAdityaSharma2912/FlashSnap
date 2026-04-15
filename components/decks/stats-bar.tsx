"use client";

import type { DeckStats } from "@/lib/types";

export function StatsBar({ stats }: { stats: DeckStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <p className="text-xs text-gray-400">Total</p>
        <p className="text-xl font-bold text-white">{stats.total}</p>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <p className="text-xs text-gray-400">Mastered</p>
        <p className="text-xl font-bold text-green-400">{stats.mastered}</p>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <p className="text-xs text-gray-400">Learning</p>
        <p className="text-xl font-bold text-yellow-400">{stats.learning}</p>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <p className="text-xs text-gray-400">Due Today</p>
        <p className="text-xl font-bold text-red-400">{stats.dueToday}</p>
      </div>
    </div>
  );
}