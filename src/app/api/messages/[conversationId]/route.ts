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

export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const conversationId = resolvedParams.conversationId;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participantIds: { has: userId }
    },
    include: {
      participants: {
        select: { id: true, name: true, profile: { select: { fitnessGoal: true, fitnessLevel: true } } }
      }
    }
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json({ 
    messages,
    otherUser: conversation.participants.find(p => p.id !== userId)
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const conversationId = resolvedParams.conversationId;
  const { content, type = "text" } = await req.json();

  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participantIds: { has: userId }
    }
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const otherUserId = conversation.participantIds.find(id => id !== userId);

  if (otherUserId) {
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: otherUserId },
          { blockerId: otherUserId, blockedId: userId }
        ]
      }
    });

    if (isBlocked) {
      return NextResponse.json({ error: "Cannot send message. User is blocked." }, { status: 403 });
    }
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content,
      type
    }
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() }
  });

  return NextResponse.json({ message });
}
