import React from 'react';
import { STATUS_LABELS } from '../api/client';

export default function StatusBadge({ status }) {
  const normalized = (status || 'LOST').toUpperCase();
  const label = STATUS_LABELS[normalized] || normalized;

  return (
    <span className={`status-badge status-badge--${normalized.toLowerCase()}`}>
      {label}
    </span>
  );
}
