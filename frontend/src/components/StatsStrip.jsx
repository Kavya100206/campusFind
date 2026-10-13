import React from 'react';

export default function StatsStrip({ stats, loading }) {
  const cards = [
    { label: 'Total', value: stats ? stats.total : 0, key: 'total' },
    { label: 'Lost', value: stats ? stats.lost : 0, key: 'lost' },
    { label: 'Found', value: stats ? stats.found : 0, key: 'found' },
    { label: 'Claimed', value: stats ? stats.claimed : 0, key: 'claimed' },
  ];

  return (
    <section className="stats-strip" aria-label="Global statistics">
      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.key} className="stat-card">
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">
              {loading && !stats ? '—' : card.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
