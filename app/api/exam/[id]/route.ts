import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

// GET /api/exam/[id] — Returns exam schedule and today's cards
export async function GET(req: NextRequest, { params }: Context) {
  try {
    // Next.js requires params to be awaited
    const { id } = await params;

    // Fetch deck + cards. Cast to any for new fields until `prisma generate` picks them up.
    const deck = await (prisma.deck.findUnique as (args: unknown) => Promise<unknown>)({
      where: { id: id },
      include: {
        cards: {
          select: {
            id: true,
            question: true,
            answer: true,
            hint: true,
            explanation: true,
            topic: true,
            difficulty: true,
            mastery: true,
            easeFactor: true,
            interval: true,
            repetitions: true,
            nextReview: true,
          },
          orderBy: { nextReview: "asc" },
        },
      },
    }) as {
      id: string;
      title: string;
      color: string;
      examDate: Date | null;
      cards: {
        id: string;
        question: string;
        answer: string;
        hint: string | null;
        explanation: string | null;
        topic: string | null;
        difficulty: string;
        mastery: string;
        easeFactor: number;
        interval: number;
        repetitions: number;
        nextReview: Date;
      }[];
    } | null;

    if (!deck) {
      return NextResponse.json({ success: false, error: "Deck not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysUntilExam = deck.examDate
      ? Math.max(0, Math.ceil((new Date(deck.examDate).getTime() - today.getTime()) / 86400000))
      : null;

    // Prioritise: NEW > LEARNING > REVIEWING > MASTERED
    const prioritised = [...deck.cards].sort((a, b) => {
      const order: Record<string, number> = { NEW: 0, LEARNING: 1, REVIEWING: 2, MASTERED: 3 };
      return (order[a.mastery] ?? 4) - (order[b.mastery] ?? 4);
    });

    const unmastered = deck.cards.filter((c) => c.mastery !== "MASTERED");
    const recommendedPerDay =
      daysUntilExam && daysUntilExam > 0
        ? Math.ceil(unmastered.length / daysUntilExam)
        : unmastered.length;

    return NextResponse.json({
      success: true,
      data: {
        deck: {
          id: deck.id,
          title: deck.title,
          examDate: deck.examDate,
          color: deck.color,
        },
        cards: prioritised,
        schedule: {
          daysUntilExam,
          totalCards: deck.cards.length,
          masteredCards: deck.cards.filter((c) => c.mastery === "MASTERED").length,
          unmasteredCards: unmastered.length,
          recommendedPerDay,
        },
      },
    });
  } catch (error) {
    console.error("[API /exam GET]", error);
    return NextResponse.json({ success: false, error: "Failed to load exam data" }, { status: 500 });
  }
}

// PATCH /api/exam/[id] — Set or update exam date
export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const { examDate } = await req.json();

    // Use raw SQL until Prisma client is regenerated with new schema
    if (examDate) {
      await prisma.$executeRaw`UPDATE "Deck" SET "examDate" = ${new Date(examDate)} WHERE id = ${id}`;
    } else {
      await prisma.$executeRaw`UPDATE "Deck" SET "examDate" = NULL WHERE id = ${id}`;
    }

    return NextResponse.json({
      success: true,
      data: { id: id, examDate: examDate ? new Date(examDate) : null },
    });
  } catch (error) {
    console.error("[API /exam PATCH]", error);
    return NextResponse.json({ success: false, error: "Failed to update exam date" }, { status: 500 });
  }
}