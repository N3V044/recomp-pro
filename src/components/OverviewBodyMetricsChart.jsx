
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-card-elevated)',
                padding: '8px 12px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                fontSize: '0.75rem'
            }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {payload.map((entry, index) => (
                    <div key={index} style={{ color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>{entry.name === 'weight' ? 'Weight' : 'Body Fat'}:</span>
                        <span style={{ fontWeight: 'bold' }}>
                            {entry.value}{entry.name === 'weight' ? 'kg' : '%'}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const OverviewBodyMetricsChart = ({ data }) => {
    // 1. Handle Empty State
    if (!data || data.length === 0) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontStyle: 'italic',
                border: '1px dashed var(--border-subtle)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)'
            }}>
                No body metrics in this period
            </div>
        );
    }

    // 2. Prepare Data (Sort safety) and Sampling
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Sample Body Fat points (Max 4)
    const count = sortedData.length;
    let bfIndices = new Set();
    if (count <= 4) {
        for (let i = 0; i < count; i++) bfIndices.add(i);
    } else {
        bfIndices.add(0);
        bfIndices.add(Math.round((count - 1) / 3));
        bfIndices.add(Math.round((2 * (count - 1)) / 3));
        bfIndices.add(count - 1);
    }

    const processedData = sortedData.map((d, i) => ({
        ...d,
        bf: bfIndices.has(i) ? d.bf : null
    }));

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData} margin={{ top: 35, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => str ? new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        stroke="var(--text-tertiary)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        padding={{ left: 20, right: 20 }}
                    />
                    {/* Left Axis: Weight (Neutral) */}
                    <YAxis
                        yAxisId="left"
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => Math.round(val)}
                        stroke="var(--text-tertiary)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                        hide={false}
                    />
                    {/* Right Axis: Body Fat (Neutral) */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => Math.round(val)}
                        stroke="var(--text-tertiary)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />

                    {/* Lines */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--accent-blue)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--bg-card)', stroke: 'var(--accent-blue)', strokeWidth: 1.5 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={true}
                        animationDuration={1000}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="bf"
                        stroke="var(--accent-orange)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--bg-card)', stroke: 'var(--accent-orange)', strokeWidth: 1.5 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={true}
                        animationDuration={1000}
                        connectNulls={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OverviewBodyMetricsChart;
