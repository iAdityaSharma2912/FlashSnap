import { NextResponse } from "next/server";
// FIX 1: Import from next-auth, not next-auth/react
import { getServerSession } from "next-auth"; 
// FIX 2: Use named import for prisma
import { prisma } from "@/lib/prisma"; 

// Optional: If your NextAuth requires authOptions, import it here:
// import { authOptions } from "@/lib/auth";

// FIX 3 & 4: Define the types for the mapped data so TypeScript doesn't complain
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
    // If your setup requires authOptions, change this to: await getServerSession(authOptions)
    const session = await getServerSession();
    
    // Fallback if not authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 1. Fetch total decks
    const totalDecks = await prisma.deck.count({
      where: { userId: user.id },
    });

    // 2. Fetch cards mastered 
    const cardsMastered = await prisma.flashcard.count({
      where: {
        deck: { userId: user.id },
        interval: { gt: 21 }, 
      },
    });

    // 3. Fetch Recent Decks with card counts
    const rawRecentDecks = await prisma.deck.findMany({
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

    const now = new Date();

    // Map the database response to the format our frontend expects
    const recentDecks = rawRecentDecks.map((deck: DeckWithCards) => {
      const totalCards = deck.cards.length;
      const dueCards = deck.cards.filter((card) => new Date(card.nextReview) <= now).length;
      
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
          // Fallback to 0 if streak doesn't exist on your Prisma User model yet
          studyStreak: (user as any).streak || 0, 
        },
        recentDecks,
      },
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}