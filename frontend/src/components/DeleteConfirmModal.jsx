import React, { useEffect, useRef } from 'react';

export default function DeleteConfirmModal({
  item,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting,
  deleteError,
}) {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelBtnRef.current?.focus(), 50);
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

  if (!isOpen || !item) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card modal-card--sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-delete-title"
      >
        <div className="modal-header">
          <h2 id="modal-delete-title" className="modal-title text-danger">
            Delete Record
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

        <div className="modal-body">
          <p className="delete-warning-text">
            Are you sure you want to delete <strong>"{item.title}"</strong>?
          </p>
          <p className="delete-subtext">
            This action cannot be undone. The record will be permanently removed.
          </p>

          {deleteError && (
            <div className="error-banner" role="alert">
              Couldn't delete this item. Try again.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirmDelete(item.id)}
            disabled={isDeleting}
            id="btn-confirm-delete"
          >
            {isDeleting ? 'Deleting...' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
