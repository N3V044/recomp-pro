
export const getLatestMetric = (metrics) => {
    if (!metrics || metrics.length === 0) return null;
    return metrics[metrics.length - 1]; // Assumes sorted by date
};

export const getFirstMetric = (metrics) => {
    if (!metrics || metrics.length === 0) return null;
    return metrics[0];
};

export const calculateDelta = (metrics, key) => {
    const start = getFirstMetric(metrics);
    const end = getLatestMetric(metrics);

    if (!start || !end) return 0;
    const startVal = start[key];
    const endVal = end[key];
    if (startVal == null || endVal == null) return 0;
    return (endVal - startVal).toFixed(1);
};


