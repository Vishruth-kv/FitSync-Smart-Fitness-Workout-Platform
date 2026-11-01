export type Muscle = 'chest' | 'anterior_shoulders' | 'triceps' | 'upper_chest' | 'lateral_deltoids' | 'glutes' | 'hamstrings' | 'spinal_erectors' | 'upper_back' | 'latissimus_dorsi' | 'biceps' | 'rhomboids' | 'trapezius' | 'rear_deltoids' | 'rotator_cuff' | 'quadriceps' | 'core' | 'lower_back' | 'gastrocnemius' | 'soleus' | 'shoulders' | 'forearms' | 'brachialis';

export interface Exercise {
  id: string;
  name: string;
  day: string;
  type: 'push' | 'pull' | 'legs';
  sets: number;
  reps: string;
  rest: string;
  primaryTarget: string;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  cues: string[];
  instructions: string[];
  mistakes: string[];
  animationType: string;
}

export const exercises: Exercise[] = [
  // DAY 1 - PUSH
  {
    id: 'bench-press',
    name: 'Bench Press',
    day: 'Day 1 — Push',
    type: 'push',
    sets: 4,
    reps: '8',
    rest: '90 seconds',
    primaryTarget: 'CHEST',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'anterior_shoulders'],
    cues: ['↓ Lower bar toward chest', '↑ Press upward', '✓ Keep shoulder blades stable'],
    instructions: [
      'Lie on the bench with feet firmly planted on the floor.',
      'Retract your shoulder blades and grab the bar with a proper grip width.',
      'Start with the bar above your chest.',
      'Slowly lower the bar toward your mid/lower chest, keeping elbows at an appropriate angle (not excessively flared).',
      'Press the bar upward until arms are extended without aggressively locking the elbows.'
    ],
    mistakes: [
      'Bouncing the bar off the chest.',
      'Excessively flaring elbows.',
      'Lifting the hips from the bench.',
      'Losing control during the lowering phase.'
    ],
    animationType: 'bench'
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    day: 'Day 1 — Push',
    type: 'push',
    sets: 3,
    reps: '10',
    rest: '75 seconds',
    primaryTarget: 'FRONT & SIDE DELTOIDS',
    primaryMuscles: ['anterior_shoulders', 'lateral_deltoids'],
    secondaryMuscles: ['triceps', 'upper_chest'],
    cues: ['↓ Lower bar to collarbone', '↑ Press overhead', '✓ Brace your core'],
    instructions: [
      'Stand with the bar at shoulder height, stable stance, and tight core.',
      'Press the bar vertically overhead.',
      'Move your head naturally out of the bar\'s path.',
      'Return the bar under control to shoulder level.'
    ],
    mistakes: [
      'Excessive lower-back arch.',
      'Using momentum.',
      'Pressing the bar too far forward.',
      'Uncontrolled lowering.'
    ],
    animationType: 'overhead'
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    day: 'Day 1 — Push',
    type: 'push',
    sets: 3,
    reps: '12',
    rest: '60 seconds',
    primaryTarget: 'UPPER CHEST',
    primaryMuscles: ['upper_chest'],
    secondaryMuscles: ['anterior_shoulders', 'triceps'],
    cues: ['↓ Lower weights to upper chest', '↑ Press upward', '✓ Keep elbows tucked slightly'],
    instructions: [
      'Lie on the incline bench. Start with dumbbells near the upper chest.',
      'Lower both dumbbells under control.',
      'Press them upward while maintaining stable shoulders.'
    ],
    mistakes: [
      'Dropping the elbows too low.',
      'Bouncing the dumbbells.',
      'Using excessive weight.'
    ],
    animationType: 'incline'
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    day: 'Day 1 — Push',
    type: 'push',
    sets: 3,
    reps: '15',
    rest: '45 seconds',
    primaryTarget: 'SIDE DELTOIDS',
    primaryMuscles: ['lateral_deltoids'],
    secondaryMuscles: ['trapezius'],
    cues: ['↑ Raise arms outward', '↓ Lower slowly', '✓ Slight bend in elbows'],
    instructions: [
      'Stand with dumbbells beside the body with a slight bend in the elbows.',
      'Raise arms outward until approximately shoulder height.',
      'Lower slowly.'
    ],
    mistakes: [
      'Swinging the body.',
      'Using momentum.',
      'Raising the weights excessively high.',
      'Using very heavy dumbbells.'
    ],
    animationType: 'lateral'
  },
  {
    id: 'tricep-pushdown',
    name: 'Triceps Pushdown',
    day: 'Day 1 — Push',
    type: 'push',
    sets: 3,
    reps: '12',
    rest: '45 seconds',
    primaryTarget: 'TRICEPS',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    cues: ['↓ Push cable downward', '↑ Return slowly', '✓ Keep elbows pinned to sides'],
    instructions: [
      'Stand facing the cable machine. Keep elbows close to the torso.',
      'Push the cable downward.',
      'Fully contract the triceps while maintaining control.',
      'Slowly return to the starting position.'
    ],
    mistakes: [
      'Moving the elbows excessively.',
      'Leaning heavily over the cable.',
      'Using momentum.'
    ],
    animationType: 'pushdown'
  },
  // DAY 2 - PULL
  {
    id: 'deadlift',
    name: 'Deadlift',
    day: 'Day 2 — Pull',
    type: 'pull',
    sets: 4,
    reps: '6',
    rest: '2 minutes',
    primaryTarget: 'GLUTES & HAMSTRINGS',
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['spinal_erectors', 'upper_back', 'forearms'],
    cues: ['← Hips back', '✓ Neutral spine', '↑ Stand by extending hips'],
    instructions: [
      'Position the bar over the middle of your feet.',
      'Hinge at the hips with a neutral spine, and grip the bar outside your legs.',
      'Brace your core.',
      'Drive through the floor and extend hips and knees together.',
      'Stand tall without excessive backward leaning.',
      'Lower the bar by hinging at the hips and bending the knees.'
    ],
    mistakes: [
      'Rounding the lower back.',
      'Starting with the bar too far away.',
      'Jerking the bar from the floor.',
      'Hyperextending the back at the top.'
    ],
    animationType: 'deadlift'
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    day: 'Day 2 — Pull',
    type: 'pull',
    sets: 3,
    reps: 'Max controlled',
    rest: '90 seconds',
    primaryTarget: 'LATISSIMUS DORSI',
    primaryMuscles: ['latissimus_dorsi'],
    secondaryMuscles: ['biceps', 'upper_back'],
    cues: ['↑ Pull chest to bar', '↓ Lower under control', '✓ Engage lats first'],
    instructions: [
      'Hang from the pull-up bar with an appropriate grip.',
      'Engage the shoulders before pulling.',
      'Pull your body upward toward the bar.',
      'Lower under control to the starting position.'
    ],
    mistakes: [
      'Swinging excessively.',
      'Using momentum.',
      'Partial repetitions.',
      'Shrugging excessively.'
    ],
    animationType: 'pullup'
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    day: 'Day 2 — Pull',
    type: 'pull',
    sets: 3,
    reps: '12',
    rest: '60 seconds',
    primaryTarget: 'LATS & MID BACK',
    primaryMuscles: ['latissimus_dorsi', 'rhomboids'],
    secondaryMuscles: ['biceps', 'rear_deltoids'],
    cues: ['← Pull handle to torso', '→ Extend arms slowly', '✓ Squeeze shoulder blades'],
    instructions: [
      'Sit upright at the cable machine with arms extended.',
      'Pull the handle toward the torso.',
      'Retract the shoulder blades naturally.',
      'Slowly extend the arms again.'
    ],
    mistakes: [
      'Excessive body swinging.',
      'Rounding the back.',
      'Pulling only with the arms.'
    ],
    animationType: 'row'
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    day: 'Day 2 — Pull',
    type: 'pull',
    sets: 3,
    reps: '15',
    rest: '45 seconds',
    primaryTarget: 'REAR DELTOIDS & UPPER BACK',
    primaryMuscles: ['rear_deltoids', 'upper_back'],
    secondaryMuscles: ['rotator_cuff'],
    cues: ['← Pull rope to face', '→ Return slowly', '✓ Keep elbows high'],
    instructions: [
      'Position the cable around upper-face level.',
      'Pull the rope toward the face, elbows moving outward.',
      'Externally rotate the shoulders naturally.',
      'Return slowly.'
    ],
    mistakes: [
      'Using excessive weight.',
      'Pulling toward the chest instead of the face.',
      'Excessive body movement.'
    ],
    animationType: 'facepull'
  },
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    day: 'Day 2 — Pull',
    type: 'pull',
    sets: 3,
    reps: '12',
    rest: '45 seconds',
    primaryTarget: 'BICEPS',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['brachialis', 'forearms'],
    cues: ['↑ Curl bar upward', '↓ Lower slowly', '✓ Keep elbows stationary'],
    instructions: [
      'Stand with barbell in hands, elbows close to the torso.',
      'Curl the bar upward.',
      'Squeeze the biceps.',
      'Lower the bar slowly.'
    ],
    mistakes: [
      'Swinging the body.',
      'Moving the elbows forward excessively.',
      'Dropping the weight quickly.'
    ],
    animationType: 'curl'
  },
  // DAY 3 - LEGS
  {
    id: 'squat',
    name: 'Squat',
    day: 'Day 3 — Legs',
    type: 'legs',
    sets: 4,
    reps: '8',
    rest: '2 minutes',
    primaryTarget: 'QUADRICEPS & GLUTES',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    cues: ['↓ Hips down', '↘ Knees track with toes', '↑ Drive upward'],
    instructions: [
      'Take a correct stance and brace your core.',
      'Move hips down and back while knees bend naturally.',
      'Keep the torso controlled and descend to an appropriate depth.',
      'Drive through the floor to stand.'
    ],
    mistakes: [
      'Knees collapsing inward.',
      'Losing balance.',
      'Excessive forward leaning.',
      'Losing control at the bottom.'
    ],
    animationType: 'squat'
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    day: 'Day 3 — Legs',
    type: 'legs',
    sets: 3,
    reps: '10',
    rest: '90 seconds',
    primaryTarget: 'HAMSTRINGS & GLUTES',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['spinal_erectors'],
    cues: ['← Push hips back', '✓ Keep bar close to legs', '→ Drive hips forward'],
    instructions: [
      'Start standing with the barbell, slight bend in the knees.',
      'Push the hips backward, keeping the bar close to the legs.',
      'Maintain a neutral spine and lower until a hamstring stretch is reached.',
      'Drive hips forward to return to standing.'
    ],
    mistakes: [
      'Squatting instead of hinging.',
      'Rounding the back.',
      'Moving the bar away from the legs.'
    ],
    animationType: 'rdl'
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    day: 'Day 3 — Legs',
    type: 'legs',
    sets: 3,
    reps: '12',
    rest: '60 seconds',
    primaryTarget: 'QUADRICEPS & GLUTES',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    cues: ['↓ Lower platform slowly', '↑ Press away', '✓ Don\'t lock knees aggressively'],
    instructions: [
      'Sit correctly in the leg press machine with proper foot placement.',
      'Lower the platform under control, knees tracking with toes.',
      'Press the platform away without aggressively locking the knees.'
    ],
    mistakes: [
      'Allowing knees to collapse inward.',
      'Lowering beyond comfortable range.',
      'Locking knees aggressively.'
    ],
    animationType: 'legpress'
  },
  {
    id: 'walking-lunges',
    name: 'Walking Lunges',
    day: 'Day 3 — Legs',
    type: 'legs',
    sets: 3,
    reps: '20 steps',
    rest: '60 seconds',
    primaryTarget: 'QUADRICEPS & GLUTES',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    cues: ['↓ Lower body under control', '↘ Front knee tracks naturally', '↑ Push through front leg'],
    instructions: [
      'Stand upright, step forward, and lower the body under control.',
      'Front knee tracks naturally over the foot.',
      'Push through the front leg and bring the rear leg forward into the next step.',
      'Continue walking.'
    ],
    mistakes: [
      'Losing balance.',
      'Taking extremely short steps.',
      'Knee collapsing inward.',
      'Using uncontrolled movement.'
    ],
    animationType: 'lunge'
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    day: 'Day 3 — Legs',
    type: 'legs',
    sets: 4,
    reps: '20',
    rest: '30 seconds',
    primaryTarget: 'GASTROCNEMIUS & SOLEUS',
    primaryMuscles: ['gastrocnemius', 'soleus'],
    secondaryMuscles: [],
    cues: ['↑ Raise heels high', '↓ Lower under control', '✓ Pause briefly at top'],
    instructions: [
      'Stand with stable foot position.',
      'Lower heels under control.',
      'Raise heels as high as comfortably possible.',
      'Pause briefly at the top and slowly lower.'
    ],
    mistakes: [
      'Bouncing.',
      'Performing very short movements.',
      'Using momentum.'
    ],
    animationType: 'calf'
  }
];
