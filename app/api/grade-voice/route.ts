import { NextRequest, NextResponse } from "next/server";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// POST /api/grade-voice
// Body: { question: string, correctAnswer: string, spokenAnswer: string }
// Returns: { score: 0|1|2|3, feedback: string, rating: "again"|"hard"|"good"|"easy" }
export async function POST(req: NextRequest) {
  try {
    const { question, correctAnswer, spokenAnswer } = await req.json();

    if (!correctAnswer || !spokenAnswer) {
      return NextResponse.json({ success: false, error: "correctAnswer and spokenAnswer required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY not set" }, { status: 500 });
    }

    const prompt = `You are a strict but fair study assistant grading a student's spoken flashcard answer.

QUESTION: ${question}
CORRECT ANSWER: ${correctAnswer}
STUDENT'S SPOKEN ANSWER: ${spokenAnswer}

Grade the student's answer semantically — exact wording does not matter, conceptual understanding does.

Respond ONLY with valid JSON in this exact shape:
{
  "score": <0|1|2|3>,
  "rating": <"again"|"hard"|"good"|"easy">,
  "feedback": "<one sentence of feedback — what was right, what was missing>"
}

Scoring rubric:
- 0 (again): Completely wrong or blank — major misconception
- 1 (hard): Partially correct — core idea present but key details missing
- 2 (good): Correct — main concept captured, minor omissions acceptable  
- 3 (easy): Excellent — complete, precise, confident answer`;

    const url = `${GEMINI_BASE}/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 256,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini ${response.status}`);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const result = JSON.parse(raw);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[API /grade-voice]", error);
    // Fallback: return neutral score on error
    return NextResponse.json({
      success: true,
      data: { score: 2, rating: "good", feedback: "Could not grade automatically — mark yourself." },
    });
  }
}
