import React from 'react';

export default function PremiumEmptyState({
    icon = "📊",
    message = "No data available for this period",
    onBackToAll,
    onSwitchPeriod
}) {
    return (
        <div className="empty-state-container animate-fade-in animate-slide-up" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 16px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px dashed var(--border-subtle)',
            margin: '16px 0'
        }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.8 }}>
                {icon}
            </div>
            <h3 style={{
                margin: '0 0 8px 0',
                color: 'var(--text-primary)',
                fontSize: '1.2rem'
            }}>
                {message}
            </h3>
            <p style={{
                margin: '0 0 16px 0',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                maxWidth: '300px'
            }}>
                Try selecting a different time period to view historical data.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {onBackToAll && (
                    <button
                        onClick={onBackToAll}
                        className="btn-primary"
                        style={{ padding: '10px 20px' }}
                    >
                        Back to All Time
                    </button>
                )}

                {onSwitchPeriod && (
                    <button
                        onClick={onSwitchPeriod}
                        className="btn-secondary"
                        style={{ padding: '10px 20px' }}
                    >
                        Switch Period
                    </button>
                )}
            </div>
        </div>
    );
}
