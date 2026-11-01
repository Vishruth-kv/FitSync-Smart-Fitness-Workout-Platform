import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ count: 0 });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "super-secret") as any;
    const userId = payload.userId as string;

    const count = await prisma.message.count({
      where: {
        conversation: {
          participantIds: { has: userId }
        },
        senderId: { not: userId },
        isRead: false
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}
