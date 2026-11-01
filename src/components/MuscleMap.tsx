import React from 'react';
import { Muscle } from '@/data/exercises';

interface MuscleMapProps {
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  view?: 'front' | 'back' | 'auto';
}

const getFill = (muscleId: string, primary: Muscle[], secondary: Muscle[]) => {
  if (primary.some(m => muscleId.includes(m))) return '#ef4444'; // Red for primary
  if (secondary.some(m => muscleId.includes(m))) return '#f97316'; // Orange for secondary
  return '#334155'; // Neutral
};

export const MuscleMap: React.FC<MuscleMapProps> = ({ primaryMuscles, secondaryMuscles, view = 'auto' }) => {
  // Determine best view if auto
  let activeView = view;
  if (activeView === 'auto') {
    const backMuscles = ['latissimus_dorsi', 'rhomboids', 'trapezius', 'rear_deltoids', 'glutes', 'hamstrings', 'spinal_erectors', 'lower_back', 'upper_back', 'calves', 'gastrocnemius', 'soleus'];
    const frontMuscles = ['chest', 'upper_chest', 'anterior_shoulders', 'quadriceps', 'biceps', 'core'];
    
    let backScore = 0;
    let frontScore = 0;
    
    primaryMuscles.forEach(m => {
      if (backMuscles.includes(m)) backScore += 2;
      if (frontMuscles.includes(m)) frontScore += 2;
    });
    secondaryMuscles.forEach(m => {
      if (backMuscles.includes(m)) backScore += 1;
      if (frontMuscles.includes(m)) frontScore += 1;
    });

    activeView = backScore > frontScore ? 'back' : 'front';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3">
        {activeView} VIEW
      </div>
      <svg viewBox="0 0 100 200" className="w-32 h-64 drop-shadow-lg">
        {activeView === 'front' ? (
          <g id="front-body" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round">
            {/* Head */}
            <circle cx="50" cy="20" r="12" fill="#334155" />
            <path d="M 44 30 L 56 30 L 58 40 L 42 40 Z" fill="#334155" />
            
            {/* Shoulders */}
            <path id="anterior_shoulders lateral_deltoids shoulders" d="M 32 40 C 25 40 20 45 20 55 C 20 65 25 70 30 70 L 35 50 Z" fill={getFill('anterior_shoulders lateral_deltoids shoulders', primaryMuscles, secondaryMuscles)} />
            <path id="anterior_shoulders lateral_deltoids shoulders" d="M 68 40 C 75 40 80 45 80 55 C 80 65 75 70 70 70 L 65 50 Z" fill={getFill('anterior_shoulders lateral_deltoids shoulders', primaryMuscles, secondaryMuscles)} />
            
            {/* Chest */}
            <path id="chest upper_chest" d="M 40 40 L 60 40 L 65 55 C 55 60 45 60 35 55 Z" fill={getFill('chest upper_chest', primaryMuscles, secondaryMuscles)} />
            <path id="chest" d="M 35 55 C 45 60 55 60 65 55 L 62 70 C 55 72 45 72 38 70 Z" fill={getFill('chest', primaryMuscles, secondaryMuscles)} />
            
            {/* Core/Abs */}
            <path id="core" d="M 38 70 C 45 72 55 72 62 70 L 60 95 C 55 98 45 98 40 95 Z" fill={getFill('core', primaryMuscles, secondaryMuscles)} />
            
            {/* Arms - Biceps/Triceps */}
            <path id="biceps brachialis" d="M 20 55 L 30 70 L 25 90 L 15 85 Z" fill={getFill('biceps brachialis', primaryMuscles, secondaryMuscles)} />
            <path id="biceps brachialis" d="M 80 55 L 70 70 L 75 90 L 85 85 Z" fill={getFill('biceps brachialis', primaryMuscles, secondaryMuscles)} />
            
            {/* Forearms */}
            <path id="forearms" d="M 25 90 L 15 85 L 10 110 L 20 115 Z" fill={getFill('forearms', primaryMuscles, secondaryMuscles)} />
            <path id="forearms" d="M 75 90 L 85 85 L 90 110 L 80 115 Z" fill={getFill('forearms', primaryMuscles, secondaryMuscles)} />
            
            {/* Legs - Quads */}
            <path id="quadriceps" d="M 40 95 L 48 95 L 45 140 L 32 135 Z" fill={getFill('quadriceps', primaryMuscles, secondaryMuscles)} />
            <path id="quadriceps" d="M 60 95 L 52 95 L 55 140 L 68 135 Z" fill={getFill('quadriceps', primaryMuscles, secondaryMuscles)} />
            
            {/* Lower Legs - Calves (front view) */}
            <path id="gastrocnemius soleus" d="M 32 135 L 45 140 L 42 180 L 35 180 Z" fill={getFill('gastrocnemius soleus', primaryMuscles, secondaryMuscles)} />
            <path id="gastrocnemius soleus" d="M 68 135 L 55 140 L 58 180 L 65 180 Z" fill={getFill('gastrocnemius soleus', primaryMuscles, secondaryMuscles)} />
          </g>
        ) : (
          <g id="back-body" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round">
            {/* Head */}
            <circle cx="50" cy="20" r="12" fill="#334155" />
            
            {/* Traps/Upper Back */}
            <path id="trapezius upper_back rhomboids" d="M 44 30 L 56 30 L 65 45 L 50 65 L 35 45 Z" fill={getFill('trapezius upper_back rhomboids', primaryMuscles, secondaryMuscles)} />
            
            {/* Shoulders (Rear) */}
            <path id="rear_deltoids shoulders" d="M 35 45 L 20 45 C 18 55 22 65 28 70 L 32 55 Z" fill={getFill('rear_deltoids shoulders', primaryMuscles, secondaryMuscles)} />
            <path id="rear_deltoids shoulders" d="M 65 45 L 80 45 C 82 55 78 65 72 70 L 68 55 Z" fill={getFill('rear_deltoids shoulders', primaryMuscles, secondaryMuscles)} />
            
            {/* Lats */}
            <path id="latissimus_dorsi upper_back" d="M 32 55 L 50 65 L 68 55 L 62 85 L 50 90 L 38 85 Z" fill={getFill('latissimus_dorsi upper_back', primaryMuscles, secondaryMuscles)} />
            
            {/* Lower Back / Spinal Erectors */}
            <path id="lower_back spinal_erectors" d="M 38 85 L 50 90 L 62 85 L 58 100 L 42 100 Z" fill={getFill('lower_back spinal_erectors', primaryMuscles, secondaryMuscles)} />
            
            {/* Triceps */}
            <path id="triceps" d="M 28 70 L 22 90 L 12 85 L 20 55 Z" fill={getFill('triceps', primaryMuscles, secondaryMuscles)} />
            <path id="triceps" d="M 72 70 L 78 90 L 88 85 L 80 55 Z" fill={getFill('triceps', primaryMuscles, secondaryMuscles)} />
            
            {/* Forearms */}
            <path id="forearms" d="M 22 90 L 12 85 L 8 110 L 18 115 Z" fill={getFill('forearms', primaryMuscles, secondaryMuscles)} />
            <path id="forearms" d="M 78 90 L 88 85 L 92 110 L 82 115 Z" fill={getFill('forearms', primaryMuscles, secondaryMuscles)} />
            
            {/* Glutes */}
            <path id="glutes" d="M 42 100 L 58 100 L 62 115 C 55 120 45 120 38 115 Z" fill={getFill('glutes', primaryMuscles, secondaryMuscles)} />
            
            {/* Hamstrings */}
            <path id="hamstrings" d="M 38 115 L 48 115 L 45 140 L 32 135 Z" fill={getFill('hamstrings', primaryMuscles, secondaryMuscles)} />
            <path id="hamstrings" d="M 62 115 L 52 115 L 55 140 L 68 135 Z" fill={getFill('hamstrings', primaryMuscles, secondaryMuscles)} />
            
            {/* Calves */}
            <path id="gastrocnemius soleus" d="M 32 135 L 45 140 L 42 180 L 35 180 Z" fill={getFill('gastrocnemius soleus', primaryMuscles, secondaryMuscles)} />
            <path id="gastrocnemius soleus" d="M 68 135 L 55 140 L 58 180 L 65 180 Z" fill={getFill('gastrocnemius soleus', primaryMuscles, secondaryMuscles)} />
          </g>
        )}
      </svg>
    </div>
  );
};
