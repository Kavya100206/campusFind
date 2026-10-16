import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import ItemCard from './ItemCard';
import { CATEGORY_LABELS } from '../api/client';

export default function ItemTable({
  items,
  loading,
  totalItemsCount,
  onSelectItem,
  onOpenReport,
  onClearFilters,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  if (loading && items.length === 0) {
    return (
      <div className="item-table-card" aria-busy="true" aria-label="Loading items">
        <div className="skeleton-table">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  // Calm empty state (a): No items in database at all
  if (totalItemsCount === 0 && items.length === 0) {
    return (
      <div className="empty-state" role="region" aria-label="No items reported">
        <p className="empty-description">No items reported yet.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenReport}
          id="btn-empty-report"
        >
          Report an item
        </button>
      </div>
    );
  }

  // Calm empty state (b): Search or filter returned 0 results
  if (items.length === 0) {
    return (
      <div className="empty-state" role="region" aria-label="No matches found">
        <p className="empty-description">No matching items found for your selected filters.</p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClearFilters}
          id="btn-clear-filters"
        >
          Clear filters
        </button>
      </div>
    );
  }

  // Pagination calculation
  const totalPages = Math.ceil(items.length / PAGE_SIZE) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleItems = items.slice(startIndex, startIndex + PAGE_SIZE);
  const displayStart = items.length === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(startIndex + PAGE_SIZE, items.length);

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatRelativeDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 30) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'just now';
  }

  return (
    <div className="item-table-card">
      {/* Desktop Table View */}
      <div className="table-wrapper">
        <table className="items-table">
          <colgroup>
            <col className="col-status" style={{ width: '110px' }} />
            <col className="col-title" style={{ minWidth: '220px' }} />
            <col className="col-category" style={{ width: '110px' }} />
            <col className="col-location" style={{ width: '20%' }} />
            <col className="col-reporter" style={{ width: '160px' }} />
            <col className="col-date" style={{ width: '90px' }} />
            <col className="col-actions" style={{ width: '72px' }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="col-status">Status</th>
              <th scope="col" className="col-title">Title</th>
              <th scope="col" className="col-category">Category</th>
              <th scope="col" className="col-location">Location</th>
              <th scope="col" className="col-reporter">Reported by</th>
              <th scope="col" className="col-date">Date</th>
              <th scope="col" className="col-actions" style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
              const relativeDate = formatRelativeDate(item.created_at);
              const fullDate = new Date(item.created_at).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              const statusKey = (item.status || 'lost').toLowerCase();

              return (
                <tr
                  key={item.id}
                  className={`table-row table-row--${statusKey}`}
                  onClick={() => onSelectItem(item)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectItem(item);
                    }
                  }}
                  aria-label={`View ${item.title}`}
                >
                  <td className="cell-status col-status">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="cell-title col-title">
                    <span className="title-truncate" title={item.title}>
                      {item.title}
                    </span>
                  </td>
                  <td className="cell-category col-category">
                    {categoryLabel}
                  </td>
                  <td className="cell-location col-location">
                    <span className="location-truncate" title={item.location}>
                      {item.location}
                    </span>
                  </td>
                  <td className="cell-reporter col-reporter">
                    <div className="reporter-cell">
                      <span className="user-avatar" aria-hidden="true">
                        {getInitials(item.reporter_name)}
                      </span>
                      <span className="reporter-name" title={item.reporter_name}>
                        {item.reporter_name}
                      </span>
                    </div>
                  </td>
                  <td className="cell-date col-date">
                    <span title={fullDate}>{relativeDate}</span>
                  </td>
                  <td className="cell-actions col-actions" style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      id={`btn-view-${item.id}`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (< 640px) */}
      <div className="card-list-wrapper">
        {visibleItems.map((item) => (
          <ItemCard key={item.id} item={item} onSelectItem={onSelectItem} />
        ))}
      </div>

      {/* Fully Visible Pagination Footer */}
      <div className="table-pagination">
        <span className="pagination-text">
          {displayStart}–{displayEnd} of {items.length}
        </span>
        <div className="pagination-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            aria-label="Previous page"
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
