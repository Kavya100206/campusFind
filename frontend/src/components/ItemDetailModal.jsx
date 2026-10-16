import React, { useState, useEffect, useRef } from 'react';
import StatusBadge from './StatusBadge';
import { CATEGORY_LABELS } from '../api/client';

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
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
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

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
      setIsDirty(false);
      setIsConfirmingDelete(false);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [item, isOpen]);

  // Focus trap and Esc key
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  function handleBackdropClick() {
    // Backdrop click closes only if form is untouched
    if (!isDirty && !isConfirmingDelete) {
      onClose();
    }
  }

  function handleChange(field, value) {
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

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

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onUpdate(item.id, formData);
  }

  // Format meta date: "Oct 15, 2026, 3:46 PM"
  const formattedFullDate = new Date(item.created_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="presentation">
      <div
        ref={modalRef}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-detail-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 id="modal-detail-title" className="modal-title">
              Edit item
            </h2>
            <span className="modal-item-id">#{item.id}</span>
            <StatusBadge status={formData.status} />
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="edit-title" className="form-label">
                Item title <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="edit-title"
                type="text"
                className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                aria-describedby={errors.title ? 'edit-title-error' : undefined}
                required
              />
              {errors.title && (
                <p id="edit-title-error" className="field-error" role="alert">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Category & Status 2-col Grid */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-category" className="form-label">
                  Category <span className="required-star" aria-hidden="true">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="edit-category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-status" className="form-label">
                  Status <span className="required-star" aria-hidden="true">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="edit-status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="LOST">Lost</option>
                    <option value="FOUND">Found</option>
                    <option value="CLAIMED">Claimed (Resolved)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="edit-location" className="form-label">
                Campus location <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                id="edit-location"
                type="text"
                className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                aria-describedby={errors.location ? 'edit-location-error' : undefined}
                required
              />
              {errors.location && (
                <p id="edit-location-error" className="field-error" role="alert">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="edit-description" className="form-label">
                Description <span className="helper-label">(Optional)</span>
              </label>
              <textarea
                id="edit-description"
                className="form-textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            {/* Meta Row */}
            <div className="modal-meta-row">
              <span>
                Reported by <strong className="reporter-name-meta">{item.reporter_name}</strong> · {formattedFullDate}
              </span>
            </div>
          </div>

          {/* Footer with Inline Delete Confirm */}
          <div className="modal-footer modal-footer--space-between">
            <div className="modal-footer-left">
              {!isConfirmingDelete ? (
                <button
                  type="button"
                  className="btn-text-delete"
                  onClick={() => setIsConfirmingDelete(true)}
                  id="btn-trigger-delete"
                >
                  Delete
                </button>
              ) : (
                <div className="inline-confirm-row">
                  <span className="inline-confirm-text">Delete this item?</span>
                  <button
                    type="button"
                    className="btn-inline-cancel"
                    onClick={() => setIsConfirmingDelete(false)}
                  >
                    Cancel
                  </button>
                  <span className="inline-confirm-separator" aria-hidden="true">|</span>
                  <button
                    type="button"
                    className="btn-inline-delete"
                    onClick={() => onDelete(item.id)}
                    disabled={isSubmitting}
                    id="btn-confirm-delete"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="modal-actions-right">
              <button
                type="button"
                className="btn btn-ghost"
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
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
