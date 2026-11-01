"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, MapPin, DollarSign, Activity, Calendar, Search, Quote } from "lucide-react";
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
}

interface Match {
  user: User;
  score: number;
  reasons: string[];
}

function label(s: string) {
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ScoreBadge({ score }: { score: number }) {
  const colorClass = score >= 75 ? "border-secondary text-secondary" : score >= 50 ? "border-primary text-primary" : "border-brand-orange text-brand-orange";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-16 h-16 rounded-full border-[3px] flex items-center justify-center font-black text-2xl shadow-lg shadow-background/5 ${colorClass}`}>
        {score}
      </div>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Match</span>
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [me, setMe] = useState<{ name: string } | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { router.push("/login"); return; }
      setMe((await meRes.json()).user);
      const res = await fetch("/api/matches");
      setMatches((await res.json()).matches || []);
    }
    load();
  }, [router]);

  const filtered = matches?.filter((m) => {
    if (filter === "high") return m.score >= 75;
    if (filter === "medium") return m.score >= 50 && m.score < 75;
    if (filter === "low") return m.score < 50;
    return true;
  });

  if (!matches) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground font-semibold">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Search className="h-8 w-8 text-primary" />
          <p>Finding your matches…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userName={me?.name?.split(" ")[0] || "…"} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Your Gym Partner Matches</h1>
          <p className="text-muted-foreground">
            {matches.length} {matches.length === 1 ? "person" : "people"} found — ranked by compatibility score.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "all", label: "All" },
            { id: "high", label: "🟢 Strong (75+)" },
            { id: "medium", label: "🔵 Good (50–74)" },
            { id: "low", label: "🟠 Low (<50)" }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={filter === tab.id ? "default" : "outline"}
              onClick={() => setFilter(tab.id)}
              className={`rounded-full whitespace-nowrap font-bold ${
                filter === tab.id ? "shadow-md shadow-primary/20" : ""
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {filtered?.length === 0 && (
          <Card className="border-dashed border-2 bg-transparent text-center p-12">
            <CardContent className="flex flex-col items-center gap-3 text-muted-foreground pt-6">
              <Search className="h-10 w-10 opacity-20" />
              <p className="text-lg font-semibold">
                {matches.length === 0
                  ? "No other members yet. Invite a friend to sign up and get matched!"
                  : "No matches in this range. Try a different filter."}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-5">
          {filtered?.map((m, i) => {
            const profile = m.user.profile;
            return (
              <motion.div
                key={m.user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-black text-2xl text-white shadow-lg shrink-0">
                      {m.user.name[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="font-bold text-xl">{m.user.name}</h2>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground font-semibold">
                          {profile?.age} · {label(profile?.gender)}
                        </Badge>
                      </div>
                      
                      {profile ? (
                        <>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {label(profile.fitnessGoal)}</span>
                            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {label(profile.fitnessLevel)}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {label(profile.workoutTime)} sessions</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {profile.preferredLocation}</span>
                            <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> ₹{profile.budget}/mo</span>
                          </div>

                          {profile.bio && (
                            <div className="mb-4 pl-3 border-l-2 border-border/50">
                              <p className="text-sm italic text-muted-foreground">&ldquo;{profile.bio}&rdquo;</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground mb-4">Profile details unavailable.</p>
                      )}

                      <div className="flex gap-2 flex-wrap mt-auto">
                        {m.reasons.length === 0
                          ? <Badge variant="outline" className="text-muted-foreground border-dashed">Limited overlap</Badge>
                          : m.reasons.map((r) => (
                              <Badge key={r} variant="outline" className="bg-primary/10 border-primary/20 text-primary font-bold">
                                ✓ {r}
                              </Badge>
                            ))
                        }
                      </div>
                    </div>

                    <div className="sm:ml-auto self-center sm:self-start flex flex-col items-center gap-4 pt-2 sm:pt-0">
                      <ScoreBadge score={m.score} />
                      <div className="flex flex-col gap-2 w-full">
                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => router.push(`/profile/${m.user.id}`)}>
                          View Profile
                        </Button>
                        <Button size="sm" className="w-full text-xs bg-primary text-primary-foreground font-bold" onClick={() => router.push(`/messages?userId=${m.user.id}`)}>
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
