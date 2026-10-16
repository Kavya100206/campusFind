import React from 'react';
import { STATUS_LABELS } from '../api/client';

export default function StatusBadge({ status }) {
  const normalized = (status || 'LOST').toUpperCase();
  const label = STATUS_LABELS[normalized] || normalized;

  return (
    <span className={`status-pill status-pill--${normalized.toLowerCase()}`}>
      <span className={`status-dot status-dot--${normalized.toLowerCase()}`} aria-hidden="true" />
      <span className="status-label">{label}</span>
    </span>
  );
}
