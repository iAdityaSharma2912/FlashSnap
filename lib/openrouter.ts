import type { GeneratedFlashcard, GenerateRequest } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Gemini (primary) ──────────────────────────────────────────────────────────
// v1beta supports ALL models + responseMimeType for structured JSON output

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

/** Extract retry-after seconds from a Gemini 429 response body */
function geminiRetryDelay(body: string): number {
  const match = body.match(/retryDelay["\s:]+(\d+)s/);
  return match ? Math.min(parseInt(match[1], 10), 60) : 30;
}

async function callGeminiModel(model: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (response.status === 429) {
    const body = await response.text();
    const delay = geminiRetryDelay(body) * 1000;
    console.log(`[Gemini] 429 on ${model}, retrying in ${delay / 1000}s...`);
    await sleep(delay);
    // One retry after waiting
    const retry = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: "application/json" },
      }),
    });
    if (!retry.ok) {
      const retryBody = await retry.text();
      throw new Error(`Gemini ${retry.status} (${model}) after retry: ${retryBody}`);
    }
    const retryData = await retry.json();
    const retryContent = retryData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!retryContent) throw new Error(`Gemini (${model}): empty response after retry`);
    return retryContent;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini ${response.status} (${model}): ${text}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error(`Gemini (${model}): empty response`);
  return content;
}

async function callGemini(prompt: string): Promise<string> {
  let lastError: Error | null = null;
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[Gemini] Trying: ${model}`);
      const result = await callGeminiModel(model, prompt);
      console.log(`[Gemini] Success: ${model}`);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Gemini] Failed ${model}: ${lastError.message.slice(0, 120)}`);
    }
  }
  throw new Error(`All Gemini models failed. Last: ${lastError?.message}`);
}

// ── NVIDIA NIM (secondary fallback) ──────────────────────────────────────────
// OpenAI-compatible endpoint with reliable free credits

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODELS = [
  "meta/llama-3.3-70b-instruct",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "meta/llama-3.1-405b-instruct",
  "mistralai/mistral-large-2-instruct",
  "google/gemma-3-27b-it",
];

async function callNvidiaModel(messages: ORMessage[], model: string): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set");

  const response = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4096 }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NVIDIA ${response.status} (${model}): ${text}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

async function callNvidia(messages: ORMessage[]): Promise<string> {
  let lastError: Error | null = null;
  for (const model of NVIDIA_MODELS) {
    try {
      console.log(`[NVIDIA] Trying: ${model}`);
      const result = await callNvidiaModel(messages, model);
      console.log(`[NVIDIA] Success: ${model}`);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[NVIDIA] Failed ${model}: ${lastError.message.slice(0, 120)}`);
    }
  }
  throw new Error(`All NVIDIA models failed. Last: ${lastError?.message}`);
}

// ── OpenRouter (last-resort fallback) ────────────────────────────────────────

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Only models confirmed active on OpenRouter free tier (429 = exists but busy, 404 = gone)
// Sorted: most reliable first, skipping known-404 models
const OPENROUTER_MODELS = [
  "google/gemma-3-27b-it:free",          // 429 = exists, rate limited
  "meta-llama/llama-3.3-70b-instruct:free", // 429 = exists, rate limited
  "nousresearch/hermes-3-llama-3.1-405b:free", // 429 = exists, rate limited
  "deepseek/deepseek-chat-v3-0324:free",
  "tngtech/deepseek-r1t-chimera:free",
  "liquid/lfm-7b:free",
  "sarvamai/sarvam-m:free",
  "featherless/qwerky-72b:free",
];

interface ORMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callORModel(messages: ORMessage[], model: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "FlashSnap",
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4096 }),
  });

  // On 429, wait briefly and retry once
  if (response.status === 429) {
    console.log(`[OpenRouter] 429 on ${model}, retrying in 8s...`);
    await sleep(8000);
    const retry = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "FlashSnap",
      },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4096 }),
    });
    if (!retry.ok) {
      const text = await retry.text();
      throw new Error(`OpenRouter ${retry.status} (${model}) after retry: ${text}`);
    }
    const retryData = await retry.json();
    return retryData.choices[0]?.message?.content ?? "";
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status} (${model}): ${text}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

async function callOpenRouter(messages: ORMessage[]): Promise<string> {
  let lastError: Error | null = null;
  for (const model of OPENROUTER_MODELS) {
    try {
      console.log(`[OpenRouter] Trying: ${model}`);
      const result = await callORModel(messages, model);
      console.log(`[OpenRouter] Success: ${model}`);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[OpenRouter] Failed ${model}: ${lastError.message.slice(0, 120)}`);
    }
  }
  throw new Error(`All OpenRouter models failed. Last: ${lastError?.message}`);
}

// ── Prompts ───────────────────────────────────────────────────────────────────

