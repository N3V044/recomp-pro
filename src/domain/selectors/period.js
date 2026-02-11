import { PERIODS } from '../constants';

/**
 * Checks if a date string falls within a given period.
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {string} period - 'all' or 'YYYY-MM'
 * @returns {boolean}
 */
export const isInPeriod = (dateStr, period) => {
    if (period === PERIODS.ALL) return true;
    if (!dateStr) return false;
    return dateStr.startsWith(period); // '2025-12-01'.startsWith('2025-12') -> true
};

export const filterWorkoutsByPeriod = (workouts, period) => {
    if (!workouts) return [];
    return workouts.filter(w => isInPeriod(w.date, period));
};

export const filterMetricsByPeriod = (metrics, period) => {
    if (!metrics) return [];
    return metrics.filter(m => isInPeriod(m.date, period));
};
