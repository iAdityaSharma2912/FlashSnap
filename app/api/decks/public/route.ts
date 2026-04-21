import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/decks/public?search=biology&tags=science&sort=popular&page=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const sort = searchParams.get("sort") ?? "popular"; // popular | newest | cards
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 24;
    const skip = (page - 1) * limit;

    const where = {
      isPublic: true,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { topic: { contains: search, mode: "insensitive" as const } },
              { tags: { hasSome: [search.toLowerCase()] } },
            ],
          }
        : {}),
    };

    const orderBy =
      sort === "newest"
        ? { createdAt: "desc" as const }
        : sort === "cards"
        ? { cardCount: "desc" as const }
        : { cloneCount: "desc" as const }; // popular

    const [decks, total] = await Promise.all([
      prisma.deck.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          sourceType: true,
          topic: true,
          cardCount: true,
          cloneCount: true,
          clonedFrom: true,
          tags: true,
          color: true,
          createdAt: true,
          user: { select: { name: true } }, // show creator name
        },
      }),
      prisma.deck.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { decks, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[API /decks/public GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch public decks" }, { status: 500 });
  }
}
