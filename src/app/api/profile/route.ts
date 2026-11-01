import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  age: z.number().min(13).max(100).optional(),
  height: z.number().min(50).max(260).optional(),
  weight: z.number().min(20).max(400).optional(),
  fitnessGoal: z.string().optional(),
  fitnessLevel: z.string().optional(),
  workoutTime: z.string().optional(),
  workoutDays: z.array(z.string()).optional(),
  preferredLocation: z.string().optional(),
  languages: z.array(z.string()).optional(),
  personality: z.enum(["introvert", "extrovert"]).optional(),
  budget: z.number().min(0).optional(),
  preferredGymType: z.string().optional(),
  bio: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = UpdateSchema.parse(body);

  const { name, ...profileData } = data;

  const profileUpdateData: any = { ...profileData };
  if (data.workoutDays) {
    profileUpdateData.workoutDays = data.workoutDays.join(",");
  }
  if (data.languages) {
    profileUpdateData.languages = data.languages.join(",");
  }

  const updatedUser = await prisma.user.update({
    where: { id: me.id },
    data: {
      ...(name ? { name } : {}),
      profile: {
        update: profileUpdateData,
      },
    },
    include: { profile: true },
  });

  const { password, ...safeUser } = updatedUser;
  return NextResponse.json({ user: safeUser });
}

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { password, ...safeUser } = me;
  return NextResponse.json({ user: safeUser });
}
