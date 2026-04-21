// Merge this PATCH handler into your existing: app/api/decks/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // Build update object for standard (already-typed) fields
    const safeUpdate: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim()) {
      safeUpdate.title = body.title.trim();
    }
    if (typeof body.description === "string") {
      safeUpdate.description = body.description;
    }

    // Apply standard fields if any
    if (Object.keys(safeUpdate).length > 0) {
      await prisma.deck.update({
        where: { id: params.id },
        data: safeUpdate,
      });
    }

    // Handle new schema fields via raw SQL (avoids stale Prisma client type errors)
    if (typeof body.isPublic === "boolean") {
      await prisma.$executeRaw`UPDATE "Deck" SET "isPublic" = ${body.isPublic} WHERE id = ${params.id}`;
    }

    if (body.examDate !== undefined) {
      if (body.examDate) {
        await prisma.$executeRaw`UPDATE "Deck" SET "examDate" = ${new Date(body.examDate)} WHERE id = ${params.id}`;
      } else {
        await prisma.$executeRaw`UPDATE "Deck" SET "examDate" = NULL WHERE id = ${params.id}`;
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: params.id, ...body },
    });
  } catch (error) {
    console.error("[API /decks/[id] PATCH]", error);
    return NextResponse.json({ success: false, error: "Failed to update deck" }, { status: 500 });
  }
}