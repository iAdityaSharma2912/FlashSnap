import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSM2 } from "@/lib/sm2";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rating, timeSpent } = await req.json();

    if (rating === undefined || rating < 0 || rating > 3) {
      return NextResponse.json({ success: false, error: "Rating must be 0-3" }, { status: 400 });
    }

    const card = await prisma.flashcard.findUnique({ where: { id } });
    if (!card) {
      return NextResponse.json({ success: false, error: "Flashcard not found" }, { status: 404 });
    }

    const sm2 = calculateSM2(
      rating as 0 | 1 | 2 | 3,
      card.easeFactor,
      card.interval,
      card.repetitions
    );

    const [updated] = await prisma.$transaction([
      prisma.flashcard.update({
        where: { id },
        data: {
          easeFactor: sm2.easeFactor,
          interval: sm2.interval,
          repetitions: sm2.repetitions,
          nextReview: sm2.nextReview,
          mastery: sm2.mastery,
        },
      }),
      prisma.reviewLog.create({
        data: {
          flashcardId: id,
          rating,
          timeSpent: timeSpent ?? null,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[API /flashcards/:id/review]", error);
    return NextResponse.json({ success: false, error: "Failed to record review" }, { status: 500 });
  }
}
