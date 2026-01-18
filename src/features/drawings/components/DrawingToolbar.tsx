/**
 * DrawingToolbar Component
 *
 * Toolbar for drawing canvas with type selector, layer visibility toggles,
 * export and print functionality.
 */

import { useState, useCallback } from 'react';
import type { DrawingType, DrawingLayer } from '@/types/drawing';
import { DRAWING_TYPES, DRAWING_TYPE_LABELS } from '@/types/drawing';

export interface DrawingToolbarProps {
  currentType: DrawingType;
  layers: DrawingLayer[];
  onTypeChange: (type: DrawingType) => void;
  onLayerVisibilityChange: (layerId: string, isVisible: boolean) => void;
  onExport: () => void;
  onPrint: () => void;
  isExporting?: boolean;
  compact?: boolean;
}

function VisibilityIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        data-testid="visibility-icon-visible"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      data-testid="visibility-icon-hidden"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      data-testid="lock-icon"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="drawing-toolbar__lock-icon"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg
      data-testid="export-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg
      data-testid="print-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </svg>
  );
}

export function DrawingToolbar({
  currentType,
  layers,
  onTypeChange,
  onLayerVisibilityChange,
  onExport,
  onPrint,
  isExporting = false,
  compact = false,
}: DrawingToolbarProps) {
  const [statusMessage, setStatusMessage] = useState('');

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as DrawingType;
      onTypeChange?.(newType);
      setStatusMessage(`Changed to ${DRAWING_TYPE_LABELS[newType]}`);
    },
    [onTypeChange]
  );

  const handleLayerToggle = useCallback(
    (layer: DrawingLayer) => {
      onLayerVisibilityChange(layer.id, !layer.isVisible);
      setStatusMessage(`${layer.name} layer ${layer.isVisible ? 'hidden' : 'shown'}`);
    },
    [onLayerVisibilityChange]
  );

  const handleExportClick = useCallback(() => {
    onExport?.();
  }, [onExport]);

  const handlePrintClick = useCallback(() => {
    onPrint?.();
  }, [onPrint]);

  const toolbarClass = compact
    ? 'drawing-toolbar drawing-toolbar--compact'
    : 'drawing-toolbar';

  return (
    <div
      data-testid="drawing-toolbar"
      role="toolbar"
      aria-label="Drawing toolbar"
      className={toolbarClass}
    >
      {/* Status announcer for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {/* Drawing Type Selector */}
      <div className="drawing-toolbar__section">
        <label htmlFor="drawing-type-select" className="sr-only">
          Drawing type
        </label>
        <select
          id="drawing-type-select"
          data-testid="drawing-type-selector"
          value={currentType}
          onChange={handleTypeChange}
          className="drawing-toolbar__select"
          aria-label="Drawing type"
        >
          {DRAWING_TYPES.map((type) => (
            <option key={type} value={type}>
              {DRAWING_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div
        data-testid="toolbar-divider"
        className="drawing-toolbar__divider"
        aria-hidden="true"
      />

      {/* Layer Visibility Toggles */}
      <div
        data-testid="layer-toggles"
        className="drawing-toolbar__section drawing-toolbar__layers"
      >
        {layers.length === 0 ? (
          <span className="drawing-toolbar__no-layers">No layers</span>
        ) : (
          layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => handleLayerToggle(layer)}
              title={layer.name}
              aria-label={layer.name}
              aria-pressed={layer.isVisible}
              className={`drawing-toolbar__layer-btn ${layer.isVisible ? 'active' : ''}`}
            >
              <VisibilityIcon visible={layer.isVisible} />
              {layer.isLocked && <LockIcon />}
              {!compact && (
                <span className="drawing-toolbar__layer-name">{layer.name}</span>
              )}
            </button>
          ))
        )}
      </div>

      <div
        data-testid="toolbar-divider"
        className="drawing-toolbar__divider"
        aria-hidden="true"
      />

      {/* Export and Print Buttons */}
      <div className="drawing-toolbar__section drawing-toolbar__actions">
        <button
          type="button"
          onClick={handleExportClick}
          disabled={isExporting}
          aria-busy={isExporting}
          aria-label="Export drawing"
          title="Export to PDF"
          className="drawing-toolbar__btn"
        >
          <ExportIcon />
          {!compact && <span>Export</span>}
        </button>

        <button
          type="button"
          onClick={handlePrintClick}
          aria-label="Print drawing"
          title="Print drawing"
          className="drawing-toolbar__btn"
        >
          <PrintIcon />
          {!compact && <span>Print</span>}
        </button>
      </div>
    </div>
  );
}
