import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import { PERIODS, PERIOD_LABELS } from '../domain/constants';
import { filterWorkoutsByPeriod } from '../domain/selectors/period';
import { calculateLoadScores } from '../domain/selectors/load';
import PremiumEmptyState from '../components/PremiumEmptyState';

export default function Compare({ allWorkouts, isExpert }) {
    const [periodA, setPeriodA] = useState(PERIODS.DEC_2025);
    const [periodB, setPeriodB] = useState(PERIODS.JAN_2026);

    // Filter Data
    const logsA = useMemo(() => filterWorkoutsByPeriod(allWorkouts, periodA), [allWorkouts, periodA]);
    const logsB = useMemo(() => filterWorkoutsByPeriod(allWorkouts, periodB), [allWorkouts, periodB]);

    // Calculate Loads
    const loadsA = useMemo(() => calculateLoadScores(logsA), [logsA]);
    const loadsB = useMemo(() => calculateLoadScores(logsB), [logsB]);

    const allMuscles = Array.from(new Set([...Object.keys(loadsA), ...Object.keys(loadsB)])).sort();

    // Chart Helper (Simple Bar Comparison)
    const ComparisonChart = () => {
        const width = 100; // %
        const maxScore = Math.max(
            ...Object.values(loadsA),
            ...Object.values(loadsB),
            1
        );

        return (
            <div style={{ marginTop: '8px' }}>
                {allMuscles.map(muscle => {
                    const valA = loadsA[muscle] || 0;
                    const valB = loadsB[muscle] || 0;
                    return (
                        <div key={muscle} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                <span>{muscle}</span>
                            </div>
                            {/* Bar A */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ width: '30px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>A</span>
                                <div style={{ flex: 1, height: '6px', background: 'var(--bg-card-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(valA / maxScore) * 100}%`, background: 'var(--accent-blue)', height: '100%' }} />
                                </div>
                                <span style={{ width: '30px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 'bold' }}>{valA}</span>
                            </div>
                            {/* Bar B */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ width: '30px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>B</span>
                                <div style={{ flex: 1, height: '6px', background: 'var(--bg-card-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(valB / maxScore) * 100}%`, background: 'var(--accent-orange)', height: '100%' }} />
                                </div>
                                <span style={{ width: '30px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 'bold' }}>{valB}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    return (
        <div className="view-container">
            <style>{`
                /* Comparison Table Compression */
                .compare-table-dense th {
                    padding: 8px 12px !important;
                }
                .compare-table-dense td {
                    padding: 6px 12px !important;
                }
            `}</style>
            <PageHeader
                title="Period Comparison"
                subtitle="Side-by-side period analysis"
            />

            {/* CONTROLS */}
            <div className="dash-card hover-lift" style={{ marginBottom: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Period A (Blue)</label>
                        <select
                            value={periodA}
                            onChange={(e) => setPeriodA(e.target.value)}
                            className="premium-input"
                        >
                            {Object.entries(PERIOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <div style={{ fontWeight: '800', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>VS</div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Period B (Orange)</label>
                        <select
                            value={periodB}
                            onChange={(e) => setPeriodB(e.target.value)}
                            className="premium-input"
                        >
                            {Object.entries(PERIOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '8px' }}>
                {/* TABLE */}
                <div className="chart-container hover-lift" style={{ padding: 0, overflow: 'hidden' }}>
                    <h3 className="section-title" style={{ padding: '8px 12px', margin: 0, borderBottom: '1px solid var(--border-subtle)' }}>Metric Deltas</h3>
                    <table className="premium-table compare-table-dense">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px', textAlign: 'left' }}>Muscle</th>
                                <th style={{ textAlign: 'center' }}>Pts A</th>
                                <th style={{ textAlign: 'center' }}>Pts B</th>
                                <th style={{ textAlign: 'center' }}>Δ</th>
                                <th style={{ textAlign: 'center' }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMuscles.map(muscle => {
                                const valA = loadsA[muscle] || 0;
                                const valB = loadsB[muscle] || 0;
                                const delta = valB - valA;
                                const pct = valA > 0 ? ((delta / valA) * 100).toFixed(0) : (valB > 0 ? '+100' : '0');
                                const color = delta > 0 ? 'var(--accent-orange)' : 'var(--accent-blue)';

                                return (
                                    <tr key={muscle}>
                                        <td style={{ paddingLeft: '24px', fontWeight: 'bold', textAlign: 'left' }}>{muscle}</td>
                                        <td style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>{valA}</td>
                                        <td style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>{valB}</td>
                                        <td style={{ color, fontWeight: 'bold', textAlign: 'center' }}>{delta > 0 ? '+' : ''}{delta}</td>
                                        <td style={{ fontSize: '0.85rem', textAlign: 'center' }}>{pct}%</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* GRAPH */}
                <div className="chart-container hover-lift" style={{ padding: '12px' }}>
                    <h3 className="section-title" style={{ marginBottom: '8px', borderBottom: 'none' }}>Visual Comparison</h3>
                    <ComparisonChart />
                </div>
            </div>
        </div>
    );
}
