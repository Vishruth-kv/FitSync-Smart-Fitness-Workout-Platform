'use client';
import React, { useMemo, useState } from 'react';

const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

const solveIK = (A: {x:number, y:number}, C: {x:number, y:number}, L1: number, L2: number, bendDir = 1) => {
  const dx = C.x - A.x;
  const dy = C.y - A.y;
  const D = Math.sqrt(dx*dx + dy*dy);
  
  if (D >= L1 + L2) {
    return { x: A.x + dx * (L1 / (L1 + L2)), y: A.y + dy * (L1 / (L1 + L2)) };
  }
  if (D <= Math.abs(L1 - L2)) {
    return { x: A.x, y: A.y + L1 * bendDir };
  }
  
  const a = Math.acos((L1*L1 + D*D - L2*L2) / (2 * L1 * D));
  const atan = Math.atan2(dy, dx);
  const angle = atan + (a * bendDir);
  
  return {
    x: A.x + L1 * Math.cos(angle),
    y: A.y + L1 * Math.sin(angle)
  };
};

type Frame = {
  hip: {x: number, y: number};
  shoulder: {x: number, y: number};
  head: {x: number, y: number};
  hand: {x: number, y: number};
  foot: {x: number, y: number};
  armBendDir: number;
  legBendDir: number;
};

type Config = {
  frameA: Frame;
  frameB: Frame;
  equipment: (frame: Frame) => React.ReactNode;
};

// ==========================================
// PUSH EXERCISES
// ==========================================
const getBenchPressConfig = (): Config => ({
  frameA: {
    hip: {x: 180, y: 210}, shoulder: {x: 100, y: 210}, head: {x: 70, y: 210},
    hand: {x: 100, y: 120}, foot: {x: 230, y: 280}, armBendDir: 1, legBendDir: -1,
  },
  frameB: {
    hip: {x: 180, y: 210}, shoulder: {x: 100, y: 210}, head: {x: 70, y: 210},
    hand: {x: 100, y: 190}, foot: {x: 230, y: 280}, armBendDir: 1, legBendDir: -1,
  },
  equipment: (frame) => (
    <g>
      <rect x="60" y="220" width="140" height="15" rx="4" fill="#334155" />
      <line x1="80" y1="235" x2="80" y2="280" stroke="#334155" strokeWidth="10" />
      <line x1="180" y1="235" x2="180" y2="280" stroke="#334155" strokeWidth="10" />
      <line x1="100" y1="220" x2="100" y2="100" stroke="#1e293b" strokeWidth="8" />
      <line x1="90" y1="100" x2="110" y2="100" stroke="#1e293b" strokeWidth="6" />
      <circle cx={frame.hand.x} cy={frame.hand.y} r="12" fill="#475569" />
      <line x1={frame.hand.x - 25} y1={frame.hand.y} x2={frame.hand.x + 25} y2={frame.hand.y} stroke="#64748b" strokeWidth="6" />
    </g>
  )
});

const getOverheadPressConfig = (): Config => ({
  frameA: {
    hip: {x: 150, y: 180}, shoulder: {x: 145, y: 110}, head: {x: 145, y: 80},
    hand: {x: 160, y: 110}, foot: {x: 150, y: 280}, armBendDir: -1, legBendDir: -1, // hand at shoulder level
  },
  frameB: {
    hip: {x: 150, y: 180}, shoulder: {x: 145, y: 110}, head: {x: 145, y: 80},
    hand: {x: 145, y: 30}, foot: {x: 150, y: 280}, armBendDir: -1, legBendDir: -1, // arms pushed up
  },
  equipment: (frame) => (
    <g>
      <circle cx={frame.hand.x} cy={frame.hand.y} r="12" fill="#475569" />
      <line x1={frame.hand.x - 25} y1={frame.hand.y} x2={frame.hand.x + 25} y2={frame.hand.y} stroke="#64748b" strokeWidth="6" />
    </g>
  )
});

