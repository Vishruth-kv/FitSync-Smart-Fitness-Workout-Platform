import { NextResponse } from "next/server";
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

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: {
      participantIds: { has: userId }
    },
    include: {
      participants: {
        select: { id: true, name: true, profile: { select: { fitnessGoal: true, fitnessLevel: true } } }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: {
      lastMessageAt: 'desc'
    }
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ['conversationId'],
    where: {
      conversation: { participantIds: { has: userId } },
      senderId: { not: userId },
      isRead: false
    },
    _count: {
      id: true
    }
  });

  const unreadMap = unreadCounts.reduce((acc, curr) => {
    acc[curr.conversationId] = curr._count.id;
    return acc;
  }, {} as Record<string, number>);

  const formatted = conversations.map(c => ({
    id: c.id,
    otherUser: c.participants.find(p => p.id !== userId),
    lastMessage: c.messages[0] || null,
    unreadCount: unreadMap[c.id] || 0,
    updatedAt: c.lastMessageAt
  }));

  return NextResponse.json({ conversations: formatted });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId } = await req.json();
  if (!targetUserId) return NextResponse.json({ error: "targetUserId required" }, { status: 400 });

  let conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participantIds: { has: userId } },
        { participantIds: { has: targetUserId } }
      ]
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participantIds: [userId, targetUserId]
      }
    });
  }

  return NextResponse.json({ conversationId: conversation.id });
}
