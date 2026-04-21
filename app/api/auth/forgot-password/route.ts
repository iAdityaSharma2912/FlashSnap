import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // We return success even if user doesn't exist to prevent email enumeration attacks
      return NextResponse.json({ success: true });
    }

    // Generate a secure 64-character token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

    // Save token to database (delete any existing ones for this email first)
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    // TODO: Send this resetUrl to the user via email using Resend, SendGrid, Nodemailer, etc.
    // For testing right now, we will just log it to the console!
    console.log(`\n PASSWORD RESET LINK FOR ${email}:\n${resetUrl}\n`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}