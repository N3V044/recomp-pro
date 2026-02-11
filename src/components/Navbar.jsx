import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Overview' },
    { id: 'load', label: 'Training Load' },
    { id: 'compare', label: 'Period Comparison' },
    { id: 'body', label: 'Body Metrics' },
    { id: 'goals', label: 'Goals' },
    { id: 'top25', label: 'Top 25' },
    { id: 'edit', label: 'Edit / Data' }
  ];

  return (
    <nav className="main-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

