import React, { useState, useEffect, useRef } from 'react';
import StatusBadge from './StatusBadge';
import { CATEGORY_LABELS, STATUS_LABELS } from '../api/client';

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onUpdate,
  onOpenDelete,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: '',
    location: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        title: item.title || '',
        category: item.category || 'OTHER',
        status: item.status || 'LOST',
        location: item.location || '',
        description: item.description || '',
      });
      setErrors({});
    }
  }, [item, isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const isClaimed = item.status === 'CLAIMED';
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  const createdDate = new Date(item.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const updatedDate = item.updated_at
    ? new Date(item.updated_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  function validate() {
    const errs = {};
    if (!formData.title || formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }
    if (!formData.location || formData.location.trim().length < 2) {
      errs.location = 'Location must be at least 2 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;
    onUpdate(item.id, formData);
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-detail-title"
      >
        <div className="modal-header">
          <div className="detail-header-info">
            <StatusBadge status={item.status} />
            <span className="detail-header-id">#{item.id}</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        {isClaimed ? (
          /* Read-only view for CLAIMED items */
          <div className="modal-body">
            <h2 id="modal-detail-title" className="detail-view-title">
              {item.title}
            </h2>

            <div className="claimed-notice" role="note">
              This item has been returned and claimed. The record is preserved for history.
            </div>

            <dl className="detail-definition-list">
              <div className="detail-item">
                <dt>Category</dt>
                <dd>{categoryLabel}</dd>
              </div>
              <div className="detail-item">
                <dt>Campus Location</dt>
                <dd>{item.location}</dd>
              </div>
              <div className="detail-item">
                <dt>Reported By</dt>
                <dd>{item.reporter_name}</dd>
              </div>
              <div className="detail-item">
                <dt>Reported Date</dt>
                <dd>{createdDate}</dd>
              </div>
              {updatedDate && (
                <div className="detail-item">
                  <dt>Last Updated</dt>
                  <dd>{updatedDate}</dd>
                </div>
              )}
            </dl>

            {item.description && (
              <div className="detail-description-box">
                <h4 className="detail-desc-heading">Description</h4>
                <p className="detail-desc-text">{item.description}</p>
              </div>
            )}
          </div>
        ) : (
          /* Editable view for active items */
          <form onSubmit={handleSave} noValidate>
            <div className="modal-body">
              <h2 id="modal-detail-title" className="sr-only">
                Edit Item: {item.title}
              </h2>

              <div className="form-group">
                <label htmlFor="edit-title" className="form-label">
                  Item Title <span className="required-star">*</span>
                </label>
                <input
                  id="edit-title"
                  type="text"
                  className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  aria-describedby={errors.title ? 'edit-title-error' : undefined}
                  required
                />
                {errors.title && (
                  <p id="edit-title-error" className="field-error" role="alert">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-category" className="form-label">
                    Category
                  </label>
                  <select
                    id="edit-category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status" className="form-label">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="LOST">Lost</option>
                    <option value="FOUND">Found</option>
                    <option value="CLAIMED">Claimed (Resolved)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-location" className="form-label">
                  Campus Location <span className="required-star">*</span>
                </label>
                <input
                  id="edit-location"
                  type="text"
                  className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  aria-describedby={errors.location ? 'edit-location-error' : undefined}
                  required
                />
                {errors.location && (
                  <p id="edit-location-error" className="field-error" role="alert">
                    {errors.location}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="edit-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="metadata-strip">
                <span>Reported by: <strong>{item.reporter_name}</strong></span>
                <span>Date: {createdDate}</span>
              </div>
            </div>

            <div className="modal-footer modal-footer--space-between">
              <button
                type="button"
                className="btn btn-danger-outline"
                onClick={() => onOpenDelete(item)}
                id="btn-open-delete"
              >
                Delete Record
              </button>

              <div className="modal-actions-right">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  id="btn-save-changes"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {isClaimed && (
          <div className="modal-footer modal-footer--space-between">
            <button
              type="button"
              className="btn btn-danger-outline"
              onClick={() => onOpenDelete(item)}
              id="btn-open-delete-claimed"
            >
              Delete Record
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
