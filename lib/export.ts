import type { Flashcard } from "./types";

export interface ExportData {
  title: string;
  cards: Flashcard[];
}

// ── JSON Export ──────────────────────────────────────────────────────────────

export function exportAsJson(data: ExportData): string {
  const payload = {
    deck: data.title,
    exportedAt: new Date().toISOString(),
    cardCount: data.cards.length,
    flashcards: data.cards.map((c) => ({
      question: c.question,
      answer: c.answer,
      hint: c.hint ?? null,
      explanation: c.explanation ?? null,
      topic: c.topic ?? null,
      difficulty: c.difficulty,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

// ── CSV Export (Anki-compatible) ─────────────────────────────────────────────
// Anki format: Front,Back,Tags (tab-separated for Anki, comma for general)

export function exportAsCsv(data: ExportData): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = "Front,Back,Hint,Explanation,Topic,Difficulty";
  const rows = data.cards.map((c) =>
    [
      escape(c.question),
      escape(c.answer),
      escape(c.hint ?? ""),
      escape(c.explanation ?? ""),
      escape(c.topic ?? ""),
      escape(c.difficulty),
    ].join(",")
  );
  return [header, ...rows].join("\n");
}

// Anki-specific TSV (tab-separated, no header, front/back only)
export function exportAsAnkiTsv(data: ExportData): string {
  return data.cards
    .map((c) => `${c.question.replace(/\t/g, " ")}\t${c.answer.replace(/\t/g, " ")}`)
    .join("\n");
}

// ── PDF Export (client-side via print-friendly HTML) ─────────────────────────
// Returns an HTML string that can be opened in a new tab and printed to PDF

export function exportAsPdfHtml(data: ExportData): string {
  const cardBlocks = data.cards
    .map(
      (c, i) => `
    <div class="card">
      <div class="card-number">${i + 1}</div>
      <div class="card-body">
        <div class="front">
          <div class="label">Q</div>
          <div class="text">${escapeHtml(c.question)}</div>
          ${c.topic ? `<div class="topic">${escapeHtml(c.topic)}</div>` : ""}
          ${c.hint ? `<div class="hint">Hint: ${escapeHtml(c.hint)}</div>` : ""}
        </div>
        <div class="divider"></div>
        <div class="back">
          <div class="label">A</div>
          <div class="text">${escapeHtml(c.answer)}</div>
          ${c.explanation ? `<div class="explanation">${escapeHtml(c.explanation)}</div>` : ""}
        </div>
      </div>
      <div class="difficulty difficulty-${c.difficulty.toLowerCase()}">${c.difficulty}</div>
    </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(data.title)} — Flashcards</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #111; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
  .meta { font-size: 13px; color: #666; margin-bottom: 32px; }
  .card { display: grid; grid-template-columns: 32px 1fr 60px; gap: 16px; align-items: start; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px; break-inside: avoid; page-break-inside: avoid; }
  .card-number { font-size: 12px; font-weight: 700; color: #9ca3af; padding-top: 2px; }
  .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 6px; }
  .text { font-size: 15px; line-height: 1.6; font-weight: 500; }
  .divider { border-top: 1px dashed #e5e7eb; margin: 12px 0; }
  .back .text { color: #374151; }
  .hint { font-size: 12px; color: #f59e0b; margin-top: 8px; font-style: italic; }
  .explanation { font-size: 12px; color: #6b7280; margin-top: 8px; line-height: 1.5; }
  .topic { font-size: 11px; color: #9ca3af; margin-top: 6px; background: #f3f4f6; padding: 2px 8px; border-radius: 20px; display: inline-block; }
  .difficulty { font-size: 10px; font-weight: 700; letter-spacing: 0.05em; padding: 3px 8px; border-radius: 20px; text-align: center; align-self: start; }
  .difficulty-easy { background: #d1fae5; color: #065f46; }
  .difficulty-medium { background: #fef3c7; color: #92400e; }
  .difficulty-hard { background: #fee2e2; color: #991b1b; }
  @media print {
    body { padding: 20px; }
    .card { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>${escapeHtml(data.title)}</h1>
<p class="meta">${data.cards.length} flashcards · Exported from FlashSnap · ${new Date().toLocaleDateString()}</p>
${cardBlocks}
<script>window.onload = () => window.print();</script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