const getInclineDumbbellPressConfig = (): Config => ({
  frameA: {
    hip: {x: 150, y: 230}, shoulder: {x: 100, y: 180}, head: {x: 80, y: 150}, // 45 deg angle
    hand: {x: 100, y: 180}, foot: {x: 210, y: 280}, armBendDir: 1, legBendDir: -1, // dumbbells down at shoulder
  },
  frameB: {
    hip: {x: 150, y: 230}, shoulder: {x: 100, y: 180}, head: {x: 80, y: 150},
    hand: {x: 100, y: 90}, foot: {x: 210, y: 280}, armBendDir: 1, legBendDir: -1, // pressed up
  },
  equipment: (frame) => (
    <g>
      <path d="M 80 160 L 160 240 L 170 250 L 90 170 Z" fill="#334155" /> {/* Incline Bench */}
      <line x1="160" y1="240" x2="160" y2="280" stroke="#334155" strokeWidth="10" />
      <line x1="100" y1="180" x2="100" y2="280" stroke="#334155" strokeWidth="10" />
      
      {/* Dumbbell */}
      <circle cx={frame.hand.x} cy={frame.hand.y - 10} r="8" fill="#475569" />
      <circle cx={frame.hand.x} cy={frame.hand.y + 10} r="8" fill="#475569" />
      <line x1={frame.hand.x} y1={frame.hand.y - 10} x2={frame.hand.x} y2={frame.hand.y + 10} stroke="#64748b" strokeWidth="4" />
    </g>
  )
});

const getLateralRaisesConfig = (): Config => ({
  frameA: {
    hip: {x: 150, y: 180}, shoulder: {x: 150, y: 110}, head: {x: 150, y: 80},
    hand: {x: 140, y: 180}, foot: {x: 150, y: 280}, armBendDir: 1, legBendDir: -1, // arm down
  },
  frameB: {
    hip: {x: 150, y: 180}, shoulder: {x: 150, y: 110}, head: {x: 150, y: 80},
    hand: {x: 70, y: 110}, foot: {x: 150, y: 280}, armBendDir: 1, legBendDir: -1, // arm raised to side (front view effectively)
  },
  equipment: (frame) => (
    <g>
      <circle cx={frame.hand.x - 10} cy={frame.hand.y} r="8" fill="#475569" />
      <circle cx={frame.hand.x + 10} cy={frame.hand.y} r="8" fill="#475569" />
      <line x1={frame.hand.x - 10} y1={frame.hand.y} x2={frame.hand.x + 10} y2={frame.hand.y} stroke="#64748b" strokeWidth="4" />
    </g>
  )
});

const getTricepPushdownConfig = (): Config => ({
  frameA: {
    hip: {x: 100, y: 180}, shoulder: {x: 100, y: 110}, head: {x: 100, y: 80},
    hand: {x: 150, y: 110}, foot: {x: 100, y: 280}, armBendDir: 1, legBendDir: -1, // forearms parallel to floor
  },
  frameB: {
    hip: {x: 100, y: 180}, shoulder: {x: 100, y: 110}, head: {x: 100, y: 80},
    hand: {x: 140, y: 180}, foot: {x: 100, y: 280}, armBendDir: 1, legBendDir: -1, // arms pushed down
  },
  equipment: (frame) => (
    <g>
      {/* Cable machine */}
      <line x1="200" y1="50" x2="200" y2="280" stroke="#334155" strokeWidth="20" />
      <line x1="170" y1="50" x2="230" y2="50" stroke="#334155" strokeWidth="10" />
      {/* Cable */}
      <line x1="200" y1="50" x2={frame.hand.x} y2={frame.hand.y} stroke="#64748b" strokeWidth="3" />
      <circle cx={frame.hand.x} cy={frame.hand.y} r="8" fill="#475569" />
    </g>
  )
});

