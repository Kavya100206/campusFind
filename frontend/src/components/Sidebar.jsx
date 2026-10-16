import React from 'react';

export default function Sidebar({
  selectedStatus,
  onStatusChange,
  stats,
  isSidebarOpen,
  onCloseSidebar,
}) {
  const navItems = [
    { id: 'ALL', label: 'All Items', count: stats ? stats.total : 0 },
    { id: 'LOST', label: 'Lost', count: stats ? stats.lost : 0 },
    { id: 'FOUND', label: 'Found', count: stats ? stats.found : 0 },
    { id: 'CLAIMED', label: 'Claimed', count: stats ? stats.claimed : 0 },
  ];

  return (
    <>
      {/* Mobile/Tablet backdrop when sidebar is toggled open */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isSidebarOpen ? 'app-sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="brand-name">Campus Find</span>
        </div>

        <nav className="sidebar-nav" aria-label="Status navigation">
          <div className="sidebar-section-title">Directory</div>
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
                >
                  <span className="sidebar-nav-label">{item.label}</span>
                  <span className="sidebar-nav-count">{item.count}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <span>Campus Find · {new Date().getFullYear()}</span>
        </div>
      </aside>
    </>
  );
}
