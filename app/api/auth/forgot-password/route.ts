import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Prevent email enumeration attacks
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); 

    // Save token
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://flashsnap.in";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Send Email
    await resend.emails.send({
      from: "FlashSnap Support <support@flashsnap.in>", 
      to: email,
      subject: "Reset your FlashSnap Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; padding: 40px; border-radius: 10px; color: #fff;">
          <h2 style="color: #f97316;">Reset Your Password</h2>
          <p style="color: #ccc;">We received a request to reset the password for your FlashSnap account.</p>
          <p style="color: #ccc;">Click the button below to choose a new password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold;">
            Reset Password
          </a>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}