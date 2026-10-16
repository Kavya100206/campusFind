import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsStrip from './components/StatsStrip';
import FilterBar from './components/FilterBar';
import ItemTable from './components/ItemTable';
import RecentActivity from './components/RecentActivity';
import ItemFormModal from './components/ItemFormModal';
import ItemDetailModal from './components/ItemDetailModal';
import {
  fetchItems,
  fetchStats,
  createItem,
  updateItem,
  deleteItem,
} from './api/client';
import './styles/app.css';

export default function App() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Tablet/Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus restoration ref
  const lastActiveElementRef = useRef(null);
  const reportBtnRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Fetch items list
  const loadItems = useCallback(async () => {
    try {
      setErrorMessage(null);
      const data = await fetchItems({
        status: selectedStatus,
        category: selectedCategory,
        q: searchQuery,
      });
      setItems(data);
    } catch (err) {
      setErrorMessage('Unable to load items from server. Please retry.');
    }
  }, [selectedStatus, selectedCategory, searchQuery]);

  // Fetch global stats
  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      // Non-blocking error for stats
    }
  }, []);

  // Initial load and filter change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      await Promise.all([loadItems(), loadStats()]);
      if (isMounted) {
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [loadItems, loadStats]);

  // Handle open Report Modal
  function handleOpenReport() {
    lastActiveElementRef.current = document.activeElement;
    setIsReportOpen(true);
  }

  // Handle close Report Modal
  function handleCloseReport() {
    setIsReportOpen(false);
    lastActiveElementRef.current?.focus();
  }

  // Handle submit Report
  async function handleCreateItem(payload) {
    try {
      setIsSubmitting(true);
      await createItem(payload);
      showToast('Item reported successfully.');
      setIsReportOpen(false);
      lastActiveElementRef.current?.focus();
      await Promise.all([loadItems(), loadStats()]);
    } catch (err) {
      alert(err.message || 'Failed to report item.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle open Item Detail Modal
  function handleSelectItem(item) {
    lastActiveElementRef.current = document.activeElement;
    setSelectedItem(item);
  }

  // Handle close Item Detail Modal
  function handleCloseDetail() {
    setSelectedItem(null);
    lastActiveElementRef.current?.focus();
  }

  // Handle update Item
  async function handleUpdateItem(id, payload) {
    try {
      setIsSubmitting(true);
      await updateItem(id, payload);
      const wasClaim = payload.status === 'CLAIMED' && selectedItem?.status !== 'CLAIMED';
      showToast(wasClaim ? 'Item marked as claimed.' : 'Item updated successfully.');
      setSelectedItem(null);
      lastActiveElementRef.current?.focus();
      await Promise.all([loadItems(), loadStats()]);
    } catch (err) {
      alert(err.message || 'Failed to update record.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle delete Item (inline confirmation)
  async function handleDeleteItem(id) {
    try {
      setIsSubmitting(true);
      await deleteItem(id);
      showToast('Item deleted.');
      setSelectedItem(null);
      lastActiveElementRef.current?.focus();
      await Promise.all([loadItems(), loadStats()]);
    } catch (err) {
      alert('Failed to delete item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Clear all filters
  function handleClearFilters() {
    setSelectedStatus('ALL');
    setSelectedCategory('');
    setSearchQuery('');
  }

  const totalItemsCount = stats ? stats.total : items.length;

  // Section title mapping
  const sectionTitles = {
    ALL: 'All items',
    LOST: 'Lost items',
    FOUND: 'Found items',
    CLAIMED: 'Claimed items',
  };
  const currentSectionTitle = sectionTitles[selectedStatus] || 'All items';

  return (
    <div className="app-layout">
      {/* 232px Sidebar */}
      <Sidebar
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        stats={stats}
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <div className="app-workspace">
        {/* 56px Top Bar */}
        <Header
          selectedStatus={selectedStatus}
          onOpenReport={handleOpenReport}
          reportButtonRef={reportBtnRef}
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Content Area */}
        <main className="main-content">
          {/* Section Header: Section name, not app name */}
          <div className="section-header">
            <h1 className="section-title">{currentSectionTitle}</h1>
            <p className="section-tagline">Lost it. Found it. Back to you.</p>
          </div>

          {errorMessage && (
            <div className="error-banner" role="alert">
              <span>{errorMessage}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '12px' }}
                onClick={() => {
                  loadItems();
                  loadStats();
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Stat Cards Strip */}
          <StatsStrip stats={stats} loading={loading} />

          {/* Unified Toolbar Above Table: Segmented control + Category select + Chips */}
          <FilterBar
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            stats={stats}
          />

          {/* Dashboard Main Grid: Table & Recent Activity */}
          <div className="dashboard-content-grid">
            <div className="grid-main-table">
              <ItemTable
                items={items}
                loading={loading}
                totalItemsCount={totalItemsCount}
                onSelectItem={handleSelectItem}
                onOpenReport={handleOpenReport}
                onClearFilters={handleClearFilters}
              />
            </div>
            <aside className="grid-side-activity">
              <RecentActivity items={items} onSelectItem={handleSelectItem} />
            </aside>
          </div>
        </main>
      </div>

      {/* Report Item Dialog */}
      <ItemFormModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        onSubmit={handleCreateItem}
        isSubmitting={isSubmitting}
      />

      {/* Edit / Claim / Delete Dialog with inline confirm */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={handleCloseDetail}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
        isSubmitting={isSubmitting}
      />

      {/* Plain CSS Auto-dismiss Toast */}
      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
