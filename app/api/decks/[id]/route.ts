import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDueToday } from "@/lib/sm2";

// Next.js requires dynamic route params to be treated as a Promise in newer versions
type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const { id } = await params;

    // Fetch the deck and ensure it belongs to the current user
    const deck = await prisma.deck.findUnique({
      where: { 
        id: id,
        userId: user.id // Security check
      },
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
    const dueToday = cards.filter((c) => isDueToday(new Date(c.nextReview))).length;
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

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Verify ownership before updating
    const existingDeck = await prisma.deck.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingDeck) {
      return NextResponse.json({ success: false, error: "Deck not found" }, { status: 404 });
    }

    // Build update object for standard fields
    const safeUpdate: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim()) safeUpdate.title = body.title.trim();
    if (typeof body.description === "string") safeUpdate.description = body.description;
    if (body.lastStudied) safeUpdate.lastStudied = new Date(body.lastStudied);

    // Apply standard fields if any
    if (Object.keys(safeUpdate).length > 0) {
      await prisma.deck.update({
        where: { id },
        data: safeUpdate,
      });
    }

    // Handle new schema fields via raw SQL
    if (typeof body.isPublic === "boolean") {
      await prisma.$executeRaw`UPDATE "Deck" SET "isPublic" = ${body.isPublic} WHERE id = ${id}`;
    }

    if (body.examDate !== undefined) {
      if (body.examDate) {
        await prisma.$executeRaw`UPDATE "Deck" SET "examDate" = ${new Date(body.examDate)} WHERE id = ${id}`;
      } else {
        await prisma.$executeRaw`UPDATE "Deck" SET "examDate" = NULL WHERE id = ${id}`;
      }
    }

    return NextResponse.json({
      success: true,
      data: { id, ...body },
    });
  } catch (error) {
    console.error("[API /decks/:id PATCH]", error);
    return NextResponse.json({ success: false, error: "Failed to update deck" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete deck (Prisma Cascade will handle the flashcards)
    await prisma.deck.delete({ 
      where: { id } 
    });
    
    return NextResponse.json({ success: true, message: "Deck deleted" });
  } catch (error) {
    console.error("[API /decks/:id DELETE]", error);
    return NextResponse.json({ success: false, error: "Failed to delete deck" }, { status: 500 });
  }
}