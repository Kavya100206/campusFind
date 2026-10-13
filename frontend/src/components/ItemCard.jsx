import React from 'react';
import StatusBadge from './StatusBadge';
import { CATEGORY_LABELS } from '../api/client';

export default function ItemCard({ item, onSelectItem }) {
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
  const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article
      className="item-card"
      onClick={() => onSelectItem(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectItem(item);
        }
      }}
      aria-label={`View details for ${item.title}`}
    >
      <div className="item-card-header">
        <StatusBadge status={item.status} />
        <span className="item-card-category">{categoryLabel}</span>
      </div>
      <h3 className="item-card-title">{item.title}</h3>
      <div className="item-card-meta">
        <span className="item-card-location">{item.location}</span>
        <span className="item-card-date">{formattedDate}</span>
      </div>
      <div className="item-card-footer">
        <span className="item-card-reporter">Reported by: {item.reporter_name}</span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item);
          }}
        >
          View
        </button>
      </div>
    </article>
  );
}
