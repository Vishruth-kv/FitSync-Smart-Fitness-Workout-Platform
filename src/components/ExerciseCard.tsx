'use client';
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { Exercise } from '@/data/exercises';
import { MuscleMap } from './MuscleMap';
import { ExerciseVisualizer } from './ExerciseVisualizer';

export const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [progress, setProgress] = useState(0);

  // Auto-playing mini preview for the card (very slow)
  const [miniProgress, setMiniProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    if (isExpanded || !isHovered) return;
    const interval = setInterval(() => {
      setMiniProgress(p => (p >= 1 ? 0 : p + 0.003));
    }, 16);
    return () => clearInterval(interval);
  }, [isExpanded, isHovered]);

  useEffect(() => {
    if (!isPlaying || !isExpanded) return;
    const baseSpeed = 0.01;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 1) return 0;
        return p + baseSpeed * speedMultiplier;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, isExpanded]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const reset = () => {
    setProgress(0);
    setIsPlaying(true); // Restart playing when clicking replay
  };

  return (
    <>
      {/* SMALL CARD */}
      <div 
        className="bg-card text-card-foreground border rounded-xl overflow-hidden shadow-sm flex flex-col w-full hover:shadow-md transition-shadow"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-48 bg-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center scale-90 pointer-events-none opacity-80">
            <ExerciseVisualizer exerciseId={exercise.id} progress={miniProgress} />
          </div>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <h3 className="font-bold text-xl">{exercise.name}</h3>
          
          <div className="flex gap-2 text-sm text-muted-foreground font-medium">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
              {exercise.sets} × {exercise.reps}
            </span>
            <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">
              Rest: {exercise.rest}
            </span>
          </div>

          <div className="flex flex-col mt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Primary Target:</span>
            <span className="text-sm font-semibold">{exercise.primaryTarget}</span>
          </div>

          <button 
            onClick={() => { setIsExpanded(true); setProgress(0); setIsPlaying(true); setSpeedMultiplier(0.5); }} // Default to slow
            className="mt-4 w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            View Tutorial
          </button>
        </div>
      </div>

      {/* EXPANDED MODAL (TUTORIAL) */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-5xl rounded-2xl border shadow-2xl flex flex-col md:flex-row overflow-hidden relative my-auto max-h-[95vh]">
            
            <button 
              onClick={() => setIsExpanded(false)} 
              className="absolute top-4 right-4 z-20 bg-slate-800/80 p-2 rounded-full text-slate-200 hover:bg-slate-700/90 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Animation Section */}
            <div className="w-full md:w-1/2 bg-slate-950 flex flex-col border-b md:border-b-0 md:border-r border-border overflow-y-auto relative p-0">
              
              <div className="flex-1 min-h-[400px] flex flex-col relative w-full pt-8">
                
                {/* Cues Overlay */}
                {exercise.cues && (
                  <div className="absolute top-6 left-6 z-10 space-y-2 pointer-events-none">
                    {exercise.cues.map((cue, i) => (
                      <div key={i} className="text-slate-100 font-bold text-sm bg-slate-900/60 px-3 py-1.5 rounded-md backdrop-blur-sm border border-slate-700">
                        {cue}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex-1 w-full h-full flex items-center justify-center">
                  <ExerciseVisualizer exerciseId={exercise.id} progress={progress} />
                </div>
              </div>
              
              <div className="p-6 bg-slate-900/50 mt-auto border-t border-slate-800">
                {/* Progress Bar */}
                <div className="flex justify-between w-full mb-2 text-xs text-slate-400 font-medium font-mono">
                  <span>Progress:</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative mb-6">
                  <div 
                    className="h-full bg-primary absolute left-0 top-0 transition-all duration-75" 
                    style={{ width: `${Math.min(100, progress * 100)}%` }}
                  />
                </div>
                
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={togglePlay}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors font-bold text-sm min-w-[120px]"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button 
                      onClick={reset}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-bold text-sm"
                    >
                      <RotateCcw size={16} />
                      Replay
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 w-full sm:w-auto justify-center">
                    <span className="text-slate-400 text-[10px] px-2 font-mono uppercase tracking-wider">Speed</span>
                    {[0.5, 1].map(speed => (
                      <button
                        key={speed}
                        onClick={() => setSpeedMultiplier(speed)}
                        className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${
                          speedMultiplier === speed 
                            ? 'bg-slate-600 text-white' 
                            : 'text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
              <div className="mb-6 border-b pb-6">
                <h3 className="text-4xl font-black mb-2 uppercase tracking-tight">{exercise.name}</h3>
                
                <div className="flex flex-wrap gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  {exercise.primaryMuscles.map(m => m.replace('_', ' ')).join(' • ')}
                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && ' • '}
                  {exercise.secondaryMuscles && exercise.secondaryMuscles.map(m => m.replace('_', ' ')).join(' • ')}
                </div>

                <div className="flex flex-col mt-1 bg-muted p-4 rounded-xl border border-border">
                  <span className="text-xs font-black uppercase tracking-widest text-primary mb-1">Primary Target</span>
                  <span className="text-2xl font-black">{exercise.primaryTarget}</span>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b pb-2">Muscles Worked</h4>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-500 mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Primary
                    </div>
                    <div className="flex flex-col gap-1">
                      {exercise.primaryMuscles.map(m => (
                        <span key={m} className="text-sm font-bold capitalize">{m.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </div>

                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-500 mb-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        Secondary
                      </div>
                      <div className="flex flex-col gap-1">
                        {exercise.secondaryMuscles.map(m => (
                          <span key={m} className="text-sm font-semibold text-muted-foreground capitalize">{m.replace('_', ' ')}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border">
                  <MuscleMap primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles || []} />
                </div>
                
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 border-b border-primary/20 pb-2">How to Do It</h4>
                <div className="space-y-4">
                  {exercise.instructions.map((inst, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <p className="text-[15px] leading-relaxed text-foreground/90 font-medium pt-0.5">{inst}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-destructive mb-4 border-b border-destructive/20 pb-2">Common Mistakes</h4>
                <ul className="space-y-3">
                  {exercise.mistakes.map((mistake, i) => (
                    <li key={i} className="flex gap-3 text-sm text-destructive items-start bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                      <span className="mt-0.5 text-xs">⚠️</span>
                      <span className="font-semibold">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
