/**
 * DrawingsPage Component
 *
 * Main page component for viewing and managing drawings.
 * Composes canvas, toolbar, and drawing list with type switching,
 * generation, and export functionality.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DrawingCanvas } from './DrawingCanvas';
import { DrawingToolbar } from './DrawingToolbar';
import {
  useDrawingsByRoom,
  useDrawing,
  useCreateDrawing,
  useUpdateDrawing,
  useDeleteDrawing,
} from '../use-drawings';
import type { DrawingType } from '@/types/drawing';
import { DRAWING_TYPES, DRAWING_TYPE_LABELS } from '@/types/drawing';

interface DrawingsPageProps {
  roomId: string;
}

export function DrawingsPage({ roomId }: DrawingsPageProps) {
  const { data: drawings, isLoading, isError } = useDrawingsByRoom(roomId);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch selected drawing details
  const { data: selectedDrawing } = useDrawing(selectedDrawingId || '');

  // Mutations
  const createDrawing = useCreateDrawing();
  const updateDrawing = useUpdateDrawing();
  const deleteDrawing = useDeleteDrawing();

  // Auto-select first drawing when list loads
  useEffect(() => {
    if (drawings && drawings.length > 0 && !selectedDrawingId) {
      setSelectedDrawingId(drawings[0].id);
    }
  }, [drawings, selectedDrawingId]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!selectedDrawing) {
      return { elementCount: 0, layerCount: 0 };
    }
    const elementCount = selectedDrawing.layers.reduce(
      (sum, layer) => sum + layer.elements.length,
      0
    );
    return {
      elementCount,
      layerCount: selectedDrawing.layers.length,
    };
  }, [selectedDrawing]);

  // Handle drawing selection
  const handleDrawingSelect = useCallback((id: string) => {
    setSelectedDrawingId(id);
    setSelectedElementId(null);
    setStatusMessage('Drawing selected');
  }, []);

  // Handle element selection
  const handleElementSelect = useCallback((id: string | null) => {
    setSelectedElementId(id);
    if (id) {
      setStatusMessage('Element selected');
    } else {
      setStatusMessage('Element deselected');
    }
  }, []);

  // Handle element move
  const handleElementMove = useCallback(
    (elementId: string, position: { x: number; y: number }) => {
      if (!selectedDrawing) return;

      const updatedLayers = selectedDrawing.layers.map((layer) => ({
        ...layer,
        elements: layer.elements.map((el) =>
          el.id === elementId ? { ...el, x: position.x, y: position.y } : el
        ),
      }));

      updateDrawing.mutate({
        id: selectedDrawing.id,
        updates: { layers: updatedLayers },
      });
    },
    [selectedDrawing, updateDrawing]
  );

  // Handle layer visibility change
  const handleLayerVisibilityChange = useCallback(
    (layerId: string, isVisible: boolean) => {
      if (!selectedDrawing) return;

      const updatedLayers = selectedDrawing.layers.map((layer) =>
        layer.id === layerId ? { ...layer, isVisible } : layer
      );

      updateDrawing.mutate({
        id: selectedDrawing.id,
        updates: { layers: updatedLayers },
      });
      setStatusMessage(`Layer ${isVisible ? 'shown' : 'hidden'}`);
    },
    [selectedDrawing, updateDrawing]
  );

  // Handle drawing type change
  const handleTypeChange = useCallback(
    (type: DrawingType) => {
      if (!selectedDrawing) return;

      updateDrawing.mutate({
        id: selectedDrawing.id,
        updates: { type },
      });
      setStatusMessage(`Changed to ${DRAWING_TYPE_LABELS[type]}`);
    },
    [selectedDrawing, updateDrawing]
  );

  // Handle generate drawing
  const handleGenerate = useCallback(async () => {
    if (!selectedDrawing) return;

    setIsGenerating(true);
    setErrorMessage('');

    try {
      await invoke('generate_electrical', {
        roomId,
        drawingType: selectedDrawing.type,
      });
      setStatusMessage('Drawing generated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      setErrorMessage(message);
      setStatusMessage('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [roomId, selectedDrawing]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (!selectedDrawing) return;

    setIsExporting(true);
    setErrorMessage('');

    try {
      const result = await invoke<{ path: string }>('export_to_pdf', {
        drawingId: selectedDrawing.id,
      });
      setStatusMessage(`Exported to ${result.path}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      setErrorMessage(message);
      setStatusMessage('Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [selectedDrawing]);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
    setStatusMessage('Print dialog opened');
  }, []);

  // Handle create new drawing
  const handleCreateDrawing = useCallback(
    (type: DrawingType) => {
      createDrawing.mutate({
        roomId,
        type,
      });
      setShowCreateMenu(false);
      setStatusMessage(`Created new ${DRAWING_TYPE_LABELS[type]}`);
    },
    [roomId, createDrawing]
  );

  // Handle delete drawing
  const handleDeleteDrawing = useCallback(() => {
    if (!selectedDrawingId) return;

    deleteDrawing.mutate(selectedDrawingId);
    setSelectedDrawingId(null);
    setShowDeleteConfirm(false);
    setStatusMessage('Drawing deleted');
  }, [selectedDrawingId, deleteDrawing]);

  // Handle preview mode toggle
  const handlePreviewToggle = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
    setStatusMessage(isPreviewMode ? 'Exited preview mode' : 'Entered preview mode');
  }, [isPreviewMode]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCreateMenu) {
          setShowCreateMenu(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else if (selectedElementId) {
          setSelectedElementId(null);
          setStatusMessage('Element deselected');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, showCreateMenu, showDeleteConfirm]);

  // Format generated date
  const formattedDate = selectedDrawing
    ? new Date(selectedDrawing.generatedAt).toLocaleDateString()
    : '';

  // Get selected element details
  const selectedElement = useMemo(() => {
    if (!selectedDrawing || !selectedElementId) return null;
    for (const layer of selectedDrawing.layers) {
      const element = layer.elements.find((el) => el.id === selectedElementId);
      if (element) return element;
    }
    return null;
  }, [selectedDrawing, selectedElementId]);

  // Page class based on state
  const pageClass = `drawings-page${isPreviewMode ? ' preview-mode' : ''}`;

  if (isLoading) {
    return (
      <main data-testid="drawings-page" className="drawings-page drawings-page--loading">
        <p className="drawings-page__message">Loading drawings…</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main data-testid="drawings-page" className="drawings-page drawings-page--error">
        <p className="drawings-page__message">
          Error loading drawings. Please try again.
        </p>
      </main>
    );
  }

  if (!drawings || drawings.length === 0) {
    return (
      <main data-testid="drawings-page" className="drawings-page drawings-page--empty">
        <div className="drawings-page__empty">
          <p className="drawings-page__message">No drawings for this room.</p>
          <button
            type="button"
            className="drawings-page__btn drawings-page__btn--primary"
            onClick={() => setShowCreateMenu(true)}
            aria-label="New drawing"
          >
            New Drawing
          </button>
          {showCreateMenu && (
            <div role="menu" className="drawings-page__create-menu">
              {DRAWING_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="menuitem"
                  className="drawings-page__create-option"
                  onClick={() => handleCreateDrawing(type)}
                >
                  {DRAWING_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main data-testid="drawings-page" className={pageClass}>
      {/* Screen reader status announcer */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {/* Error message display */}
      {errorMessage && (
        <div className="drawings-page__error" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Header */}
      <header className="drawings-page__header">
        <h1 className="drawings-page__title">Drawings</h1>
        <div className="drawings-page__actions">
          <button
            type="button"
            className="drawings-page__btn"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedDrawing}
            aria-label="Generate drawing"
          >
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
          <button
            type="button"
            className="drawings-page__btn"
            onClick={handlePreviewToggle}
            aria-label={isPreviewMode ? 'Exit preview' : 'Preview'}
          >
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button
            type="button"
            className="drawings-page__btn"
            onClick={() => setShowCreateMenu(true)}
            aria-label="New drawing"
          >
            New Drawing
          </button>
          {selectedDrawingId && (
            <button
              type="button"
              className="drawings-page__btn drawings-page__btn--danger"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete drawing"
            >
              Delete
            </button>
          )}
        </div>
      </header>

      {/* Create menu dropdown */}
      {showCreateMenu && (
        <div role="menu" className="drawings-page__create-menu">
          {DRAWING_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              className="drawings-page__create-option"
              onClick={() => handleCreateDrawing(type)}
            >
              {DRAWING_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="drawings-page__confirm-overlay">
          <div className="drawings-page__confirm-dialog" role="alertdialog">
            <p>Are you sure you want to delete this drawing?</p>
            <div className="drawings-page__confirm-actions">
              <button
                type="button"
                className="drawings-page__btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="drawings-page__btn drawings-page__btn--danger"
                onClick={handleDeleteDrawing}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="drawings-page__content">
        {/* Drawings list sidebar */}
        <aside
          data-testid="drawings-list"
          className="drawings-page__sidebar"
          role="region"
          aria-label="Available drawings"
        >
          <h2 className="drawings-page__sidebar-title">Drawings</h2>
          <ul className="drawings-page__list">
            {drawings.map((drawing) => (
              <li key={drawing.id}>
                <button
                  type="button"
                  data-testid={`drawing-item-${drawing.id}`}
                  className={`drawings-page__list-item ${
                    selectedDrawingId === drawing.id ? 'active' : ''
                  }`}
                  onClick={() => handleDrawingSelect(drawing.id)}
                >
                  <span className="drawings-page__item-type">
                    {DRAWING_TYPE_LABELS[drawing.type]}
                  </span>
                  <span className="drawings-page__item-date">
                    {new Date(drawing.generatedAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Canvas area */}
        <section className="drawings-page__canvas-area">
          {/* Toolbar */}
          {selectedDrawing && !isPreviewMode && (
            <DrawingToolbar
              currentType={selectedDrawing.type}
              layers={selectedDrawing.layers}
              onTypeChange={handleTypeChange}
              onLayerVisibilityChange={handleLayerVisibilityChange}
              onExport={handleExport}
              onPrint={handlePrint}
              isExporting={isExporting}
            />
          )}

          {/* Stats bar */}
          {selectedDrawing && (
            <div className="drawings-page__stats">
              <span>
                {stats.elementCount} element{stats.elementCount !== 1 ? 's' : ''}
              </span>
              <span>
                {stats.layerCount} layer{stats.layerCount !== 1 ? 's' : ''}
              </span>
              <span>Generated: {formattedDate}</span>
            </div>
          )}

          {/* Canvas */}
          {selectedDrawing && (
            <DrawingCanvas
              drawing={selectedDrawing}
              selectedElementId={selectedElementId}
              onElementSelect={handleElementSelect}
              onElementMove={handleElementMove}
              onLayerVisibilityChange={handleLayerVisibilityChange}
            />
          )}
        </section>

        {/* Properties panel */}
        {!isPreviewMode && selectedElement && (
          <aside className="drawings-page__properties">
            <h3 className="drawings-page__properties-title">Element Properties</h3>
            <div className="drawings-page__property">
              <span className="drawings-page__property-label">Type</span>
              <span className="drawings-page__property-value">
                {selectedElement.type}
              </span>
            </div>
            <div className="drawings-page__property">
              <span className="drawings-page__property-label">Position</span>
              <span className="drawings-page__property-value">
                ({selectedElement.x.toFixed(1)}, {selectedElement.y.toFixed(1)})
              </span>
            </div>
            <div className="drawings-page__property">
              <span className="drawings-page__property-label">Rotation</span>
              <span className="drawings-page__property-value">
                {selectedElement.rotation}°
              </span>
            </div>
            {selectedElement.properties &&
              Object.entries(selectedElement.properties).map(([key, value]) => (
                <div key={key} className="drawings-page__property">
                  <span className="drawings-page__property-label">{key}</span>
                  <span className="drawings-page__property-value">{String(value)}</span>
                </div>
              ))}
          </aside>
        )}
      </div>
    </main>
  );
}
