import React from 'react';

export default function Header({ onOpenReport, reportButtonRef }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-titles">
          <h1 className="header-title">SST Lost & Found</h1>
          <p className="header-tagline">Report and find lost items on campus.</p>
        </div>
        <div className="header-actions">
          <button
            ref={reportButtonRef}
            type="button"
            className="btn btn-primary"
            onClick={onOpenReport}
            id="btn-report-item"
          >
            + Report an Item
          </button>
        </div>
      </div>
    </header>
  );
}
