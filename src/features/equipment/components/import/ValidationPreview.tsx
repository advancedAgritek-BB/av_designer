/**
 * ValidationPreview Component
 *
 * Shows parsed rows with errors/warnings and allows filtering
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui';
import type { ImportPreview, ParsedRow } from '@/types/equipment';

interface ValidationPreviewProps {
  preview: ImportPreview;
  onEditRow: (rowNumber: number) => void;
}

type FilterType = 'all' | 'valid' | 'warning' | 'error' | 'create' | 'update';

export function ValidationPreview({ preview, onEditRow }: ValidationPreviewProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = useMemo(() => {
    let rows = preview.rows;

    // Apply status/action filter
    if (filter === 'valid') {
      rows = rows.filter((r) => r.status === 'valid');
    } else if (filter === 'warning') {
      rows = rows.filter((r) => r.status === 'warning');
    } else if (filter === 'error') {
      rows = rows.filter((r) => r.status === 'error');
    } else if (filter === 'create') {
      rows = rows.filter((r) => r.action === 'create');
    } else if (filter === 'update') {
      rows = rows.filter((r) => r.action === 'update');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      rows = rows.filter((r) => {
        const data = r.data;
        return (
          data.manufacturer?.toLowerCase().includes(query) ||
          data.model?.toLowerCase().includes(query) ||
          data.sku?.toLowerCase().includes(query)
        );
      });
    }

    return rows;
  }, [preview.rows, filter, searchQuery]);

  const getStatusIcon = (row: ParsedRow) => {
    if (row.status === 'error') {
      return (
        <span className="text-error" title="Error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
          </svg>
        </span>
      );
    }
    if (row.status === 'warning' || row.action === 'update') {
      return (
        <span
          className="text-warning"
          title={row.action === 'update' ? 'Update' : 'Warning'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
          </svg>
        </span>
      );
    }
    return (
      <span className="text-green-500" title="Valid">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
        </svg>
      </span>
    );
  };

  return (
    <div className="validation-preview">
      {/* Summary Stats */}
      <div className="validation-preview__summary">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('valid')}
            className={`validation-preview__stat ${filter === 'valid' ? 'validation-preview__stat--active' : ''}`}
          >
            <span className="validation-preview__stat-value text-green-500">
              {preview.summary.valid}
            </span>
            <span className="validation-preview__stat-label">valid</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('warning')}
            className={`validation-preview__stat ${filter === 'warning' ? 'validation-preview__stat--active' : ''}`}
          >
            <span className="validation-preview__stat-value text-warning">
              {preview.summary.warnings}
            </span>
            <span className="validation-preview__stat-label">warnings</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('error')}
            className={`validation-preview__stat ${filter === 'error' ? 'validation-preview__stat--active' : ''}`}
          >
            <span className="validation-preview__stat-value text-error">
              {preview.summary.errors}
            </span>
            <span className="validation-preview__stat-label">errors</span>
          </button>

          <div className="h-6 w-px bg-border mx-2" />

          <button
            type="button"
            onClick={() => setFilter('create')}
            className={`validation-preview__stat ${filter === 'create' ? 'validation-preview__stat--active' : ''}`}
          >
            <span className="validation-preview__stat-value text-accent-gold">
              {preview.summary.toCreate}
            </span>
            <span className="validation-preview__stat-label">new</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('update')}
            className={`validation-preview__stat ${filter === 'update' ? 'validation-preview__stat--active' : ''}`}
          >
            <span className="validation-preview__stat-value text-blue-400">
              {preview.summary.toUpdate}
            </span>
            <span className="validation-preview__stat-label">updates</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="validation-preview__filters">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="settings-select text-sm"
        >
          <option value="all">All ({preview.summary.total})</option>
          <option value="valid">Valid ({preview.summary.valid})</option>
          <option value="warning">Warnings ({preview.summary.warnings})</option>
          <option value="error">Errors ({preview.summary.errors})</option>
          <option value="create">New items ({preview.summary.toCreate})</option>
          <option value="update">Updates ({preview.summary.toUpdate})</option>
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="settings-input text-sm flex-1 max-w-xs"
        />
      </div>

      {/* Rows Table */}
      <div className="validation-preview__table">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-tertiary text-text-secondary">
              <th className="px-3 py-2 text-left font-medium w-12">#</th>
              <th className="px-3 py-2 text-left font-medium">Manufacturer</th>
              <th className="px-3 py-2 text-left font-medium">Model</th>
              <th className="px-3 py-2 text-left font-medium">SKU</th>
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-right font-medium">Cost</th>
              <th className="px-3 py-2 text-right font-medium">MSRP</th>
              <th className="px-3 py-2 text-center font-medium w-20">Status</th>
              <th className="px-3 py-2 text-center font-medium w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredRows.map((row) => (
              <tr
                key={row.rowNumber}
                className={`hover:bg-bg-secondary/50 ${row.status === 'error' ? 'bg-error/5' : ''}`}
              >
                <td className="px-3 py-2 text-text-tertiary tabular-nums">
                  {row.rowNumber}
                </td>
                <td className="px-3 py-2 text-text-primary truncate max-w-32">
                  {row.data.manufacturer || '-'}
                </td>
                <td className="px-3 py-2 text-text-primary truncate max-w-32">
                  {row.data.model || '-'}
                </td>
                <td className="px-3 py-2 text-text-secondary font-mono text-xs">
                  {row.data.sku || '-'}
                </td>
                <td className="px-3 py-2 text-text-secondary capitalize">
                  {row.data.category || '-'}
                </td>
                <td className="px-3 py-2 text-text-primary text-right tabular-nums">
                  {row.data.cost !== undefined ? `$${row.data.cost.toFixed(2)}` : '-'}
                </td>
                <td className="px-3 py-2 text-text-primary text-right tabular-nums">
                  {row.data.msrp !== undefined ? `$${row.data.msrp.toFixed(2)}` : '-'}
                </td>
                <td className="px-3 py-2 text-center">{getStatusIcon(row)}</td>
                <td className="px-3 py-2 text-center">
                  {row.status === 'error' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditRow(row.rowNumber)}
                    >
                      Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredRows.length === 0 && (
        <div className="text-center py-8 text-text-tertiary">
          <p>No rows match the current filter</p>
        </div>
      )}

      {/* Error Details */}
      {filter === 'error' && filteredRows.length > 0 && (
        <div className="validation-preview__errors">
          <h4 className="text-sm font-medium text-text-primary mb-2">Error Details</h4>
          <div className="space-y-2">
            {filteredRows.slice(0, 10).map((row) => (
              <div
                key={row.rowNumber}
                className="p-2 bg-error/5 rounded border border-error/20"
              >
                <p className="text-xs font-medium text-text-primary mb-1">
                  Row {row.rowNumber}
                </p>
                <ul className="text-xs text-error space-y-0.5">
                  {row.errors.map((err, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{err.field}:</span> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
