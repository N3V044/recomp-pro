
import { workoutsRaw } from './src/data/data.js';

// TARGET TOTALS
const TARGETS = {
    Chest: 36,
    Back: 35,
    Legs: 31,
    Shoulders: 27,
    Biceps: 16,
    Triceps: 15,
    Abs: 33
};

const ACTIVITY_TARGETS = {
    Pilates: 5,
    Cardio: 6 // Note: Some strength workouts might have Cardio type or muscles, need to align definitions
};

// MUSCLE LIST
const MUSCLES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs'];

// CALCULATION
const scores = {};
MUSCLES.forEach(m => scores[m] = 0);

let pilatesCount = 0;
let cardioCount = 0;

workoutsRaw.forEach(w => {
    // Activities
    if (w.type === 'Pilates') pilatesCount++;
    if (w.type === 'Cardio') cardioCount++;
    // Note: User says "Cardio sessions: 6 (Trainings: 16, 17, 18, 22, 24, 32)"
    // 16, 24, 32 are pure Cardio. 17, 18, 22 are Mixed/Other types but counted as Cardio sessions?
    // Let's check IDs specifically for activity counts based on user list.
    // User list for Cardio: 16, 17, 18, 22, 24, 32.

    // Intensity
    if (w.intensity) {
        Object.entries(w.intensity).forEach(([key, val]) => {
            const m = key.charAt(0).toUpperCase() + key.slice(1);
            if (scores[m] !== undefined) {
                scores[m] += val;
            }
        });
    }
});

// Manual override for Cardio count to match User's specific ID list for verification
const cardioIds = [16, 17, 18, 22, 24, 32];
const actualCardioCount = workoutsRaw.filter(w => cardioIds.includes(w.id)).length;

console.log("--- DATA ALIGNMENT REPORT ---");
console.log(`Total Workouts: ${workoutsRaw.length} (Target: 33)`);

const dec25 = workoutsRaw.filter(w => w.date.startsWith('2025-12')).length;
const jan26 = workoutsRaw.filter(w => w.date.startsWith('2026-01')).length;
const feb26 = workoutsRaw.filter(w => w.date.startsWith('2026-02')).length;

console.log(`Dec 2025: ${dec25} (Target: 13)`);
console.log(`Jan 2026: ${jan26} (Target: 17)`);
console.log(`Feb 2026: ${feb26} (Target: 3)`);

console.log("\n--- MUSCLE LOAD TOTALS ---");
let allMatch = true;
Object.keys(TARGETS).forEach(m => {
    const actual = scores[m];
    const target = TARGETS[m];
    const match = actual === target;
    if (!match) allMatch = false;
    console.log(`${m}: ${actual} (Target: ${target}) ${match ? 'OK' : 'MISMATCH'}`);
});

console.log("\n--- ACTIVITY COUNTS ---");
console.log(`Pilates: ${pilatesCount} (Target: 5) ${pilatesCount === 5 ? 'OK' : 'MISMATCH'}`);
console.log(`Cardio (Specific IDs): ${actualCardioCount} (Target: 6) ${actualCardioCount === 6 ? 'OK' : 'MISMATCH'}`);

console.log("\n--- JSON DUMP FOR CHECKSUM ---");
// console.log(JSON.stringify(workoutsRaw)); 