// ==========================================
// PULL EXERCISES
// ==========================================
const getDeadliftConfig = (): Config => ({
  frameA: {
    hip: {x: 100, y: 200}, shoulder: {x: 150, y: 140}, head: {x: 170, y: 110}, // bent over
    hand: {x: 150, y: 220}, foot: {x: 150, y: 280}, armBendDir: 1, legBendDir: -1, // grabbing bar at shin level
  },
  frameB: {
    hip: {x: 130, y: 180}, shoulder: {x: 130, y: 110}, head: {x: 130, y: 80}, // stood up
    hand: {x: 140, y: 190}, foot: {x: 130, y: 280}, armBendDir: 1, legBendDir: -1, // bar at thigh
  },
  equipment: (frame) => (
    <g>
      {/* Plates */}
      <circle cx={frame.hand.x} cy={frame.hand.y} r="25" fill="#475569" />
      {/* Barbell collar */}
      <circle cx={frame.hand.x} cy={frame.hand.y} r="8" fill="#1e293b" />
    </g>
  )
});

const getPullUpsConfig = (): Config => ({
  frameA: {
    hip: {x: 150, y: 200}, shoulder: {x: 150, y: 130}, head: {x: 150, y: 100},
    hand: {x: 150, y: 40}, foot: {x: 150, y: 270}, armBendDir: -1, legBendDir: -1, // hanging straight
  },
  frameB: {
    hip: {x: 150, y: 140}, shoulder: {x: 150, y: 70}, head: {x: 150, y: 40},
    hand: {x: 150, y: 40}, foot: {x: 130, y: 210}, armBendDir: -1, legBendDir: 1, // pulled up, legs bend slightly back
  },
  equipment: (frame) => (
    <g>
      {/* Pull-up bar structure */}
      <rect x="50" y="30" width="200" height="15" rx="2" fill="#334155" />
      <line x1="50" y1="30" x2="50" y2="10" stroke="#1e293b" strokeWidth="8" />
      <line x1="250" y1="30" x2="250" y2="10" stroke="#1e293b" strokeWidth="8" />
    </g>
  )
});

const getSeatedCableRowConfig = (): Config => ({
  frameA: {
    hip: {x: 100, y: 230}, shoulder: {x: 120, y: 160}, head: {x: 120, y: 130}, // reaching forward
    hand: {x: 190, y: 160}, foot: {x: 210, y: 230}, armBendDir: -1, legBendDir: 1, 
  },
  frameB: {
    hip: {x: 100, y: 230}, shoulder: {x: 100, y: 160}, head: {x: 100, y: 130}, // pulling back
    hand: {x: 110, y: 170}, foot: {x: 210, y: 230}, armBendDir: -1, legBendDir: 1,
  },
  equipment: (frame) => (
    <g>
      {/* Bench */}
      <rect x="50" y="240" width="70" height="15" rx="4" fill="#334155" />
      <line x1="60" y1="255" x2="60" y2="280" stroke="#334155" strokeWidth="8" />
      <line x1="110" y1="255" x2="110" y2="280" stroke="#334155" strokeWidth="8" />
      {/* Machine & Footrest */}
      <line x1="230" y1="120" x2="230" y2="280" stroke="#334155" strokeWidth="20" />
      <rect x="200" y="210" width="10" height="40" fill="#1e293b" />
      {/* Cable */}
      <line x1="230" y1="160" x2={frame.hand.x} y2={frame.hand.y} stroke="#64748b" strokeWidth="3" />
      <rect x={frame.hand.x - 5} y={frame.hand.y - 10} width="10" height="20" fill="#475569" />
    </g>
  )
});

const getFacePullsConfig = (): Config => ({
  frameA: {
    hip: {x: 100, y: 180}, shoulder: {x: 100, y: 110}, head: {x: 100, y: 80},
    hand: {x: 180, y: 90}, foot: {x: 100, y: 280}, armBendDir: 1, legBendDir: -1, // arms extended towards machine (face level)
  },
  frameB: {
    hip: {x: 100, y: 180}, shoulder: {x: 100, y: 110}, head: {x: 100, y: 80},
    hand: {x: 110, y: 85}, foot: {x: 100, y: 280}, armBendDir: 1, legBendDir: -1, // pulled to face
  },
  equipment: (frame) => (
    <g>
      <line x1="220" y1="50" x2="220" y2="280" stroke="#334155" strokeWidth="20" />
      <line x1="220" y1="90" x2={frame.hand.x} y2={frame.hand.y} stroke="#64748b" strokeWidth="3" />
      <circle cx={frame.hand.x} cy={frame.hand.y} r="8" fill="#475569" />
    </g>
  )
});

