/**
 * Preferences Settings Component
 *
 * Theme, behavior, units, and canvas settings
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useAppStore } from '@/stores/app-store';
import { applyTheme } from '@/lib/theme';
import { useUserPreferences, useUpdateUserPreferences } from '../use-settings';
import {
  THEME_OPTIONS,
  MEASUREMENT_OPTIONS,
  AUTOSAVE_INTERVALS,
  DATE_FORMAT_OPTIONS,
  NUMBER_FORMAT_OPTIONS,
  type Theme,
  type MeasurementUnit,
  type UserPreferences,
} from '../settings-types';

interface PreferencesSettingsProps {
  userId: string;
}

/**
 * Radio group component
 */
function RadioGroup({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-4">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="settings-radio"
          />
          <span className="text-sm text-text-primary">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

/**
 * Checkbox component
 */
function Checkbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="settings-checkbox"
      />
      <span className="text-sm text-text-primary">{label}</span>
    </label>
  );
}

/**
 * Select component
 */
function Select({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="settings-select"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function PreferencesForm({
  userId,
  preferences,
}: {
  userId: string;
  preferences: UserPreferences;
}) {
  const updateMutation = useUpdateUserPreferences();
  const setSidebarExpanded = useAppStore((state) => state.setSidebarExpanded);

  const [theme, setTheme] = useState<Theme>(preferences.theme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(preferences.sidebarCollapsed);
  const [autoSave, setAutoSave] = useState(preferences.autoSave);
  const [autoSaveInterval, setAutoSaveInterval] = useState(preferences.autoSaveInterval);
  const [confirmDeletions, setConfirmDeletions] = useState(preferences.confirmDeletions);
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>(
    preferences.measurementUnit
  );
  const [currency, setCurrency] = useState(preferences.currency);
  const [dateFormat, setDateFormat] = useState(preferences.dateFormat);
  const [numberFormat, setNumberFormat] = useState(preferences.numberFormat);
  const [gridSnap, setGridSnap] = useState(preferences.gridSnap);
  const [gridSize, setGridSize] = useState(preferences.gridSize);
  const [showGrid, setShowGrid] = useState(preferences.showGrid);
  const [defaultZoom, setDefaultZoom] = useState(preferences.defaultZoom);

  const handleSave = () => {
    updateMutation.mutate({
      userId,
      data: {
        theme,
        sidebarCollapsed,
        autoSave,
        autoSaveInterval,
        confirmDeletions,
        measurementUnit,
        currency,
        dateFormat,
        numberFormat,
        gridSnap,
        gridSize,
        showGrid,
        defaultZoom,
      },
    });
    applyTheme(theme);
    setSidebarExpanded(!sidebarCollapsed);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Preferences</h2>
        <p className="text-sm text-text-secondary mt-1">Customize your app experience</p>
      </div>

      {/* Appearance Section */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Appearance</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Theme</label>
            <RadioGroup
              name="theme"
              value={theme}
              options={THEME_OPTIONS}
              onChange={(v) => setTheme(v as Theme)}
            />
          </div>

          {/* Theme Preview */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1 p-4 bg-[#0D1421] border border-border rounded-lg">
              <div className="h-2 w-12 bg-[#C9A227] rounded mb-2" />
              <div className="h-2 w-20 bg-gray-600 rounded mb-2" />
              <div className="h-2 w-16 bg-gray-700 rounded" />
              <p className="text-xs text-center text-gray-400 mt-2">Dark</p>
            </div>
            <div className="flex-1 p-4 bg-white border border-border rounded-lg">
              <div className="h-2 w-12 bg-[#2563eb] rounded mb-2" />
              <div className="h-2 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-2 w-16 bg-gray-300 rounded" />
              <p className="text-xs text-center text-gray-500 mt-2">Light</p>
            </div>
          </div>
        </div>
      </section>

      {/* Behavior Section */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Behavior</h3>

        <div className="space-y-4">
          <Checkbox
            id="sidebar-collapsed"
            label="Collapse sidebar by default"
            checked={sidebarCollapsed}
            onChange={setSidebarCollapsed}
          />

          <Checkbox
            id="auto-save"
            label="Auto-save projects"
            checked={autoSave}
            onChange={setAutoSave}
          />

          {autoSave && (
            <div className="ml-6">
              <label className="block text-sm text-text-secondary mb-2">
                Auto-save interval
              </label>
              <Select
                id="auto-save-interval"
                value={autoSaveInterval}
                options={AUTOSAVE_INTERVALS}
                onChange={(v) => setAutoSaveInterval(Number(v))}
              />
            </div>
          )}

          <Checkbox
            id="confirm-deletions"
            label="Confirm before deleting"
            checked={confirmDeletions}
            onChange={setConfirmDeletions}
          />
        </div>
      </section>

      {/* Units & Formats */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Units & Formats</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Measurement</label>
            <Select
              id="measurement"
              value={measurementUnit}
              options={MEASUREMENT_OPTIONS}
              onChange={(v) => setMeasurementUnit(v as MeasurementUnit)}
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Currency</label>
            <Select
              id="currency"
              value={currency}
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'CAD', label: 'CAD ($)' },
              ]}
              onChange={setCurrency}
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Date Format</label>
            <Select
              id="date-format"
              value={dateFormat}
              options={DATE_FORMAT_OPTIONS}
              onChange={setDateFormat}
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Number Format
            </label>
            <Select
              id="number-format"
              value={numberFormat}
              options={NUMBER_FORMAT_OPTIONS}
              onChange={setNumberFormat}
            />
          </div>
        </div>
      </section>

      {/* Canvas Settings */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Design Canvas</h3>

        <div className="space-y-4">
          <Checkbox
            id="show-grid"
            label="Show grid"
            checked={showGrid}
            onChange={setShowGrid}
          />

          <Checkbox
            id="grid-snap"
            label="Snap to grid"
            checked={gridSnap}
            onChange={setGridSnap}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Grid Size</label>
              <input
                type="number"
                min="1"
                max="24"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="settings-input"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Default Zoom
              </label>
              <input
                type="number"
                min="50"
                max="200"
                value={defaultZoom}
                onChange={(e) => setDefaultZoom(Number(e.target.value))}
                className="settings-input"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={updateMutation.isPending}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

export function PreferencesSettings({ userId }: PreferencesSettingsProps) {
  const { data: preferences, isLoading } = useUserPreferences(userId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-bg-tertiary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!preferences) {
    return <p className="text-sm text-text-tertiary">Preferences not found.</p>;
  }

  return (
    <PreferencesForm
      key={preferences.updatedAt}
      userId={userId}
      preferences={preferences}
    />
  );
}
