import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDeckColor } from "@/lib/utils";
import { isDueToday } from "@/lib/sm2";

// GET all decks (for a userId passed as query param)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId required" }, { status: 400 });
    }

    const decks = await prisma.deck.findMany({
      where: { userId },
      include: {
        cards: {
          select: { id: true, mastery: true, nextReview: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Compute stats per deck
    const decksWithStats = decks.map((deck) => {
      const cards = deck.cards;
      const total = cards.length;
      const mastered = cards.filter((c) => c.mastery === "MASTERED").length;
      const learning = cards.filter((c) => c.mastery === "LEARNING").length;
      const reviewing = cards.filter((c) => c.mastery === "REVIEWING").length;
      const newCards = cards.filter((c) => c.mastery === "NEW").length;
      const dueToday = cards.filter((c) => isDueToday(c.nextReview)).length;
      const masteryPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

      return {
        ...deck,
        cards: undefined,
        stats: { total, mastered, learning, reviewing, new: newCards, dueToday, masteryPercent },
      };
    });

    return NextResponse.json({ success: true, data: decksWithStats });
  } catch (error) {
    console.error("[API /decks GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch decks" }, { status: 500 });
  }
}

// POST create deck
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, userId, cards, sourceType, sourceFile, topic } = body;

    if (!title || !userId || !cards?.length) {
      return NextResponse.json({ success: false, error: "title, userId, and cards are required" }, { status: 400 });
    }

    const deck = await prisma.deck.create({
      data: {
        title,
        description,
        sourceType: sourceType ?? "TOPIC",
        sourceFile,
        topic,
        cardCount: cards.length,
        userId,
        color: generateDeckColor(),
        cards: {
          create: cards.map((c: {
            question: string;
            answer: string;
            hint?: string;
            explanation?: string;
            topic?: string;
            difficulty?: "EASY" | "MEDIUM" | "HARD";
          }) => ({
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

    return NextResponse.json({ success: true, data: deck }, { status: 201 });
  } catch (error) {
    console.error("[API /decks POST]", error);
    return NextResponse.json({ success: false, error: "Failed to create deck" }, { status: 500 });
  }
}
