import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDueToday } from "@/lib/sm2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deck = await prisma.deck.findUnique({
      where: { id },
      include: { cards: { orderBy: { createdAt: "asc" } } },
    });

    if (!deck) {
      return NextResponse.json({ success: false, error: "Deck not found" }, { status: 404 });
    }

    const cards = deck.cards;
    const total = cards.length;
    const mastered = cards.filter((c) => c.mastery === "MASTERED").length;
    const learning = cards.filter((c) => c.mastery === "LEARNING").length;
    const reviewing = cards.filter((c) => c.mastery === "REVIEWING").length;
    const newCards = cards.filter((c) => c.mastery === "NEW").length;
    const dueToday = cards.filter((c) => isDueToday(c.nextReview)).length;
    const masteryPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        deck,
        stats: { total, mastered, learning, reviewing, new: newCards, dueToday, masteryPercent },
      },
    });
  } catch (error) {
    console.error("[API /decks/:id GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch deck" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.deck.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deck deleted" });
  } catch (error) {
    console.error("[API /decks/:id DELETE]", error);
    return NextResponse.json({ success: false, error: "Failed to delete deck" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, lastStudied } = body;

    const deck = await prisma.deck.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(lastStudied && { lastStudied: new Date(lastStudied) }),
      },
    });

    return NextResponse.json({ success: true, data: deck });
  } catch (error) {
    console.error("[API /decks/:id PATCH]", error);
    return NextResponse.json({ success: false, error: "Failed to update deck" }, { status: 500 });
  }
}
