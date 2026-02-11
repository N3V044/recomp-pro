import React, { useState, useEffect, useMemo } from 'react';
import { getMuscleAnalysis } from '../domain/selectors/load';
import PremiumEmptyState from '../components/PremiumEmptyState';

import PageHeader from '../components/PageHeader';

export default function Goals({ goals, currentProgress, setCurrentProgress, period, workouts = [] }) {
    const [activeTab, setActiveTab] = useState('chest');
    const [modalGoal, setModalGoal] = useState(null);
    const [newValue, setNewValue] = useState('');

    // Exercise order, visibility, and achievement management
    const [exerciseOrder, setExerciseOrder] = useState({});
    const [hiddenExercises, setHiddenExercises] = useState({});
    const [achievedExercises, setAchievedExercises] = useState({});

    // Saved state for revert functionality
    const [savedOrder, setSavedOrder] = useState({});
    const [savedHidden, setSavedHidden] = useState({});
    const [savedAchieved, setSavedAchieved] = useState({});
    const [savedTargets, setSavedTargets] = useState({});

    // Inline editing for Targets
    const [customTargets, setCustomTargets] = useState({});
    const [editingTarget, setEditingTarget] = useState(null); // { exercise, value }

    // Tooltip state
    const [hoveredMuscle, setHoveredMuscle] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'triceps', 'biceps'];

    // Compute muscle stats from workouts
    const muscleStats = useMemo(() => getMuscleAnalysis(workouts), [workouts]);

    // Load preferences from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('recompPro.goals.v2');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setExerciseOrder(parsed.order || {});
                setHiddenExercises(parsed.hidden || {});
                setAchievedExercises(parsed.achieved || {});
                setCustomTargets(parsed.targets || {});
                setSavedOrder(parsed.order || {});
                setSavedHidden(parsed.hidden || {});
                setSavedAchieved(parsed.achieved || {});
                setSavedTargets(parsed.targets || {});
            } catch (e) {
                console.error('Failed to load goals preferences:', e);
            }
        }
    }, []);

    // Check if there are unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        const orderChanged = JSON.stringify(exerciseOrder) !== JSON.stringify(savedOrder);
        const hiddenChanged = JSON.stringify(hiddenExercises) !== JSON.stringify(savedHidden);
        const achievedChanged = JSON.stringify(achievedExercises) !== JSON.stringify(savedAchieved);
        const targetsChanged = JSON.stringify(customTargets) !== JSON.stringify(savedTargets);
        return orderChanged || hiddenChanged || achievedChanged || targetsChanged;
    }, [exerciseOrder, savedOrder, hiddenExercises, savedHidden, achievedExercises, savedAchieved, customTargets, savedTargets]);

    const getLatestProgress = (exercise) => {
        const updates = currentProgress.filter(p => p.exercise === exercise);
        if (updates.length > 0) {
            updates.sort((a, b) => new Date(b.date) - new Date(a.date));
            return updates[0].value;
        }
        return null;
    };

    const handleOpenModal = (goal) => {
        setModalGoal(goal);
        const current = getLatestProgress(goal.exercise) || goal.current;
        setNewValue(current);
    };

    const handleSave = () => {
        if (!newValue.trim()) return;

        const record = {
            date: new Date().toISOString(),
            exercise: modalGoal.exercise,
            value: newValue
        };

        setCurrentProgress([...currentProgress, record]);
        setModalGoal(null);
        setNewValue('');
    };

    // Get ordered and filtered exercises for current tab
    const getDisplayedExercises = () => {
        if (!goals[activeTab]) return [];

        const exercises = [...goals[activeTab]];
        const hidden = hiddenExercises[activeTab] || [];

        // Filter out hidden exercises
        const visible = exercises.filter(ex => !hidden.includes(ex.exercise));

        // Apply custom order if exists
        const order = exerciseOrder[activeTab];
        if (order) {
            visible.sort((a, b) => {
                const indexA = order.indexOf(a.exercise);
                const indexB = order.indexOf(b.exercise);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        }

        return visible;
    };

    // Move exercise up
    const moveUp = (exercise) => {
        const displayed = getDisplayedExercises();
        const index = displayed.findIndex(ex => ex.exercise === exercise);
        if (index <= 0) return;

        const newOrder = displayed.map(ex => ex.exercise);
        [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];

        setExerciseOrder({ ...exerciseOrder, [activeTab]: newOrder });
    };

    // Move exercise down
    const moveDown = (exercise) => {
        const displayed = getDisplayedExercises();
        const index = displayed.findIndex(ex => ex.exercise === exercise);
        if (index === -1 || index >= displayed.length - 1) return;

        const newOrder = displayed.map(ex => ex.exercise);
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

        setExerciseOrder({ ...exerciseOrder, [activeTab]: newOrder });
    };

    // Remove (hide) exercise
    const removeExercise = (exercise) => {
        const current = hiddenExercises[activeTab] || [];
        setHiddenExercises({ ...hiddenExercises, [activeTab]: [...current, exercise] });
    };

    // Toggle achievement status
    const toggleAchieved = (exercise) => {
        const current = achievedExercises[activeTab] || [];
        const isAchieved = current.includes(exercise);

        if (isAchieved) {
            // Remove from achieved
            setAchievedExercises({
                ...achievedExercises,
                [activeTab]: current.filter(ex => ex !== exercise)
            });
        } else {
            // Add to achieved
            setAchievedExercises({
                ...achievedExercises,
                [activeTab]: [...current, exercise]
            });
        }
    };

    // Check if exercise is achieved
    const isAchieved = (exercise) => {
        const current = achievedExercises[activeTab] || [];
        return current.includes(exercise);
    };

    // Save changes to localStorage
    const saveChanges = () => {
        const dataToSave = {
            order: exerciseOrder,
            hidden: hiddenExercises,
            achieved: achievedExercises,
            targets: customTargets
        };
        localStorage.setItem('recompPro.goals.v2', JSON.stringify(dataToSave));
        setSavedOrder(exerciseOrder);
        setSavedHidden(hiddenExercises);
        setSavedAchieved(achievedExercises);
        setSavedTargets(customTargets);

        // Show success feedback
        const btn = document.querySelector('.save-btn');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✓ Saved';
            setTimeout(() => btn.textContent = originalText, 1500);
        }
    };

    // Discard changes (revert to last saved)
    const discardChanges = () => {
        setExerciseOrder({ ...savedOrder });
        setHiddenExercises({ ...savedHidden });
        setAchievedExercises({ ...savedAchieved });
        setCustomTargets({ ...savedTargets });
    };

    // Reset to defaults (restore all)
    const restoreAll = () => {
        const newHidden = { ...hiddenExercises };
        delete newHidden[activeTab];
        setHiddenExercises(newHidden);

        const newOrder = { ...exerciseOrder };
        delete newOrder[activeTab];
        setExerciseOrder(newOrder);

        const newTargets = { ...customTargets };
        // We technically don't organize targets by tab in structure, but by exercise key.
        // So we filter out keys belonging to current tab exercises?
        // Simpler: Just don't reset targets on 'Reset Tab' or filter them.
        // Since targets are global per exercise, let's leave them or reset them if they map to displayed exercises.
        const exercisesInTab = goals[activeTab]?.map(g => g.exercise) || [];
        exercisesInTab.forEach(ex => delete newTargets[ex]);
        setCustomTargets(newTargets);
    };

    // Handle muscle hover
    const handleMuscleHover = (muscle, event) => {
        if (event) {
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 8
            });
        }
        setHoveredMuscle(muscle);
    };

    const handleMuscleLeave = () => {
        setHoveredMuscle(null);
    };

    // Get muscle stats for tooltip
    const getMuscleTooltipData = (muscle) => {
        const normalized = muscle.charAt(0).toUpperCase() + muscle.slice(1);
        const stats = muscleStats[normalized] || { points: 0, sessions: 0 };
        return stats;
    };

    // --- INLINE EDIT HANDLERS ---
    const handleStartEdit = (exercise, currentValue) => {
        setEditingTarget({ exercise, value: currentValue });
    };

    const handleCancelEdit = () => {
        setEditingTarget(null);
    };

    const handleSaveTarget = () => {
        if (!editingTarget || !editingTarget.value.trim()) return; // Prevent empty save logic
        setCustomTargets({
            ...customTargets,
            [editingTarget.exercise]: editingTarget.value.trim()
        });
        setEditingTarget(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveTarget();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <div className="view-container">
            <div style={{ marginBottom: '6px' }}>
                <PageHeader
                    title="Goals Roadmap"
                    subtitle="Strength targets and progression"
                />
            </div>

            {/* TABS + CONTROLS */}
            <div className="premium-tabs" style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {muscleGroups.map(grp => {
                        const stats = getMuscleTooltipData(grp);
                        return (
                            <button
                                key={grp}
                                className={`premium-tab-btn ${activeTab === grp ? 'active' : ''}`}
                                onClick={() => setActiveTab(grp)}
                                onMouseEnter={(e) => handleMuscleHover(grp, e)}
                                onMouseLeave={handleMuscleLeave}
                                style={{ textTransform: 'capitalize', position: 'relative' }}
                            >
                                {grp}
                            </button>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {hasUnsavedChanges && (
                        <>
                            <button
                                onClick={discardChanges}
                                className="btn-secondary"
                                style={{
                                    fontSize: '0.7rem',
                                    padding: '4px 10px',
                                    opacity: 0.7
                                }}
                            >
                                Discard
                            </button>
                            <button
                                onClick={saveChanges}
                                className="save-btn btn-primary"
                                style={{
                                    fontSize: '0.7rem',
                                    padding: '4px 10px',
                                    background: 'var(--accent-orange)',
                                    border: '1px solid var(--accent-orange)'
                                }}
                            >
                                Save Changes
                            </button>
                        </>
                    )}
                    {(hiddenExercises[activeTab]?.length > 0 || exerciseOrder[activeTab]) && (
                        <button
                            onClick={restoreAll}
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
                        >
                            Reset Tab
                        </button>
                    )}
                </div>
            </div>

            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
                <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--accent-orange)',
                    marginBottom: '8px',
                    opacity: 0.8
                }}>
                    ● Unsaved changes
                </div>
            )}

            {/* Muscle Tooltip - Compact & Centered */}
            {hoveredMuscle && (
                <div style={{
                    position: 'fixed',
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    transform: 'translate(-50%, -100%)',
                    background: 'var(--bg-card-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                    zIndex: 10000,
                    pointerEvents: 'none',
                    animation: 'fadeSlideIn 0.15s ease',
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                        <span style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>
                            {getMuscleTooltipData(hoveredMuscle).points}
                        </span> pts
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>
                            {getMuscleTooltipData(hoveredMuscle).sessions}
                        </span> {getMuscleTooltipData(hoveredMuscle).sessions === 1 ? 'session' : 'sessions'}
                    </div>
                </div>
            )}

            {/* TABLE */}
            <div className="chart-container no-hover" style={{ padding: '0', overflow: 'hidden', marginTop: '0', border: 'none', outline: 'none', boxShadow: 'none' }}>
                <table className="premium-table" style={{ tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '24px', width: '18%' }}>Exercise</th>
                            <th style={{ width: '13%' }}>Starting PR</th>
                            <th style={{ width: '13%' }}>Target</th>
                            <th style={{ width: '42%' }}>Current Status</th>
                            <th style={{ width: '8%', textAlign: 'center' }}>Achieved</th>
                            <th style={{ width: '6%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {getDisplayedExercises().map((goal, idx) => {
                            const currentVal = getLatestProgress(goal.exercise) || goal.current;
                            const isUpdated = !!getLatestProgress(goal.exercise);
                            const displayed = getDisplayedExercises();
                            const isFirst = idx === 0;
                            const isLast = idx === displayed.length - 1;
                            const achieved = isAchieved(goal.exercise);
                            const displayTarget = customTargets[goal.exercise] || goal.target;
                            const isEditing = editingTarget?.exercise === goal.exercise;

                            return (
                                <tr key={goal.exercise} className="goal-row-interactive" style={{ cursor: 'default', opacity: achieved ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                    <td style={{ paddingLeft: '24px', paddingTop: '10px', paddingBottom: '10px', fontWeight: 'bold' }}>
                                        {goal.exercise}
                                        {goal.rank && (
                                            <span style={{
                                                fontSize: '0.75em',
                                                color: '#EF4444',
                                                fontWeight: 'normal',
                                                marginLeft: '8px',
                                                opacity: 0.9
                                            }}>
                                                #{goal.rank}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--accent-orange)', fontWeight: '600', paddingTop: '10px', paddingBottom: '10px', fontSize: '0.85rem' }}>{goal.current}</td>

                                    {/* TARGET CELL (Editable) */}
                                    <td
                                        style={{ fontWeight: '800', color: 'var(--accent-blue)', paddingTop: '10px', paddingBottom: '10px', fontSize: '0.85rem', cursor: 'text' }}
                                        onClick={() => !isEditing && handleStartEdit(goal.exercise, displayTarget)}
                                    >
                                        {isEditing ? (
                                            <input
                                                autoFocus
                                                value={editingTarget.value}
                                                onChange={(e) => setEditingTarget({ ...editingTarget, value: e.target.value })}
                                                onKeyDown={handleKeyDown}
                                                onBlur={handleCancelEdit}
                                                style={{
                                                    background: 'var(--bg-card-elevated)',
                                                    border: '1px solid var(--accent-blue)',
                                                    borderRadius: '4px',
                                                    color: 'var(--text-primary)',
                                                    padding: '2px 6px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '700',
                                                    width: '80px',
                                                    outline: 'none'
                                                }}
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '12px' }}>
                                                <span>{displayTarget}</span>
                                                <span style={{ fontSize: '0.7rem', opacity: 0.3, transition: 'opacity 0.2s' }} className="edit-pencil">✎</span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                                        <div style={{ fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                                            {goal.status}
                                        </div>
                                    </td>
                                    <td style={{ paddingTop: '10px', paddingBottom: '10px', textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={achieved}
                                            onChange={() => toggleAchieved(goal.exercise)}
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                cursor: 'pointer',
                                                accentColor: 'var(--accent-orange)'
                                            }}
                                            title="Mark as achieved"
                                        />
                                    </td>
                                    <td style={{ paddingTop: '10px', paddingBottom: '10px', textAlign: 'right', paddingRight: '12px' }}>
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <button
                                                onClick={() => moveUp(goal.exercise)}
                                                disabled={isFirst}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: isFirst ? 'rgba(255,255,255,0.2)' : 'var(--text-secondary)',
                                                    cursor: isFirst ? 'not-allowed' : 'pointer',
                                                    padding: '2px 4px',
                                                    fontSize: '0.7rem',
                                                    opacity: isFirst ? 0.3 : 0.6,
                                                    transition: 'opacity 0.2s'
                                                }}
                                                onMouseEnter={(e) => !isFirst && (e.target.style.opacity = '1')}
                                                onMouseLeave={(e) => !isFirst && (e.target.style.opacity = '0.6')}
                                                title="Move up"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                onClick={() => moveDown(goal.exercise)}
                                                disabled={isLast}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: isLast ? 'rgba(255,255,255,0.2)' : 'var(--text-secondary)',
                                                    cursor: isLast ? 'not-allowed' : 'pointer',
                                                    padding: '2px 4px',
                                                    fontSize: '0.7rem',
                                                    opacity: isLast ? 0.3 : 0.6,
                                                    transition: 'opacity 0.2s'
                                                }}
                                                onMouseEnter={(e) => !isLast && (e.target.style.opacity = '1')}
                                                onMouseLeave={(e) => !isLast && (e.target.style.opacity = '0.6')}
                                                title="Move down"
                                            >
                                                ▼
                                            </button>
                                            <button
                                                onClick={() => removeExercise(goal.exercise)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'rgba(255, 100, 100, 0.6)',
                                                    cursor: 'pointer',
                                                    padding: '2px 4px',
                                                    fontSize: '0.8rem',
                                                    opacity: 0.5,
                                                    transition: 'opacity 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.opacity = '1'}
                                                onMouseLeave={(e) => e.target.style.opacity = '0.5'}
                                                title="Remove exercise"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {getDisplayedExercises().length === 0 && (
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>No exercises to display. Click "Reset Tab" to restore.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {modalGoal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="dash-card" style={{ width: '90%', maxWidth: '400px', animation: 'scaleUp 0.3s ease' }}>
                        <h3 className="section-title">Update Progress</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            {modalGoal.exercise}
                        </p>

                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Current Best
                        </label>
                        <input
                            type="text"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            className="premium-input"
                            style={{ marginBottom: '24px', fontSize: '1.1rem' }}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setModalGoal(null)}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary"
                                style={{ flex: 1 }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeSlideIn { from { opacity: 0; transform: translate(-50%, calc(-100% - 5px)); } to { opacity: 1; transform: translate(-50%, -100%); } }

                .goal-row-interactive {
                    transition: transform 180ms ease-out, box-shadow 180ms ease-out, border-color 180ms ease-out, background 180ms ease-out !important;
                    position: relative;
                }
                .goal-row-interactive:hover {
                    transform: translateY(-2px) scale(1.01);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    border-color: rgba(255,255,255,0.2) !important;
                    background: var(--bg-card-elevated) !important;
                    z-index: 2;
                }
                /* Ensure children don't scale themselves and break layout */
                .goal-row-interactive td {
                    transition: border-color 180ms ease-out;
                }
                .goal-row-interactive:hover td {
                    border-bottom-color: transparent;
                }
            `}</style>
        </div>
    );
}
