import React from 'react';

export default function Sidebar({
  selectedStatus,
  onStatusChange,
  stats,
  isSidebarOpen,
  onCloseSidebar,
}) {
  const navItems = [
    { id: 'ALL', label: 'All items', count: stats ? stats.total : 0, icon: 'items' },
    { id: 'LOST', label: 'Lost', count: stats ? stats.lost : 0, icon: 'lost' },
    { id: 'FOUND', label: 'Found', count: stats ? stats.found : 0, icon: 'found' },
    { id: 'CLAIMED', label: 'Claimed', count: stats ? stats.claimed : 0, icon: 'claimed' },
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
                    <span className="sidebar-item-bullet" aria-hidden="true" />
                    <span className="sidebar-nav-label">{item.label}</span>
                  </span>
                  <span className="sidebar-nav-count">{item.count}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-footer-text">Campus Find · 2026</span>
        </div>
      </aside>
    </>
  );
}
