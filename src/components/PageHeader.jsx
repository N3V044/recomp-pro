import React from 'react';

export default function PageHeader({ title, subtitle, rightSlot }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
                <h1 className="page-title" style={{ margin: 0 }}>{title}</h1>
                <p className="page-subtitle" style={{ margin: '8px 0 0 0' }}>{subtitle}</p>
            </div>
            {rightSlot && <div>{rightSlot}</div>}
        </div>
    );
}
