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

  const hasActiveFilters = selectedStatus !== 'ALL' || selectedCategory !== '';

  function handleClearAll() {
    onStatusChange('ALL');
    onCategoryChange('');
  }

  return (
    <div className="table-toolbar" role="search" aria-label="Item filters">
      {/* Primary Toolbar Row */}
      <div className="toolbar-controls-row">
        {/* Segmented Control */}
        <div className="segmented-control" role="tablist" aria-label="Filter items by status">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`segmented-btn ${isActive ? 'segmented-btn--active' : ''}`}
                onClick={() => onStatusChange(tab.id)}
                id={`tab-status-${tab.id.toLowerCase()}`}
              >
                <span>{tab.label}</span>
                <span className="segmented-count">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Category Select with Proper Label Spacing */}
        <div className="toolbar-category-select">
          <label htmlFor="filter-cat-select" className="category-label">
            Category
          </label>
          <div className="select-wrapper">
            <select
              id="filter-cat-select"
              className="toolbar-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="active-filters-row" aria-label="Active filters">
          <span className="active-filters-label">Filters:</span>
          {selectedStatus !== 'ALL' && (
            <span className="filter-chip">
              Status: <strong>{selectedStatus.toLowerCase()}</strong>
              <button
                type="button"
                className="chip-remove-btn"
                onClick={() => onStatusChange('ALL')}
                aria-label={`Remove status filter`}
              >
                &times;
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="filter-chip">
              Category: <strong>{CATEGORY_LABELS[selectedCategory] || selectedCategory}</strong>
              <button
                type="button"
                className="chip-remove-btn"
                onClick={() => onCategoryChange('')}
                aria-label="Remove category filter"
              >
                &times;
              </button>
            </span>
          )}
          <button
            type="button"
            className="btn-clear-all"
            onClick={handleClearAll}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
