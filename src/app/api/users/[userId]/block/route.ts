import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "super-secret") as any;
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const blockerId = await getUserId();
  if (!blockerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const blockedId = resolvedParams.userId;

  if (blockerId === blockedId) {
    return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
  }

  try {
    await prisma.block.upsert({
      where: {
        blockerId_blockedId: { blockerId, blockedId }
      },
      create: { blockerId, blockedId },
      update: {} // do nothing if exists
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
  }
}