function systemInstruction(): string {
  return `You are an expert educational content creator who writes high-quality flashcards for active recall and spaced repetition.

Rules:
- One concept per card (atomic)
- Specific, unambiguous answers
- EASY = basic recall, MEDIUM = understanding, HARD = application/analysis
- Add hints and explanations where helpful
- Group cards by sub-topic

Respond with valid JSON only — no markdown fences, no extra text outside the JSON object.`;
}

function pdfPrompt(text: string, cardCount: number): string {
  return `${systemInstruction()}

Analyze the content below and generate exactly ${cardCount} flashcards covering key definitions, relationships, processes, examples, and edge cases.

CONTENT:
${text}

Return ONLY this JSON:
{"flashcards":[{"question":"...","answer":"...","hint":"...","explanation":"...","topic":"...","difficulty":"EASY|MEDIUM|HARD"}]}`;
}

function topicPrompt(topic: string, description: string, cardCount: number): string {
  return `${systemInstruction()}

Generate exactly ${cardCount} flashcards for: "${topic}"
${description ? `\nSyllabus:\n${description}` : ""}

Cover fundamentals, principles, formulas, applications, misconceptions, and relationships.

Return ONLY this JSON:
{"flashcards":[{"question":"...","answer":"...","hint":"...","explanation":"...","topic":"...","difficulty":"EASY|MEDIUM|HARD"}]}`;
}

// ── Parser ────────────────────────────────────────────────────────────────────

function parseFlashcards(raw: string): GeneratedFlashcard[] {
  let cleaned = raw.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];

  const parsed = JSON.parse(cleaned);
  const cards = parsed.flashcards ?? parsed.cards ?? parsed;
  if (!Array.isArray(cards)) throw new Error("Response is not an array");

  return cards
    .filter((c: Record<string, unknown>) => c.question && c.answer)
    .map((c: Record<string, unknown>) => ({
      question: String(c.question).trim(),
      answer: String(c.answer).trim(),
      hint: c.hint ? String(c.hint).trim() : undefined,
      explanation: c.explanation ? String(c.explanation).trim() : undefined,
      topic: c.topic ? String(c.topic).trim() : undefined,
      difficulty: (["EASY", "MEDIUM", "HARD"].includes(String(c.difficulty))
        ? c.difficulty
        : "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
    }));
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

async function generate(geminiPrompt: string, orMessages: ORMessage[]): Promise<GeneratedFlashcard[]> {
  // 1. NVIDIA NIM (primary — reliable free credits, high-quality models)
  if (process.env.NVIDIA_API_KEY) {
    try {
      const content = await callNvidia(orMessages);
      return parseFlashcards(content);
    } catch (err) {
      console.warn("[AI] NVIDIA exhausted, trying Gemini:", err instanceof Error ? err.message.slice(0, 80) : err);
    }
  }

  // 2. Gemini (secondary fallback)
  if (process.env.GEMINI_API_KEY) {
    try {
      const content = await callGemini(geminiPrompt);
      return parseFlashcards(content);
    } catch (err) {
      console.warn("[AI] Gemini exhausted, trying OpenRouter:", err instanceof Error ? err.message.slice(0, 80) : err);
    }
  }

  // 3. OpenRouter (last resort)
  const content = await callOpenRouter(orMessages);
  return parseFlashcards(content);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateFlashcardsFromPdf(text: string, cardCount = 20): Promise<GeneratedFlashcard[]> {
  const MAX_CHARS = 12000;
  if (text.length > MAX_CHARS) {
    const third = Math.floor(MAX_CHARS / 3);
    text =
      text.slice(0, third) + "\n...\n" +
      text.slice(Math.floor(text.length / 2) - third / 2, Math.floor(text.length / 2) + third / 2) +
      "\n...\n" + text.slice(-third);
  }
  return generate(
    pdfPrompt(text, cardCount),
    [
      { role: "system", content: systemInstruction() },
      { role: "user", content: `Generate exactly ${cardCount} flashcards from this content. Return JSON only.\n\n${text}` },
    ]
  );
}

export async function generateFlashcardsFromTopic(topic: string, description = "", cardCount = 20): Promise<GeneratedFlashcard[]> {
  return generate(
    topicPrompt(topic, description, cardCount),
    [
      { role: "system", content: systemInstruction() },
      { role: "user", content: `Generate exactly ${cardCount} flashcards for: ${topic}${description ? `\n\n${description}` : ""}. Return JSON only.` },
    ]
  );
}

export async function generateFlashcards(req: GenerateRequest): Promise<GeneratedFlashcard[]> {
  const cardCount = req.cardCount ?? 20;
  if (req.type === "pdf" && req.pdfText) return generateFlashcardsFromPdf(req.pdfText, cardCount);
  if (req.type === "topic" && req.topic) return generateFlashcardsFromTopic(req.topic, req.description ?? "", cardCount);
  throw new Error("Must provide pdfText or topic");
}
