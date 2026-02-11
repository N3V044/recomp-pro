import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLatestMetric, getFirstMetric } from '../domain/selectors/metrics';
import PremiumEmptyState from '../components/PremiumEmptyState';
import { AnimatedNumber } from '../components/AnimatedNumber';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--bg-card-elevated)', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <p style={{ margin: 0, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                    {payload[0].value} {payload[0].name === 'weight' ? 'kg' : '%'}
                </p>
                {payload[0].payload.note && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '200px' }}>
                        {payload[0].payload.note}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

// --- ADD/EDIT WEIGH-IN MODAL ---
function WeighInModal({ isOpen, onClose, onSave, editData, existingDates }) {
    const [date, setDate] = useState('');
    const [weight, setWeight] = useState('');
    const [bf, setBf] = useState('');
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (editData) {
            setDate(editData.date);
            setWeight(String(editData.weight));
            setBf(String(editData.bf));
            setError('');
        } else {
            setDate('');
            setWeight('');
            setBf('');
            setError('');
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!date || !weight || !bf) {
            setError('All fields are required.');
            return;
        }
        const w = parseFloat(weight);
        const b = parseFloat(bf);
        if (isNaN(w) || isNaN(b)) {
            setError('Weight and Body Fat must be numbers.');
            return;
        }
        // Check duplicate date (but allow same date when editing)
        if (!editData && existingDates.includes(date)) {
            setError('A weigh-in already exists for this date.');
            return;
        }
        if (editData && editData.date !== date && existingDates.includes(date)) {
            setError('A weigh-in already exists for this date.');
            return;
        }
        onSave({ date, weight: w, bf: b, note: '' });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '360px',
                animation: 'scaleUp 0.2s ease'
            }}>
                <h4 style={{
                    margin: '0 0 16px 0',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                }}>
                    {editData ? 'Edit Weigh-In' : 'Add Weigh-In'}
                </h4>

                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="premium-input"
                    style={{ marginBottom: '12px', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
                />

                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Weight (kg)</label>
                <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="premium-input"
                    placeholder="e.g. 72.5"
                    style={{ marginBottom: '12px', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
                />

                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Body Fat (%)</label>
                <input
                    type="number"
                    step="0.1"
                    value={bf}
                    onChange={(e) => setBf(e.target.value)}
                    className="premium-input"
                    placeholder="e.g. 14.5"
                    style={{ marginBottom: '16px', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
                />

                {error && (
                    <div style={{ color: '#EF4444', fontSize: '0.75rem', marginBottom: '12px' }}>{error}</div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onClose} className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}>Cancel</button>
                    <button onClick={handleSave} className="btn-primary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}>Save</button>
                </div>
            </div>
            <style>{`
                @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}

// --- WEIGH-IN HISTORY COMPONENT ---
function WeighInHistory({ period, weighIns, setWeighIns }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const filteredWeighIns = useMemo(() => {
        let filtered = [...weighIns].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Apply period filter (period values: 'all', '2025-12', '2026-01', '2026-02')
        if (period && period !== 'all') {
            filtered = filtered.filter(w => w.date.startsWith(period));
        }

        // Calculate deltas
        return filtered.map((w, i) => {
            const isFirst = i === 0;
            const prev = isFirst ? null : filtered[i - 1];
            const weightDelta = isFirst ? null : parseFloat((w.weight - prev.weight).toFixed(1));
            const bfDelta = isFirst ? null : parseFloat((w.bf - prev.bf).toFixed(1));

            // Determine if BF value has ~ prefix
            const bfDisplay = w.note && w.note.startsWith('~') ? `~${w.bf}%` : `${w.bf}%`;

            return {
                ...w,
                weightDelta,
                bfDelta,
                bfDisplay
            };
        });
    }, [period, weighIns]);

    const getDeltaColor = (val) => {
        if (val === null || val === 0) return 'var(--text-secondary)';
        return val > 0 ? '#EF4444' : '#22C55E';
    };

    const formatDelta = (val, unit) => {
        if (val === null) return '\u2014';
        const sign = val > 0 ? '+' : '';
        return `${sign}${val.toFixed(1)} ${unit}`;
    };

    const handleAddClick = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEditClick = (w) => {
        setEditData({ date: w.date, weight: w.weight, bf: w.bf });
        setModalOpen(true);
    };

    const handleSave = (newEntry) => {
        let updated;
        if (editData) {
            // Edit: replace existing entry
            updated = weighIns.map(w => w.date === editData.date
                ? { ...w, date: newEntry.date, weight: newEntry.weight, bf: newEntry.bf }
                : w
            );
        } else {
            // Add: insert new entry
            updated = [...weighIns, newEntry];
        }
        // Sort chronologically
        updated.sort((a, b) => new Date(a.date) - new Date(b.date));
        setWeighIns(updated);
        setModalOpen(false);
        setEditData(null);
    };

    const existingDates = weighIns.map(w => w.date);

    return (
        <>
            <div className="animate-fade-in delay-500 hover-lift" style={{
                background: 'var(--bg-card)',
                padding: '7px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                position: 'relative'
            }}>
                {/* Visual Accent */}
                <div style={{
                    position: 'absolute',
                    top: '16px', bottom: '16px', left: '0',
                    width: '3px',
                    background: 'var(--accent-blue)',
                    borderRadius: '0 2px 2px 0'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '12px', marginBottom: '4px' }}>
                    <h4 style={{
                        margin: 0,
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--text-tertiary)'
                    }}>
                        Weigh-In History
                    </h4>
                    <button
                        onClick={handleAddClick}
                        style={{
                            background: 'rgba(255, 159, 10, 0.1)',
                            border: '1px solid rgba(255, 159, 10, 0.3)',
                            borderRadius: '6px',
                            color: 'var(--accent-orange)',
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            padding: '3px 8px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        + Add
                    </button>
                </div>

                {filteredWeighIns.length === 0 ? (
                    <div style={{
                        padding: '30px 20px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem'
                    }}>
                        No weigh-ins recorded for this period.
                    </div>
                ) : (
                    <div style={{ paddingLeft: '12px' }}>
                        <table className="weighin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Weight</th>
                                    <th>Δ Weight</th>
                                    <th>Body Fat</th>
                                    <th>Δ Body Fat</th>
                                    <th style={{ width: '28px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWeighIns.map((w) => (
                                    <tr key={w.date}>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                            {new Date(w.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                        </td>
                                        <td style={{ fontWeight: '600', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', fontSize: '12px' }}>
                                            {w.weight} kg
                                        </td>
                                        <td style={{
                                            color: getDeltaColor(w.weightDelta),
                                            fontWeight: '600',
                                            fontSize: '12px',
                                            opacity: w.weightDelta === null ? 0.4 : 1
                                        }}>
                                            {formatDelta(w.weightDelta, 'kg')}
                                        </td>
                                        <td style={{ fontWeight: '600', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', fontSize: '12px' }}>
                                            {w.bfDisplay}
                                        </td>
                                        <td style={{
                                            color: getDeltaColor(w.bfDelta),
                                            fontWeight: '600',
                                            fontSize: '12px',
                                            opacity: w.bfDelta === null ? 0.4 : 1
                                        }}>
                                            {formatDelta(w.bfDelta, '%')}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '4px 2px' }}>
                                            <button
                                                onClick={() => handleEditClick(w)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    fontSize: '11px',
                                                    padding: '2px 4px',
                                                    opacity: 0.4,
                                                    transition: 'opacity 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => e.target.style.opacity = '1'}
                                                onMouseLeave={(e) => e.target.style.opacity = '0.4'}
                                                title="Edit weigh-in"
                                            >
                                                ✏️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <WeighInModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditData(null); }}
                onSave={handleSave}
                editData={editData}
                existingDates={existingDates}
            />
        </>
    );
}

export default function BodyMetrics({ metrics = [], period, isExpert, weighIns = [], setWeighIns }) {
    // Data processing
    const data = useMemo(() => {
        return [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [metrics]);

    const latest = getLatestMetric(metrics);
    const first = getFirstMetric(metrics);

    // Calculate deltas
    const weightDelta = latest && first ? (latest.weight - first.weight).toFixed(1) : 0;
    const bfDelta = latest && first ? (latest.bf - first.bf).toFixed(1) : 0;

    // --- INSIGHTS LOGIC ---
    const insights = useMemo(() => {
        if (!data || data.length < 2) return [];
        const first = data[0];
        const last = data[data.length - 1];
        const mid = data[Math.floor(data.length / 2)];

        const res = [];

        // 1. Weight Trend
        const wDiff = last.weight - first.weight;
        if (wDiff > 1.0) res.push("Weight shows a clear upward trend across the period");
        else if (wDiff < -1.0) res.push("Weight trending downward, consistent with a deficit");
        else res.push("Weight remains relatively stable within maintenance range");

        // 2. BF Trend
        const bfDiff = last.bf - first.bf;
        if (bfDiff < -0.3 && wDiff >= -0.5) res.push("Positive signal: Body fat decreasing while weight is stable/up");
        else if (bfDiff < -0.3) res.push("Body fat percentage is trending downwards");
        else if (bfDiff > 0.5) res.push("Body fat showing a slight increase");
        else res.push("Body composition metrics remain stable");

        // 3. Volatility/Consistency
        res.push("Recent data points show consistent tracking frequency");

        return res;
    }, [data]);

    if (!data || data.length === 0) return <PremiumEmptyState message="No body metrics recorded" />;

    return (
        <div className="view-container animate-slide-up">
            <div style={{ marginBottom: '2px' }}>
                <PageHeader
                    title="Body Metrics"
                    subtitle="Weight and body fat trends"
                />
            </div>

            {/* KPI Cards */}
            <div className="dashboard-grid" style={{ marginBottom: '6px' }}>
                <div className="metric-card card-hover-effect transition-transform hover-lift">
                    <h3>Weight</h3>
                    <div className="metric-value">
                        {latest.weight}<span className="unit">kg</span>
                    </div>
                    <div className="metric-delta" style={{ color: 'var(--accent-orange)' }}>
                        {weightDelta > 0 ? '+' : ''}<AnimatedNumber value={parseFloat(weightDelta)} duration={800} />kg
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px', fontWeight: 'normal' }}>in period</span>
                    </div>
                </div>
                <div className="metric-card card-hover-effect transition-transform delay-100 hover-lift">
                    <h3>Body Fat</h3>
                    <div className="metric-value">
                        {latest.bf}<span className="unit">%</span>
                    </div>
                    <div className="metric-delta" style={{ color: 'var(--accent-orange)' }}>
                        {bfDelta > 0 ? '+' : ''}<AnimatedNumber value={parseFloat(bfDelta)} duration={800} />%
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px', fontWeight: 'normal' }}>in period</span>
                    </div>
                </div>
            </div>

            {/* Charts Row - Forced Side-by-Side on Desktop */}
            <style>{`
                .charts-row {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                @media (min-width: 1280px) {
                    .charts-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        align-items: start;
                    }
                }
                .bottom-insights-row {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                @media (min-width: 1280px) {
                    .bottom-insights-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        align-items: start;
                    }
                }
                .weighin-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }
                .weighin-table th {
                    text-align: left;
                    padding: 4px 6px;
                    color: var(--text-secondary);
                    font-family: var(--font-heading);
                    font-size: 0.6rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid var(--border-subtle);
                    background: var(--bg-card);
                }
                .weighin-table td {
                    padding: 2px 6px;
                    color: var(--text-primary);
                    border-bottom: 1px solid var(--border-subtle);
                    font-size: 11px;
                    font-family: var(--font-body);
                    vertical-align: middle;
                }
                .weighin-table tr:last-child td {
                    border-bottom: none;
                }
                .weighin-table tbody tr {
                    transition: background 0.15s ease;
                }
                .weighin-table tbody tr:hover {
                    background: var(--bg-card-elevated);
                }
                /* Compression Overrides */
                .metric-card h3 { margin-bottom: 2px !important; }
                .metric-value { line-height: 1.1; margin-bottom: 0px !important; }
                .metric-delta { margin-top: 0px !important; }
                .weighin-table td { padding: 1.5px 6px; line-height: 1.1; }
            `}</style>

            <div className="charts-row">
                {/* Weight Chart */}
                <div className="chart-container animate-slide-up delay-200 hover-lift" style={{ padding: '4px 12px 4px 0px' }}>
                    <h3 className="section-title">Weight Progression</h3>
                    <div style={{ width: '100%', height: '130px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    stroke="var(--text-secondary)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    stroke="var(--text-secondary)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    width={44}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="var(--accent-blue)"
                                    strokeWidth={3}
                                    dot={{ fill: 'var(--bg-card)', stroke: 'var(--accent-blue)', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    isAnimationActive={true}
                                    animationDuration={1500}
                                    animationEasing="ease-in-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* BF Chart */}
                <div className="chart-container animate-slide-up delay-300 hover-lift" style={{ padding: '4px 12px 4px 0px' }}>
                    <h3 className="section-title">Body Fat %</h3>
                    <div style={{ width: '100%', height: '130px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    stroke="var(--text-secondary)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[(min) => Math.floor(min), (max) => Math.ceil(max)]}
                                    tickCount={5}
                                    stroke="var(--text-secondary)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    width={44}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                <Line
                                    type="monotone"
                                    dataKey="bf"
                                    stroke="var(--accent-orange)"
                                    strokeWidth={3}
                                    dot={{ fill: 'var(--bg-card)', stroke: 'var(--accent-orange)', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    isAnimationActive={true}
                                    animationDuration={1500}
                                    animationEasing="ease-in-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM INSIGHTS ROW (2-column grid) --- */}
            <div className="bottom-insights-row" style={{ marginTop: '6px' }}>

                {/* --- ANALYTICAL INSIGHTS (Left Column) --- */}
                <div className="animate-fade-in delay-500 hover-lift" style={{
                    background: 'var(--bg-card)',
                    padding: '8px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    position: 'relative'
                }}>
                    {/* Visual Accent */}
                    <div style={{
                        position: 'absolute',
                        top: '16px', bottom: '16px', left: '0',
                        width: '3px',
                        background: 'var(--accent-orange)',
                        borderRadius: '0 2px 2px 0'
                    }} />

                    <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--text-tertiary)',
                        paddingLeft: '12px'
                    }}>
                        Analytical Summary
                    </h4>

                    <ul style={{
                        margin: 0,
                        paddingLeft: '12px',
                        listStyle: 'none'
                    }}>
                        {insights.map((insight, i) => (
                            <li key={i} style={{
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'baseline',
                                lineHeight: '1.3'
                            }}>
                                <div style={{
                                    width: '3px', height: '3px', borderRadius: '50%',
                                    background: 'var(--text-tertiary)',
                                    marginRight: '10px', flexShrink: 0,
                                    transform: 'translateY(-3px)'
                                }} />
                                <span style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-primary)',
                                    fontWeight: '500',
                                    lineHeight: '1.35',
                                    letterSpacing: '-0.01em'
                                }}>
                                    {insight}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* --- WEIGH-IN HISTORY (Right Column) --- */}
                <WeighInHistory period={period} weighIns={weighIns} setWeighIns={setWeighIns} />
            </div>
        </div>
    );
}