const getBarbellCurlConfig = (): Config => ({
  frameA: {
    hip: {x: 150, y: 180}, shoulder: {x: 145, y: 110}, head: {x: 145, y: 80},
    hand: {x: 155, y: 190}, foot: {x: 150, y: 280}, armBendDir: -1, legBendDir: -1, // arms down
  },
  frameB: {
    hip: {x: 150, y: 180}, shoulder: {x: 145, y: 110}, head: {x: 145, y: 80},
    hand: {x: 165, y: 120}, foot: {x: 150, y: 280}, armBendDir: -1, legBendDir: -1, // curled up
  },
  equipment: (frame) => (
    <g>
      <circle cx={frame.hand.x} cy={frame.hand.y} r="8" fill="#475569" />
      <line x1={frame.hand.x - 20} y1={frame.hand.y} x2={frame.hand.x + 20} y2={frame.hand.y} stroke="#64748b" strokeWidth="5" />
    </g>
  )
});


// ==========================================
// LEGS EXERCISES
// ==========================================
const getSquatConfig = (): Config => ({
  frameA: {
    hip: {x: 150, y: 180}, shoulder: {x: 150, y: 110}, head: {x: 150, y: 80},
    hand: {x: 160, y: 110}, foot: {x: 150, y: 280}, armBendDir: 1, legBendDir: -1, // standing, bar on back
  },
  frameB: {
    hip: {x: 120, y: 240}, shoulder: {x: 150, y: 170}, head: {x: 150, y: 140},
    hand: {x: 160, y: 170}, foot: {x: 150, y: 280}, armBendDir: 1, legBendDir: -1, // squatted down
  },
  equipment: (frame) => (
    <g>
      <circle cx={frame.shoulder.x} cy={frame.shoulder.y} r="15" fill="#475569" />
      <circle cx={frame.shoulder.x} cy={frame.shoulder.y} r="5" fill="#1e293b" />
    </g>
  )
});

const getRomanianDeadliftConfig = (): Config => ({
  frameA: {
    hip: {x: 130, y: 180}, shoulder: {x: 130, y: 110}, head: {x: 130, y: 80},
    hand: {x: 140, y: 190}, foot: {x: 130, y: 280}, armBendDir: 1, legBendDir: -1, // standing
  },
  frameB: {
    hip: {x: 110, y: 180}, shoulder: {x: 150, y: 130}, head: {x: 160, y: 100}, // hips push back, hinge
    hand: {x: 150, y: 210}, foot: {x: 130, y: 280}, armBendDir: 1, legBendDir: -1, // bar below knee
  },
  equipment: (frame) => (
    <g>
      <circle cx={frame.hand.x} cy={frame.hand.y} r="15" fill="#475569" />
      <circle cx={frame.hand.x} cy={frame.hand.y} r="5" fill="#1e293b" />
    </g>
  )
});

const getLegPressConfig = (): Config => ({
  frameA: {
    hip: {x: 100, y: 240}, shoulder: {x: 50, y: 190}, head: {x: 30, y: 170}, // sitting down in machine
    hand: {x: 70, y: 230}, foot: {x: 200, y: 140}, armBendDir: 1, legBendDir: -1, // legs extended (platform pushed)
  },
  frameB: {
    hip: {x: 100, y: 240}, shoulder: {x: 50, y: 190}, head: {x: 30, y: 170},
    hand: {x: 70, y: 230}, foot: {x: 140, y: 200}, armBendDir: 1, legBendDir: -1, // legs bent (platform close)
  },
  equipment: (frame) => (
    <g>
      {/* Seat */}
      <path d="M 40 180 L 110 250 L 120 260 L 30 260 Z" fill="#334155" />
      <line x1="40" y1="260" x2="40" y2="280" stroke="#334155" strokeWidth="10" />
      {/* Platform & Track */}
      <line x1="120" y1="280" x2="250" y2="150" stroke="#1e293b" strokeWidth="10" />
      <rect x={frame.foot.x} y={frame.foot.y - 40} width="15" height="80" rx="2" fill="#475569" transform={`rotate(45, ${frame.foot.x}, ${frame.foot.y})`} />
    </g>
  )
});

