import React from 'react';
import { CATEGORY_LABELS } from '../api/client';

export default function FilterBar({
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  stats,
}) {
  const statusTabs = [
    { id: 'ALL', label: 'All', count: stats ? stats.total : 0 },
    { id: 'LOST', label: 'Lost', count: stats ? stats.lost : 0 },
    { id: 'FOUND', label: 'Found', count: stats ? stats.found : 0 },
    { id: 'CLAIMED', label: 'Claimed', count: stats ? stats.claimed : 0 },
  ];

  return (
    <div className="filter-bar" role="search" aria-label="Item filters">
      {/* Horizontally scrollable pill row for status filters on mobile & tablet */}
      <div className="mobile-pill-row" role="tablist" aria-label="Status filters">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`pill-btn ${isActive ? 'pill-btn--active' : ''}`}
              onClick={() => onStatusChange(tab.id)}
              id={`tab-status-${tab.id.toLowerCase()}`}
            >
              <span>{tab.label}</span>
              <span className="pill-count">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Compact category filter without card wrapper */}
      <div className="category-filter-group">
        <label htmlFor="filter-category-select" className="filter-label">
          Category:
        </label>
        <select
          id="filter-category-select"
          className="select-category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {selectedCategory && (
          <button
            type="button"
            className="btn-clear-category"
            onClick={() => onCategoryChange('')}
            aria-label="Clear category filter"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
