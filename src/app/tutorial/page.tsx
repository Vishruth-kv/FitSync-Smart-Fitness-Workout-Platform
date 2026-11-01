import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { exercises } from '@/data/exercises';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Dumbbell } from 'lucide-react';

export default function TutorialPage() {
  const day1 = exercises.filter(e => e.type === 'push');
  const day2 = exercises.filter(e => e.type === 'pull');
  const day3 = exercises.filter(e => e.type === 'legs');

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName="Athlete" />
      
      <main className="container mx-auto max-w-5xl px-4 py-12">
        
        <header className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4">
            <Dumbbell size={36} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Interactive Exercise Tutorial</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master the perfect form for your intermediate muscle-gain transformation. 
            Use the interactive 3D anatomy animations below to understand the movement of every exercise.
          </p>
        </header>

        <section className="mb-16">
          <div className="border-b border-border pb-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-primary text-primary-foreground w-10 h-10 rounded-lg flex items-center justify-center text-xl">1</span>
                Day 1 — PUSH
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">Chest, Shoulders, Triceps</p>
            </div>
            <Link href="/workout?type=push" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8 text-lg w-full md:w-auto uppercase tracking-wider">
              ▶ START WORKOUT
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {day1.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="border-b border-border pb-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-secondary text-secondary-foreground w-10 h-10 rounded-lg flex items-center justify-center text-xl">2</span>
                Day 2 — PULL
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">Back, Biceps, Rear Delts</p>
            </div>
            <Link href="/workout?type=pull" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow hover:bg-secondary/90 h-12 px-8 text-lg w-full md:w-auto uppercase tracking-wider">
              ▶ START WORKOUT
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {day2.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="border-b border-border pb-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="bg-brand-orange text-white w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#f97316' }}>3</span>
                Day 3 — LEGS
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">Quadriceps, Hamstrings, Glutes, Calves</p>
            </div>
            <Link href="/workout?type=legs" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-brand-orange text-white shadow hover:opacity-90 h-12 px-8 text-lg w-full md:w-auto uppercase tracking-wider" style={{ backgroundColor: '#f97316' }}>
              ▶ START WORKOUT
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {day3.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
