"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, ArrowRight, Check } from "lucide-react";

const GOALS = ["weight_loss", "muscle_gain", "strength", "cardio", "bodybuilding", "general_fitness"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const TIMES = ["morning", "afternoon", "evening", "night"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const GYM_TYPES = ["premium", "budget", "women_only", "crossfit", "powerlifting"];

function label(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", age: "", gender: "male",
    height: "", weight: "", fitnessGoal: GOALS[0], fitnessLevel: LEVELS[0],
    workoutTime: TIMES[0], workoutDays: [] as string[], preferredLocation: "",
    languages: "", personality: "introvert", budget: "", preferredGymType: GYM_TYPES[0], bio: "",
  });

  function toggleDay(day: string) {
    setForm((f) => ({
      ...f,
      workoutDays: f.workoutDays.includes(day)
        ? f.workoutDays.filter((d) => d !== day)
        : [...f.workoutDays, day],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, age: Number(form.age), height: Number(form.height),
          weight: Number(form.weight), budget: Number(form.budget),
          languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed"); setLoading(false); return; }
      router.push("/dashboard");
    } catch { setError("Something went wrong."); setLoading(false); }
  }

  const InputLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{children}</label>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/5 to-secondary/5 rounded-full blur-[120px] -z-10" />

      <Card className="w-full max-w-[560px] border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-1 mb-6 hover:opacity-80 transition-opacity">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xl font-black tracking-tighter">
              Fit<span className="text-primary">Match</span>
              <span className="text-secondary ml-1 text-[10px] tracking-widest uppercase align-top">AI</span>
            </span>
          </Link>
          <CardTitle className="text-2xl font-bold tracking-tight">Create your profile</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">These details power your gym partner matches.</p>
        </CardHeader>
        <CardContent>
          {/* Step indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <div className="text-xs font-semibold text-muted-foreground mb-6">
            Step {step} of 3 — {["Account & Body", "Fitness Goals", "Preferences"][step - 1]}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel>Full name</InputLabel>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" />
                </div>
                <div>
                  <InputLabel>Email</InputLabel>
                  <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" />
                </div>
                <div className="sm:col-span-2">
                  <InputLabel>Password</InputLabel>
                  <Input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11" />
                </div>
                <div>
                  <InputLabel>Age</InputLabel>
                  <Input required type="number" min={13} max={100} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="h-11" />
                </div>
                <div>
                  <InputLabel>Gender</InputLabel>
                  <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="male" className="bg-background">Male</option>
                    <option value="female" className="bg-background">Female</option>
                    <option value="other" className="bg-background">Other</option>
                  </select>
                </div>
                <div>
                  <InputLabel>Height (cm)</InputLabel>
                  <Input required type="number" min={50} max={260} value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="h-11" />
                </div>
                <div>
                  <InputLabel>Weight (kg)</InputLabel>
                  <Input required type="number" min={20} max={400} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-11" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <InputLabel>Fitness Goal</InputLabel>
                    <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.fitnessGoal} onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })}>
                      {GOALS.map((g) => <option key={g} value={g} className="bg-background">{label(g)}</option>)}
                    </select>
                  </div>
                  <div>
                    <InputLabel>Fitness Level</InputLabel>
                    <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.fitnessLevel} onChange={(e) => setForm({ ...form, fitnessLevel: e.target.value })}>
                      {LEVELS.map((l) => <option key={l} value={l} className="bg-background">{label(l)}</option>)}
                    </select>
                  </div>
                  <div>
                    <InputLabel>Workout Time</InputLabel>
                    <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.workoutTime} onChange={(e) => setForm({ ...form, workoutTime: e.target.value })}>
                      {TIMES.map((t) => <option key={t} value={t} className="bg-background">{label(t)}</option>)}
                    </select>
                  </div>
                  <div>
                    <InputLabel>Preferred Gym Type</InputLabel>
                    <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.preferredGymType} onChange={(e) => setForm({ ...form, preferredGymType: e.target.value })}>
                      {GYM_TYPES.map((g) => <option key={g} value={g} className="bg-background">{label(g)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <InputLabel>Workout Days</InputLabel>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((d) => {
                      const isSelected = form.workoutDays.includes(d);
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
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel>Location / Area</InputLabel>
                  <Input required placeholder="e.g. Indiranagar, Bengaluru" value={form.preferredLocation} onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })} className="h-11" />
                </div>
                <div>
                  <InputLabel>Monthly Budget (₹)</InputLabel>
                  <Input required type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="h-11" />
                </div>
                <div>
                  <InputLabel>Languages</InputLabel>
                  <Input placeholder="English, Hindi" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="h-11" />
                </div>
                <div>
                  <InputLabel>Personality</InputLabel>
                  <select className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })}>
                    <option value="introvert" className="bg-background">Introvert</option>
                    <option value="extrovert" className="bg-background">Extrovert</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <InputLabel>Bio (optional)</InputLabel>
                  <textarea
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border/50">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="h-12 px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button type="submit" disabled={loading} className="flex-1 h-12 text-md font-bold shadow-lg shadow-primary/20">
                {loading ? "Creating account…" : step < 3 ? (
                  <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Complete Sign Up <Check className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline underline-offset-4 transition-colors">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
