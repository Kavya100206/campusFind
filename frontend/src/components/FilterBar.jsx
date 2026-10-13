import React, { useState, useEffect } from 'react';
import { CATEGORY_LABELS } from '../api/client';

export default function FilterBar({
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
}) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // 300ms debounce for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Sync if parent clears search externally
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const statusTabs = [
    { id: 'ALL', label: 'All' },
    { id: 'LOST', label: 'Lost' },
    { id: 'FOUND', label: 'Found' },
    { id: 'CLAIMED', label: 'Claimed' },
  ];

  return (
    <div className="filter-bar" role="search" aria-label="Item search and filters">
      <div className="filter-controls-top">
        <div className="status-tabs" role="tablist" aria-label="Filter items by status">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`tab-btn ${isActive ? 'tab-btn--active' : ''}`}
                onClick={() => onStatusChange(tab.id)}
                id={`tab-status-${tab.id.toLowerCase()}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="search-box">
          <label htmlFor="search-input" className="sr-only">
            Search items
          </label>
          <input
            id="search-input"
            type="search"
            className="input-search"
            placeholder="Search title, location, or details..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-controls-bottom">
        <div className="category-select-wrapper">
          <label htmlFor="category-select" className="filter-label">
            Category:
          </label>
          <select
            id="category-select"
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
        </div>
      </div>
    </div>
  );
}
