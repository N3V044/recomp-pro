import React, { useState, useMemo } from 'react';
import { getMuscleAnalysis } from '../domain/selectors/load';
import PremiumEmptyState from '../components/PremiumEmptyState';
import { AnimatedNumber } from '../components/AnimatedNumber';


import PageHeader from '../components/PageHeader';

export default function LoadAnalysis({ logs = [], month, onPeriodChange, periods, isExpert }) {
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  // Manual Order State
  const DEFAULT_ORDER = ['Chest', 'Back', 'Legs', 'Shoulders', 'Triceps', 'Biceps', 'Abs'];
  const [muscleOrder, setMuscleOrder] = useState(DEFAULT_ORDER);
  const [savedOrder, setSavedOrder] = useState(DEFAULT_ORDER);

  // Load preferences
  React.useEffect(() => {
    const saved = localStorage.getItem('recompPro.trainingLoad.order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMuscleOrder(parsed);
        setSavedOrder(parsed);
      } catch (e) {
        console.error('Failed to load training load order:', e);
      }
    }
  }, []);

  // Check for changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(muscleOrder) !== JSON.stringify(savedOrder);
  }, [muscleOrder, savedOrder]);

  // Actions
  const moveUp = (muscle) => {
    const index = muscleOrder.indexOf(muscle);
    if (index <= 0) return;
    const newOrder = [...muscleOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setMuscleOrder(newOrder);
  };

  const moveDown = (muscle) => {
    const index = muscleOrder.indexOf(muscle);
    if (index === -1 || index >= muscleOrder.length - 1) return;
    const newOrder = [...muscleOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setMuscleOrder(newOrder);
  };

  const saveChanges = () => {
    localStorage.setItem('recompPro.trainingLoad.order', JSON.stringify(muscleOrder));
    setSavedOrder(muscleOrder);
    // Visual feedback
    const btn = document.querySelector('.save-btn-load');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓ Saved';
      setTimeout(() => btn.textContent = originalText, 1500);
    }
  };

  const discardChanges = () => {
    setMuscleOrder([...savedOrder]);
  };

  const restoreDefault = () => {
    setMuscleOrder(DEFAULT_ORDER);
  };

  // useMemo for analysis
  const analysis = useMemo(() => getMuscleAnalysis(logs), [logs]);
  const hasData = logs && logs.length > 0;

  if (!hasData) {
    return (
      <div className="view-container">
        <div className="animate-slide-up">
          <PageHeader
            title="Training Load Analysis"
            subtitle="Cumulative load by muscle group"
          />
        </div>
        {onPeriodChange && periods && (
          <div style={{ marginBottom: '16px' }}>
            <select
              value={month}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="premium-input"
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: '160px' }}
            >
              {Object.entries(periods).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="animate-fade-in">
          <PremiumEmptyState message="No training load data for this period" />
        </div>
      </div>
    );
  }

  const getIntensityStatus = (score) => {
    if (score >= 21) return { label: 'High', color: 'var(--accent-orange)', bg: 'rgba(249, 115, 22, 0.15)' };
    if (score >= 15) return { label: 'Optimal', color: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.15)' };
    if (score >= 10) return { label: 'Moderate', color: '#ffbd2e', bg: 'rgba(255, 189, 46, 0.1)' }; // Amber/Yellow
    return { label: 'Low', color: 'var(--text-secondary)', bg: 'rgba(255, 255, 255, 0.1)' };
  };

  // Sort based on manual order
  const muscleList = Object.entries(analysis).sort(([a], [b]) => {
    const indexA = muscleOrder.indexOf(a);
    const indexB = muscleOrder.indexOf(b);
    // If both found, sort by index. If not found (new/unknown), put at end.
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  return (
    <div className="view-container">
      <div className="animate-slide-up" style={{ marginBottom: '4px' }}>
        <PageHeader
          title="Training Load Analysis"
          subtitle="Cumulative load by muscle group"
        />
      </div>

      {/* CONTROLS BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
        {onPeriodChange && periods && (
          <select
            value={month}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="premium-input"
            style={{ padding: '6px 12px', fontSize: '0.85rem', width: '160px' }}
          >
            {Object.entries(periods).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
          {hasUnsavedChanges && (
            <>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-orange)', marginRight: '4px', opacity: 0.8 }}>● Unsaved order</span>
              <button
                onClick={discardChanges}
                className="btn-secondary"
                style={{ fontSize: '0.7rem', padding: '4px 10px', opacity: 0.7 }}
              >
                Discard
              </button>
              <button
                onClick={saveChanges}
                className="save-btn-load btn-primary"
                style={{
                  fontSize: '0.7rem',
                  padding: '4px 10px',
                  background: 'var(--accent-orange)',
                  border: '1px solid var(--accent-orange)'
                }}
              >
                Save Order
              </button>
            </>
          )}
          {/* Show Reset if order is different from default */}
          {JSON.stringify(muscleOrder) !== JSON.stringify(DEFAULT_ORDER) && (
            <button
              onClick={restoreDefault}
              style={{
                fontSize: '0.7rem',
                padding: '4px 10px',
                background: 'rgba(255, 159, 10, 0.1)',
                border: '1px solid rgba(255, 159, 10, 0.3)',
                borderRadius: '6px',
                color: 'var(--accent-orange)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: 0.6
              }}
              title="Reset to default order"
            >
              Reset Order
            </button>
          )}
        </div>
      </div>

      <div className="animate-slide-up delay-100 training-load-split" style={{ display: 'grid', gridTemplateColumns: '66% 1fr', gap: '16px', alignItems: 'stretch' }}>
        {/* LEFT: Table */}
        <div style={{ overflow: 'visible', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Muscle Group</th>
                <th style={{ textAlign: 'center' }}>Sessions</th>
                <th style={{ textAlign: 'center' }}>Total Points</th>
                <th style={{ textAlign: 'center' }}>Intensity</th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {muscleList.map(([muscle, data], index) => {
                const isHovered = hoveredMuscle === muscle;
                const status = getIntensityStatus(data.points);
                const rowKey = `${muscle}-${month || 'all'}`;
                const isFirst = index === 0;
                const isLast = index === muscleList.length - 1;

                return (
                  <tr
                    key={rowKey}
                    onMouseEnter={() => setHoveredMuscle(muscle)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                    className="muscle-row-interactive"
                    onClick={() => setHoveredMuscle(muscle)}
                    style={{
                      cursor: 'default'
                    }}
                  >
                    <td style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                      {muscle}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {data.sessions}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: '700', color: status.color, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                      <AnimatedNumber value={data.points} duration={800} />
                    </td>
                    <td style={{ textAlign: 'center', position: 'relative' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '100px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        letterSpacing: '0.3px',
                        background: status.bg,
                        color: status.color,
                        border: `1px solid ${status.color}40`
                      }}>
                        {status.label}
                      </span>

                      {/* PREMIUM HOVER TOOLTIP */}
                      <div style={{
                        position: 'absolute',
                        right: '100%',
                        marginRight: '16px',
                        top: isFirst ? '4px' : '50%',
                        transform: isFirst ? `scale(${isHovered ? 1 : 0.9})` : `translateY(-50%) scale(${isHovered ? 1 : 0.9})`,
                        opacity: isHovered ? 1 : 0,
                        visibility: isHovered ? 'visible' : 'hidden',
                        width: '280px',
                        background: 'var(--bg-card-elevated)',
                        border: '1px solid var(--border-highlight)',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        zIndex: 100,
                        pointerEvents: 'none',
                        transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                      }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                          Intensity Breakdown
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--accent-orange)', fontSize: '0.75rem', fontWeight: '600' }}>HIGH ({data.i3.length})</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {data.i3.length > 0 ? data.i3.map(id => (
                                <span key={id} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-orange)', borderRadius: '4px' }}>{id}</span>
                              )) : <span style={{ color: '#444', fontSize: '0.7rem' }}>—</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: '600' }}>MED ({data.i2.length})</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {data.i2.length > 0 ? data.i2.map(id => (
                                <span key={id} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '4px' }}>{id}</span>
                              )) : <span style={{ color: '#444', fontSize: '0.7rem' }}>—</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600' }}>LOW ({data.i1.length})</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {data.i1.length > 0 ? data.i1.map(id => (
                                <span key={id} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', borderRadius: '4px' }}>{id}</span>
                              )) : <span style={{ color: '#444', fontSize: '0.7rem' }}>—</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* REORDER CONTROLS */}
                    <td style={{ textAlign: 'right', paddingRight: '12px' }}>
                      <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end', opacity: isHovered ? 1 : 0.4, transition: 'opacity 0.2s' }}>
                        <button
                          onClick={() => moveUp(muscle)}
                          disabled={isFirst}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: isFirst ? 'rgba(255,255,255,0.1)' : 'var(--text-secondary)',
                            cursor: isFirst ? 'default' : 'pointer',
                            padding: '2px',
                            fontSize: '0.7rem',
                          }}
                          title="Move up"
                        >▲</button>
                        <button
                          onClick={() => moveDown(muscle)}
                          disabled={isLast}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: isLast ? 'rgba(255,255,255,0.1)' : 'var(--text-secondary)',
                            cursor: isLast ? 'default' : 'pointer',
                            padding: '2px',
                            fontSize: '0.7rem',
                          }}
                          title="Move down"
                        >▼</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* RIGHT: Muscle Load Analysis Chart (Vertical) */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <div style={{ width: '3px', height: '10px', background: 'var(--accent-blue)', borderRadius: '2px' }}></div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Muscle Load Analysis</div>
          </div>
          {(() => {
            const chartData = muscleList.map(([muscle, data]) => ({ muscle, points: data.points }));
            const maxPts = Math.max(...chartData.map(d => d.points), 1);
            return (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                paddingBottom: '2px',
                minHeight: '200px'
              }}>
                {chartData.map(({ muscle, points }) => (
                  <div
                    key={muscle}
                    onMouseEnter={() => setHoveredMuscle(muscle)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      width: '12%',
                      justifyContent: 'flex-end',
                      cursor: 'default'
                    }}
                  >
                    {/* Value */}
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      color: hoveredMuscle === muscle ? 'var(--accent-orange)' : 'var(--text-secondary)',
                      marginBottom: '4px',
                      transition: 'color 0.2s'
                    }}>
                      {points}
                    </div>
                    {/* Bar */}
                    <div style={{
                      width: '80%',
                      height: `${(points / maxPts) * 80}%`, // Leave space for text
                      background: hoveredMuscle === muscle ? 'var(--accent-orange)' : 'var(--accent-blue)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.3s ease',
                      boxShadow: hoveredMuscle === muscle ? '0 0 10px rgba(249, 115, 22, 0.3)' : 'none',
                      minHeight: '4px'
                    }} />
                    {/* Label */}
                    <div style={{
                      marginTop: '6px',
                      fontSize: '0.6rem',
                      fontWeight: '600',
                      color: hoveredMuscle === muscle ? 'var(--text-primary)' : 'var(--text-secondary)',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.2s',
                      transform: 'rotate(0deg)' // Adjust if needed
                    }}>
                      {muscle}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
      <style>{`
        .muscle-row-interactive {
            transition: transform 180ms ease-out, box-shadow 180ms ease-out, border-color 180ms ease-out, background 180ms ease-out !important;
            position: relative;
        }
        .muscle-row-interactive:hover {
            transform: translateY(-2px) scale(1.01);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border-color: rgba(255,255,255,0.2) !important;
            background: var(--bg-card-elevated) !important;
            z-index: 2;
        }
        .muscle-row-interactive td {
            transition: border-color 180ms ease-out;
        }
        .muscle-row-interactive:hover td {
            border-bottom-color: transparent;
        }
        @media (max-width: 768px) {
          .training-load-split {
            grid-template-columns: 1fr !important;
          }
          .training-load-split > div:first-child {
            order: 2;
          }
          .training-load-split > div:last-child {
            order: 1;
          }
        }
      `}</style>
    </div>
  );
}
