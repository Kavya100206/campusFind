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
      // Focus first input on open
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-report-title"
      >
        <div className="modal-header">
          <h2 id="modal-report-title" className="modal-title">
            Report an Item
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Title Field */}
            <div className="form-group">
              <label htmlFor="item-title" className="form-label">
                Item Title <span className="required-star">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="item-title"
                type="text"
                className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                placeholder="e.g. Blue Noise-cancelling Headphones"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  Category <span className="required-star">*</span>
                </label>
                <select
                  id="item-category"
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
                <label htmlFor="item-status" className="form-label">
                  Status <span className="required-star">*</span>
                </label>
                <select
                  id="item-status"
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="LOST">Lost</option>
                  <option value="FOUND">Found</option>
                </select>
              </div>
            </div>

            {/* Location Field */}
            <div className="form-group">
              <label htmlFor="item-location" className="form-label">
                Campus Location <span className="required-star">*</span>
              </label>
              <input
                id="item-location"
                type="text"
                className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                placeholder="e.g. Central Library, 2nd Floor Quiet Zone"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                Reported By <span className="required-star">*</span>
              </label>
              <input
                id="item-reporter"
                type="text"
                className={`form-input ${errors.reporter_name ? 'form-input--error' : ''}`}
                placeholder="e.g. Aarav Sharma"
                value={formData.reporter_name}
                onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
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
                Description (Optional)
              </label>
              <textarea
                id="item-desc"
                className="form-textarea"
                rows={3}
                placeholder="Additional details, distinctive marks, or serial number info..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
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
              id="btn-submit-report"
            >
              {isSubmitting ? 'Reporting...' : 'Report Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
