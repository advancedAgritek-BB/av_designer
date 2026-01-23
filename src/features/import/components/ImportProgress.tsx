/**
 * Import Progress
 *
 * Progress indicator shown during the actual import execution.
 * Displays import status and results when complete.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import type { ImportResult } from '../import-types';

// ============================================================================
// Types
// ============================================================================

interface ImportProgressProps {
  status: 'importing' | 'complete' | 'failed';
  progress?: {
    current: number;
    total: number;
  };
  result?: ImportResult;
  error?: string;
  onRetry?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ImportProgress({
  status,
  progress,
  result,
  error,
  onRetry,
}: ImportProgressProps) {
  const progressPercent = useMemo(() => {
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  }, [progress]);

  // Importing state
  if (status === 'importing') {
    return (
      <div className="import-progress">
        <div className="import-progress__spinner" />
        <div className="import-progress__text">Importing Equipment...</div>
        {progress && (
          <>
            <div className="import-progress__bar">
              <div
                className="import-progress__bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="import-progress__subtext">
              {progress.current} of {progress.total} rows ({progressPercent}%)
            </div>
          </>
        )}
      </div>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <div className="import-complete import-complete--failed">
        <ErrorIcon />
        <div className="import-complete__title">Import Failed</div>
        <div className="import-complete__subtitle">
          {error || 'An unexpected error occurred during import.'}
        </div>
        <div className="import-complete__actions">
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              Retry Import
            </Button>
          )}
          <Link to="/equipment">
            <Button variant="secondary">Back to Equipment</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Complete state
  return (
    <div className="import-complete">
      <SuccessIcon />
      <div className="import-complete__title">Import Complete</div>
      <div className="import-complete__subtitle">
        Your equipment has been successfully imported.
      </div>

      {result && (
        <div className="import-complete__stats">
          <div className="import-complete__stat">
            <div className="import-complete__stat-value import-complete__stat-value--success">
              {result.created}
            </div>
            <div className="import-complete__stat-label">Created</div>
          </div>
          <div className="import-complete__stat">
            <div className="import-complete__stat-value">{result.updated}</div>
            <div className="import-complete__stat-label">Updated</div>
          </div>
          {result.skipped > 0 && (
            <div className="import-complete__stat">
              <div className="import-complete__stat-value import-complete__stat-value--warning">
                {result.skipped}
              </div>
              <div className="import-complete__stat-label">Skipped</div>
            </div>
          )}
        </div>
      )}

      {result?.errors && result.errors.length > 0 && (
        <div className="import-complete__errors">
          <div className="import-complete__errors-title">
            {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} had errors:
          </div>
          <ul className="import-complete__errors-list">
            {result.errors.slice(0, 5).map((err) => (
              <li key={err.rowNumber}>
                Row {err.rowNumber}: {err.error}
              </li>
            ))}
            {result.errors.length > 5 && (
              <li>...and {result.errors.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      <div className="import-complete__actions">
        <Link to="/equipment">
          <Button variant="primary">View Equipment</Button>
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function SuccessIcon() {
  return (
    <svg
      className="import-complete__icon"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="import-complete__icon import-complete__icon--error"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
