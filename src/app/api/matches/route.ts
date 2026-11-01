import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { findMatches } from "@/lib/matching";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    include: { profile: true }
  });
  
  const matches = findMatches(me as any, users as any);
  return NextResponse.json({ matches });
}
