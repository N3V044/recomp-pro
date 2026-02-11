import React, { useMemo, useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { getLatestMetric, calculateDelta, getFirstMetric } from '../domain/selectors/metrics';
import { calculateLoadScores, getFocusMuscles } from '../domain/selectors/load';
import PremiumEmptyState from '../components/PremiumEmptyState';
import { useAnimatedCount } from '../hooks/useAnimatedCount';
import OverviewBodyMetricsChart from '../components/OverviewBodyMetricsChart';
import { filterWorkoutsByPeriod } from '../domain/selectors/period';
import { PERIODS } from '../domain/constants';

export default function Home({ workouts = [], metrics = [], period, isExpert, goals = {}, allWorkouts = [], allMetrics = [] }) {
    // --- 1. DATA PROCESSING ---
    const loadScores = useMemo(() => calculateLoadScores(workouts), [workouts]);
    const focus = useMemo(() => getFocusMuscles(workouts), [workouts]);

    const totalLoadPoints = Object.values(loadScores).reduce((a, b) => a + b, 0);

    const strengthCount = workouts.filter(w => !['Cardio', 'Pilates'].includes(w.type)).length;
    const cardioCount = workouts.filter(w => w.type === 'Cardio').length;
    const pilatesCount = workouts.filter(w => w.type === 'Pilates').length;

    const latestMetric = getLatestMetric(metrics);
    const weightDelta = calculateDelta(metrics, 'weight');
    const bfDelta = calculateDelta(metrics, 'bf');

    const formattedDate = latestMetric ? new Date(latestMetric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';
    const isApprox = latestMetric?.note?.includes('~');

    // --- PERIOD DELTA KPIs ---
    const periodDeltas = useMemo(() => {
        if (!metrics || metrics.length < 2) return { weight: null, bf: null, lean: null, lastWeight: metrics?.[metrics.length - 1]?.weight, lastBf: metrics?.[metrics.length - 1]?.bf };
        const first = metrics[0];
        const last = metrics[metrics.length - 1];
        const wDelta = +(last.weight - first.weight).toFixed(1);
        const bfDelta = +(last.bf - first.bf).toFixed(1);
        const firstLean = +(first.weight * (1 - first.bf / 100)).toFixed(1);
        const lastLean = +(last.weight * (1 - last.bf / 100)).toFixed(1);
        const leanDelta = +(lastLean - firstLean).toFixed(1);
        return { weight: wDelta, bf: bfDelta, lean: leanDelta, lastWeight: last.weight, lastBf: last.bf, lastLean };
    }, [metrics]);

    // --- GOALS PROGRESS ---
    const goalsProgress = useMemo(() => {
        const allGoals = Object.values(goals).flat();
        const total = allGoals.length;
        if (total === 0) return { total: 0, achieved: 0, inProgress: 0, pct: 0 };
        // Parse a value like '24kg x12' => extract the weight number
        const extractNum = (str) => {
            if (!str) return 0;
            const m = str.match(/([\d.]+)/);
            return m ? parseFloat(m[1]) : 0;
        };
        let achieved = 0;
        let inProgress = 0;
        allGoals.forEach(g => {
            const cur = extractNum(g.current);
            const tgt = extractNum(g.target);
            if (tgt > 0 && cur >= tgt) {
                achieved++;
            } else if (cur > 0) {
                inProgress++;
            }
        });
        return { total, achieved, inProgress, pct: total > 0 ? Math.round((achieved / total) * 100) : 0 };
    }, [goals]);

    // --- TRAINING TREND ---
    const trainingTrend = useMemo(() => {
        const periodOrder = [PERIODS.DEC_2025, PERIODS.JAN_2026, PERIODS.FEB_2026];
        const periodLabels = { [PERIODS.DEC_2025]: 'Dec 2025', [PERIODS.JAN_2026]: 'Jan 2026', [PERIODS.FEB_2026]: 'Feb 2026' };
        const currentIdx = periodOrder.indexOf(period);
        const currentVolume = Object.values(loadScores).reduce((a, b) => a + b, 0);

        let previousVolume = null;
        let volumeDelta = null;
        let volumeLabel = 'No comparison data';
        let volumeArrow = '→';
        let volumeColor = 'var(--text-secondary)';
        let prevPeriodLabel = null;

        if (period === PERIODS.ALL || currentIdx <= 0) {
            if (period === PERIODS.ALL) {
                volumeLabel = null;
                volumeArrow = null;
            } else {
                volumeLabel = 'No previous period';
            }
        } else {
            const prevPeriod = periodOrder[currentIdx - 1];
            prevPeriodLabel = periodLabels[prevPeriod] || prevPeriod;
            const prevWorkouts = filterWorkoutsByPeriod(allWorkouts, prevPeriod);
            const prevScores = calculateLoadScores(prevWorkouts);
            previousVolume = Object.values(prevScores).reduce((a, b) => a + b, 0);
            volumeDelta = currentVolume - previousVolume;

            if (volumeDelta > 0) {
                volumeLabel = 'Volume increasing vs previous period';
                volumeArrow = '↑';
                volumeColor = '#EF4444';
            } else if (volumeDelta < 0) {
                volumeLabel = 'Volume decreasing vs previous period';
                volumeArrow = '↓';
                volumeColor = '#22C55E';
            } else {
                volumeLabel = 'Volume stable vs previous period';
                volumeArrow = '→';
                volumeColor = 'var(--text-secondary)';
            }
        }

        // Top muscle this period
        let topMuscle = null;
        let topMuscleScore = 0;
        Object.entries(loadScores).forEach(([m, s]) => {
            if (s > topMuscleScore) { topMuscleScore = s; topMuscle = m; }
        });

        // Least trained (Lowest score > 0, or 0 if present in list)
        // Fixed order for tie-breaking: Chest, Back, Legs, Shoulders, Triceps, Biceps, Abs
        const muscleOrder = ['Chest', 'Back', 'Legs', 'Shoulders', 'Triceps', 'Biceps', 'Abs'];
        let leastTrainedMuscle = null;
        let leastTrainedScore = Infinity;

        // Check each muscle in fixed order
        muscleOrder.forEach(m => {
            const score = loadScores[m] || 0;
            if (score < leastTrainedScore) {
                leastTrainedScore = score;
                leastTrainedMuscle = m;
            }
        });

        if (leastTrainedScore === Infinity) {
            leastTrainedMuscle = null;
            leastTrainedScore = 0;
        }

        // Focus shift: biggest increase muscle vs previous
        let focusShift = null;
        let focusShiftDelta = 0;
        if (previousVolume !== null && period !== PERIODS.ALL) {
            const prevPeriod = periodOrder[currentIdx - 1];
            const prevWorkouts = filterWorkoutsByPeriod(allWorkouts, prevPeriod);
            const prevScores = calculateLoadScores(prevWorkouts);
            let maxDelta = 0;
            let maxMuscle = null;
            Object.keys(loadScores).forEach(m => {
                const delta = (loadScores[m] || 0) - (prevScores[m] || 0);
                if (delta > maxDelta) {
                    maxDelta = delta;
                    maxMuscle = m;
                }
            });
            if (maxMuscle) { focusShift = maxMuscle; focusShiftDelta = maxDelta; }
        }

        return { volumeLabel, volumeArrow, volumeColor, focusShift, focusShiftDelta, currentVolume, previousVolume, volumeDelta, prevPeriodLabel, topMuscle, topMuscleScore, leastTrainedMuscle, leastTrainedScore };
    }, [period, loadScores, allWorkouts]);

    // --- ANIMATED VALUES ---
    // We animate the positive integer parts for visual effect
    const animatedStrength = useAnimatedCount(strengthCount);
    const animatedCardio = useAnimatedCount(cardioCount);
    const animatedPilates = useAnimatedCount(pilatesCount);
    const animatedLoad = useAnimatedCount(totalLoadPoints);

    // For decimals, we can just animate the integer part or display static for precision,
    // but here we'll stick to static precision for weight/BF to avoid jumping decimals,
    // or use a specialized float hook if needed. For now, static precision is safer for metrics.

    // --- STATUS LOGIC (Narrative) ---
    let statusTitle = "Maintenance Phase";
    let statusDesc = "Stable metrics indicate a solid base for strength building.";
    let direction = "stable"; // up, down, stable

    if (weightDelta < -0.5) {
        statusTitle = "Effective Cut";
        statusDesc = `Weight down ${Math.abs(weightDelta)}kg, driven by high activity.`;
        direction = "down";
    } else if (weightDelta > 0.5 && bfDelta < 0) {
        statusTitle = "Recomposition Gold";
        statusDesc = "Gaining lean mass while losing fat";
        direction = "up-good";
    } else if (weightDelta > 0.5) {
        statusTitle = "Lean Bulk";
        statusDesc = "Weight trending up. Monitor body fat to keep it lean.";
        direction = "up";
    }

    // --- TENSION / BALANCE LOGIC ---
    const topMuscle = focus.top[0] || 'General';
    const lowMuscle = focus.low[0] || 'None';
    const isBalanced = focus.top.length > 2; // Rough proxy for balance

    // --- INSIGHTS GENERATION ---
    // --- INSIGHTS GENERATION ---
    const insightSets = useMemo(() => {
        const sets = [];

        // Set 1: Load Distribution
        sets.push([
            { label: 'Focus', value: isBalanced ? "Training stimulus is well-distributed" : `Primary focus is currently on ${topMuscle}` },
            { label: 'Balance', value: isBalanced ? "No significant lagging groups detected" : `${lowMuscle} volume is lower relative to others` },
            { label: 'Volume', value: `Total training volume is ${totalLoadPoints} points` }
        ]);

        // Set 2: Composition & Trends
        const weightTrend = weightDelta < 0 ? "Weight is trending down" : weightDelta > 0 ? "Weight is trending up" : "Weight is stable";
        const composition = (weightDelta > 0 && bfDelta < 0) ? "Positive recomposition trend detected" : "Maintenance of body composition";

        sets.push([
            { label: 'Trend', value: weightTrend },
            { label: 'Recomp', value: composition },
            { label: 'Strength', value: `${strengthCount} strength sessions completed` }
        ]);

        // Set 3: Cardio/Pilates Mix
        if (cardioCount > 0 || pilatesCount > 0) {
            const mixItems = [];
            if (pilatesCount > 0) mixItems.push({ label: 'Pilates', value: "Pilates activity is present" });
            if (cardioCount > 0) mixItems.push({ label: 'Cardio', value: "Cardio sessions recorded" });

            // Fill remaining slot if needed or just add Frequency
            mixItems.push({ label: 'Freq', value: `${((workouts.length / 30) * 7).toFixed(1)} workouts/week avg` });

            sets.push(mixItems);
        }

        return sets;
    }, [isBalanced, topMuscle, lowMuscle, totalLoadPoints, weightDelta, bfDelta, strengthCount, cardioCount, pilatesCount, workouts.length]);

    const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
    const [mobileTooltipOpen, setMobileTooltipOpen] = useState(false);

    // DEV: Scroll Guard to prevent jumps
    const checkScrollStability = (phase, startY) => {
        if (process.env.NODE_ENV === 'development') {
            const currentY = window.scrollY;
            if (phase === 'before') return currentY;
            if (phase === 'after' && startY !== undefined) {
                const diff = currentY - startY;
                if (Math.abs(diff) > 2) {
                    console.error(`StrategicConclusionRotation scroll jump detected: before=${startY} after=${currentY} (delta=${diff}px)`);
                }
            }
        }
        return 0;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            // Guard Before
            const startY = checkScrollStability('before');

            setCurrentInsightIndex(prev => (prev + 1) % insightSets.length);

            // Guard After (microtask)
            requestAnimationFrame(() => {
                checkScrollStability('after', startY);
            });
        }, 30000); // 30s strictly as requested

        return () => clearInterval(interval);
    }, [insightSets.length]);

    // Derived current for other uses if needed, but we render all in the new layout
    const currentInsights = insightSets[currentInsightIndex];

    // --- 2. RENDER HELPERS ---
    const hasWorkouts = workouts && workouts.length > 0;
    const hasMetrics = metrics && metrics.length > 0;

    // --- 3. GRAPH COMPONENT (Analytical Distribution) ---
    const MuscleBarGraph = () => {
        const [hoveredMuscle, setHoveredMuscle] = React.useState(null);

        if (!hasWorkouts) return <PremiumEmptyState message="No workout data" />;

        // Compute session counts for tooltip
        const sessionsByMuscle = useMemo(() => {
            const counts = {};
            workouts.forEach(w => {
                if (!w.intensity) return;
                Object.keys(w.intensity).forEach(m => {
                    const muscleName = m.charAt(0).toUpperCase() + m.slice(1);
                    counts[muscleName] = (counts[muscleName] || 0) + 1;
                });
            });
            return counts;
        }, []);

        const data = Object.entries(loadScores)
            .sort(([, a], [, b]) => b - a)
            .filter(([, score]) => score > 0);

        if (data.length === 0) return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No intensity recorded</div>;

        const maxScore = Math.max(...data.map(([, s]) => s));

        return (
            <div style={{ marginTop: '2px', display: 'flex', height: '180px', gap: '4px' }}>
                {/* Y-Axis */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    paddingBottom: '24px', // Align with chart bottom
                    alignItems: 'flex-end',
                    color: 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    fontWeight: '500',
                    minWidth: '24px'
                }}>
                    <span>{maxScore}</span>
                    <span>{Math.round(maxScore * 0.75)}</span>
                    <span>{Math.round(maxScore * 0.5)}</span>
                    <span>{Math.round(maxScore * 0.25)}</span>
                    <span>0</span>
                </div>

                {/* Chart Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Plot Area */}
                    <div style={{
                        flex: 1,
                        position: 'relative',
                        borderLeft: '1px solid var(--border-subtle)',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        paddingTop: '10px' // Space at top
                    }}>
                        {/* Horizontal Gridlines */}
                        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                            <div key={ratio} style={{
                                position: 'absolute',
                                bottom: `${ratio * 100}%`,
                                left: 0,
                                right: 0,
                                height: '1px',
                                background: 'var(--border-subtle)',
                                opacity: 0.15,
                                pointerEvents: 'none'
                            }} />
                        ))}

                        {/* Bars Row */}
                        <div style={{
                            display: 'flex',
                            width: '100%',
                            height: '100%',
                            alignItems: 'flex-end',
                            justifyContent: 'space-around',
                            zIndex: 1,
                            padding: '0 4px'
                        }}>
                            {data.map(([muscle, score], index) => (
                                <div
                                    key={muscle}
                                    onMouseEnter={() => setHoveredMuscle(muscle)}
                                    onMouseLeave={() => setHoveredMuscle(null)}
                                    style={{
                                        flex: 1,
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        cursor: 'default'
                                    }}
                                >
                                    {/* Tooltip - Floats ABOVE the bar, never obscuring */}
                                    {hoveredMuscle === muscle && (
                                        <div className="animate-fade-in" style={{
                                            position: 'absolute',
                                            bottom: '100%', // Anchored to top of container/bar
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            marginBottom: '12px', // increased separation
                                            background: 'var(--bg-card-elevated)',
                                            border: '1px solid var(--border-subtle)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            zIndex: 100, // High z-index to float over everything
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                                            pointerEvents: 'none',
                                            whiteSpace: 'nowrap',
                                            textAlign: 'center',
                                            minWidth: '100px'
                                        }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{muscle}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                <span style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>{score}</span> pts
                                                <span style={{ margin: '0 4px', opacity: 0.3 }}>|</span>
                                                <span style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>{sessionsByMuscle[muscle] || 0}</span> sessions
                                            </div>
                                            {/* Arrow pointing down */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                borderLeft: '6px solid transparent',
                                                borderRight: '6px solid transparent',
                                                borderTop: '6px solid var(--border-subtle)' // Matches border color
                                            }} />
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                marginTop: '-1px', // Overlap to hide border seam if needed, or just standard
                                                borderLeft: '6px solid transparent',
                                                borderRight: '6px solid transparent',
                                                borderTop: '6px solid var(--bg-card-elevated)' // Matches bg color
                                            }} />
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            width: '60%', // Wider bars
                                            maxWidth: '40px',
                                            height: `${(score / maxScore) * 100}%`,
                                            background: hoveredMuscle === muscle ? 'var(--accent-orange)' : 'var(--accent-blue)', // Highlight: Blue -> Orange on hover
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'all 0.2s ease', // Snap bit faster
                                            opacity: hoveredMuscle && hoveredMuscle !== muscle ? 0.6 : 1, // Subtle dimming for non-focused
                                            boxShadow: hoveredMuscle === muscle ? '0 0 15px rgba(249, 115, 22, 0.3)' : 'none' // Glow on hover
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* X-Axis Labels */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginTop: '6px',
                        padding: '0 4px'
                    }}>
                        {data.map(([muscle]) => (
                            <div key={muscle} style={{
                                flex: 1,
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: hoveredMuscle === muscle ? 'var(--text-primary)' : 'var(--text-secondary)',
                                letterSpacing: '0.3px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                transition: 'color 0.2s ease'
                            }}>
                                {muscle}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // --- OVERVIEW DELTA COLOR HELPER (increase=red, decrease=green) ---
    const getDeltaColor = (val) => {
        if (val === null || val === 0) return 'var(--text-secondary)';
        return val > 0 ? '#EF4444' : '#22C55E';
    };

    return (
        <div className="view-container">
            {/* --- HERO SECTION --- */}
            <div className="animate-slide-up" style={{ marginBottom: '4px' }}>
                <PageHeader
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>{statusTitle}</span>
                            {direction === 'down' && <span className="animate-scale-in" style={{ marginLeft: '10px', color: '#22C55E', fontSize: '0.85rem', background: 'rgba(34,197,94,0.1)', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>▼ {Math.abs(weightDelta)}kg</span>}
                            {direction === 'up' && <span className="animate-scale-in" style={{ marginLeft: '10px', color: '#EF4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>▲ {Math.abs(weightDelta)}kg</span>}
                        </div>
                    }
                    subtitle={statusDesc}
                />
            </div>

            {/* === ROW 1: Muscle Load (left) + Compact Session/Volume + Chart (right) === */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '10px',
                alignItems: 'stretch'
            }}>
                {/* LEFT: Muscle Load Analysis */}
                <div className="hover-lift animate-slide-up delay-100" style={{
                    background: 'var(--bg-card)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    opacity: 0.96
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <div style={{ width: '3px', height: '10px', background: 'var(--accent-orange)', borderRadius: '2px' }}></div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Muscle Load Analysis</div>
                    </div>
                    <MuscleBarGraph />
                </div>

                {/* RIGHT: Compact Session/Volume + Chart stacked */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Ultra-compact Session + Volume card */}
                    <div className="hover-lift animate-slide-up delay-200" style={{
                        background: 'var(--bg-card)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.04)',
                        padding: '5px 12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>{strengthCount}</span>
                            <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textTransform: 'uppercase', opacity: 0.5, letterSpacing: '0.5px' }}>Strength</span>
                            <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)', opacity: 0.3 }}></div>
                            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>{pilatesCount}</span>
                            <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textTransform: 'uppercase', opacity: 0.5, letterSpacing: '0.5px' }}>Pilates</span>
                            <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)', opacity: 0.3 }}></div>
                            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>{cardioCount}</span>
                            <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textTransform: 'uppercase', opacity: 0.5, letterSpacing: '0.5px' }}>Cardio</span>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            <span style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{animatedLoad}</span>
                            <span style={{ marginLeft: '4px', opacity: 0.5, fontWeight: '700' }}>PTS</span>
                            <span style={{ margin: '0 6px', opacity: 0.2 }}>—</span>
                            <span style={{ color: 'var(--text-secondary)', opacity: 0.7, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Period Intensity</span>
                        </div>
                    </div>

                    {/* Weight vs Body Fat Progress Chart */}
                    <div className="hover-lift" style={{
                        position: 'relative',
                        flex: 1,
                        padding: '0',
                        background: 'var(--bg-card)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.04)',
                        overflow: 'hidden',
                        minHeight: '150px',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.05)'
                    }}>
                        <div style={{
                            position: 'absolute', top: '8px', left: '0px', padding: '0 0 0 12px',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            pointerEvents: 'none', zIndex: 10
                        }}>
                            <div style={{ width: '3px', height: '10px', background: 'var(--accent-blue)', borderRadius: '2px' }}></div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Weight vs Body Fat Progress</span>
                        </div>
                        <OverviewBodyMetricsChart data={metrics} />
                    </div>
                </div>
            </div>

            {/* === ROW 2: PERIOD DELTA KPIs === */}
            <div className="animate-slide-up delay-50" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '8px'
            }}>
                {/* Weight Δ */}
                <div className="hover-lift" style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '5px 8px',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', fontWeight: '700', marginBottom: '4px', opacity: 0.8 }}>Weight</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                        {periodDeltas.lastWeight ?? '—'}<span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-secondary)', marginLeft: '2px' }}>KG</span>
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        marginTop: '4px',
                        color: getDeltaColor(periodDeltas.weight),
                        opacity: 0.9
                    }}>
                        {periodDeltas.weight === null ? '—' : `${periodDeltas.weight > 0 ? '+' : ''}${periodDeltas.weight} kg`}
                    </div>
                </div>

                {/* Body Fat Δ */}
                <div className="hover-lift" style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '5px 8px',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', fontWeight: '700', marginBottom: '4px', opacity: 0.8 }}>Body Fat</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                        {periodDeltas.lastBf ?? '—'}<span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-secondary)', marginLeft: '2px' }}>%</span>
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        marginTop: '4px',
                        color: getDeltaColor(periodDeltas.bf),
                        opacity: 0.9
                    }}>
                        {periodDeltas.bf === null ? '—' : `${periodDeltas.bf > 0 ? '+' : ''}${periodDeltas.bf}%`}
                    </div>
                </div>

                {/* Lean Mass Δ */}
                <div className="hover-lift" style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '5px 8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', fontWeight: '700', marginBottom: '4px', opacity: 0.8 }}>Lean Mass</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                        {periodDeltas.lastLean ?? '—'}<span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-secondary)', marginLeft: '2px' }}>KG</span>
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        marginTop: '4px',
                        color: getDeltaColor(periodDeltas.lean),
                        opacity: 0.9
                    }}>
                        {periodDeltas.lean === null ? '—' : `${periodDeltas.lean > 0 ? '+' : ''}${periodDeltas.lean} kg`}
                    </div>
                </div>
            </div>


            {/* === ROW 3: Goals Progress (full width) === */}
            <div className="hover-lift animate-slide-up delay-350" style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.04)',
                padding: '8px 12px',
                marginBottom: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '3px', height: '10px', background: 'var(--accent-orange)', borderRadius: '2px' }}></div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Mission Status Bar</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        {goalsProgress.achieved} <span style={{ fontSize: '0.8rem', opacity: 0.3, margin: '0 2px' }}>/</span> {goalsProgress.total}
                        <span style={{ fontSize: '0.65rem', fontWeight: '600', color: 'var(--text-secondary)', marginLeft: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Achieved</span>
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-blue)', opacity: 0.8 }}>
                        {goalsProgress.inProgress} Targets in Progress
                    </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{
                        height: '100%',
                        width: `${goalsProgress.pct}%`,
                        background: 'linear-gradient(90deg, var(--accent-orange), #FFB64D)',
                        borderRadius: '4px',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 0 10px rgba(255, 159, 10, 0.2)'
                    }} />
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: 'right', fontWeight: '700', letterSpacing: '0.5px' }}>
                    <span style={{ color: 'var(--accent-orange)' }}>{goalsProgress.pct}%</span> COMPLETE
                </div>
            </div>

            {/* === ROW 4: Strategic Conclusion (left) + Training Trend (right) === */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '10px',
                alignItems: 'stretch'
            }}>
                {/* LEFT: Strategic Conclusion */}
                <div className="hover-lift animate-slide-up delay-300" style={{
                    position: 'relative',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '12px', bottom: '12px', left: '0',
                        width: '3px',
                        background: 'var(--accent-orange)',
                        borderRadius: '0 2px 2px 0',
                        opacity: 0.8
                    }} />
                    <h4 style={{
                        margin: '0 0 6px 0',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--text-tertiary)',
                        paddingLeft: '14px',
                        opacity: 0.7
                    }}>
                        Strategic Insight Panel
                    </h4>
                    <div style={{
                        position: 'relative',
                        flex: 1,
                        width: '100%',
                        overflow: 'hidden',
                        paddingLeft: '14px'
                    }}>
                        {insightSets.map((set, setIdx) => (
                            <div
                                key={setIdx}
                                style={{
                                    position: currentInsightIndex === setIdx ? 'relative' : 'absolute',
                                    top: 0, left: 0, width: '100%',
                                    display: 'flex', flexDirection: 'column', gap: '0',
                                    opacity: currentInsightIndex === setIdx ? 1 : 0,
                                    transform: currentInsightIndex === setIdx ? 'translateY(0)' : 'translateY(8px)',
                                    pointerEvents: currentInsightIndex === setIdx ? 'auto' : 'none',
                                    transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    zIndex: currentInsightIndex === setIdx ? 2 : 1
                                }}
                            >
                                {set.map((insight, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px 0',
                                        borderBottom: idx < set.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none'
                                    }}>
                                        <span style={{ fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.8px', width: '60px', flexShrink: 0, opacity: 0.5 }}>
                                            {insight.label}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: '600', lineHeight: '1.2', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {insight.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Training Trend - ACTIVE */}
                <div className="hover-lift animate-slide-up delay-150" style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    padding: '8px 12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <div style={{ width: '3px', height: '10px', background: 'var(--accent-blue)', borderRadius: '2px' }}></div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Training Trends</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.4rem', color: trainingTrend.volumeColor, lineHeight: 1 }}>{trainingTrend.volumeArrow}</span>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: trainingTrend.volumeColor, letterSpacing: '-0.01em' }}>{trainingTrend.volumeLabel}</div>
                    </div>
                    {trainingTrend.volumeDelta !== null && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px', opacity: 0.8, fontWeight: '500' }}>
                            <span style={{ fontWeight: '800', color: getDeltaColor(trainingTrend.volumeDelta) }}>
                                {trainingTrend.volumeDelta > 0 ? '+' : ''}{trainingTrend.volumeDelta} PTS
                            </span>
                            <span> VS {trainingTrend.prevPeriodLabel?.toUpperCase()}</span>
                        </div>
                    )}
                    {/* Context line */}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                        {/* Compact Grouping */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {trainingTrend.topMuscle ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: '700' }}>Dominant focus</span>
                                    <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                                        {trainingTrend.topMuscle.toUpperCase()} <span style={{ fontSize: '0.65rem', fontWeight: '400', opacity: 0.5 }}>{trainingTrend.topMuscleScore}</span>
                                    </span>
                                </div>
                            ) : (
                                <span style={{ color: 'var(--text-tertiary)' }}>NO DATA FOR PERIOD</span>
                            )}

                            {trainingTrend.leastTrainedMuscle && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: '700' }}>Lowest volume</span>
                                    <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                                        {trainingTrend.leastTrainedMuscle.toUpperCase()} <span style={{ fontSize: '0.65rem', fontWeight: '400', opacity: 0.5 }}>{trainingTrend.leastTrainedScore}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
