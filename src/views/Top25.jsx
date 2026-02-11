import React, { useState, useMemo } from 'react';
import { NIPPARD_TOP_25 } from '../data/data';

// --- STATIC ENHANCEMENTS (Focus & Equipment) ---
// Mapping based on exercise identity for the hover popover
const EXERCISE_DETAILS = {
    1: { focus: 'Leg Mass & Strength', equipment: 'Barbell / Safety Bar' },
    2: { focus: 'Vertical Pull', equipment: 'Bodyweight / Weighted' },
    3: { focus: 'Upper Chest', equipment: 'Barbell / Dumbbell' },
    4: { focus: 'Posterior Chain', equipment: 'Barbell' },
    5: { focus: 'Back Thickness', equipment: 'Machine / Landmine' },
    6: { focus: 'Side Delts', equipment: 'Cable' },
    7: { focus: 'Biceps Peak', equipment: 'EZ Bar / DB' },
    8: { focus: 'Triceps Long Head', equipment: 'Cable / DB' },
    9: { focus: 'Quad Isolation', equipment: 'Machine' },
    10: { focus: 'Hamstrings', equipment: 'Machine' },
    11: { focus: 'Pec Stretch', equipment: 'Cable' },
    12: { focus: 'Lats Width', equipment: 'Machine' },
    13: { focus: 'Chest Strength', equipment: 'Barbell' },
    14: { focus: 'Unilateral Legs', equipment: 'Dumbbell' },
    15: { focus: 'Rear Delts', equipment: 'Cable' },
    16: { focus: 'Chest & Triceps', equipment: 'Bodyweight / Weighted' },
    17: { focus: 'Vertical Push', equipment: 'Barbell' },
    18: { focus: 'Glutes', equipment: 'Barbell / Machine' },
    19: { focus: 'Leg Dynamics', equipment: 'Dumbbell' },
    20: { focus: 'Calves', equipment: 'Machine' },
    21: { focus: 'Triceps Mass', equipment: 'Barbell / EZ Bar' },
    22: { focus: 'Brachialis', equipment: 'Dumbbell' },
    23: { focus: 'Chest Detail', equipment: 'Cable' },
    24: { focus: 'Upper Traps', equipment: 'Dumbbell / Barbell' },
    25: { focus: 'Core Stability', equipment: 'Bodyweight' }
};

import PageHeader from '../components/PageHeader';

