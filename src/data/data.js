
export const workoutsRaw = [
    // --- DECEMBER 2025 ---
    { id: 1, date: '2025-12-01', type: 'Full Body', muscles: ['Back', 'Legs', 'Chest', 'Shoulders', 'Biceps', 'Triceps'], notes: 'Start Point', intensity: { back: 3, legs: 3, chest: 2, shoulders: 2, biceps: 1, triceps: 1 } },
    { id: 2, date: '2025-12-03', type: 'Pilates', muscles: ['Core', 'Legs'], notes: 'Focus: Legs & Core' },
    { id: 3, date: '2025-12-04', type: 'Upper Body', muscles: ['Chest', 'Back', 'Shoulders', 'Abs'], intensity: { chest: 3, back: 3, shoulders: 2, abs: 2 } },
    { id: 4, date: '2025-12-08', type: 'Full Body', muscles: ['Legs', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'], intensity: { legs: 3, chest: 2, back: 1, shoulders: 2, biceps: 1, triceps: 1 } },
    { id: 5, date: '2025-12-10', type: 'Push', muscles: ['Chest', 'Legs', 'Shoulders', 'Triceps'], intensity: { chest: 3, legs: 1, shoulders: 3, triceps: 1 } },
    { id: 6, date: '2025-12-12', type: 'Pull', muscles: ['Back', 'Legs', 'Biceps', 'Abs'], intensity: { back: 3, legs: 2, biceps: 2, abs: 2 } },
    { id: 7, date: '2025-12-13', type: 'Upper Body', muscles: ['Chest', 'Shoulders', 'Triceps'], intensity: { chest: 3, shoulders: 1, triceps: 1 } },
    { id: 8, date: '2025-12-17', type: 'Pilates', muscles: ['Core', 'Legs'], notes: 'Focus: Legs & Core' },
    { id: 9, date: '2025-12-18', type: 'Lower Body', muscles: ['Legs'], intensity: { legs: 3 } },
    { id: 10, date: '2025-12-24', type: 'Pilates', muscles: ['Legs', 'Glutes'], notes: 'Focus: Legs & Glutes' },
    { id: 11, date: '2025-12-25', type: 'Upper Body', muscles: ['Back', 'Chest', 'Shoulders', 'Biceps', 'Triceps'], intensity: { back: 3, chest: 2, shoulders: 1, biceps: 2, triceps: 1 } },
    { id: 12, date: '2025-12-27', type: 'Lower Body', muscles: ['Legs', 'Shoulders', 'Abs'], intensity: { legs: 3, shoulders: 2, abs: 3 } },
    { id: 13, date: '2025-12-30', type: 'Upper Body', muscles: ['Chest', 'Back', 'Abs'], intensity: { chest: 3, back: 3, abs: 1 } },

    // --- JANUARY 2026 ---
    { id: 14, date: '2026-01-01', type: 'Lower Body', muscles: ['Legs', 'Shoulders', 'Triceps', 'Abs'], intensity: { legs: 3, shoulders: 2, triceps: 2, abs: 1 } },
    { id: 15, date: '2026-01-02', type: 'Pull', muscles: ['Back', 'Chest', 'Biceps', 'Abs'], intensity: { back: 3, chest: 1, biceps: 2, abs: 2 } },
    { id: 16, date: '2026-01-03', type: 'Cardio', muscles: [], notes: 'Cycling 20.81km' },
    { id: 17, date: '2026-01-04', type: 'Upper Body', muscles: ['Chest', 'Legs', 'Cardio'], intensity: { chest: 3, legs: 1 } },
    { id: 18, date: '2026-01-06', type: 'Cardio', muscles: ['Abs', 'Cardio'], intensity: { abs: 3 } },
    { id: 19, date: '2026-01-07', type: 'Pilates', muscles: ['Full Body'], notes: 'Full Body' },
    { id: 20, date: '2026-01-08', type: 'Upper Body', muscles: ['Back', 'Chest', 'Shoulders', 'Abs'], intensity: { back: 3, chest: 1, shoulders: 1, abs: 1 } },
    { id: 21, date: '2026-01-10', type: 'Lower Body', muscles: ['Legs', 'Triceps', 'Biceps', 'Abs'], intensity: { legs: 3, triceps: 2, biceps: 2, abs: 2 } },
    { id: 22, date: '2026-01-12', type: 'Upper Body', muscles: ['Chest', 'Back', 'Shoulders', 'Abs', 'Cardio'], intensity: { chest: 3, back: 1, shoulders: 3, abs: 3 } },
    { id: 23, date: '2026-01-14', type: 'Pilates', muscles: ['Legs'], notes: 'Focus: Legs' },
    { id: 24, date: '2026-01-16', type: 'Cardio', muscles: [], notes: 'Walking 12km' },
    { id: 25, date: '2026-01-19', type: 'Upper Body', muscles: ['Back', 'Chest', 'Shoulders', 'Abs'], intensity: { back: 3, chest: 3, shoulders: 1, abs: 3 } },
    { id: 26, date: '2026-01-22', type: 'Upper + Lower', muscles: ['Legs', 'Chest', 'Triceps', 'Abs'], intensity: { legs: 3, chest: 2, triceps: 3, abs: 3 } },
    { id: 27, date: '2026-01-24', type: 'Upper Body', muscles: ['Back', 'Shoulders', 'Biceps', 'Abs'], intensity: { back: 3, shoulders: 2, biceps: 2, abs: 2 } },
    { id: 28, date: '2026-01-26', type: 'Lower + Upper', muscles: ['Legs', 'Shoulders', 'Biceps', 'Triceps'], intensity: { legs: 3, shoulders: 1, biceps: 1, triceps: 1 } },
    { id: 29, date: '2026-01-28', type: 'Upper Body', muscles: ['Chest'], intensity: { chest: 2 }, notes: 'Stopped early (fatigue)' },
    { id: 30, date: '2026-01-29', type: 'Back + Legs', muscles: ['Back', 'Legs', 'Abs', 'Shoulders'], intensity: { back: 3, legs: 2, abs: 2, shoulders: 1 } },

    // --- FEBRUARY 2026 ---
    { id: 31, date: '2026-02-02', type: 'Upper Body', muscles: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Abs'], intensity: { chest: 1, back: 1, shoulders: 3, biceps: 1, triceps: 2, abs: 1 } },
    { id: 32, date: '2026-02-07', type: 'Cardio', muscles: ['Cardio', 'Legs'], notes: 'Tennis ~2hours', intensity: { legs: 1 } },
    { id: 33, date: '2026-02-08', type: 'Upper Body', muscles: ['Chest', 'Back', 'Biceps', 'Abs', 'Cardio'], intensity: { chest: 2, back: 2, biceps: 2, abs: 2 } }
];

export const weighInsRaw = [
    { date: '2025-12-01', weight: 69.5, bf: 15.4, note: 'Start' },
    { date: '2025-12-08', weight: 70.0, bf: 15.1, note: '' },
    { date: '2025-12-17', weight: 70.6, bf: 14.7, note: '' },
    { date: '2025-12-25', weight: 71.2, bf: 14.9, note: '' },
    { date: '2026-01-04', weight: 72.5, bf: 15.2, note: '' },
    { date: '2026-01-08', weight: 73.2, bf: 15.0, note: '' },
    { date: '2026-01-12', weight: 72.8, bf: 14.8, note: '' },
    { date: '2026-01-19', weight: 73.1, bf: 14.5, note: '' },
    { date: '2026-01-26', weight: 72.5, bf: 14.2, note: '~14.2%' }
];

export const goalsRaw = {
    // CHEST: Top 25 first (sorted by rank), then remaining exercises
    chest: [
        // Top 25 exercises (sorted by rank ascending)
        { exercise: 'Incline Dumbbell Press', current: '24kg x12', target: '26kg x10', focus: '', status: 'Primary focus and aiming to break a personal best for upper chest', rank: 3 },
        { exercise: 'Incline Barbell Press', current: '15kg + bar x10', target: '20kg + bar x8', focus: '', status: 'Stable technique and aiming to increase load on upper chest fibers', rank: 3 },
        { exercise: 'Flat Barbell Bench Press', current: '25kg + bar x9', target: '30kg + bar x8', focus: '', status: 'Good bar control and aiming to get closer to 30kg per side', rank: 11 },
        { exercise: 'Chest Dips', current: '12 reps', target: '18 reps', focus: '', status: 'Good control and aiming for gradual rep volume improvement', rank: 17 },
        { exercise: 'Pec Deck', current: '70kg x8', target: '75kg x10', focus: '', status: 'Strong peak contraction and aiming to increase volume with heavier weight', rank: 19 },
        // Remaining exercises (original order preserved)
        { exercise: 'Flat Dumbbell Press', current: '26kg x10', target: '28kg x8', focus: '', status: 'Strong strength base and aiming to enter the 28kg territory' },
        { exercise: 'Machine Chest Press', current: '65kg x12', target: '75kg x8', focus: '', status: 'Stable mechanical loading and aiming to maximize strength output on the machine' },
        { exercise: 'Cable Fly', current: '7.5kg x13', target: '10kg x10', focus: '', status: 'Precise technique and aiming to progress under continuous tension' },
        { exercise: 'Push-Ups', current: '20 reps', target: '30 reps', focus: '', status: 'Good base level and aiming to increase volume as a finisher' }
    ],
    // BACK: Top 25 first (sorted by rank ascending), then remaining exercises
    back: [
        // Top 25 exercises (sorted by rank ascending)
        { exercise: 'Pull-Ups', current: '20 reps', target: '25 reps', focus: '', status: 'Reached the original target and aiming to build higher endurance', rank: 2 },
        { exercise: 'Assisted Pull-Ups', current: '50kg assist x10', target: 'Reduce to 40kg assist', focus: '', status: 'Working on isolation and aiming to reduce assistance toward independent strength', rank: 2 },
        { exercise: 'T-Bar Row', current: '40kg x11', target: '45kg x10', focus: '', status: 'Building back thickness and aiming to add weight without losing technique', rank: 5 },
        { exercise: 'Cable Pullover', current: '17.5kg x10', target: '20kg x12', focus: '', status: 'Emphasis on stretch and aiming to improve end of session tension', rank: 25 },
        // Remaining exercises (original order preserved)
        { exercise: 'Lat Pulldown', current: '60kg x12', target: '65kg x10', focus: '', status: 'Good stretch and aiming to build strength at heavier loads' },
        { exercise: 'Seated Cable Row', current: '70kg x8', target: '75kg x8', focus: '', status: 'High pulling strength and aiming to drive the session with heavier weight' },
        { exercise: 'Chest-Supported Row', current: '65kg x10', target: '70kg x10', focus: '', status: 'Successful isolation and aiming to increase mechanical load' },
        { exercise: 'Smith Machine Row', current: '25kg per side x12', target: '30kg per side x10', focus: '', status: 'Maximum stability and aiming for heavy work to increase thickness' },
        { exercise: 'Inverted Rows', current: '15 reps', target: '20 reps', focus: '', status: 'Good muscular endurance and aiming to increase rep volume' }
    ],
    // LEGS: Top 25 first (sorted by rank ascending), then remaining exercises
    // NOTE: "Romanian Deadlift (Dumbbells)" REMOVED per user request
    legs: [
        // Top 25 exercises (sorted by rank ascending)
        { exercise: 'Hack Squat', current: '30kg per side x8', target: '32.5kg per side x8', focus: '', status: 'Buildup strength at 30kg and aim to add weight gradually', rank: 1 },
        { exercise: 'Romanian Deadlift (Smith)', current: '15kg per side x10', target: '17.5kg per side x10', focus: '', status: 'Good control with the heavy bar and aiming to increase continuous tension', rank: 4 },
        { exercise: 'Leg Extension', current: '55kg x10', target: '60kg x10', focus: '', status: 'Consistent isolation work and aiming to reach 60kg for sharper quad development', rank: 9 },
        { exercise: 'Leg Curl', current: '45kg x12', target: '50kg x10', focus: '', status: 'Strong work in seated or lying variations and aiming to solidify heavier loading', rank: 10 },
        { exercise: 'Dumbbell Lunges', current: '10kg per hand x24 steps', target: '12kg per hand x20 steps', focus: '', status: 'Good stability and aiming to increase difficulty for glutes', rank: 12 },
        { exercise: 'Calf Raises', current: '10kg per side x15', target: '15kg per side x12', focus: '', status: 'Emphasis on stretch and aiming to add weight for meaningful stimulus', rank: 23 },
        // Remaining exercises (original order preserved)
        { exercise: 'Leg Press', current: '100kg x12', target: '110kg x10', focus: '', status: 'Crossed the 100kg mark and aiming to build strength on the machine' },
        { exercise: 'Adductors / Abductors', current: '40kg x15', target: '45kg x12', focus: '', status: 'Strengthening support muscles and aiming to continue moderate progressive overload' },
        { exercise: 'Free Squat / Kettlebell Squat', current: '10kg x100 reps', target: '15kg x80 reps', focus: '', status: 'High endurance level and aiming to increase weight at high volume' }
    ],
    // SHOULDERS: Top 25 first (sorted by rank ascending), then remaining exercises
    shoulders: [
        // Top 25 exercises (sorted by rank ascending)
        { exercise: 'Lateral Raises', current: '8kg x12', target: '10kg x10', focus: '', status: 'Emphasis on width and aiming to solidify 10kg with clean technique', rank: 6 },
        { exercise: 'Dumbbell Shoulder Press', current: '18kg x15', target: '20kg x10', focus: '', status: 'High stability and aiming to move to 20kg dumbbells', rank: 13 },
        { exercise: 'Machine Shoulder Press', current: '30kg x15', target: '35kg x12', focus: '', status: 'Isolated work and aiming to increase machine resistance', rank: 13 },
        { exercise: 'Smith Machine Shoulder Press', current: '12.5kg per side x11', target: '15kg per side x8', focus: '', status: 'Stability challenge and aiming to build anterior deltoid strength', rank: 13 },
        { exercise: 'Rear Delt Fly (Machine)', current: '15kg x11', target: '17.5kg x10', focus: '', status: 'Rear deltoid focus and aiming to improve proportions', rank: 18 },
        // Remaining exercises (original order preserved)
        { exercise: 'Front Plate Raise', current: '15kg x12', target: '17.5kg x10', focus: '', status: 'Good explosive strength and aiming to add front load progressively' }
    ],
    // TRICEPS: Top 25 first (sorted by rank ascending), then remaining exercises
    triceps: [
        // Top 25 exercises (sorted by rank ascending)
        { exercise: 'Overhead Triceps Extension', current: '15kg x9', target: '17.5kg x8', focus: '', status: 'Emphasis on stretch and aiming to improve strength in the lengthened position', rank: 8 },
        { exercise: 'Dips', current: '20 reps', target: '25 reps', focus: '', status: 'Improving endurance and aiming to increase total accumulated work volume', rank: 17 },
        // Remaining exercises (original order preserved)
        { exercise: 'Cable Triceps Pushdown', current: '22.5kg x10', target: '25kg x10', focus: '', status: 'Strong pump and aiming to reach 25kg for higher loading' }
    ],
    // BICEPS: Top 25 first (sorted by rank ascending), then remaining exercises
    biceps: [
        // Top 25 exercises (sorted by rank ascending)
        { exercise: 'Single-Arm Cable Curl', current: '10kg x10', target: '12.5kg x10', focus: '', status: 'Continuous tension and aiming to add controlled resistance', rank: 15 },
        // Remaining exercises (original order preserved)
        { exercise: 'Barbell Curl', current: '25kg x10', target: '27.5kg x8', focus: '', status: 'Good response to the weight and aiming to keep strength momentum' },
        { exercise: 'Dumbbell Curl', current: '8kg x15', target: '10kg x12', focus: '', status: 'High rep volume and aiming to move to heavier loads' },
        { exercise: 'Machine Curl', current: '20kg x15', target: '25kg x12', focus: '', status: 'Perfect isolation and aiming to increase tension at peak contraction' },
        { exercise: 'Hammer Curl', current: '10kg x15', target: '12kg x12', focus: '', status: 'Forearm strengthening and aiming to increase max loading' }
    ]
};


export const top25Raw = [
    { rank: 1, name: 'Squat Variations', tier: 'S', rationale: 'King of leg builders.' },
    { rank: 2, name: 'Pull-Ups / Chin-Ups', tier: 'S', rationale: 'Best lat builder.' },
    { rank: 3, name: 'Incline Press', tier: 'S', rationale: 'Upper chest shelf.' },
    { rank: 4, name: 'RDL', tier: 'S', rationale: 'Posterior chain & stretch.' },
    { rank: 5, name: 'Supported T-Bar Row', tier: 'S', rationale: 'Back thickness + stability.' },
    { rank: 6, name: 'Cable Lateral Raise', tier: 'A', rationale: 'Constant tension side delt.' },
    { rank: 7, name: 'Preacher Curls', tier: 'A', rationale: 'Biceps isolation / stretch.' },
    { rank: 8, name: 'Overhead Extension', tier: 'A', rationale: 'Long head triceps.' },
    { rank: 9, name: 'Leg Extension', tier: 'A', rationale: 'Rectus femoris isolation.' },
    { rank: 10, name: 'Seated Leg Curl', tier: 'A', rationale: 'Hamstring stretch.' },
    { rank: 11, name: 'Chest Fly (Cable)', tier: 'A', rationale: 'Loaded stretch at bottom.' },
    { rank: 12, name: 'Lateral Pulldown', tier: 'A', rationale: 'Vertical pull, great load.' },
    { rank: 13, name: 'Bench Press', tier: 'A', rationale: 'Classic chest builder.' },
    { rank: 14, name: 'Bulgarian Split Squat', tier: 'A', rationale: 'Unilateral stability.' },
    { rank: 15, name: 'Face Pulls', tier: 'A', rationale: 'Rear delt & rotator cuff.' },
    { rank: 16, name: 'Dips', tier: 'B', rationale: 'Chest/Triceps compound.' },
    { rank: 17, name: 'OHP (Barbell)', tier: 'B', rationale: 'Compound vertical press.' },
    { rank: 18, name: 'Hip Thrust', tier: 'B', rationale: 'Glute isolation.' },
    { rank: 19, name: 'Lunges', tier: 'B', rationale: 'Dynamic leg movement.' },
    { rank: 20, name: 'Calf Raises', tier: 'B', rationale: 'Essential isolation.' },
    { rank: 21, name: 'Skull Crushers', tier: 'B', rationale: 'Triceps mass.' },
    { rank: 22, name: 'Hammer Curls', tier: 'B', rationale: 'Brachialis thickness.' },
    { rank: 23, name: 'Cable Crossover', tier: 'B', rationale: 'Chest definition.' },
    { rank: 24, name: 'Shrugs', tier: 'B', rationale: 'Traps isolation.' },
    { rank: 25, name: 'Plank', tier: 'B', rationale: 'Core stability.' }
];

// BACKWARD COMPATIBILITY EXPORTS (For current UI until refactored)
export const WORKOUT_LOGS = workoutsRaw;
export const BODY_METRICS = weighInsRaw;
export const GOALS_FEB_2026 = goalsRaw;
export const NIPPARD_TOP_25 = top25Raw;
