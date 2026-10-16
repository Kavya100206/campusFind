import React from 'react';
import { CATEGORY_LABELS } from '../api/client';

export default function FilterBar({
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  itemsCount = 0,
}) {
  const hasActiveFilters = selectedStatus !== 'ALL' || selectedCategory !== '';
  const countLabel = itemsCount === 1 ? '1 item' : `${itemsCount} items`;

  function handleClearAll() {
    onStatusChange('ALL');
    onCategoryChange('');
  }

  const statusLabels = {
    LOST: 'Lost',
    FOUND: 'Found',
    CLAIMED: 'Claimed',
  };

  return (
    <div className="table-toolbar" role="search" aria-label="Item filters">
      {/* Primary Toolbar Row: Left = Result count, Right = Category select */}
      <div className="toolbar-controls-row">
        <div className="toolbar-result-count" aria-live="polite">
          <span className="result-count-text">{countLabel}</span>
        </div>

        {/* Category Select with 8px Gap */}
        <div className="toolbar-category-select">
          <label htmlFor="filter-cat-select" className="category-label">
            Category:
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

      {/* Removable Active Filter Chips + Clear All */}
      {hasActiveFilters && (
        <div className="active-filters-row" aria-label="Active filters">
          <span className="active-filters-label">Filters:</span>
          {selectedStatus !== 'ALL' && (
            <span className="filter-chip">
              Status: <strong>{statusLabels[selectedStatus] || selectedStatus}</strong>
              <button
                type="button"
                className="chip-remove-btn"
                onClick={() => onStatusChange('ALL')}
                aria-label="Remove status filter"
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
