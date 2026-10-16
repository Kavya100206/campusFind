import React from 'react';
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
  if (loading && items.length === 0) {
    return (
      <div className="item-list-container" aria-busy="true" aria-label="Loading items">
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
        <p className="empty-description">No items reported yet. Be the first to report a lost or found item.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenReport}
          id="btn-empty-report"
        >
          + Report an item
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
          className="btn btn-secondary"
          onClick={onClearFilters}
          id="btn-clear-filters"
        >
          Clear filters
        </button>
      </div>
    );
  }

  const countText = items.length === 1 ? '1 item' : `${items.length} items`;

  return (
    <div className="item-list-container">
      <div className="item-count-bar" aria-live="polite">
        <span>Showing {countText}</span>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="table-wrapper">
        <table className="items-table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '100px' }}>Status</th>
              <th scope="col">Item Title</th>
              <th scope="col" style={{ width: '120px' }}>Category</th>
              <th scope="col">Campus Location</th>
              <th scope="col" className="col-reporter">Reported By</th>
              <th scope="col" style={{ width: '90px' }}>Date</th>
              <th scope="col" style={{ width: '80px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
              const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <tr
                  key={item.id}
                  className="table-row"
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
                  <td className="cell-status">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="cell-title font-medium">
                    <span className="title-truncate" title={item.title}>
                      {item.title}
                    </span>
                  </td>
                  <td className="cell-category">
                    {categoryLabel}
                  </td>
                  <td className="cell-location">
                    <span className="location-truncate" title={item.location}>
                      {item.location}
                    </span>
                  </td>
                  <td className="cell-reporter col-reporter">
                    {item.reporter_name}
                  </td>
                  <td className="cell-date">
                    {formattedDate}
                  </td>
                  <td style={{ textAlign: 'right' }}>
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

      {/* Mobile Card List */}
      <div className="card-list-wrapper">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onSelectItem={onSelectItem} />
        ))}
      </div>
    </div>
  );
}