const getWalkingLungeConfig = (): Config => ({
  frameA: {
    hip: {x: 150, y: 180}, shoulder: {x: 150, y: 110}, head: {x: 150, y: 80},
    hand: {x: 150, y: 190}, foot: {x: 150, y: 280}, armBendDir: 1, legBendDir: 1, // standing
  },
  frameB: {
    hip: {x: 150, y: 210}, shoulder: {x: 150, y: 140}, head: {x: 150, y: 110},
    hand: {x: 150, y: 220}, foot: {x: 220, y: 280}, armBendDir: 1, legBendDir: 1, // lunged forward
  },
  equipment: (frame) => (
    <g>
      <circle cx={frame.hand.x} cy={frame.hand.y} r="8" fill="#475569" />
    </g>
  )
});

const getCalfRaisesConfig = (): Config => ({
  frameA: {
    hip: {x: 150, y: 180}, shoulder: {x: 150, y: 110}, head: {x: 150, y: 80},
    hand: {x: 150, y: 190}, foot: {x: 150, y: 270}, armBendDir: 1, legBendDir: -1, // heels down
  },
  frameB: {
    hip: {x: 150, y: 160}, shoulder: {x: 150, y: 90}, head: {x: 150, y: 60},
    hand: {x: 150, y: 170}, foot: {x: 150, y: 270}, armBendDir: 1, legBendDir: -1, // heels up (whole body shifted up)
  },
  equipment: (frame) => (
    <g>
      {/* Platform */}
      <rect x="130" y="270" width="30" height="10" fill="#334155" />
      <circle cx={frame.hand.x} cy={frame.hand.y} r="8" fill="#475569" />
    </g>
  )
});


const getExerciseConfig = (id: string): Config => {
  switch(id) {
    case 'bench-press': return getBenchPressConfig();
    case 'overhead-press': return getOverheadPressConfig();
    case 'incline-dumbbell-press': return getInclineDumbbellPressConfig();
    case 'lateral-raises': return getLateralRaisesConfig();
    case 'tricep-pushdown': return getTricepPushdownConfig();
    
    case 'deadlift': return getDeadliftConfig();
    case 'pull-ups': return getPullUpsConfig();
    case 'seated-cable-row': return getSeatedCableRowConfig();
    case 'face-pulls': return getFacePullsConfig();
    case 'barbell-curl': return getBarbellCurlConfig();
    
    case 'squat': return getSquatConfig();
    case 'romanian-deadlift': return getRomanianDeadliftConfig();
    case 'leg-press': return getLegPressConfig();
    case 'walking-lunges': return getWalkingLungeConfig();
    case 'calf-raises': return getCalfRaisesConfig();
    default: return getBenchPressConfig();
  }
};

