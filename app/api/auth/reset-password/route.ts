import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // Find the token
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (new Date(existingToken.expires) < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await prisma.user.update({
      where: { email: existingToken.email },
      data: { password: hashedPassword },
    });

    // Delete the token so it can't be used again
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}