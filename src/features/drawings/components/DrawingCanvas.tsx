/**
 * DrawingCanvas Component
 *
 * Interactive canvas for viewing and editing drawings with layer rendering,
 * zoom, pan, and element selection capabilities.
 */

import { useState, useCallback, useRef } from 'react';
import type { Drawing, DrawingElement } from '@/types/drawing';

export interface DrawingCanvasProps {
  drawing: Drawing;
  selectedElementId: string | null;
  onElementSelect: (id: string | null) => void;
  onElementMove: (id: string, position: { x: number; y: number }) => void;
  onLayerVisibilityChange: (layerId: string, isVisible: boolean) => void;
}

const MIN_ZOOM = 25;
const MAX_ZOOM = 400;
const ZOOM_STEP = 10;

type ToolMode = 'select' | 'pan';

function getElementLabel(element: DrawingElement): string {
  const props = element.properties as Record<string, unknown>;
  if (props.label && typeof props.label === 'string') {
    return props.label;
  }
  if (props.text && typeof props.text === 'string') {
    return props.text;
  }
  return element.type;
}

export function DrawingCanvas({
  drawing,
  selectedElementId,
  onElementSelect,
  onElementMove,
  onLayerVisibilityChange,
}: DrawingCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [statusMessage, setStatusMessage] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.min(prev + ZOOM_STEP, MAX_ZOOM);
      setStatusMessage(`Zoom: ${newZoom}%`);
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
      setStatusMessage(`Zoom: ${newZoom}%`);
      return newZoom;
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
    setStatusMessage('Zoom: 100%');
  }, []);

  const handleFitToView = useCallback(() => {
    setStatusMessage('Fit to view');
  }, []);

  const handleToggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev);
    setStatusMessage((prev) => (prev.includes('hidden') ? 'Grid shown' : 'Grid hidden'));
  }, []);

  const handleToolChange = useCallback((mode: ToolMode) => {
    setToolMode(mode);
    setStatusMessage(`${mode} tool active`);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!drawing) return;

      switch (e.key) {
        case 'Escape':
          if (selectedElementId) {
            onElementSelect(null);
            setStatusMessage('Element deselected');
          }
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'Tab': {
          e.preventDefault();
          const allElements = drawing.layers
            .filter((l) => l.isVisible)
            .flatMap((l) => l.elements);
          if (allElements.length > 0) {
            const currentIndex = allElements.findIndex(
              (el) => el.id === selectedElementId
            );
            const nextIndex = (currentIndex + 1) % allElements.length;
            onElementSelect(allElements[nextIndex].id);
            setStatusMessage(`Selected: ${getElementLabel(allElements[nextIndex])}`);
          }
          break;
        }
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          // Pan support - handled via CSS transform in full implementation
          break;
      }
    },
    [drawing, selectedElementId, onElementSelect, handleZoomIn, handleZoomOut]
  );

  const handleViewportClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).dataset.testid === 'drawing-viewport') {
        onElementSelect(null);
        setStatusMessage('Element deselected');
      }
    },
    [onElementSelect]
  );

  const handleElementClick = useCallback(
    (e: React.MouseEvent, elementId: string, label: string) => {
      e.stopPropagation();
      onElementSelect(elementId);
      setStatusMessage(`Selected: ${label}`);
    },
    [onElementSelect]
  );

  const handleElementDragStart = useCallback((e: React.DragEvent, elementId: string) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.dataTransfer.setData('text/plain', JSON.stringify({ elementId }));
  }, []);

  const handleElementDragEnd = useCallback(
    (e: React.DragEvent, elementId: string) => {
      if (canvasRef.current && dragStartPos.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scale = zoom / 100;
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        onElementMove(elementId, { x, y });
      }
      dragStartPos.current = null;
    },
    [zoom, onElementMove]
  );

  const handleLayerToggle = useCallback(
    (layerId: string, currentlyVisible: boolean) => {
      onLayerVisibilityChange(layerId, !currentlyVisible);
      setStatusMessage(`Layer ${currentlyVisible ? 'hidden' : 'shown'}`);
    },
    [onLayerVisibilityChange]
  );

  // Handle empty drawing state
  if (!drawing) {
    return (
      <div
        data-testid="drawing-canvas"
        role="application"
        aria-label="Drawing canvas"
        className="drawing-canvas drawing-canvas--empty"
        tabIndex={0}
      >
        <p className="drawing-canvas__empty-message">No drawing selected</p>
      </div>
    );
  }

  const scale = zoom / 100;
  const visibleLayers = drawing.layers.filter((layer) => layer.isVisible);

  return (
    <div
      ref={canvasRef}
      data-testid="drawing-canvas"
      data-drawing-type={drawing.type}
      role="application"
      aria-label={`${drawing.type} drawing canvas`}
      className="drawing-canvas"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Status announcer for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {/* Toolbar */}
      <div data-testid="drawing-toolbar" className="drawing-canvas__toolbar">
        <span className="drawing-canvas__type-label">{drawing.type}</span>

        <div className="drawing-canvas__toolbar-divider" />

        <button
          type="button"
          aria-label="Select tool"
          onClick={() => handleToolChange('select')}
          className={`drawing-canvas__btn ${toolMode === 'select' ? 'active' : ''}`}
        >
          Select
        </button>
        <button
          type="button"
          aria-label="Pan tool"
          onClick={() => handleToolChange('pan')}
          className={`drawing-canvas__btn ${toolMode === 'pan' ? 'active' : ''}`}
        >
          Pan
        </button>

        <div className="drawing-canvas__toolbar-divider" />

        <button
          type="button"
          aria-label="Zoom in"
          onClick={handleZoomIn}
          className="drawing-canvas__btn"
        >
          +
        </button>
        <span data-testid="zoom-level" className="drawing-canvas__zoom-level">
          {zoom}%
        </span>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={handleZoomOut}
          className="drawing-canvas__btn"
        >
          -
        </button>
        <button
          type="button"
          aria-label="Reset zoom"
          onClick={handleZoomReset}
          className="drawing-canvas__btn"
        >
          100%
        </button>
        <button
          type="button"
          aria-label="Fit to view"
          onClick={handleFitToView}
          className="drawing-canvas__btn"
        >
          Fit
        </button>
        <button
          type="button"
          aria-label="Toggle grid"
          onClick={handleToggleGrid}
          className="drawing-canvas__btn"
        >
          Grid
        </button>
      </div>

      <div className="drawing-canvas__content">
        {/* Layer Panel */}
        <div
          data-testid="layer-panel"
          role="region"
          aria-label="Layer visibility controls"
          className="drawing-canvas__layer-panel"
        >
          <h3 className="drawing-canvas__layer-panel-title">Layers</h3>
          <ul className="drawing-canvas__layer-list">
            {drawing.layers.map((layer) => (
              <li key={layer.id} className="drawing-canvas__layer-item">
                <label className="drawing-canvas__layer-label">
                  <input
                    type="checkbox"
                    checked={layer.isVisible}
                    onChange={() => handleLayerToggle(layer.id, layer.isVisible)}
                    aria-label={`Toggle ${layer.name} visibility`}
                    className="drawing-canvas__layer-checkbox"
                  />
                  <span className="drawing-canvas__layer-name">{layer.name}</span>
                </label>
                {layer.isLocked && (
                  <span
                    data-testid={`lock-indicator-${layer.id}`}
                    className="drawing-canvas__lock-indicator"
                    aria-label="Layer is locked"
                  >
                    L
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Viewport */}
        <div
          data-testid="drawing-viewport"
          className="drawing-canvas__viewport"
          onClick={handleViewportClick}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Grid */}
          {showGrid && (
            <div data-testid="drawing-grid" className="drawing-canvas__grid" />
          )}

          {/* Layers and Elements */}
          {visibleLayers.map((layer) => (
            <div
              key={layer.id}
              data-testid={`layer-${layer.id}`}
              className="drawing-canvas__layer"
            >
              {layer.elements.map((element) => {
                const isSelected = selectedElementId === element.id;
                const label = getElementLabel(element);
                const isDraggable = !layer.isLocked;

                return (
                  <div
                    key={element.id}
                    data-testid={`element-${element.id}`}
                    data-type={element.type}
                    draggable={isDraggable}
                    aria-label={`${element.type} element: ${label}`}
                    className={`drawing-canvas__element drawing-canvas__element--${element.type} ${isSelected ? 'selected' : ''}`}
                    style={{
                      transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg)`,
                    }}
                    onClick={(e) => handleElementClick(e, element.id, label)}
                    onDragStart={(e) => handleElementDragStart(e, element.id)}
                    onDragEnd={(e) => handleElementDragEnd(e, element.id)}
                    title={label}
                  >
                    {element.type === 'text' && (
                      <span className="drawing-canvas__element-text">
                        {(element.properties as { text?: string }).text || ''}
                      </span>
                    )}
                    <span className="drawing-canvas__element-label">{label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
