"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Brain, Edit3, User as UserIcon, Calendar, Activity, MapPin, DollarSign, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface Profile {
  age: number; gender: string; height: number; weight: number;
  fitnessGoal: string; fitnessLevel: string; workoutTime: string; personality: string;
  workoutDays: string; preferredLocation: string; budget: number;
  preferredGymType: string; bio?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profile: Profile;
  createdAt: string;
}

function label(s: string) { 
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); 
}
function bmi(h: number, w: number) { return (w / Math.pow(h / 100, 2)).toFixed(1); }

function StatCard({ title, value, sub, icon: Icon, colorClass }: { title: string; value: string | number; sub?: string; icon: any; colorClass?: string }) {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-black ${colorClass || "text-foreground"}`}>{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1 font-medium">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/auth/me");
        if (!r.ok) { router.push("/login"); return; }
        const { user } = await r.json();
        setUser(user);
        
        // Mocked or load from matches API
        const mr = await fetch("/api/matches").catch(() => null);
        if (mr && mr.ok) {
          const md = await mr.json();
          setMatchCount((md.matches || []).filter((m: { score: number }) => m.score >= 50).length);
        } else {
          setMatchCount(0); // fallback if api/matches not implemented yet
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading || !user || !user.profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-semibold">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Activity className="h-8 w-8 text-primary" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const profile = user.profile;
  const userBmi = bmi(profile.height, profile.weight);
  const bmiNum = parseFloat(userBmi);
  const bmiStatus = bmiNum < 18.5 ? "Underweight" : bmiNum < 25 ? "Healthy" : bmiNum < 30 ? "Overweight" : "Obese";
  const bmiColor = bmiNum < 18.5 ? "text-brand-orange" : bmiNum < 25 ? "text-secondary" : bmiNum < 30 ? "text-brand-orange" : "text-destructive";
  
  const workoutDaysArr = profile.workoutDays ? profile.workoutDays.split(",") : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userName={user.name.split(" ")[0]} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-10 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Welcome back, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground text-lg">Here&apos;s your fitness overview.</p>
        </motion.div>

        {/* Quick actions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          <Button asChild className="rounded-full shadow-md shadow-primary/20 font-bold">
            <Link href="/matches"><Target className="w-4 h-4 mr-2" /> Browse Matches</Link>
          </Button>
          <Button asChild variant="secondary" className="rounded-full font-bold">
            <Link href="/coach"><Brain className="w-4 h-4 mr-2" /> AI Coach</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full font-bold">
            <Link href="/profile"><Edit3 className="w-4 h-4 mr-2" /> Edit Profile</Link>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
        >
          <StatCard title="Fitness Goal" value={label(profile.fitnessGoal)} icon={Target} />
          <StatCard title="Experience" value={label(profile.fitnessLevel)} colorClass="text-primary" icon={Activity} />
          <StatCard title="BMI" value={userBmi} sub={bmiStatus} colorClass={bmiColor} icon={UserIcon} />
          <StatCard title="Strong Matches" value={matchCount ?? "…"} sub="50+ score" colorClass="text-secondary" icon={Target} />
          <StatCard title="Training Days" value={workoutDaysArr.length} sub={workoutDaysArr.join(", ")} icon={Calendar} />
          <StatCard title="Preferred Time" value={label(profile.workoutTime)} icon={Activity} />
        </motion.div>

        {/* Profile summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
              <div>
                <CardTitle className="text-xl">Your Profile Details</CardTitle>
                <CardDescription>How you appear to potential matches</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-primary font-semibold hover:text-primary/80">
                <Link href="/profile">Edit &rarr;</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4">
                {[
                  { k: "Age", v: `${profile.age} years`, icon: UserIcon },
                  { k: "Gender", v: label(profile.gender), icon: UserIcon },
                  { k: "Height", v: `${profile.height} cm`, icon: Activity },
                  { k: "Weight", v: `${profile.weight} kg`, icon: Activity },
                  { k: "Location", v: profile.preferredLocation, icon: MapPin },
                  { k: "Gym Type", v: label(profile.preferredGymType), icon: Target },
                  { k: "Budget", v: `₹${profile.budget}/mo`, icon: DollarSign },
                  { k: "Personality", v: label(profile.personality), icon: Brain },
                ].map((item) => (
                  <div key={item.k} className="flex flex-col">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <item.icon className="w-3 h-3" /> {item.k}
                    </span>
                    <span className="text-sm font-semibold">{item.v}</span>
                  </div>
                ))}
              </div>
              
              {profile.bio && (
                <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border/50 relative">
                  <Quote className="absolute top-4 left-4 h-5 w-5 text-muted-foreground/30 rotate-180" />
                  <p className="pl-8 text-sm italic text-muted-foreground leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
