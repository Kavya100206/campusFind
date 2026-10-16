import React from 'react';

export default function RecentActivity({ items, onSelectItem }) {
  if (!items || items.length === 0) return null;

  // Take the 5 most recent items
  const recentItems = [...items]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  function formatRelative(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'just now';
  }

  return (
    <div className="recent-activity-card">
      <div className="activity-card-header">
        <span className="activity-card-title">Recent activity</span>
      </div>
      <div className="activity-list">
        {recentItems.map((item) => (
          <div
            key={item.id}
            className="activity-item"
            onClick={() => onSelectItem(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectItem(item);
              }
            }}
          >
            <div className="activity-item-left">
              <span className={`status-dot status-dot--${item.status.toLowerCase()}`} aria-hidden="true" />
              <span className="activity-item-title">{item.title}</span>
            </div>
            <span className="activity-item-time">{formatRelative(item.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