export default function Top25({ goals, currentProgress }) { // Props received from App
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [tierFilter, setTierFilter] = useState('All');
    const [bodyPartFilter, setBodyPartFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Rank'); // 'Rank' | 'BodyPart'

    // --- HELPERS ---
    const getMuscleTag = (exercise) => {
        const text = (exercise.name + ' ' + exercise.rationale).toLowerCase();
        if (text.includes('squat') || text.includes('leg') || text.includes('lunge') || text.includes('calf') || text.includes('hip') || text.includes('rdl') || text.includes('deadlift')) return 'Legs';
        if (text.includes('pull') || text.includes('row') || text.includes('chin') || text.includes('lat') || text.includes('shrug')) return 'Back';
        if (text.includes('chest') || text.includes('press') || text.includes('fly') || text.includes('dip')) return 'Chest'; // Dip can be tricep too but often chest
        if (text.includes('curl') || text.includes('bicep')) return 'Biceps';
        if (text.includes('tricep') || text.includes('skull') || text.includes('extension')) return 'Triceps';
        if (text.includes('raise') || text.includes('face') || text.includes('ohp') || text.includes('shoulder')) return 'Shoulders';
        if (text.includes('plank') || text.includes('abs')) return 'Core';
        return 'General';
    };

    // --- DERIVED DATA ---
    const exercisesWithMetadata = useMemo(() => {
        // Compute "Used in Logs" set
        const loggedSet = new Set();
        if (goals) {
            Object.values(goals).flat().forEach(g => loggedSet.add(g.exercise.toLowerCase()));
        }
        if (currentProgress) {
            currentProgress.forEach(p => loggedSet.add(p.exercise.toLowerCase()));
        }

        return NIPPARD_TOP_25.map(ex => {
            const bodyPart = getMuscleTag(ex);
            // Strict match check
            const isLogged = loggedSet.has(ex.name.toLowerCase());
            // Note: This is strict. "Squat Variations" won't match "Hack Squat". 
            // Per instructions: "Do NOT infer... Strict match only".

            return {
                ...ex,
                bodyPart,
                details: EXERCISE_DETAILS[ex.rank] || { focus: 'Strength', equipment: 'General' },
                isLogged
            };
        });
    }, [goals, currentProgress]);

    // --- FILTERING & SORTING ---
    const filteredAndSorted = useMemo(() => {
        let result = exercisesWithMetadata.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTier = tierFilter === 'All' || ex.tier === tierFilter;
            const matchesBodyPart = bodyPartFilter === 'All' || ex.bodyPart === bodyPartFilter;
            return matchesSearch && matchesTier && matchesBodyPart;
        });

        if (sortBy === 'Rank') {
            result.sort((a, b) => a.rank - b.rank);
        } else if (sortBy === 'BodyPart') {
            result.sort((a, b) => a.bodyPart.localeCompare(b.bodyPart));
        }

        return result;
    }, [exercisesWithMetadata, searchTerm, tierFilter, bodyPartFilter, sortBy]);

    // Unique Body Parts for Filter
    const availableBodyParts = useMemo(() => {
        const parts = new Set(exercisesWithMetadata.map(e => e.bodyPart));
        return ['All', ...Array.from(parts).sort()];
    }, [exercisesWithMetadata]);

    // --- COLORS ---
    const getTierColor = (tier) => {
        if (tier === 'S') return '#EF4444'; // Red
        if (tier === 'A') return '#F59E0B'; // Yellow / Gold
        return 'var(--text-secondary)';     // Support (Gray)
    };

    const getBodyPartColor = (bp) => {
        switch (bp) {
            case 'Legs': return '#859F3D';      // Olive / Khaki (Earth tone)
            case 'Back': return '#3B82F6';      // Blue
            case 'Chest': return '#F97316';     // Orange
            case 'Shoulders': return '#7E22CE'; // Dark Purple
            case 'Triceps': return '#4D7C0F';   // Dark Lime Green
            case 'Biceps': return '#BBF7D0';    // Very Light Green (True Green)
            case 'Core': return '#EC4899';      // Pink (Abs)
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div className="view-container">
            {/* --- HEADER --- */}
            <PageHeader
                title="Top 25"
                subtitle="Science-based exercise ranking"
            />
            {/* --- CONTROLS --- */}
            <div className="controls-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center', position: 'sticky', top: '0', zIndex: 30, background: 'var(--bg-app)', paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                {/* Search */}
                <div style={{ flex: '1 1 200px' }}>
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="premium-input"
                        style={{ width: '100%', padding: '4px 8px', fontSize: '0.8rem' }}
                    />
                </div>

                {/* Filters Group */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {/* Tier Filter */}
                    <select
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value)}
                        className="premium-input"
                        style={{ width: 'auto', minWidth: '90px', padding: '4px 20px 4px 8px', fontSize: '0.8rem' }}
                    >
                        <option value="All">All Tiers</option>
                        <option value="S">S Tier</option>
                        <option value="A">A Tier</option>
                        <option value="B">Support</option>
                    </select>

                    {/* Body Part Filter */}
                    <select
                        value={bodyPartFilter}
                        onChange={(e) => setBodyPartFilter(e.target.value)}
                        className="premium-input"
                        style={{ width: 'auto', minWidth: '110px', padding: '4px 20px 4px 8px', fontSize: '0.8rem' }}
                    >
                        {availableBodyParts.map(bp => (
                            <option key={bp} value={bp}>{bp === 'All' ? 'All Parts' : bp}</option>
                        ))}
                    </select>

                    {/* Sort */}
                    <button
                        className="btn-secondary"
                        onClick={() => setSortBy(prev => prev === 'Rank' ? 'BodyPart' : 'Rank')}
                        style={{ minWidth: '80px', padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                        Sort: {sortBy === 'BodyPart' ? 'Body Part' : 'Rank'}
                    </button>
                </div>
            </div>

            {/* --- GRID --- */}
            {filteredAndSorted.length > 0 ? (
                <>
                    {/* MAIN GRID: Ranks 1-15 */}
                    <div className="top25-grid-layout">
                        {filteredAndSorted.filter(ex => ex.rank <= 15).map(ex => (
                            <div key={ex.rank} className="exercise-card-premium hover-lift-subtle">
                                {/* RANK BADGE (Absolute Top Left) */}
                                <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontFamily: 'var(--font-heading)',
                                    zIndex: 1
                                }}>
                                    #{ex.rank}
                                </div>

                                {/* TIER BADGE (Absolute Top Right) */}
                                <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    right: '3px',
                                    fontSize: '0.6rem',
                                    fontWeight: '800',
                                    color: getTierColor(ex.tier),
                                    background: `${getTierColor(ex.tier)}15`,
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    border: `1px solid ${getTierColor(ex.tier)}`
                                }}>
                                    {ex.tier === 'B' ? 'Support' : `${ex.tier} Tier`}
                                </div>

                                {/* CARD CONTENT */}
                                <div style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '4px', paddingRight: '4px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                                    {/* CENTER STACK SUPER-WRAPPER (Strict Enforcement) */}
                                    <div style={{
                                        flex: 1,
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center'
                                    }}>
                                        {/* 1. Body Part Label */}
                                        <span style={{
                                            fontSize: '0.55rem',
                                            color: getBodyPartColor(ex.bodyPart),
                                            border: `1px solid ${getBodyPartColor(ex.bodyPart)}40`,
                                            padding: '1px 6px',
                                            borderRadius: '100px',
                                            textTransform: 'uppercase',
                                            fontWeight: '700',
                                            marginBottom: '3px',
                                            letterSpacing: '0.5px',
                                            display: 'inline-block'
                                        }}>
                                            {ex.bodyPart}
                                        </span>

                                        {/* 2. Exercise Name */}
                                        <h3 style={{
                                            fontSize: '0.85rem',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            lineHeight: '1.1',
                                            textAlign: 'center !important',
                                            width: '100% !important',
                                            margin: '0 !important',
                                            padding: '0 !important',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {ex.name}
                                        </h3>
                                    </div>

                                    {/* Used Badge (Centered at Bottom - Outside Stack) */}
                                    {[1, 2, 3, 4, 5, 8, 9, 10, 12, 13, 16, 19, 20, 25].includes(ex.rank) ? (
                                        <span style={{
                                            fontSize: '0.55rem',
                                            color: 'var(--text-secondary)',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            marginTop: '3px',
                                            opacity: 0.9,
                                            flexShrink: 0
                                        }}>
                                            <span>✓</span> In Plan
                                        </span>
                                    ) : (
                                        <div style={{ height: '12px', flexShrink: 0 }}></div>
                                    )}
                                </div>

                                {/* HOVER POPOVER */}
                                <div className="card-popover">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center', alignItems: 'center' }}>
                                        <div style={{ width: '100%' }}>
                                            <div className="popover-label">Focus</div>
                                            <div className="popover-value">{ex.details.focus}</div>
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <div className="popover-label">Equipment</div>
                                            <div className="popover-value">{ex.details.equipment}</div>
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <div className="popover-label">Why</div>
                                            <div className="popover-value" style={{ lineHeight: '1.2' }}>{ex.rationale}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* COMPACT ROW: Ranks 16-25 */}
                    <div className="top25-compact-row" style={{ marginTop: '10px', paddingBottom: '8px' }}>
                        {filteredAndSorted.filter(ex => ex.rank > 15).map(ex => (
                            <div key={ex.rank} className="exercise-card-premium hover-lift-subtle" style={{ height: '100%' }}>
                                {/* RANK BADGE (Absolute Top Left) - Smaller */}
                                <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: '3px',
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    color: 'rgba(255,255,255,0.6)',
                                    fontFamily: 'var(--font-heading)',
                                    zIndex: 1
                                }}>
                                    #{ex.rank}
                                </div>

                                {/* CARD CONTENT - Compact */}
                                <div style={{ paddingTop: '6px', paddingBottom: '6px', paddingLeft: '4px', paddingRight: '4px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                                    {/* CENTER STACK SUPER-WRAPPER */}
                                    <div style={{
                                        flex: 1,
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center'
                                    }}>
                                        {/* 1. Body Part Label - Simplified/Smaller */}
                                        <span style={{
                                            fontSize: '0.5rem',
                                            color: getBodyPartColor(ex.bodyPart),
                                            border: `1px solid ${getBodyPartColor(ex.bodyPart)}40`,
                                            padding: '1px 4px',
                                            borderRadius: '100px',
                                            textTransform: 'uppercase',
                                            fontWeight: '700',
                                            marginBottom: '2px',
                                            letterSpacing: '0.5px',
                                            display: 'inline-block',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '95%'
                                        }}>
                                            {ex.bodyPart}
                                        </span>

                                        {/* 2. Exercise Name - Smaller */}
                                        <h3 style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            lineHeight: '1.05',
                                            textAlign: 'center !important',
                                            width: '100% !important',
                                            margin: '0 !important',
                                            padding: '0 !important',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {ex.name}
                                        </h3>
                                    </div>

                                    {/* Used Badge (Matching Standard Style) */}
                                    {[1, 2, 3, 4, 5, 8, 9, 10, 12, 13, 16, 19, 20, 25].includes(ex.rank) ? (
                                        <span style={{
                                            fontSize: '0.55rem',
                                            color: 'var(--text-secondary)',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            marginTop: '3px',
                                            opacity: 0.9,
                                            flexShrink: 0
                                        }}>
                                            <span>✓</span> In Plan
                                        </span>
                                    ) : (
                                        <div style={{ height: '10px', flexShrink: 0 }}></div>
                                    )}
                                </div>

                                {/* HOVER POPOVER (Compact Text Version) */}
                                <div className="card-popover compact-tooltip">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center', alignItems: 'center' }}>
                                        <div style={{ width: '100%' }}>
                                            <div className="popover-label">Focus</div>
                                            <div className="popover-value">{ex.details.focus}</div>
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <div className="popover-label">Equipment</div>
                                            <div className="popover-value">{ex.details.equipment}</div>
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <div className="popover-label">Why</div>
                                            <div className="popover-value" style={{ lineHeight: '1.2' }}>{ex.rationale}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No exercises match your filters.
                </div>
            )}

            {/* --- STYLES --- */}
            <style>{`
                .top25-grid-layout {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 10px;
                }
                @media (min-width: 600px) {
                    .top25-grid-layout {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (min-width: 1024px) {
                    .top25-grid-layout {
                        grid-template-columns: repeat(5, 1fr);
                    }
                }

                /* NEW: Compact Row for Ranks 16-25 */
                .top25-compact-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr); /* Mobile fallback */
                    gap: 10px;
                }
                 @media (min-width: 768px) {
                    .top25-compact-row {
                        grid-template-columns: repeat(5, 1fr);
                    }
                }
                @media (min-width: 1200px) {
                    .top25-compact-row {
                        grid-template-columns: repeat(10, 1fr); /* STRICT 10 COLS */
                        gap: 16px; /* Matched gap */
                    }
                }

                /* Tooltip sizing overrides for Compact Row (Ranks 16-25) */
                .card-popover.compact-tooltip .popover-label {
                    font-size: 0.55rem; /* Reduced from 0.65rem */
                    letter-spacing: 0.5px;
                }
                .card-popover.compact-tooltip .popover-value {
                    font-size: 0.7rem; /* Reduced from 0.8rem */
                    line-height: 1.1;
                }

                .exercise-card-premium {
                    background: var(--bg-card);
                    border: 1px solid var(--border-subtle);
                    border-radius: 12px;
                    padding: 5px;
                    position: relative;
                    transition: all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
                    min-height: 75px;
                    cursor: default;
                    overflow: visible;
                }
                
                .hover-lift-subtle:hover {
                    transform: translateY(-2px);
                    border-color: var(--border-highlight);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
                    z-index: 100; /* Increased to beat sticky header (z-30) */
                }

                .card-popover {
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    right: 0;
                    background: var(--bg-card-elevated);
                    border: 1px solid var(--accent-orange);
                    border-left: 3px solid var(--accent-orange);
                    border-radius: 8px;
                    padding: 14px;
                    box-shadow: 0 -8px 30px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(8px);
                    transition: all 0.2s ease;
                    pointer-events: none;
                    z-index: 20;
                    margin-bottom: 10px;
                }

                .hover-lift-subtle:hover .card-popover {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .popover-label {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    color: var(--text-tertiary);
                    font-weight: 700;
                    margin-bottom: 3px;
                    letter-spacing: 0.8px;
                }
                .popover-value {
                    font-size: 0.8rem;
                    color: var(--text-primary);
                    font-weight: 500;
                    line-height: 1.3;
                }
            `}</style>
        </div>
    );
}
