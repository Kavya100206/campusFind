import React from 'react';

export default function Sidebar({
  selectedStatus,
  onStatusChange,
  stats,
  isSidebarOpen,
  onCloseSidebar,
}) {
  const navItems = [
    {
      id: 'ALL',
      label: 'All items',
      count: stats ? stats.total : 0,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'LOST',
      label: 'Lost',
      count: stats ? stats.lost : 0,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
      ),
    },
    {
      id: 'FOUND',
      label: 'Found',
      count: stats ? stats.found : 0,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      id: 'CLAIMED',
      label: 'Claimed',
      count: stats ? stats.claimed : 0,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isSidebarOpen ? 'app-sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <span className="brand-name">Campus Find</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main directory navigation">
          <div className="sidebar-section-label">Directory</div>
          <div className="sidebar-nav-list" role="tablist">
            {navItems.map((item) => {
              const isActive = selectedStatus === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`}
                  onClick={() => {
                    onStatusChange(item.id);
                    if (onCloseSidebar) onCloseSidebar();
                  }}
                  id={`sidebar-nav-${item.id.toLowerCase()}`}
                  title={`${item.label} (${item.count})`}
                >
                  <span className="sidebar-item-content">
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span className="sidebar-nav-label">{item.label}</span>
                  </span>
                  <span className="sidebar-nav-count">{item.count}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">
            Lost something? Someone's probably holding it.
          </p>
        </div>
      </aside>
    </>
  );
}
