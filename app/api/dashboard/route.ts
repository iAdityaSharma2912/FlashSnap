import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // Use /next for App Router
import { prisma } from "@/lib/prisma"; 
import { authOptions } from "@/lib/auth";

// Fix Next.js aggressive caching for this route
export const dynamic = "force-dynamic";

type DeckWithCards = {
  id: string;
  title: string;
  updatedAt: Date;
  cards: Array<{
    id: string;
    nextReview: Date | string;
  }>;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log("Dashboard API: Unauthorized - No session found");
      return NextResponse.json({ success: false, error: "Unauthorized - Please log in again." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log("Dashboard API: User not found in DB");
      return NextResponse.json({ success: false, error: "User not found in database." }, { status: 404 });
    }

    const totalDecksPromise = prisma.deck.count({
      where: { userId: user.id },
    });

    // Check if this specific query is crashing due to schema mismatches
    const cardsMasteredPromise = prisma.flashcard.count({
      where: {
        deck: { userId: user.id },
        mastery: "MASTERED", 
      },
    });

    const rawRecentDecksPromise = prisma.deck.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: {
        cards: {
          select: {
            id: true,
            nextReview: true,
          },
        },
      },
    });

    // Run queries concurrently
    const [totalDecks, cardsMastered, rawRecentDecks] = await Promise.all([
      totalDecksPromise,
      cardsMasteredPromise,
      rawRecentDecksPromise
    ]);

    const now = new Date();

    const recentDecks = rawRecentDecks.map((deck: DeckWithCards) => {
      const totalCards = deck.cards?.length || 0;
      const dueCards = deck.cards?.filter((card) => new Date(card.nextReview) <= now).length || 0;
      
      const progress = totalCards === 0 ? 0 : Math.round(((totalCards - dueCards) / totalCards) * 100);

      const hoursSinceUpdate = Math.floor((now.getTime() - new Date(deck.updatedAt).getTime()) / (1000 * 60 * 60));
      const lastStudied = hoursSinceUpdate < 24 
        ? hoursSinceUpdate === 0 ? "Just now" : `${hoursSinceUpdate} hours ago`
        : `${Math.floor(hoursSinceUpdate / 24)} days ago`;

      return {
        id: deck.id,
        title: deck.title,
        cardsCount: totalCards,
        dueCount: dueCards,
        lastStudied,
        progress,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalDecks,
          cardsMastered,
          studyStreak: 0, 
        },
        recentDecks,
      },
    });
  } catch (error: any) {
    // This will print the EXACT reason it's failing to your terminal
    console.error("🔥 DASHBOARD FETCH ERROR 🔥:", error.message || error);
    
    return NextResponse.json({ 
      success: false, 
      error: `Server Error: ${error.message || "Failed to fetch dashboard data"}` 
    }, { status: 500 });
  }
}