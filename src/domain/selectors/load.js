
/**
 * Calculates total load score per muscle for a list of workouts.
 * @param {Array} workouts 
 * @returns {Object} { MuscleName: TotalScore }
 */
export const calculateLoadScores = (workouts) => {
    const scores = {};

    workouts.forEach(workout => {
        if (!workout.intensity) return;

        Object.entries(workout.intensity).forEach(([muscleKey, intensityValue]) => {
            // Normalize muscle key (chest -> Chest)
            const muscleName = muscleKey.charAt(0).toUpperCase() + muscleKey.slice(1);

            if (!scores[muscleName]) scores[muscleName] = 0;
            scores[muscleName] += intensityValue;
        });
    });

    return scores;
};

/**
 * Returns top N and bottom N muscles by load.
 */
export const getFocusMuscles = (workouts) => {
    const loads = calculateLoadScores(workouts);
    const sorted = Object.entries(loads).sort(([, a], [, b]) => b - a); // Descending

    if (sorted.length === 0) return { top: [], low: [] };

    return {
        top: sorted.slice(0, 2).map(([name]) => name),
        low: sorted.slice(-2).reverse().map(([name]) => name) // Bottom 2, smallest last
    };
};



export const LOAD_THRESHOLDS = {
    LOW: 5,   // Below this is Undertrained (Yellow)
    HIGH: 15  // Above this is Overloaded (Red), in between is Optimal (Green)
};

/**
 * Returns detailed analysis for all muscles.
 * @returns {Object} { MuscleName: { points, sessions, i3: [], i2: [], i1: [] } }
 */
export const getMuscleAnalysis = (workouts) => {
    const analysis = {};
    const MUSCLES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs'];

    MUSCLES.forEach(m => {
        analysis[m] = {
            points: 0,
            sessions: 0,
            i3: [], // List of workout IDs
            i2: [],
            i1: []
        };
    });

    workouts.forEach(w => {
        if (!w.intensity) return;

        Object.entries(w.intensity).forEach(([key, val]) => {
            const muscleName = key.charAt(0).toUpperCase() + key.slice(1);
            if (analysis[muscleName]) {
                analysis[muscleName].points += val;
                analysis[muscleName].sessions += 1;

                if (val === 3) analysis[muscleName].i3.push(w.id);
                if (val === 2) analysis[muscleName].i2.push(w.id);
                if (val === 1) analysis[muscleName].i1.push(w.id);
            }
        });
    });

    return analysis;
};
