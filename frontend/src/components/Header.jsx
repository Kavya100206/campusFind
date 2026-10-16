import React, { useState, useEffect, useRef } from 'react';

export default function Header({
  onOpenReport,
  reportButtonRef,
  searchTerm,
  onSearchChange,
  onToggleSidebar,
}) {
  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' focuses search input
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if (
        e.key === '/' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        document.activeElement.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        {/* Mobile/Tablet sidebar toggle */}
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation rail"
          id="btn-sidebar-toggle"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Mobile logo mark */}
        <div className="topbar-mobile-brand" aria-label="Campus Find">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span className="topbar-brand-text">Campus Find</span>
        </div>

        {/* Search input with / shortcut hint */}
        <div className="topbar-search-box">
          <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <label htmlFor="topbar-search-input" className="sr-only">
            Search items
          </label>
          <input
            ref={searchInputRef}
            id="topbar-search-input"
            type="search"
            className="input-topbar-search"
            placeholder="Search items or locations..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <kbd className="search-kbd" title="Press / to search">/</kbd>
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
          + Report item
        </button>
      </div>
    </header>
  );
}
