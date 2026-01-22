/**
 * Version History Panel
 *
 * Displays template version history with restore actions.
 */
import { Button, Modal } from '@/components/ui';
import { useTemplateVersions, useRestoreVersion } from '../use-templates';

interface VersionHistoryPanelProps {
  templateId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryPanel({
  templateId,
  isOpen,
  onClose,
}: VersionHistoryPanelProps) {
  const { data: versions = [], isLoading } = useTemplateVersions(templateId || '');
  const restoreMutation = useRestoreVersion();

  const handleRestore = async (version: number) => {
    if (!templateId) return;
    await restoreMutation.mutateAsync({ templateId, version });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Version History"
      description="View previous versions and restore if needed."
      size="lg"
    >
      {isLoading ? (
        <div className="text-text-secondary">Loading versions...</div>
      ) : (
        <div className="space-y-4">
          {versions.length === 0 && (
            <p className="text-text-tertiary text-sm">No versions found.</p>
          )}
          {versions.map((version, index) => (
            <div
              key={version.id}
              className="border border-border rounded-lg p-4 bg-bg-secondary"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    v{version.version}
                    {index === 0 && (
                      <span className="ml-2 text-xs text-accent-gold">Current</span>
                    )}
                  </p>
                  {version.changeSummary && (
                    <p className="text-xs text-text-secondary mt-1">
                      {version.changeSummary}
                    </p>
                  )}
                  <p className="text-xs text-text-tertiary mt-1">
                    {new Date(version.createdAt).toLocaleString()}
                  </p>
                </div>
                {index !== 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRestore(version.version)}
                    loading={restoreMutation.isPending}
                  >
                    Restore
                  </Button>
                )}
              </div>
              <details className="mt-3 text-xs text-text-tertiary">
                <summary className="cursor-pointer">View content</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {JSON.stringify(version.content, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
