import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().min(13).max(100),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().min(50).max(260),
  weight: z.number().min(20).max(400),
  fitnessGoal: z.string(),
  fitnessLevel: z.string(),
  workoutTime: z.string(),
  workoutDays: z.array(z.string()),
  preferredLocation: z.string(),
  languages: z.array(z.string()),
  personality: z.enum(["introvert", "extrovert"]),
  budget: z.number().min(0),
  preferredGymType: z.string(),
  bio: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let currentStep = "starting";
  try {
    currentStep = "parsing_body";
    const body = await req.json();
    const data = SignupSchema.parse(body);

    currentStep = "checking_exists";
    const exists = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    
    if (exists) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    currentStep = "hashing_password";
    const passwordHash = await hashPassword(data.password);
    
    const generateObjectId = () => 
      Math.floor(Date.now() / 1000).toString(16) + 
      'x'.repeat(16).replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));

    const userId = generateObjectId();
    const profileId = generateObjectId();
    const now = new Date().toISOString();

    currentStep = "creating_user";
    console.log("Creating user using raw...");
    await prisma.$runCommandRaw({
      insert: "User",
      documents: [{
        _id: { $oid: userId },
        name: data.name,
        email: data.email.toLowerCase(),
        password: passwordHash,
        createdAt: { $date: now },
        updatedAt: { $date: now },
      }]
    });
    console.log("User created:", userId);

    currentStep = "creating_profile";
    console.log("Creating profile using raw...");
    await prisma.$runCommandRaw({
      insert: "Profile",
      documents: [{
        _id: { $oid: profileId },
        userId: { $oid: userId },
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        fitnessGoal: data.fitnessGoal,
        fitnessLevel: data.fitnessLevel,
        workoutTime: data.workoutTime,
        workoutDays: data.workoutDays.join(","),
        preferredLocation: data.preferredLocation,
        languages: data.languages.join(","),
        personality: data.personality,
        budget: data.budget,
        preferredGymType: data.preferredGymType,
        bio: data.bio || "",
        createdAt: { $date: now },
        updatedAt: { $date: now },
      }]
    });
    console.log("Profile created");

    const token = signToken(userId);
    const res = NextResponse.json({
      user: { id: userId, name: data.name, email: data.email.toLowerCase() },
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err: unknown) {
    const zodErr = err as { issues?: unknown };
    if (zodErr?.issues) {
      return NextResponse.json(
        { error: "Invalid input", details: zodErr.issues },
        { status: 400 }
      );
    }
    console.error("Signup error:", err);
    return NextResponse.json({ 
      error: "Signup failed", 
      details: String(err),
      step: currentStep 
    }, { status: 500 });
  }
}
