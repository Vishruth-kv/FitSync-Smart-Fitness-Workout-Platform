import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success anyway to prevent email enumeration, or in this demo just return success
      return NextResponse.json({ success: true });
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password: passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
