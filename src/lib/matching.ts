export interface Profile {
  age: number; gender: string; height: number; weight: number;
  fitnessGoal: string; fitnessLevel: string; workoutTime: string; personality: string;
  workoutDays: string; preferredLocation: string; budget: number;
  preferredGymType: string; bio?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profile: Profile;
  createdAt?: string;
}

export interface MatchResult {
  user: Omit<User, "password">;
  score: number;
  reasons: string[];
}

const WEIGHTS = {
  goal: 0.3,
  routine: 0.2,
  location: 0.2,
  level: 0.15,
  budget: 0.1,
  personality: 0.05,
};

function daysOverlapRatio(a: string, b: string) {
  const arrA = a ? a.split(",") : [];
  const arrB = b ? b.split(",") : [];
  if (!arrA.length || !arrB.length) return 0;
  const setB = new Set(arrB);
  const overlap = arrA.filter((d) => setB.has(d)).length;
  return overlap / Math.max(arrA.length, arrB.length);
}

function levelScore(a: string, b: string) {
  const order = ["beginner", "intermediate", "advanced"];
  const ia = order.indexOf(a);
  const ib = order.indexOf(b);
  if (ia === -1 || ib === -1) return 0.5;
  const diff = Math.abs(ia - ib);
  return diff === 0 ? 1 : diff === 1 ? 0.5 : 0;
}

function budgetScore(a: number, b: number) {
  if (!a || !b) return 0.5;
  const diff = Math.abs(a - b);
  const avg = (a + b) / 2;
  const ratio = diff / avg;
  return Math.max(0, 1 - ratio);
}

export function computeCompatibility(
  me: User,
  other: User
): MatchResult {
  const reasons: string[] = [];

  const myP = me.profile;
  const otherP = other.profile;

  if (!myP || !otherP) return { user: other, score: 0, reasons: [] };

  const goalScore = myP.fitnessGoal === otherP.fitnessGoal ? 1 : 0.3;
  if (goalScore === 1) reasons.push("Same fitness goal");

  const timeScore = myP.workoutTime === otherP.workoutTime ? 1 : 0.3;
  const dayScore = daysOverlapRatio(myP.workoutDays, otherP.workoutDays);
  const routineScore = (timeScore + dayScore) / 2;
  if (timeScore === 1) reasons.push("Same preferred workout time");
  if (dayScore > 0.5) reasons.push("Overlapping workout days");

  const locScore =
    myP.preferredLocation.trim().toLowerCase() ===
    otherP.preferredLocation.trim().toLowerCase()
      ? 1
      : 0.2;
  if (locScore === 1) reasons.push("Same gym location/area");

  const lvlScore = levelScore(myP.fitnessLevel, otherP.fitnessLevel);
  if (lvlScore === 1) reasons.push("Similar fitness experience");

  const budScore = budgetScore(myP.budget, otherP.budget);
  if (budScore > 0.8) reasons.push("Similar gym budget");

  const persScore = myP.personality === otherP.personality ? 1 : 0.5;

  const total =
    goalScore * WEIGHTS.goal +
    routineScore * WEIGHTS.routine +
    locScore * WEIGHTS.location +
    lvlScore * WEIGHTS.level +
    budScore * WEIGHTS.budget +
    persScore * WEIGHTS.personality;

  const safeUser: any = { ...other };
  delete safeUser.password;

  return {
    user: safeUser,
    score: Math.round(total * 100),
    reasons,
  };
}

export function findMatches(
  me: User,
  candidates: User[]
): MatchResult[] {
  return candidates
    .filter((c) => c.id !== me.id)
    .map((c) => computeCompatibility(me, c))
    .sort((a, b) => b.score - a.score);
}
