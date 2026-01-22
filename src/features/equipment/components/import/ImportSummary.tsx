/**
 * ImportSummary Component
 *
 * Final review before committing import
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import type { ImportPreview } from '@/types/equipment';

interface ImportSummaryProps {
  preview: ImportPreview;
  distributorName: string;
  onConfirm: () => void;
  onBack: () => void;
  isImporting: boolean;
}

export function ImportSummary({
  preview,
  distributorName,
  onConfirm,
  onBack,
  isImporting,
}: ImportSummaryProps) {
  const [confirmed, setConfirmed] = useState(false);

  const canImport =
    confirmed &&
    !isImporting &&
    (preview.summary.valid > 0 || preview.summary.warnings > 0);

  const totalToImport = preview.summary.valid + preview.summary.warnings;

  return (
    <div className="import-summary">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Ready to import {totalToImport} items from {distributorName}
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-green-500"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-sm text-text-secondary">New items</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {preview.summary.toCreate}
          </p>
        </div>

        <div className="p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-400"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            <span className="text-sm text-text-secondary">Updates</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {preview.summary.toUpdate}
          </p>
        </div>

        <div className="p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-warning"
            >
              <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
            <span className="text-sm text-text-secondary">With warnings</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {preview.summary.warnings}
          </p>
          <p className="text-xs text-text-tertiary mt-1">Will be imported</p>
        </div>

        <div className="p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-error"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6M9 9l6 6" />
            </svg>
            <span className="text-sm text-text-secondary">Errors</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {preview.summary.errors}
          </p>
          <p className="text-xs text-text-tertiary mt-1">Will be skipped</p>
        </div>
      </div>

      {/* What will happen */}
      <div className="p-4 bg-bg-secondary rounded-lg border border-border mb-6">
        <h4 className="text-sm font-medium text-text-primary mb-3">What will happen:</h4>
        <ul className="space-y-2 text-sm text-text-secondary">
          {preview.summary.toCreate > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">+</span>
              <span>
                {preview.summary.toCreate} new equipment items will be created in your
                catalog
              </span>
            </li>
          )}
          {preview.summary.toUpdate > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">~</span>
              <span>
                {preview.summary.toUpdate} existing items will have pricing updated from{' '}
                {distributorName}
              </span>
            </li>
          )}
          {preview.summary.errors > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-error mt-0.5">x</span>
              <span>{preview.summary.errors} rows with errors will be skipped</span>
            </li>
          )}
        </ul>
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer p-4 bg-bg-tertiary rounded-lg border border-border mb-6">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="settings-checkbox mt-0.5"
        />
        <span className="text-sm text-text-primary">
          I understand this will update pricing for existing items from {distributorName}{' '}
          and create new equipment entries in my catalog.
        </span>
      </label>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={onBack} disabled={isImporting}>
          Back
        </Button>

        <Button onClick={onConfirm} disabled={!canImport}>
          {isImporting ? (
            <>
              <span className="inline-block animate-spin mr-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </span>
              Importing...
            </>
          ) : (
            `Import ${totalToImport} Items`
          )}
        </Button>
      </div>
    </div>
  );
}
