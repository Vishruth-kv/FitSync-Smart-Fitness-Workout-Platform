"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Activity, Settings, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const GOALS = ["weight_loss", "muscle_gain", "strength", "cardio", "bodybuilding", "general_fitness"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const TIMES = ["morning", "afternoon", "evening", "night"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const GYM_TYPES = ["premium", "budget", "women_only", "crossfit", "powerlifting"];

function label(s: string) {
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Profile {
  age: number; gender: string; height: number; weight: number;
  fitnessGoal: string; fitnessLevel: string; workoutTime: string; workoutDays: string;
  preferredLocation: string; languages: string; personality: string;
  budget: number; preferredGymType: string; bio?: string;
}

interface UserData {
  id: string;
  name: string;
  profile: Profile;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  
  const [form, setForm] = useState<any>({});
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/auth/me");
        if (!r.ok) { router.push("/login"); return; }
        const { user } = await r.json();
        setUser(user);
        
        if (user.profile) {
          setForm({ 
            name: user.name, 
            ...user.profile,
            workoutDays: user.profile.workoutDays ? user.profile.workoutDays.split(",") : []
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function toggleDay(day: string) {
    setForm((f: any) => {
      const currentDays = f.workoutDays || [];
      return {
        ...f,
        workoutDays: currentDays.includes(day)
          ? currentDays.filter((d: string) => d !== day)
          : [...currentDays, day],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    // Convert arrays back to comma separated for the API
    const payload = {
      ...form,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      budget: Number(form.budget),
      languages: form.languages && typeof form.languages === 'string' ? form.languages.split(",").map((l: string) => l.trim()).filter(Boolean) : (form.languages || []),
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Update failed"); setSaving(false); return; }
      setUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  }

  const InputLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{children}</label>
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-semibold">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userName={user.name.split(" ")[0]} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-10 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black tracking-tight mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your details to get better matches.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Personal */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Personal Information</CardTitle>
                <CardDescription>Your basic details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <InputLabel>Full name</InputLabel>
                    <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" />
                  </div>
                  <div>
                    <InputLabel>Age</InputLabel>
                    <Input type="number" value={form.age || ""} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} className="h-11" />
                  </div>
                  <div>
                    <InputLabel>Height (cm)</InputLabel>
                    <Input type="number" value={form.height || ""} onChange={(e) => setForm({ ...form, height: Number(e.target.value) })} className="h-11" />
                  </div>
                  <div>
                    <InputLabel>Weight (kg)</InputLabel>
                    <Input type="number" value={form.weight || ""} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="h-11" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Fitness */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Fitness Details</CardTitle>
                <CardDescription>Your goals and routines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <InputLabel>Fitness Goal</InputLabel>
                    <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.fitnessGoal || ""} onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })}>
                      {GOALS.map((g) => <option key={g} value={g} className="bg-background">{label(g)}</option>)}
                    </select>
                  </div>
                  <div>
                    <InputLabel>Fitness Level</InputLabel>
                    <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.fitnessLevel || ""} onChange={(e) => setForm({ ...form, fitnessLevel: e.target.value })}>
                      {LEVELS.map((l) => <option key={l} value={l} className="bg-background">{label(l)}</option>)}
                    </select>
                  </div>
                  <div>
                    <InputLabel>Preferred Workout Time</InputLabel>
                    <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.workoutTime || ""} onChange={(e) => setForm({ ...form, workoutTime: e.target.value })}>
                      {TIMES.map((t) => <option key={t} value={t} className="bg-background">{label(t)}</option>)}
                    </select>
                  </div>
                  <div>
                    <InputLabel>Preferred Gym Type</InputLabel>
                    <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.preferredGymType || ""} onChange={(e) => setForm({ ...form, preferredGymType: e.target.value })}>
                      {GYM_TYPES.map((g) => <option key={g} value={g} className="bg-background">{label(g)}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <InputLabel>Workout Days</InputLabel>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((d) => {
                      const isSelected = (form.workoutDays || []).includes(d);
                      return (
                        <button
                          type="button"
                          key={d}
                          onClick={() => toggleDay(d)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                            isSelected ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20" : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Preferences</CardTitle>
                <CardDescription>Match criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <InputLabel>Preferred Location / Area</InputLabel>
                    <Input value={form.preferredLocation || ""} onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })} className="h-11" />
                  </div>
                  <div>
                    <InputLabel>Monthly Budget (₹)</InputLabel>
                    <Input type="number" value={form.budget || ""} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} className="h-11" />
                  </div>
                  <div>
                    <InputLabel>Languages</InputLabel>
                    <Input value={form.languages || ""} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="h-11" />
                  </div>
                  <div>
                    <InputLabel>Personality</InputLabel>
                    <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.personality || "introvert"} onChange={(e) => setForm({ ...form, personality: e.target.value })}>
                      <option value="introvert" className="bg-background">Introvert</option>
                      <option value="extrovert" className="bg-background">Extrovert</option>
                    </select>
                  </div>
                </div>
                <div>
                  <InputLabel>Bio</InputLabel>
                  <textarea
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                    value={form.bio || ""}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4 pb-10">
            <Button 
              type="submit" 
              disabled={saving} 
              size="lg"
              className={`min-w-[200px] h-14 text-md font-bold transition-all shadow-lg ${saved ? "bg-secondary hover:bg-secondary text-secondary-foreground" : "shadow-primary/20"}`}
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving…</>
              ) : saved ? (
                <><Check className="w-5 h-5 mr-2" /> Saved!</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
