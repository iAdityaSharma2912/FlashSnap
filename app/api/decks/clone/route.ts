import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDeckColor } from "@/lib/utils";

// POST /api/decks/clone
// Body: { deckId: string, userId: string }
export async function POST(req: NextRequest) {
  try {
    const { deckId, userId } = await req.json();

    if (!deckId || !userId) {
      return NextResponse.json({ success: false, error: "deckId and userId required" }, { status: 400 });
    }

    // Fetch original deck (must be public)
    const original = await prisma.deck.findFirst({
      where: { id: deckId },
      include: { cards: true },
    });

    if (!original) {
      return NextResponse.json({ success: false, error: "Deck not found or not public" }, { status: 404 });
    }

    // Create cloned deck in a transaction
    // Note: use $executeRaw for the increment to avoid TS type issues until `prisma generate` runs
    const cloned = await prisma.$transaction(async (tx) => {
      const newDeck = await tx.deck.create({
        data: {
          title: `${original.title} (Clone)`,
          description: original.description,
          sourceType: original.sourceType,
          topic: original.topic,
          cardCount: original.cardCount,
          userId,
          tags: original.tags,
          color: generateDeckColor(),
          clonedFrom: original.id,
          isPublic: false,
          cards: {
            create: original.cards.map((c) => ({
              question: c.question,
              answer: c.answer,
              hint: c.hint,
              explanation: c.explanation,
              topic: c.topic,
              difficulty: c.difficulty,
            })),
          },
        },
        include: { cards: true },
      });

      // Increment cloneCount via raw SQL to avoid stale Prisma client type issues
      await tx.$executeRaw`UPDATE "Deck" SET "cloneCount" = "cloneCount" + 1 WHERE id = ${deckId}`;

      return newDeck;
    });

    return NextResponse.json({ success: true, data: cloned }, { status: 201 });
  } catch (error) {
    console.error("[API /decks/clone POST]", error);
    return NextResponse.json({ success: false, error: "Failed to clone deck" }, { status: 500 });
  }
}