import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

const SYSTEM_PROMPT = `You are the fitness assistant inside this application.
Answer the user's CURRENT question directly.
Do not repeat previous answers unless necessary.
Distinguish between questions about:
- exercises
- exercise technique
- muscles worked
- workouts
- strength
- muscle gain
- recovery
- nutrition
- progress
- application features
Use conversation context when relevant.
Prefer concise, specific and actionable answers.
If the user asks about an exercise, explain that exercise specifically rather than returning generic fitness advice.
Do not invent the user's workout history or physical condition.
For medical/injury questions, avoid diagnosis and recommend appropriate professional evaluation when warranted.`;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const profile = user.profile;
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }
  const userContext = [
    "User profile:",
    `Name: ${user.name}, Age: ${profile.age}, Gender: ${profile.gender}`,
    `Height: ${profile.height}cm, Weight: ${profile.weight}kg`,
    `Goal: ${profile.fitnessGoal.replace(/_/g, " ")}, Level: ${profile.fitnessLevel}`,
    `Workout time: ${profile.workoutTime}, Days: ${profile.workoutDays}`,
  ].join("\n");

  const apiKey = process.env.OPENAI_API_KEY;
  const recentMessages = messages.slice(-6);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\n" + userContext },
          ...recentMessages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ reply: `OpenAI Error: ${data.error.message}` });
    }
    
    const reply =
      data.choices?.[0]?.message?.content ||
      "I could not generate a response. Please try again.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 500 }
    );
  }
}