export const ExerciseVisualizer = ({ exerciseId, progress }: { exerciseId: string; progress: number }) => {
  const config = getExerciseConfig(exerciseId);

  // Smooth easing
  const t = (1 - Math.cos(progress * 2 * Math.PI)) / 2;

  const currentFrame: Frame = {
    hip: { x: lerp(config.frameA.hip.x, config.frameB.hip.x, t), y: lerp(config.frameA.hip.y, config.frameB.hip.y, t) },
    shoulder: { x: lerp(config.frameA.shoulder.x, config.frameB.shoulder.x, t), y: lerp(config.frameA.shoulder.y, config.frameB.shoulder.y, t) },
    head: { x: lerp(config.frameA.head.x, config.frameB.head.x, t), y: lerp(config.frameA.head.y, config.frameB.head.y, t) },
    hand: { x: lerp(config.frameA.hand.x, config.frameB.hand.x, t), y: lerp(config.frameA.hand.y, config.frameB.hand.y, t) },
    foot: { x: lerp(config.frameA.foot.x, config.frameB.foot.x, t), y: lerp(config.frameA.foot.y, config.frameB.foot.y, t) },
    armBendDir: config.frameA.armBendDir,
    legBendDir: config.frameA.legBendDir,
  };

  const lengths = { upperArm: 40, lowerArm: 40, thigh: 50, calf: 50 };

  const elbow = solveIK(currentFrame.shoulder, currentFrame.hand, lengths.upperArm, lengths.lowerArm, currentFrame.armBendDir);
  const knee = solveIK(currentFrame.hip, currentFrame.foot, lengths.thigh, lengths.calf, currentFrame.legBendDir);

  // Determine active muscles for highlighting (glowing outline)
  const isPush = ['bench-press', 'overhead-press', 'incline-dumbbell-press', 'lateral-raises', 'tricep-pushdown'].includes(exerciseId);
  const isPull = ['deadlift', 'pull-ups', 'seated-cable-row', 'face-pulls', 'barbell-curl'].includes(exerciseId);
  const isLeg = ['squat', 'romanian-deadlift', 'leg-press', 'walking-lunges', 'calf-raises'].includes(exerciseId);

  const humanColor = "#94a3b8";
  const glow = "rgba(239, 68, 68, 0.8)";
  const strokeW = "16";

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center">
      
      {/* Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <svg width="100%" height="100%" viewBox="0 0 300 300" className="max-w-md max-h-md z-10">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Floor */}
        <line x1="20" y1="280" x2="280" y2="280" stroke="#1e293b" strokeWidth="4" />

        {/* Equipment Background Layer */}
        {config.equipment(currentFrame)}

        {/* Human Body */}
        <g strokeLinecap="round" strokeLinejoin="round">
          
          {/* Leg */}
          <polyline points={`${currentFrame.hip.x},${currentFrame.hip.y} ${knee.x},${knee.y} ${currentFrame.foot.x},${currentFrame.foot.y}`} fill="none" stroke={humanColor} strokeWidth={strokeW} />
          {isLeg && <line x1={currentFrame.hip.x} y1={currentFrame.hip.y} x2={knee.x} y2={knee.y} stroke={glow} strokeWidth="22" filter="url(#glow)" opacity={0.6 + t*0.4} />}

          {/* Torso */}
          <line x1={currentFrame.hip.x} y1={currentFrame.hip.y} x2={currentFrame.shoulder.x} y2={currentFrame.shoulder.y} stroke={humanColor} strokeWidth="24" />
          {isPull && <line x1={currentFrame.hip.x} y1={currentFrame.hip.y} x2={currentFrame.shoulder.x} y2={currentFrame.shoulder.y} stroke={glow} strokeWidth="30" filter="url(#glow)" opacity={0.6 + t*0.4} />}

          {/* Head */}
          <circle cx={currentFrame.head.x} cy={currentFrame.head.y} r="16" fill={humanColor} />

          {/* Arm */}
          <polyline points={`${currentFrame.shoulder.x},${currentFrame.shoulder.y} ${elbow.x},${elbow.y} ${currentFrame.hand.x},${currentFrame.hand.y}`} fill="none" stroke={humanColor} strokeWidth={strokeW} />
          {isPush && <line x1={currentFrame.shoulder.x} y1={currentFrame.shoulder.y} x2={elbow.x} y2={elbow.y} stroke={glow} strokeWidth="22" filter="url(#glow)" opacity={0.6 + t*0.4} />}
          {isPull && <line x1={elbow.x} y1={elbow.y} x2={currentFrame.hand.x} y2={currentFrame.hand.y} stroke={glow} strokeWidth="22" filter="url(#glow)" opacity={0.6 + t*0.4} />}
        </g>
      </svg>
    </div>
  );
};
