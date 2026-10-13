import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import StatsStrip from './components/StatsStrip';
import FilterBar from './components/FilterBar';
import ItemTable from './components/ItemTable';
import ItemFormModal from './components/ItemFormModal';
import ItemDetailModal from './components/ItemDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
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

  // Modals state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

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
      // Refetch both list and stats
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
      const updated = await updateItem(id, payload);
      showToast('Record updated successfully.');
      setSelectedItem(null);
      lastActiveElementRef.current?.focus();
      // Refetch both list and stats
      await Promise.all([loadItems(), loadStats()]);
    } catch (err) {
      alert(err.message || 'Failed to update record.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle open Delete Confirm Modal
  function handleOpenDelete(item) {
    setDeleteError(false);
    setItemToDelete(item);
  }

  // Handle close Delete Confirm Modal
  function handleCloseDelete() {
    setItemToDelete(null);
    setDeleteError(false);
    // If detail modal is still open, keep it or return focus
    if (!selectedItem) {
      lastActiveElementRef.current?.focus();
    }
  }

  // Handle confirm delete
  async function handleConfirmDelete(id) {
    try {
      setIsDeleting(true);
      setDeleteError(false);
      await deleteItem(id);
      showToast('Item record deleted.');
      setItemToDelete(null);
      setSelectedItem(null);
      lastActiveElementRef.current?.focus();
      // Refetch both list and stats
      await Promise.all([loadItems(), loadStats()]);
    } catch (err) {
      setDeleteError(true);
    } finally {
      setIsDeleting(false);
    }
  }

  // Clear all filters
  function handleClearFilters() {
    setSelectedStatus('ALL');
    setSelectedCategory('');
    setSearchQuery('');
  }

  const totalItemsCount = stats ? stats.total : items.length;

  return (
    <div className="app-container">
      <Header onOpenReport={handleOpenReport} reportButtonRef={reportBtnRef} />

      <main className="main-content">
        {errorMessage && (
          <div className="error-banner" role="alert">
            {errorMessage}
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

        {/* Global Statistics Strip */}
        <StatsStrip stats={stats} loading={loading} />

        {/* Filters and Search Bar */}
        <FilterBar
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Items Directory Table / Cards */}
        <ItemTable
          items={items}
          loading={loading}
          totalItemsCount={totalItemsCount}
          onSelectItem={handleSelectItem}
          onOpenReport={handleOpenReport}
          onClearFilters={handleClearFilters}
        />
      </main>

      {/* Modals */}
      <ItemFormModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        onSubmit={handleCreateItem}
        isSubmitting={isSubmitting}
      />

      <ItemDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={handleCloseDetail}
        onUpdate={handleUpdateItem}
        onOpenDelete={handleOpenDelete}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        item={itemToDelete}
        isOpen={Boolean(itemToDelete)}
        onClose={handleCloseDelete}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        deleteError={deleteError}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
