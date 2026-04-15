import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, error: "Only PDF files are supported." }, { status: 400 });
    }

    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File size exceeds 20MB limit." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic import to avoid edge runtime issues
    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(buffer);

    const text = pdfData.text
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { success: false, error: "Could not extract readable text from this PDF. Try a text-based PDF." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        text,
        pages: pdfData.numpages,
        wordCount: text.split(/\s+/).length,
        fileName: file.name,
      },
    });
  } catch (error) {
    console.error("[API /extract-pdf]", error);
    return NextResponse.json(
      { success: false, error: "Failed to process PDF. Make sure it contains readable text." },
      { status: 500 }
    );
  }
}
