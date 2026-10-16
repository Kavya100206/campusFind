import React, { useState, useEffect, useRef } from 'react';
import { CATEGORY_LABELS } from '../api/client';

export default function ItemFormModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'ELECTRONICS',
    status: 'LOST',
    location: '',
    reporter_name: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        category: 'ELECTRONICS',
        status: 'LOST',
        location: '',
        reporter_name: '',
        description: '',
      });
      setErrors({});
      setIsDirty(false);
      // Focus first field on open
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  function handleBackdropClick() {
    // Backdrop click closes only if form is untouched
    if (!isDirty) {
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
    } else if (formData.title.length > 120) {
      errs.title = 'Title cannot exceed 120 characters.';
    }

    if (!formData.location || formData.location.trim().length < 2) {
      errs.location = 'Location must be at least 2 characters.';
    }

    if (!formData.reporter_name || formData.reporter_name.trim().length < 2) {
      errs.reporter_name = 'Reporter name must be at least 2 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="presentation">
      <div
        ref={modalRef}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-report-title"
      >
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 id="modal-report-title" className="modal-title">
              Report an item
            </h2>
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Title Field */}
            <div className="form-group">
              <label htmlFor="item-title" className="form-label">
                Item title <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="item-title"
                type="text"
                className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                placeholder="e.g. Wireless Noise-cancelling Headphones"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                aria-describedby={errors.title ? 'title-error' : undefined}
                required
              />
              {errors.title && (
                <p id="title-error" className="field-error" role="alert">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Category and Status Grid */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item-category" className="form-label">
                  Category <span className="required-star" aria-hidden="true">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="item-category"
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
                <label htmlFor="item-status" className="form-label">
                  Status <span className="required-star" aria-hidden="true">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="item-status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="LOST">Lost</option>
                    <option value="FOUND">Found</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Field */}
            <div className="form-group">
              <label htmlFor="item-location" className="form-label">
                Campus location <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                id="item-location"
                type="text"
                className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                placeholder="e.g. Central Library, 2nd Floor Study Room"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                aria-describedby={errors.location ? 'location-error' : undefined}
                required
              />
              {errors.location && (
                <p id="location-error" className="field-error" role="alert">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Reporter Name Field */}
            <div className="form-group">
              <label htmlFor="item-reporter" className="form-label">
                Reported by <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                id="item-reporter"
                type="text"
                className={`form-input ${errors.reporter_name ? 'form-input--error' : ''}`}
                placeholder="e.g. Elena Patel"
                value={formData.reporter_name}
                onChange={(e) => handleChange('reporter_name', e.target.value)}
                aria-describedby={errors.reporter_name ? 'reporter-error' : undefined}
                required
              />
              {errors.reporter_name && (
                <p id="reporter-error" className="field-error" role="alert">
                  {errors.reporter_name}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label htmlFor="item-desc" className="form-label">
                Description <span className="helper-label">(Optional)</span>
              </label>
              <textarea
                id="item-desc"
                className="form-textarea"
                rows={3}
                placeholder="Distinctive marks, serial number, color details..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
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
                id="btn-submit-report"
              >
                {isSubmitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
