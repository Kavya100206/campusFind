import React, { useState, useEffect } from 'react';

export default function Header({
  onOpenReport,
  reportButtonRef,
  searchTerm,
  onSearchChange,
  onToggleSidebar,
}) {
  const [localSearch, setLocalSearch] = useState(searchTerm || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          id="btn-sidebar-toggle"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="topbar-mobile-brand">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="topbar-brand-title">Campus Find</span>
        </div>

        <div className="topbar-search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <label htmlFor="topbar-search-input" className="sr-only">
            Search items
          </label>
          <input
            id="topbar-search-input"
            type="search"
            className="input-topbar-search"
            placeholder="Search items, locations..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="topbar-right">
        <button
          ref={reportButtonRef}
          type="button"
          className="btn btn-primary"
          onClick={onOpenReport}
          id="btn-report-item"
        >
          + Report an item
        </button>
      </div>
    </header>
  );
}
