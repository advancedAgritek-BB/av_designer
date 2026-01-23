/**
 * Template Step
 *
 * Source template selection for the import wizard.
 * Allows users to apply saved column mappings or start fresh.
 */

import { useState, useCallback } from 'react';
import { useImportStore } from '../import-store';
import { useSourceTemplates } from '../use-source-templates';
import { useAuthStore } from '@/features/auth/auth-store';
import type { SourceTemplate, FileType } from '../import-types';

// ============================================================================
// Types
// ============================================================================

interface TemplateStepProps {
  fileType: FileType;
  onContinue: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function TemplateStep({ fileType, onContinue }: TemplateStepProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const applyTemplate = useImportStore((state) => state.applyTemplate);

  // Get the user's organization ID - for now use a placeholder
  // In production, this would come from the user's current organization context
  const orgId = user?.id ?? '';

  const { data: templates, isLoading } = useSourceTemplates(orgId);

  // Filter templates to match the current file type
  const compatibleTemplates = templates?.filter((t) => t.fileType === fileType) ?? [];

  const handleTemplateSelect = useCallback((template: SourceTemplate | null) => {
    if (template) {
      setSelectedTemplateId(template.id);
    } else {
      setSelectedTemplateId(null);
    }
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedTemplateId) {
      const template = compatibleTemplates.find((t) => t.id === selectedTemplateId);
      if (template) {
        applyTemplate(template.id, template.columnMappings);
      }
    }
    onContinue();
  }, [selectedTemplateId, compatibleTemplates, applyTemplate, onContinue]);

  return (
    <div className="template-step">
      <p className="template-step__description">
        Do you have a saved template for this source? Templates remember column mappings for repeat
        imports from the same distributor or manufacturer.
      </p>

      <div className="template-step__list">
        {/* Start Fresh Option */}
        <button
          type="button"
          className={`template-step__option ${
            selectedTemplateId === null ? 'template-step__option--selected' : ''
          }`}
          onClick={() => handleTemplateSelect(null)}
        >
          <div className="template-step__option-radio" />
          <div className="template-step__option-content">
            <div className="template-step__option-name">Start Fresh</div>
            <div className="template-step__option-description">
              Map columns manually (you can save as a template later)
            </div>
          </div>
        </button>

        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              padding: 'var(--spacing-4)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            Loading saved templates...
          </div>
        )}

        {/* Saved Templates */}
        {!isLoading && compatibleTemplates.length > 0 && (
          <>
            <div
              style={{
                padding: 'var(--spacing-3) 0',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-tertiary)',
                fontWeight: 500,
              }}
            >
              Saved Templates
            </div>
            {compatibleTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`template-step__option ${
                  selectedTemplateId === template.id ? 'template-step__option--selected' : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="template-step__option-radio" />
                <div className="template-step__option-content">
                  <div className="template-step__option-name">{template.name}</div>
                  <div className="template-step__option-description">
                    {template.description || `${template.columnMappings.filter((m) => m.targetField).length} columns mapped`}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  {formatRelativeDate(template.updatedAt)}
                </div>
              </button>
            ))}
          </>
        )}

        {/* No Templates Message */}
        {!isLoading && compatibleTemplates.length === 0 && (
          <div
            style={{
              padding: 'var(--spacing-4)',
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)',
            }}
          >
            No saved templates for {fileType.toUpperCase()} files yet.
            <br />
            You can save your mappings as a template after import.
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleContinue}
          style={{
            padding: 'var(--spacing-3) var(--spacing-6)',
            backgroundColor: 'var(--color-accent-gold)',
            color: 'var(--color-bg-primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
}
