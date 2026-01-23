import { useState, useCallback, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { EquipmentCard } from './EquipmentCard';
import {
  useEquipmentList,
  useEquipmentByCategory,
  useEquipmentSearch,
} from '../use-equipment';
import { Button } from '@/components/ui';
import { EQUIPMENT_CATEGORIES } from '@/types/equipment';
import type { Equipment, EquipmentCategory } from '@/types/equipment';

interface EquipmentListProps {
  selectedId?: string;
  favoriteIds?: string[];
  onSelect?: (equipment: Equipment) => void;
  onFavoriteToggle?: (id: string) => void;
}

type CategoryFilter = 'all' | EquipmentCategory;

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  video: 'Video',
  audio: 'Audio',
  control: 'Control',
  infrastructure: 'Infrastructure',
};

/**
 * Equipment catalog list with category filtering, search, and grid display.
 * Follows Programa-inspired visual catalog style.
 */
export function EquipmentList({
  selectedId,
  favoriteIds = [],
  onSelect,
  onFavoriteToggle,
}: EquipmentListProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const tabPanelId = useId();

  // Fetch data based on current state
  const allEquipmentQuery = useEquipmentList();
  const categoryQuery = useEquipmentByCategory(
    activeCategory === 'all' ? 'video' : activeCategory
  );
  const searchQueryHook = useEquipmentSearch(searchQuery);

  // Determine which data source to use
  const isSearchActive = searchQuery.length >= 2;
  const isFilterActive = activeCategory !== 'all';

  const currentQuery = isSearchActive
    ? searchQueryHook
    : isFilterActive
      ? categoryQuery
      : allEquipmentQuery;

  const equipment = isSearchActive
    ? (searchQueryHook.data ?? [])
    : isFilterActive
      ? (categoryQuery.data ?? [])
      : (allEquipmentQuery.data ?? []);

  const isLoading = currentQuery.isLoading;
  const isError = currentQuery.isError;
  const error = currentQuery.error;

  const handleCategoryChange = useCallback((category: CategoryFilter) => {
    setActiveCategory(category);
    setSearchQuery(''); // Clear search when changing category
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const tabs = ['all', ...EQUIPMENT_CATEGORIES] as CategoryFilter[];
      const currentIndex = tabs.indexOf(activeCategory);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveCategory(tabs[nextIndex]);
        // Focus the next tab
        const nextTab = document.querySelector(
          `[role="tab"][data-category="${tabs[nextIndex]}"]`
        ) as HTMLButtonElement;
        nextTab?.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveCategory(tabs[prevIndex]);
        // Focus the previous tab
        const prevTab = document.querySelector(
          `[role="tab"][data-category="${tabs[prevIndex]}"]`
        ) as HTMLButtonElement;
        prevTab?.focus();
      }
    },
    [activeCategory]
  );

  const itemCount = equipment.length;

  return (
    <section className="equipment-list" aria-label="Equipment catalog" role="region">
      {/* Header */}
      <div className="equipment-list-header">
        <div className="equipment-list-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <h1 className="equipment-list-title">Equipment</h1>
            {!isLoading && !isError && (
              <span className="equipment-list-count">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/equipment/import')}
          >
            Import Equipment
          </Button>
        </div>

        {/* Search */}
        <div className="equipment-list-search">
          <SearchIcon />
          <input
            type="search"
            role="searchbox"
            placeholder="Search equipment..."
            aria-label="Search equipment"
            value={searchQuery}
            onChange={handleSearchChange}
            className="equipment-list-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="equipment-list-search-clear"
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div
        role="tablist"
        aria-label="Equipment categories"
        className="equipment-list-tabs"
        onKeyDown={handleKeyDown}
      >
        {(['all', ...EQUIPMENT_CATEGORIES] as CategoryFilter[]).map((category) => (
          <button
            key={category}
            role="tab"
            type="button"
            data-category={category}
            aria-selected={activeCategory === category}
            aria-controls={tabPanelId}
            tabIndex={activeCategory === category ? 0 : -1}
            onClick={() => handleCategoryChange(category)}
            className={`equipment-list-tab ${activeCategory === category ? 'equipment-list-tab-active' : ''}`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div id={tabPanelId} role="tabpanel" aria-label="Equipment list">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState
            message={error?.message ?? 'Failed to load equipment'}
            onRetry={() => currentQuery.refetch?.()}
          />
        ) : equipment.length === 0 ? (
          <EmptyState isSearch={isSearchActive} />
        ) : (
          <div
            className="equipment-list-grid"
            data-testid="equipment-grid"
            role="list"
            aria-label="Equipment items"
          >
            {equipment.map((item) => (
              <div key={item.id} role="listitem">
                <EquipmentCard
                  equipment={item}
                  isSelected={selectedId === item.id}
                  isFavorite={favoriteIds.includes(item.id)}
                  onClick={onSelect ? () => onSelect(item) : undefined}
                  onFavoriteToggle={onFavoriteToggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div data-testid="equipment-loading" className="equipment-list-loading">
      <div role="status" className="sr-only">
        Loading equipment...
      </div>
      <div className="equipment-list-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            data-testid="equipment-skeleton"
            className="equipment-skeleton"
            aria-hidden="true"
          >
            <div className="equipment-skeleton-image" />
            <div className="equipment-skeleton-content">
              <div className="equipment-skeleton-line equipment-skeleton-short" />
              <div className="equipment-skeleton-line" />
              <div className="equipment-skeleton-line equipment-skeleton-medium" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ isSearch }: { isSearch: boolean }) {
  return (
    <div data-testid="equipment-empty" className="equipment-list-empty">
      <EmptyIcon />
      <p className="equipment-list-empty-title">
        {isSearch ? 'No results found' : 'No equipment found'}
      </p>
      <p className="equipment-list-empty-description">
        {isSearch ? 'Try adjusting your search terms' : 'Add equipment to get started'}
      </p>
    </div>
  );
}

// Error State Component
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div data-testid="equipment-error" className="equipment-list-error">
      <ErrorIcon />
      <p className="equipment-list-error-title">Failed to load</p>
      <p className="equipment-list-error-message">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary equipment-list-retry"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Icon Components
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="equipment-list-search-icon"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="equipment-list-empty-icon"
    >
      <path d="M16.5 9.4l-9-5.19" />
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="equipment-list-error-icon"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
