import React from 'react';

export default function StatsStrip({ stats, loading }) {
  const total = stats ? stats.total : 0;
  const lost = stats ? stats.lost : 0;
  const found = stats ? stats.found : 0;
  const claimed = stats ? stats.claimed : 0;

  function calcPct(val) {
    if (!stats || total === 0) return '0%';
    return `${Math.round((val / total) * 100)}%`;
  }

  const cards = [
    { label: 'Total', value: total, subtext: null, key: 'total' },
    { label: 'Lost', value: lost, subtext: total > 0 ? `${calcPct(lost)} of total` : null, key: 'lost' },
    { label: 'Found', value: found, subtext: total > 0 ? `${calcPct(found)} of total` : null, key: 'found' },
    { label: 'Claimed', value: claimed, subtext: total > 0 ? `${calcPct(claimed)} of total` : null, key: 'claimed' },
  ];

  return (
    <section className="stats-strip" aria-label="Global statistics">
      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.key} className="stat-card">
            <span className="stat-label">{card.label}</span>
            <div className="stat-content">
              <span className="stat-value">
                {loading && !stats ? '—' : card.value}
              </span>
              {card.subtext && (
                <span className="stat-pct">{card.subtext}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
