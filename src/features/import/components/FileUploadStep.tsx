/**
 * File Upload Step
 *
 * Drag-and-drop file selection for the import wizard.
 * Accepts Excel (.xlsx), CSV, and PDF files.
 */

import { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui';
import type { FileType } from '../import-types';

// ============================================================================
// Types
// ============================================================================

interface FileUploadStepProps {
  onFileSelect: (file: File, fileType: FileType) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface SelectedFile {
  file: File;
  fileType: FileType;
}

// ============================================================================
// Constants
// ============================================================================

const ACCEPTED_EXTENSIONS: Record<string, FileType> = {
  xlsx: 'xlsx',
  xls: 'xlsx',
  csv: 'csv',
  pdf: 'pdf',
};

const ACCEPTED_MIME_TYPES: Record<string, FileType> = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xlsx',
  'text/csv': 'csv',
  'application/csv': 'csv',
  'application/pdf': 'pdf',
};

// ============================================================================
// Helpers
// ============================================================================

function getFileType(file: File): FileType | null {
  // Check MIME type first
  if (file.type && ACCEPTED_MIME_TYPES[file.type]) {
    return ACCEPTED_MIME_TYPES[file.type];
  }

  // Fall back to extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && ACCEPTED_EXTENSIONS[extension]) {
    return ACCEPTED_EXTENSIONS[extension];
  }

  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(fileType: FileType): string {
  switch (fileType) {
    case 'xlsx':
      return 'Excel Spreadsheet';
    case 'csv':
      return 'CSV File';
    case 'pdf':
      return 'PDF Document';
  }
}

// ============================================================================
// Component
// ============================================================================

export function FileUploadStep({ onFileSelect, isLoading, error }: FileUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setValidationError(null);

      const fileType = getFileType(file);
      if (!fileType) {
        setValidationError(
          'Unsupported file type. Please select an Excel (.xlsx), CSV, or PDF file.'
        );
        return;
      }

      setSelectedFile({ file, fileType });
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDropzoneClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile.file, selectedFile.fileType);
    }
  }, [selectedFile, onFileSelect]);

  const displayError = error || validationError;

  return (
    <div className="file-upload-step">
      {selectedFile ? (
        // File selected state
        <div className="file-upload-step__selected">
          <div className="file-upload-step__file-icon">
            <FileIcon fileType={selectedFile.fileType} />
          </div>
          <div className="file-upload-step__file-info">
            <div className="file-upload-step__file-name">{selectedFile.file.name}</div>
            <div className="file-upload-step__file-meta">
              {getFileTypeLabel(selectedFile.fileType)} &bull;{' '}
              {formatFileSize(selectedFile.file.size)}
            </div>
          </div>
          <button
            type="button"
            className="file-upload-step__file-remove"
            onClick={handleRemoveFile}
            aria-label="Remove file"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        // Dropzone state
        <div
          role="button"
          tabIndex={0}
          className={`file-upload-step__dropzone ${
            isDragging ? 'file-upload-step__dropzone--dragging' : ''
          } ${displayError ? 'file-upload-step__dropzone--error' : ''}`}
          onClick={handleDropzoneClick}
          onKeyDown={(e) => e.key === 'Enter' && handleDropzoneClick()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-upload-step__icon">
            <UploadIcon />
          </div>
          <div className="file-upload-step__text">
            <div className="file-upload-step__primary">
              Drop your pricing sheet here or click to browse
            </div>
            <div className="file-upload-step__secondary">
              Import equipment from distributor or manufacturer price lists
            </div>
          </div>
          <div className="file-upload-step__formats">
            <span className="file-upload-step__format">.xlsx</span>
            <span className="file-upload-step__format">.csv</span>
            <span className="file-upload-step__format">.pdf</span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.pdf"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-label="Select file"
      />

      {displayError && <div className="file-upload-step__error">{displayError}</div>}

      {selectedFile && (
        <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center' }}>
          <Button variant="primary" onClick={handleContinue} disabled={isLoading}>
            {isLoading ? 'Parsing...' : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function UploadIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function FileIcon({ fileType }: { fileType: FileType }) {
  const color =
    fileType === 'xlsx'
      ? 'var(--color-status-success)'
      : fileType === 'csv'
        ? 'var(--color-accent-blue)'
        : 'var(--color-status-error)';

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
