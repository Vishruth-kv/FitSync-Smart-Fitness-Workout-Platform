"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { exercises, Exercise } from '@/data/exercises';
import { ExerciseVisualizer } from '@/components/ExerciseVisualizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, ChevronRight, ChevronLeft, ArrowLeft, Play, X, Trophy } from 'lucide-react';

interface CompletedSet {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  volume: number;
  timestamp: number;
}

interface WorkoutState {
  type: string;
  currentExerciseIndex: number;
  completedSets: CompletedSet[];
  startTime: number;
}

function WorkoutSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get('type') || 'push';
  
  const workoutExercises = exercises.filter(e => e.type === typeParam);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [workoutState, setWorkoutState] = useState<WorkoutState | null>(null);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  
  const [weightInput, setWeightInput] = useState<string>('');
  const [repsInput, setRepsInput] = useState<string>('');
  
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  
  const [prNotification, setPrNotification] = useState<{ exercise: string, text: string } | null>(null);
  
  const currentExercise = workoutExercises[currentExerciseIndex];
  const isFinished = currentExerciseIndex >= workoutExercises.length;
  
  // Calculate sets completed for current exercise
  const currentExerciseSets = completedSets.filter(s => s.exerciseId === currentExercise?.id);
  const currentSetNumber = currentExerciseSets.length + 1;
  const isExerciseComplete = currentExercise && currentExerciseSets.length >= currentExercise.sets;

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('current_workout_session');
    if (saved) {
      try {
        const parsed: WorkoutState = JSON.parse(saved);
        if (parsed.type === typeParam) {
          setWorkoutState(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoaded(true);
  }, [typeParam]);

  useEffect(() => {
    // Save to local storage when state changes
    if (isLoaded && !isFinished) {
      const state: WorkoutState = {
        type: typeParam,
        currentExerciseIndex,
        completedSets,
        startTime: workoutState?.startTime || Date.now(),
      };
      localStorage.setItem('current_workout_session', JSON.stringify(state));
    }
  }, [isLoaded, currentExerciseIndex, completedSets, typeParam, isFinished, workoutState?.startTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeRemaining > 0 && !isTimerPaused) {
      interval = setInterval(() => {
        setRestTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isResting && restTimeRemaining <= 0) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining, isTimerPaused]);

  const discardWorkout = () => {
    localStorage.removeItem('current_workout_session');
    setWorkoutState(null);
    setCurrentExerciseIndex(0);
    setCompletedSets([]);
    
    // Preset reps based on target
    if (workoutExercises[0]) {
      const targetReps = parseInt(workoutExercises[0].reps.replace(/[^0-9]/g, '')) || 0;
      setRepsInput(targetReps ? targetReps.toString() : '');
    }
    setShowDiscardConfirm(false);
  };

  const resumeWorkout = () => {
    if (workoutState) {
      setCurrentExerciseIndex(workoutState.currentExerciseIndex);
      setCompletedSets(workoutState.completedSets);
      
      const ex = workoutExercises[workoutState.currentExerciseIndex];
      if (ex) {
        const targetReps = parseInt(ex.reps.replace(/[^0-9]/g, '')) || 0;
        setRepsInput(targetReps ? targetReps.toString() : '');
      }
    }
    setWorkoutState(null); // Clear prompt
  };

  const parseRestTime = (restStr: string): number => {
    if (restStr.includes('min')) {
      const mins = parseInt(restStr);
      return mins * 60;
    }
    return parseInt(restStr) || 60;
  };

  const checkPersonalRecord = (exerciseId: string, weight: number, reps: number) => {
    const prKey = `pr_${exerciseId}`;
    const savedPr = localStorage.getItem(prKey);
    let isNewPr = false;
    let prevText = '';
    
    if (savedPr) {
      const pr = JSON.parse(savedPr);
      // Simple 1RM estimate calculation for PR: weight * (1 + reps/30)
      const current1RM = weight * (1 + reps / 30);
      const saved1RM = pr.weight * (1 + pr.reps / 30);
      
      if (current1RM > saved1RM && weight > 0) {
        isNewPr = true;
        prevText = `${pr.weight} kg × ${pr.reps}`;
        localStorage.setItem(prKey, JSON.stringify({ weight, reps, volume: weight * reps }));
      }
    } else if (weight > 0) {
      isNewPr = true;
      localStorage.setItem(prKey, JSON.stringify({ weight, reps, volume: weight * reps }));
    }
    
    if (isNewPr) {
      setPrNotification({
        exercise: currentExercise?.name || '',
        text: prevText ? `Previous best: ${prevText}` : 'First time recording this exercise!'
      });
      setTimeout(() => setPrNotification(null), 4000);
    }
  };

  const handleCompleteSet = () => {
    if (!currentExercise) return;
    
    const w = parseFloat(weightInput) || 0;
    const r = parseInt(repsInput) || 0;
    
    checkPersonalRecord(currentExercise.id, w, r);
    
    const newSet: CompletedSet = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      setNumber: currentSetNumber,
      weight: w,
      reps: r,
      volume: w * r,
      timestamp: Date.now()
    };
    
    setCompletedSets([...completedSets, newSet]);
    
    // Start Rest Timer if not the last set of the last exercise
    if (currentSetNumber < currentExercise.sets) {
      setRestTimeRemaining(parseRestTime(currentExercise.rest));
      setIsResting(true);
      setIsTimerPaused(false);
    } else {
      // Exercise complete
      setRestTimeRemaining(0);
      setIsResting(false);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < workoutExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      const nextEx = workoutExercises[currentExerciseIndex + 1];
      const targetReps = parseInt(nextEx.reps.replace(/[^0-9]/g, '')) || 0;
      setRepsInput(targetReps ? targetReps.toString() : '');
      setWeightInput('');
    } else {
      setCurrentExerciseIndex(prev => prev + 1); // Finish
      localStorage.removeItem('current_workout_session');
      
      // Save to history
      try {
        const history = JSON.parse(localStorage.getItem('workout_history') || '[]');
        const totalVolume = completedSets.reduce((sum, set) => sum + set.volume, 0);
        const totalReps = completedSets.reduce((sum, set) => sum + set.reps, 0);
        const duration = Math.round((Date.now() - (workoutState?.startTime || Date.now())) / 60000);
        const uniqueExercises = new Set(completedSets.map(s => s.exerciseId)).size;
        
        history.push({
          id: Date.now().toString(),
          type: typeParam,
          date: Date.now(),
          duration: duration,
          totalVolume,
          totalSets: completedSets.length,
          totalReps,
          exercisesCompleted: uniqueExercises,
          sets: completedSets
        });
        localStorage.setItem('workout_history', JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save workout history", e);
      }
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  if (workoutExercises.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <CardTitle className="mb-4">Workout Not Found</CardTitle>
          <Button onClick={() => router.push('/tutorial')}>Back to Workouts</Button>
        </Card>
      </div>
    );
  }

  // RESUME PROMPT
  if (workoutState && !isFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary/10 to-brand-orange/5 rounded-full blur-[120px] -z-10" />
        
        <Card className="w-full max-w-md border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl p-6 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Workout In Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">You have an unfinished {typeParam.toUpperCase()} workout session.</p>
            <p className="text-sm font-semibold">{workoutState.completedSets.length} sets completed</p>
            
            {showDiscardConfirm ? (
              <div className="flex flex-col gap-3 pt-4">
                <p className="font-bold text-destructive">Discard this workout?</p>
                <p className="text-sm">Your completed sets will be lost.</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowDiscardConfirm(false)}>CANCEL</Button>
                  <Button variant="destructive" className="flex-1" onClick={discardWorkout}>DISCARD</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-4">
                <Button size="lg" onClick={resumeWorkout} className="font-bold text-lg">
                  <Play className="mr-2 h-5 w-5" /> RESUME WORKOUT
                </Button>
                <Button size="lg" variant="outline" onClick={() => setShowDiscardConfirm(true)}>
                  DISCARD WORKOUT
                </Button>
                <Button variant="ghost" onClick={() => router.push('/tutorial')} className="mt-2 text-muted-foreground">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // COMPLETION SCREEN
  if (isFinished) {
    const totalVolume = completedSets.reduce((sum, set) => sum + set.volume, 0);
    const totalReps = completedSets.reduce((sum, set) => sum + set.reps, 0);
    const totalTime = Math.round((Date.now() - (workoutState?.startTime || Date.now() - 3600000)) / 60000);
    
    // Group sets by exercise for summary
    const summary = workoutExercises.map(ex => {
      const exSets = completedSets.filter(s => s.exerciseId === ex.id);
      const exVol = exSets.reduce((sum, s) => sum + s.volume, 0);
      return { exercise: ex, sets: exSets, volume: exVol };
    });

    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-primary/20 bg-background/80 backdrop-blur-md shadow-2xl overflow-hidden text-center pt-8">
            <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <CardHeader>
              <CardTitle className="text-3xl font-black text-primary mb-2">WORKOUT COMPLETE</CardTitle>
              <p className="text-xl font-bold text-foreground">DAY {typeParam === 'push' ? 1 : typeParam === 'pull' ? 2 : 3} — {typeParam.toUpperCase()}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Exercises</p>
                  <p className="text-2xl font-bold">{workoutExercises.length} / {workoutExercises.length}</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Total Sets</p>
                  <p className="text-2xl font-bold">{completedSets.length}</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Total Reps</p>
                  <p className="text-2xl font-bold">{totalReps}</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Total Volume</p>
                  <p className="text-2xl font-bold">{totalVolume.toLocaleString()} <span className="text-lg font-medium">kg</span></p>
                </div>
                <div className="bg-muted rounded-xl p-4 col-span-2">
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Total Time</p>
                  <p className="text-2xl font-bold">{totalTime} <span className="text-lg font-medium">min</span></p>
                </div>
              </div>
              <h3 className="text-lg font-bold mt-8 mb-4 border-b pb-2 text-left">Workout Summary</h3>
              <div className="space-y-4 text-left">
                {summary.map(item => (
                  <div key={item.exercise.id} className="bg-card border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-sm">{item.exercise.name}</p>
                      <span className="text-xs font-semibold text-primary">{item.volume > 0 ? `${item.volume} kg` : ''}</span>
                    </div>
                    {item.sets.length > 0 ? (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {item.sets.map((s, i) => (
                          <div key={i} className="flex justify-between border-t border-border/50 pt-1 mt-1">
                            <span>Set {s.setNumber}</span>
                            <span className="font-medium text-foreground">{s.weight > 0 ? `${s.weight}kg × ` : ''}{s.reps} reps</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Skipped</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <Button size="lg" className="w-full font-bold text-lg h-14" onClick={() => router.push('/tutorial')}>
                  FINISH WORKOUT
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // WORKOUT SESSION UI
  const totalWorkoutSets = workoutExercises.reduce((acc, ex) => acc + ex.sets, 0);
  const workoutProgressPct = Math.round((completedSets.length / totalWorkoutSets) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setShowExitConfirm(true)}>
            <X className="h-6 w-6" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-sm font-black tracking-widest uppercase text-muted-foreground">
              Day {typeParam === 'push' ? 1 : typeParam === 'pull' ? 2 : 3} — {typeParam}
            </h1>
            <p className="text-xs font-semibold text-primary">Exercise {currentExerciseIndex + 1} / {workoutExercises.length}</p>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
            <span>Progress</span>
            <span>{workoutProgressPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, workoutProgressPct)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 pb-32">
        {prNotification && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <Card className="bg-green-500 text-white border-none shadow-xl">
              <CardContent className="p-3 flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-300" />
                <div>
                  <p className="font-black text-sm">🎉 NEW PERSONAL RECORD!</p>
                  <p className="text-xs font-medium opacity-90">{prNotification.exercise}</p>
                  <p className="text-[10px] opacity-80 mt-1">{prNotification.text}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Exercise Details */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">{currentExercise.name}</h2>
          <p className="text-sm font-semibold text-muted-foreground mt-1">
            Target: {currentExercise.sets} sets × {currentExercise.reps} reps
          </p>
        </div>

        {/* Visualizer (if available) */}
        {currentExercise.animationType && (
          <div className="mb-6 rounded-xl overflow-hidden border border-border shadow-sm bg-muted/30 h-[250px] flex items-center justify-center relative">
            <ExerciseVisualizer exerciseId={currentExercise.id} progress={isResting ? 100 : 50} />
          </div>
        )}

        {/* REST TIMER OVERLAY */}
        {isResting && (
          <Card className="border-primary bg-primary/5 shadow-lg mb-6 animate-in zoom-in-95 duration-300">
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-black tracking-widest text-primary uppercase mb-2">Rest Timer</h3>
              <div className="text-6xl font-black tabular-nums tracking-tighter mb-4">
                {formatTime(restTimeRemaining)}
              </div>
              
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-primary transition-all duration-1000 linear"
                  style={{ width: `${(restTimeRemaining / parseRestTime(currentExercise.rest)) * 100}%` }}
                />
              </div>

              {restTimeRemaining === 0 ? (
                <div className="animate-pulse text-xl font-bold text-green-500 mb-4">
                  REST COMPLETE! GET READY!
                </div>
              ) : null}

              <div className="flex gap-2">
                {restTimeRemaining > 0 && (
                  <Button 
                    variant="outline"
                    size="lg"
                    className="flex-1 font-bold h-12"
                    onClick={() => setIsTimerPaused(!isTimerPaused)}
                  >
                    {isTimerPaused ? "RESUME" : "PAUSE"}
                  </Button>
                )}
                <Button 
                  variant={restTimeRemaining === 0 ? "default" : "outline"}
                  size="lg" 
                  className="flex-1 font-bold h-12"
                  onClick={() => { setIsResting(false); setIsTimerPaused(false); }}
                >
                  {restTimeRemaining === 0 ? "START NEXT SET" : "SKIP REST"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SET TRACKER UI */}
        {!isResting && (
          <Card className="mb-6 shadow-md border-border/50">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="flex justify-between items-center text-lg">
                <span>Set Progress</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentExerciseSets.length} / {currentExercise.sets} completed
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {/* Display completed sets */}
              {currentExerciseSets.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="font-bold">Set {s.setNumber}</span>
                  </div>
                  <span className="font-semibold">{s.weight > 0 ? `${s.weight} kg × ` : ''}{s.reps} reps</span>
                </div>
              ))}

              {/* Input for current set */}
              {!isExerciseComplete && (
                <div className="p-4 rounded-xl bg-card border shadow-sm mt-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Current: Set {currentSetNumber}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Weight (kg)</label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="h-12 text-lg font-bold text-center"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Reps</label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="h-12 text-lg font-bold text-center"
                        value={repsInput}
                        onChange={(e) => setRepsInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 text-lg font-black tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    onClick={handleCompleteSet}
                    disabled={!repsInput}
                  >
                    <Check className="mr-2 h-6 w-6" /> COMPLETE SET
                  </Button>
                </div>
              )}

              {/* Exercise Complete State */}
              {isExerciseComplete && (
                <div className="p-6 text-center bg-primary/10 rounded-xl border border-primary/20 mt-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-3">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-primary uppercase mb-4">
                    ✓ {currentExercise.name} COMPLETE
                  </h3>
                  {currentExerciseIndex < workoutExercises.length - 1 ? (
                    <>
                      <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                        NEXT: {workoutExercises[currentExerciseIndex + 1].name}
                      </p>
                      <Button 
                        className="w-full h-14 text-lg font-bold"
                        onClick={handleNextExercise}
                      >
                        START NEXT EXERCISE <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full h-14 text-lg font-bold"
                      onClick={handleNextExercise}
                    >
                      FINISH WORKOUT
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation Controls */}
        <div className="flex justify-between items-center px-2 pt-2 border-t border-border/50">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrevExercise}
            disabled={currentExerciseIndex === 0 || isResting}
            className="text-muted-foreground font-semibold"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Prev Exercise
          </Button>
          {!isExerciseComplete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNextExercise}
              disabled={isResting}
              className="text-muted-foreground font-semibold"
            >
              Skip <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl border-primary/20 animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Exit Workout?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to leave? Your completed sets will be saved and you can resume later.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="default" onClick={() => router.push('/tutorial')}>
                  Exit & Save
                </Button>
                <Button variant="outline" onClick={() => setShowExitConfirm(false)}>
                  Continue Workout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">Loading Workout...</div>}>
      <WorkoutSession />
    </Suspense>
  );
}
