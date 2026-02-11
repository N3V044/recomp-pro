import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { PERIOD_LABELS } from '../domain/constants';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs'];

export default function EditData({
    onReset,
    onImport,
    onExport,
    currentProgress,
    setCurrentProgress,
    weighIns,
    setWeighIns,
    workouts = [],
    setWorkouts,
    periods,          // Passed from App.jsx
    onAddPeriod       // Function to add new period
}) {
    const [activeTab, setActiveTab] = useState('workouts');

    // --- WORKOUT STATE ---
    const [selectedMonth, setSelectedMonth] = useState('2026-01');
    const [editingId, setEditingId] = useState(null);

    const [wDate, setWDate] = useState('2026-01-01');
    const [wType, setWType] = useState('Strength');
    const [wNotes, setWNotes] = useState('');
    const [wLoads, setWLoads] = useState({
        Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Biceps: 0, Triceps: 0, Abs: 0
    });

    // --- ADD MONTH STATE ---
    const [isAddingMonth, setIsAddingMonth] = useState(false);
    const [newMonthYear, setNewMonthYear] = useState('2026');
    const [newMonthVal, setNewMonthVal] = useState('03');

    // --- WEIGH-IN STATE ---
    const [newWeight, setNewWeight] = useState('');
    const [newBF, setNewBF] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

    // Update form date when month changes
    useEffect(() => {
        setWDate(`${selectedMonth}-01`);
    }, [selectedMonth]);

    // Helper: Convert periods object to array for dropdown, excluding 'all'
    const currentPeriods = periods || PERIOD_LABELS;
    const availableMonths = Object.entries(currentPeriods)
        .filter(([key]) => key !== 'all')
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.value.localeCompare(b.value));

    // Dynamic month label for sub-header
    const selectedMonthLabel = currentPeriods[selectedMonth] || selectedMonth;

    // --- WORKOUT HANDLERS ---
    const handleSaveWorkout = () => {
        if (!wDate.startsWith(selectedMonth)) {
            alert(`Date must be in ${selectedMonth}`);
            return;
        }

        const newWorkout = {
            id: editingId || Date.now(),
            date: wDate,
            type: wType,
            note: wNotes,
            muscles: wType === 'Strength' ? wLoads : undefined,
            points: wType === 'Strength' ? Object.values(wLoads).reduce((a, b) => a + b, 0) : 1
        };

        let updated;
        if (editingId) {
            updated = workouts.map(w => w.id === editingId ? newWorkout : w);
            setEditingId(null);
        } else {
            updated = [...workouts, newWorkout];
        }

        updated.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (setWorkouts) setWorkouts(updated);

        setWNotes('');
        setWLoads({ Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Biceps: 0, Triceps: 0, Abs: 0 });
    };

    const handleEditWorkout = (workout) => {
        setEditingId(workout.id);
        setWDate(workout.date);
        setWType(workout.type);
        setWNotes(workout.note || '');
        if (workout.muscles) {
            setWLoads(workout.muscles);
        } else {
            setWLoads({ Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Biceps: 0, Triceps: 0, Abs: 0 });
        }
        const m = workout.date.substring(0, 7);
        setSelectedMonth(m);
    };

    const handleDeleteWorkout = (id) => {
        if (!window.confirm('Delete this workout?')) return;
        if (setWorkouts) setWorkouts(workouts.filter(w => w.id !== id));
    };

    const monthWorkouts = workouts.filter(w => w.date.startsWith(selectedMonth));

    // --- ADD MONTH HANDLERS ---
    const handleCreateMonth = () => {
        const key = `${newMonthYear}-${newMonthVal}`;
        const dateObj = new Date(parseInt(newMonthYear), parseInt(newMonthVal) - 1);
        const label = dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' });

        if (periods[key]) {
            alert('Month already exists!');
            return;
        }

        if (onAddPeriod) {
            onAddPeriod(key, label);
            setIsAddingMonth(false);
            setSelectedMonth(key); // Auto-select new month
        }
    };

    // --- GENERIC HANDLERS ---
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target.result);
                onImport(json);
            } catch (err) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const handleAddWeighIn = () => {
        if (!newWeight || !newDate) return;
        const record = { date: newDate, weight: parseFloat(newWeight), bf: newBF ? parseFloat(newBF) : null, note: 'Manual Entry' };
        setWeighIns([...weighIns, record].sort((a, b) => new Date(a.date) - new Date(b.date)));
        setNewWeight(''); setNewBF('');
    };

    const handleDeleteWeighIn = (index) => setWeighIns(weighIns.filter((_, i) => i !== index));
    const handleDeleteProgress = (index) => setCurrentProgress(currentProgress.filter((_, i) => i !== index));

    // --- SCOPED STYLES ---
    const scopedStyles = `
        .edit-data-tabs .premium-tab-btn {
            padding: 3px 14px;
            position: relative;
        }
        .edit-data-tabs .premium-tab-btn.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 20%;
            right: 20%;
            height: 2px;
            background: var(--accent-blue);
            border-radius: 2px;
        }

        /* Muscle selector visual feedback */
        .muscle-selector-active {
            background: rgba(59, 130, 246, 0.08) !important;
            border: 1px solid rgba(59, 130, 246, 0.15);
        }
        .muscle-selector-max {
            background: rgba(59, 130, 246, 0.12) !important;
            border: 1px solid rgba(59, 130, 246, 0.3) !important;
        }

        /* Save button hover glow */
        .edit-save-btn:hover {
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
        }

        /* Mobile overrides */
        @media (max-width: 768px) {
            .edit-form-grid {
                grid-template-columns: 1fr !important;
            }
            .edit-form-grid .notes-field {
                grid-column: span 1 !important;
            }
            .edit-new-workout {
                padding: 10px 12px !important;
            }
            .muscle-grid {
                grid-template-columns: repeat(4, 1fr) !important;
            }
            .edit-save-row .btn-primary {
                width: 100%;
            }
        }

        /* FIXED HOVER INTERACTION */
        /* Base card style (copied from dash-card) but WITHOUT hover transform */
        .edit-card-base {
            background: var(--bg-card);
            border-radius: 12px;
            border: 1px solid var(--border-subtle);
            padding: 16px;
            transition: transform 180ms ease-out, box-shadow 180ms ease-out, border-color 180ms ease-out, filter 180ms ease-out;
        }

        /* Explicit independent hover */
        .edit-card-hover:hover {
            transform: translateY(-2px) scale(1.005) !important;
            box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.4) !important;
            border-color: rgba(255, 255, 255, 0.15) !important;
            filter: brightness(1.02) !important;
            z-index: 10 !important;
        }
    `;


    return (
        <div className="view-container">
            <style>{scopedStyles}</style>
            <PageHeader
                title="Edit / Data"
                subtitle="Raw data control"
            />

            {/* Tabs with blue active underline */}
            <div className="premium-tabs edit-data-tabs">
                <button className={`premium-tab-btn ${activeTab === 'workouts' ? 'active' : ''}`} onClick={() => setActiveTab('workouts')}>Workouts</button>
                <button className={`premium-tab-btn ${activeTab === 'weighins' ? 'active' : ''}`} onClick={() => setActiveTab('weighins')}>Weigh-Ins</button>
                <button className={`premium-tab-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>Progress Logs</button>
                <button className={`premium-tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>System</button>
            </div>

            {/* --- WORKOUTS TAB --- */}
            {activeTab === 'workouts' && (
                <div className="animate-fade-in no-hover">

                    {/* ── STEP 1: Month Selector ── */}
                    <div className="edit-card-base edit-card-hover" style={{
                        marginBottom: '0',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
                        padding: '10px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '12px 12px 0 0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>Editing Month:</span>
                            <div style={{ maxWidth: '200px', flex: 1 }}>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="premium-input"
                                >
                                    {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsAddingMonth(true)}
                            className="btn-secondary"
                            style={{ gap: '6px' }}
                        >
                            <span>+ Add Month</span>
                        </button>
                    </div>

                    {/* ADD MONTH MODAL / PANEL */}
                    {isAddingMonth && (
                        <div className="edit-card-base edit-card-hover" style={{ marginBottom: '12px', border: '1px solid var(--accent-orange)', background: 'rgba(255, 159, 10, 0.05)' }}>
                            <h4 className="section-title" style={{ color: 'var(--accent-orange)', borderBottom: 'none', margin: '0 0 8px 0' }}>Create New Month</h4>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ width: '100px' }}>
                                    <select
                                        value={newMonthYear}
                                        onChange={(e) => setNewMonthYear(e.target.value)}
                                        className="premium-input"
                                    >
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                        <option value="2027">2027</option>
                                    </select>
                                </div>
                                <div style={{ width: '150px' }}>
                                    <select
                                        value={newMonthVal}
                                        onChange={(e) => setNewMonthVal(e.target.value)}
                                        className="premium-input"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => {
                                            const val = (i + 1).toString().padStart(2, '0');
                                            const name = new Date(2000, i).toLocaleString('en-US', { month: 'long' });
                                            return <option key={val} value={val}>{val} - {name}</option>
                                        })}
                                    </select>
                                </div>
                                <button onClick={handleCreateMonth} className="btn-primary">Create</button>
                                <button onClick={() => setIsAddingMonth(false)} className="btn-secondary">Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: New Workout (Primary Action Module) ── */}
                    <div className="edit-card-base edit-card-hover edit-new-workout" style={{
                        marginTop: '14px',
                        marginBottom: '14px',
                        border: '1px solid var(--accent-blue)',
                        padding: '14px 16px'
                    }}>
                        <h3 className="section-title" style={{ color: 'var(--accent-blue)', borderBottom: 'none', marginBottom: '2px' }}>
                            {editingId ? 'Edit Workout' : 'New Workout'}
                        </h3>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: 'var(--text-tertiary)', letterSpacing: '0.2px' }}>
                            {editingId ? `Editing session in ${selectedMonthLabel}` : `Add a new session to ${selectedMonthLabel}`}
                        </p>

                        {/* Form Grid – 3-col on web, stacked on mobile */}
                        <div className="edit-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Date</label>
                                <input type="date" value={wDate} onChange={e => setWDate(e.target.value)} className="premium-input" style={{ height: '36px', textAlign: 'left' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Type</label>
                                <select value={wType} onChange={e => setWType(e.target.value)} className="premium-input" style={{ height: '36px' }}>
                                    <option value="Strength">Strength</option>
                                    <option value="Pilates">Pilates</option>
                                    <option value="Cardio">Cardio</option>
                                </select>
                            </div>
                            <div className="notes-field">
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Notes</label>
                                <input type="text" value={wNotes} onChange={e => setWNotes(e.target.value)} placeholder="Optional details..." className="premium-input" style={{ height: '36px' }} />
                            </div>
                        </div>

                        {/* Muscle Load Intensity */}
                        {wType === 'Strength' && (
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Muscle Load Intensity (0-3)</label>
                                <p style={{ margin: '0 0 10px 0', fontSize: '0.65rem', color: 'var(--text-tertiary)', opacity: 0.7 }}>
                                    0 = not trained &bull; 3 = primary focus
                                </p>
                                <div className="muscle-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                                    {MUSCLE_GROUPS.map(muscle => {
                                        const val = wLoads[muscle];
                                        const isActive = val > 0;
                                        const isMax = val === 3;
                                        return (
                                            <div key={muscle} className={isMax ? 'muscle-selector-max' : isActive ? 'muscle-selector-active' : ''} style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                background: isActive ? undefined : 'var(--bg-card)',
                                                padding: '8px 4px', borderRadius: '8px',
                                                border: isActive ? undefined : '1px solid transparent',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)', marginBottom: '6px', fontWeight: isActive ? '600' : '400', transition: 'color 0.2s ease' }}>{muscle}</span>
                                                <select
                                                    value={val}
                                                    onChange={e => setWLoads({ ...wLoads, [muscle]: parseInt(e.target.value) })}
                                                    className="premium-input"
                                                    style={{ textAlign: 'center', padding: '6px', color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)', fontWeight: 'bold', width: '100%' }}
                                                >
                                                    <option value="0">0</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="edit-save-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {editingId && <button onClick={() => { setEditingId(null); setWNotes(''); }} className="btn-secondary">Cancel</button>}
                            <button onClick={handleSaveWorkout} className="btn-primary edit-save-btn" style={{ transition: 'box-shadow 0.2s ease' }}>
                                {editingId ? 'Update Workout' : 'Save Workout'}
                            </button>
                        </div>
                    </div>

                    {/* ── STEP 3: Workout History ── */}
                    <div className="edit-card-base edit-card-hover">
                        <h3 className="section-title" style={{ fontSize: '1rem', borderBottom: 'none' }}>{periods ? periods[selectedMonth] : selectedMonth} Workouts ({monthWorkouts.length})</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                            {monthWorkouts.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '28px 20px' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.15 }}>🏋️</div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>No workouts recorded yet</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Start by adding your first session above.</div>
                                </div>
                            )}
                            {monthWorkouts.map(w => (
                                <div key={w.id} className="hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-card-elevated)', borderRadius: '12px', borderLeft: `4px solid ${w.type === 'Strength' ? 'var(--accent-blue)' : 'var(--accent-orange)'}` }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>{new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })} • {w.type}</div>
                                        {w.note && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{w.note}</div>}
                                        {w.type === 'Strength' && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Load Points: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{w.points}</span></div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleEditWorkout(w)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => handleDeleteWorkout(w.id)} className="btn-danger" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Del</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- SYSTEM TAB --- */}
            {activeTab === 'system' && (
                <div className="dash-card hover-lift">
                    <h3 className="section-title">System Actions</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Manage your data persistence.</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={onExport} className="btn-secondary">⬇ Export JSON</button>
                        <label className="btn-secondary" style={{ display: 'inline-block' }}>
                            ⬆ Import JSON
                            <input type="file" onChange={handleImport} accept=".json" style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                        <h3 className="section-title" style={{ color: 'var(--accent-red)', fontSize: '1rem', borderBottom: 'none' }}>Danger Zone</h3>
                        <button onClick={() => { if (window.confirm('Reset all data?')) onReset(); }} className="btn-danger">⚠ Reset to Seed Data</button>
                    </div>
                </div>
            )}

            {/* --- WEIGH-INS TAB --- */}
            {activeTab === 'weighins' && (
                <div className="animate-fade-in">
                    <div className="dash-card">
                        <h3 className="section-title">Weigh-Ins</h3>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'end' }}>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Date</label>
                                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="premium-input" style={{ textAlign: 'left' }} />
                            </div>
                            <div style={{ width: '120px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Weight (kg)</label>
                                <input type="number" placeholder="0.0" value={newWeight} onChange={e => setNewWeight(e.target.value)} className="premium-input" />
                            </div>
                            <div style={{ width: '100px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>BF %</label>
                                <input type="number" placeholder="%" value={newBF} onChange={e => setNewBF(e.target.value)} className="premium-input" />
                            </div>
                            <button onClick={handleAddWeighIn} className="btn-primary" style={{ height: '42px' }}>+ Add</button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Weight</th>
                                        <th>Body Fat</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weighIns.map((w, i) => (
                                        <tr key={i}>
                                            <td>{new Date(w.date).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: 'bold' }}>{w.weight}kg</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{w.bf ? `${w.bf}%` : '-'}</td>
                                            <td>
                                                <button onClick={() => handleDeleteWeighIn(i)} style={{ color: 'var(--accent-red)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PROGRESS TAB --- */}
            {activeTab === 'progress' && (
                <div className="animate-fade-in">
                    <div className="dash-card">
                        <h3 className="section-title">Progress Logs</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Exercise</th>
                                        <th>Value</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentProgress.map((p, i) => (
                                        <tr key={i}>
                                            <td>{new Date(p.date).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: 'bold' }}>{p.exercise}</td>
                                            <td>{p.value}</td>
                                            <td>
                                                <button onClick={() => handleDeleteProgress(i)} style={{ color: 'var(--accent-red)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentProgress.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No progress logs used yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
