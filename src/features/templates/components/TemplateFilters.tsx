/**
 * Template Filters Component
 *
 * Provides filtering controls for templates
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { TemplateFilters, TemplateScope, TemplateType } from '../template-types';
import type { Platform, QualityTier } from '@/types/room';

interface TemplateFiltersProps {
  filters: TemplateFilters;
  onFiltersChange: (filters: TemplateFilters) => void;
  showTypeFilter?: boolean;
}

/**
 * Select dropdown component
 */
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-text-tertiary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-bg-secondary border border-border rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-gold"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Search input component
 */
function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex-1 min-w-[200px]">
      <label className="text-xs text-text-tertiary block mb-1">Search</label>
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search templates..."
          className="w-full bg-bg-secondary border border-border rounded pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-gold"
        />
      </div>
    </div>
  );
}

const SCOPE_OPTIONS: { value: TemplateScope | 'all'; label: string }[] = [
  { value: 'all', label: 'All Scopes' },
  { value: 'personal', label: 'My Templates' },
  { value: 'team', label: 'Team' },
  { value: 'org', label: 'Organization' },
  { value: 'system', label: 'System' },
];

const TYPE_OPTIONS: { value: TemplateType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'room', label: 'Room' },
  { value: 'equipment_package', label: 'Equipment Package' },
  { value: 'project', label: 'Project' },
  { value: 'quote', label: 'Quote' },
];

const PLATFORM_OPTIONS: { value: Platform | 'all'; label: string }[] = [
  { value: 'all', label: 'All Platforms' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'webex', label: 'Cisco Webex' },
  { value: 'meet', label: 'Google Meet' },
  { value: 'multi', label: 'Multi-platform' },
  { value: 'none', label: 'None' },
];

const TIER_OPTIONS: { value: QualityTier | 'all'; label: string }[] = [
  { value: 'all', label: 'All Tiers' },
  { value: 'budget', label: 'Budget' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'executive', label: 'Executive' },
];

export function TemplateFiltersBar({
  filters,
  onFiltersChange,
  showTypeFilter = true,
}: TemplateFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleScopeChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        scope: value === 'all' ? undefined : (value as TemplateScope),
      });
    },
    [filters, onFiltersChange]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        type: value === 'all' ? undefined : (value as TemplateType),
      });
    },
    [filters, onFiltersChange]
  );

  const handlePlatformChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        platform: value === 'all' ? undefined : (value as Platform),
      });
    },
    [filters, onFiltersChange]
  );

  const handleTierChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        tier: value === 'all' ? undefined : (value as QualityTier),
      });
    },
    [filters, onFiltersChange]
  );

  const debounceRef = useRef<number | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      onFiltersChange({
        ...filters,
        search: searchValue || undefined,
      });
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [filters, onFiltersChange, searchValue]);

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-bg-secondary rounded-lg border border-border">
      <Select
        label="Scope"
        value={filters.scope || 'all'}
        onChange={handleScopeChange}
        options={SCOPE_OPTIONS}
      />

      {showTypeFilter && (
        <Select
          label="Type"
          value={filters.type || 'all'}
          onChange={handleTypeChange}
          options={TYPE_OPTIONS}
        />
      )}

      <Select
        label="Platform"
        value={filters.platform || 'all'}
        onChange={handlePlatformChange}
        options={PLATFORM_OPTIONS}
      />

      <Select
        label="Tier"
        value={filters.tier || 'all'}
        onChange={handleTierChange}
        options={TIER_OPTIONS}
      />

      <SearchInput value={searchValue} onChange={handleSearchChange} />
    </div>
  );
}
