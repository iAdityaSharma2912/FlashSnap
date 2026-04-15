import { NextRequest, NextResponse } from "next/server";
import { generateFlashcards } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";
import { generateDeckColor } from "@/lib/utils";
import type { GenerateRequest } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest & {
      saveDeck?: boolean;
      deckTitle?: string;
      userId?: string;
    };

    const { type, topic, description, pdfText, fileName, cardCount = 20, saveDeck, deckTitle, userId } = body;

    // Validate
    if (type === "pdf" && !pdfText) {
      return NextResponse.json({ success: false, error: "No PDF text provided." }, { status: 400 });
    }
    if (type === "topic" && !topic) {
      return NextResponse.json({ success: false, error: "No topic provided." }, { status: 400 });
    }
    if (cardCount < 5 || cardCount > 50) {
      return NextResponse.json({ success: false, error: "Card count must be between 5 and 50." }, { status: 400 });
    }

    // Generate
    const flashcards = await generateFlashcards({
      type,
      topic,
      description,
      pdfText,
      fileName,
      cardCount,
    });

    if (!flashcards || flashcards.length === 0) {
      return NextResponse.json({ success: false, error: "No flashcards could be generated." }, { status: 500 });
    }

    // Optionally save to DB
    if (saveDeck && userId && deckTitle) {
      const deck = await prisma.deck.create({
        data: {
          title: deckTitle,
          description: description ?? (topic ? `Flashcards about ${topic}` : undefined),
          sourceType: type === "pdf" ? "PDF" : "TOPIC",
          sourceFile: fileName,
          topic: topic,
          cardCount: flashcards.length,
          userId,
          color: generateDeckColor(),
          cards: {
            create: flashcards.map((c) => ({
              question: c.question,
              answer: c.answer,
              hint: c.hint,
              explanation: c.explanation,
              topic: c.topic,
              difficulty: c.difficulty ?? "MEDIUM",
            })),
          },
        },
        include: { cards: true },
      });
      return NextResponse.json({ success: true, data: { deck, flashcards: deck.cards } });
    }

    return NextResponse.json({ success: true, data: { flashcards } });
  } catch (error) {
    console.error("[API /generate]", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
