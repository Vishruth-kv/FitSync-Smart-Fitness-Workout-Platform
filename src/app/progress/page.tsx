"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Activity, Flame, Dumbbell, History, Trophy, CalendarDays } from 'lucide-react';

const ProgressCharts = dynamic(() => import('@/components/ProgressCharts'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full flex items-center justify-center border rounded-xl bg-muted/20 text-muted-foreground">Loading charts...</div>
});
import { exercises } from '@/data/exercises';

interface CompletedSet {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  volume: number;
  timestamp: number;
}

interface WorkoutHistoryItem {
  id: string;
  type: string;
  date: number;
  duration: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  exercisesCompleted: number;
  sets: CompletedSet[];
}

export default function ProgressDashboard() {
  const router = useRouter();
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [formCheckHistory, setFormCheckHistory] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string>('bench-press');

  useEffect(() => {
    const saved = localStorage.getItem('workout_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Sort newest first
        parsed.sort((a: WorkoutHistoryItem, b: WorkoutHistoryItem) => b.date - a.date);
        setHistory(parsed);
      } catch (e) {
        console.error(e);
      }
    }
    const savedFC = localStorage.getItem('formCheckHistory');
    if (savedFC) {
      try {
        setFormCheckHistory(JSON.parse(savedFC));
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Summary Metrics
  const totalWorkouts = history.length;
  const totalSets = history.reduce((sum, w) => sum + w.totalSets, 0);
  const totalVolume = history.reduce((sum, w) => sum + w.totalVolume, 0);

  // Calculate Streak
  const currentStreak = useMemo(() => {
    if (history.length === 0) return 0;
    let streak = 0;
    const now = new Date();
    now.setHours(0,0,0,0);
    
    // Create a set of unique days where workouts happened
    const workoutDays = new Set(history.map(w => {
      const d = new Date(w.date);
      d.setHours(0,0,0,0);
      return d.getTime();
    }));
    
    const ONE_DAY = 86400000;
    let checkDate = now.getTime();
    
    // If they worked out today or yesterday, streak is active
    if (workoutDays.has(checkDate) || workoutDays.has(checkDate - ONE_DAY)) {
      if (!workoutDays.has(checkDate)) {
        checkDate -= ONE_DAY;
      }
      while (workoutDays.has(checkDate)) {
        streak++;
        checkDate -= ONE_DAY;
      }
    }
    return streak;
  }, [history]);

  // Extract all unique exercises the user has done
  const userExercises = useMemo(() => {
    const exIds = new Set<string>();
    history.forEach(w => w.sets.forEach(s => exIds.add(s.exerciseId)));
    return Array.from(exIds).map(id => {
      const def = exercises.find(e => e.id === id);
      return { id, name: def ? def.name : id };
    });
  }, [history]);

  // Make sure selectedExercise is valid
  useEffect(() => {
    if (userExercises.length > 0 && !userExercises.find(e => e.id === selectedExercise)) {
      setSelectedExercise(userExercises[0].id);
    }
  }, [userExercises, selectedExercise]);

  // Strength Progress Chart Data (Estimated 1RM for selected exercise over time)
  const strengthData = useMemo(() => {
    const data: { date: string, est1RM: number, weight: number }[] = [];
    
    // Process oldest to newest
    const reversedHistory = [...history].reverse();
    
    reversedHistory.forEach(w => {
      const exSets = w.sets.filter(s => s.exerciseId === selectedExercise);
      if (exSets.length > 0) {
        // Find best set in this workout
        let best1RM = 0;
        let highestWeight = 0;
        exSets.forEach(s => {
          const est1RM = s.weight * (1 + s.reps / 30);
          if (est1RM > best1RM) best1RM = est1RM;
          if (s.weight > highestWeight) highestWeight = s.weight;
        });
        
        data.push({
          date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          est1RM: Math.round(best1RM * 10) / 10,
          weight: highestWeight
        });
      }
    });
    return data;
  }, [history, selectedExercise]);

  // Volume Chart Data
  const volumeData = useMemo(() => {
    const reversedHistory = [...history].reverse();
    return reversedHistory.slice(-14).map(w => ({
      date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volume: w.totalVolume,
      type: w.type.toUpperCase()
    }));
  }, [history]);

  // Muscle Training Summary
  const muscleGroups = useMemo(() => {
    const groups: Record<string, number> = {
      'Chest': 0, 'Back': 0, 'Shoulders': 0, 'Arms': 0, 'Legs': 0, 'Core': 0
    };
    
    history.forEach(w => {
      w.sets.forEach(set => {
        const ex = exercises.find(e => e.id === set.exerciseId);
        if (ex) {
          ex.primaryMuscles.forEach(m => {
            if (m.includes('chest')) groups['Chest']++;
            else if (m.includes('lat') || m.includes('back') || m.includes('rhomboid') || m.includes('trapezius')) groups['Back']++;
            else if (m.includes('shoulder') || m.includes('deltoid') || m.includes('rotator_cuff')) groups['Shoulders']++;
            else if (m.includes('bicep') || m.includes('tricep')) groups['Arms']++;
            else if (m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('calf') || m.includes('gastrocnemius') || m.includes('soleus')) groups['Legs']++;
            else if (m.includes('core') || m.includes('spinal')) groups['Core']++;
          });
        }
      });
    });
    
    return Object.entries(groups)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [history]);

  // Personal Records
  const personalRecords = useMemo(() => {
    const prs: { name: string, weight: number, reps: number }[] = [];
    userExercises.forEach(ue => {
      const savedPr = localStorage.getItem(`pr_${ue.id}`);
      if (savedPr) {
        const pr = JSON.parse(savedPr);
        prs.push({ name: ue.name, weight: pr.weight, reps: pr.reps });
      }
    });
    return prs.sort((a, b) => b.weight - a.weight);
  }, [userExercises]);

  if (!isLoaded) return <div className="min-h-screen bg-background"></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName="Athlete" />
      
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Progress & Analytics</h1>
            <p className="text-muted-foreground text-lg">Track your journey and celebrate your gains.</p>
          </div>
          {history.length > 0 && (
            <Button size="lg" onClick={() => router.push('/tutorial')} className="font-bold">
              START NEXT WORKOUT
            </Button>
          )}
        </header>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30 mb-12">
            <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
              <Activity size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-3">No progress data yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Complete your first workout in Smart Workout Mode to unlock your personal dashboard, streak tracking, and strength charts.
            </p>
            <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={() => router.push('/tutorial')}>
              START YOUR FIRST WORKOUT
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-muted-foreground mb-2">
                    <CalendarDays size={18} />
                    <span className="font-semibold text-sm uppercase tracking-wider">Workouts</span>
                  </div>
                  <div className="text-4xl font-black">{totalWorkouts}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-orange-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Flame size={60} className="text-orange-500" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-orange-500 mb-2">
                    <Flame size={18} />
                    <span className="font-semibold text-sm uppercase tracking-wider">Streak</span>
                  </div>
                  <div className="text-4xl font-black text-foreground">
                    {currentStreak} <span className="text-lg text-muted-foreground font-semibold uppercase">Days</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-muted-foreground mb-2">
                    <Dumbbell size={18} />
                    <span className="font-semibold text-sm uppercase tracking-wider">Total Sets</span>
                  </div>
                  <div className="text-4xl font-black">{totalSets}</div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-muted-foreground mb-2">
                    <Activity size={18} />
                    <span className="font-semibold text-sm uppercase tracking-wider">Total Volume</span>
                  </div>
                  <div className="text-4xl font-black">{totalVolume.toLocaleString()} <span className="text-lg font-medium text-muted-foreground">kg</span></div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <ProgressCharts 
              strengthData={strengthData}
              volumeData={volumeData}
              selectedExercise={selectedExercise}
              setSelectedExercise={setSelectedExercise}
              userExercises={userExercises}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Personal Records List */}
              <Card className="md:col-span-1 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Trophy className="text-yellow-500" size={24} /> 
                    Personal Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                    {personalRecords.length > 0 ? personalRecords.map((pr, i) => (
                      <div key={i} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                        <span className="font-semibold text-sm">{pr.name}</span>
                        <div className="text-right">
                          <div className="font-black text-primary">{pr.weight} kg</div>
                          <div className="text-xs text-muted-foreground">{pr.reps} reps</div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No personal records stored yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Workouts */}
              <Card className="md:col-span-1 shadow-sm">
                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <History size={24} /> 
                    Recent Workouts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                    {history.slice(0, 10).map((w, i) => (
                      <div key={i} className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black uppercase tracking-widest text-primary">Day {w.type === 'push' ? 1 : w.type === 'pull' ? 2 : 3} — {w.type}</span>
                          </div>
                          <div className="text-sm text-muted-foreground font-medium">
                            {w.exercisesCompleted} exercises • {w.totalSets} sets
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-semibold">
                            {new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No workouts logged yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Form Check History */}
              <Card className="md:col-span-1 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Activity size={24} className="text-emerald-500" /> 
                    Form Check History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                    {formCheckHistory.slice(0, 10).map((fc, i) => (
                      <div key={i} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-md">{fc.exercise}</span>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {new Date(fc.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-primary mb-2">
                          {fc.reps} reps
                        </div>
                        {fc.events.length > 0 && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                            {fc.events.filter((e: string) => e.includes('met depth')).length > 0 && fc.exercise === 'Squat' ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                ✓ {fc.events.filter((e: string) => e === 'Squat met depth criterion').length} met depth criterion
                              </span>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-400">
                                {fc.events[0]} {fc.events.length > 1 ? `+${fc.events.length - 1} more` : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {formCheckHistory.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                        No form checks performed yet.
                        <Button variant="link" onClick={() => router.push('/form-check')} className="mt-2 text-primary p-0">
                          Try AI Form Checker
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Muscle Group Distribution */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold">Muscle Groups Trained</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {muscleGroups.map(([group, count], i) => (
                    <div key={group} className="bg-muted px-4 py-3 rounded-xl flex flex-col items-center flex-1 min-w-[120px]">
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{group}</span>
                      <span className="text-2xl font-black text-foreground">{count} <span className="text-xs font-semibold text-muted-foreground uppercase">sets</span></span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </main>
    </div>
  );
}
