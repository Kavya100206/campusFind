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
      <div className="table-container" aria-busy="true" aria-label="Loading items">
        <div className="skeleton-table">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state (a): No items in database at all
  if (totalItemsCount === 0 && items.length === 0) {
    return (
      <div className="empty-state" role="region" aria-label="No items reported">
        <h3 className="empty-title">No items reported yet</h3>
        <p className="empty-description">Be the first to log a lost or found item on campus.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenReport}
          id="btn-empty-report"
        >
          + Report an Item
        </button>
      </div>
    );
  }

  // Empty state (b): Search or filter returned 0 results
  if (items.length === 0) {
    return (
      <div className="empty-state" role="region" aria-label="No matches found">
        <h3 className="empty-title">No matching items found</h3>
        <p className="empty-description">Try clearing your filters or selecting the All tab.</p>
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

  const countText = items.length === 1 ? 'Showing 1 item' : `Showing ${items.length} items`;

  return (
    <div className="item-list-container">
      <div className="item-count-bar" aria-live="polite">
        <span>{countText}</span>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="table-wrapper">
        <table className="items-table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '110px' }}>Status</th>
              <th scope="col">Item Title</th>
              <th scope="col" style={{ width: '130px' }}>Category</th>
              <th scope="col">Campus Location</th>
              <th scope="col" className="col-reporter">Reported By</th>
              <th scope="col" style={{ width: '100px' }}>Date</th>
              <th scope="col" style={{ width: '90px', textAlign: 'right' }}>Actions</th>
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
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="cell-title font-medium">
                    {item.title}
                  </td>
                  <td className="cell-category">
                    {categoryLabel}
                  </td>
                  <td className="cell-location">
                    {item.location}
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
                      className="btn btn-secondary btn-sm"
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
