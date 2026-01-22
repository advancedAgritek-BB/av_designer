/**
 * Templates Page Component
 *
 * Main page for browsing, managing, and using templates
 */
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, ModalFooter, Input } from '@/components/ui';
import { useAuthStore } from '@/features/auth/auth-store';
import { ROUTES } from '@/routes';
import {
  useTemplateList,
  useDeleteTemplate,
  useArchiveTemplate,
  useForkTemplate,
  useDuplicateTemplate,
  usePromoteTemplate,
} from '../use-templates';
import { TemplateGrid } from './TemplateGrid';
import { TemplateFiltersBar } from './TemplateFilters';
import { TemplateEditor } from './TemplateEditor';
import { ApplyTemplateModal } from './ApplyTemplateModal';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import type { Template, TemplateType, TemplateFilters } from '../template-types';

type TabId = 'rooms' | 'packages' | 'projects' | 'quotes';

interface Tab {
  id: TabId;
  label: string;
  type: TemplateType;
}

const TABS: Tab[] = [
  { id: 'rooms', label: 'Rooms', type: 'room' },
  { id: 'packages', label: 'Packages', type: 'equipment_package' },
  { id: 'projects', label: 'Projects', type: 'project' },
  { id: 'quotes', label: 'Quotes', type: 'quote' },
];

/**
 * Tab navigation
 */
function TabNav({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="flex border-b border-border" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === tab.id
              ? 'border-accent-gold text-accent-gold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

/**
 * Error state
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2 text-balance">
        Failed to load templates
      </h3>
      <p className="text-text-secondary mb-6 max-w-sm text-pretty">{message}</p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}

export function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('rooms');
  const [filters, setFilters] = useState<TemplateFilters>({
    isArchived: false,
  });
  const [editorTemplateId, setEditorTemplateId] = useState<string | undefined>();
  const [editorType, setEditorType] = useState<TemplateType>('room');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [applyTemplateId, setApplyTemplateId] = useState<string | null>(null);
  const [versionTemplateId, setVersionTemplateId] = useState<string | null>(null);
  const [forkTemplate, setForkTemplate] = useState<Template | null>(null);
  const [forkName, setForkName] = useState('');
  const [forkDescription, setForkDescription] = useState('');
  const [duplicateTemplate, setDuplicateTemplate] = useState<Template | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  const [promoteTemplate, setPromoteTemplate] = useState<Template | null>(null);
  const [promoteScope, setPromoteScope] = useState<'team' | 'org'>('team');

  const activeType = TABS.find((t) => t.id === activeTab)?.type || 'room';

  // Combine tab type with filters
  const queryFilters: TemplateFilters = {
    ...filters,
    type: activeType,
  };

  const { data: templates, isLoading, error, refetch } = useTemplateList(queryFilters);
  const deleteMutation = useDeleteTemplate();
  const archiveMutation = useArchiveTemplate();
  const forkMutation = useForkTemplate();
  const duplicateMutation = useDuplicateTemplate();
  const promoteMutation = usePromoteTemplate();

  const currentUser = useAuthStore((state) => state.user);
  const currentOrg = useAuthStore((state) => state.currentOrg);
  const currentTeam = useAuthStore((state) => state.currentTeam);
  const navigate = useNavigate();

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  const handleFiltersChange = useCallback((newFilters: TemplateFilters) => {
    setFilters(newFilters);
  }, []);

  const handleUseTemplate = useCallback((template: Template) => {
    setApplyTemplateId(template.id);
  }, []);

  const handleEditTemplate = useCallback((template: Template) => {
    setEditorTemplateId(template.id);
    setEditorType(template.type);
    setIsEditorOpen(true);
  }, []);

  const handleForkTemplate = useCallback((template: Template) => {
    setForkTemplate(template);
    setForkName(`${template.name} (Copy)`);
    setForkDescription(template.description || '');
  }, []);

  const handleDeleteTemplate = useCallback(
    (template: Template) => {
      if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
        deleteMutation.mutate(template.id);
      }
    },
    [deleteMutation]
  );

  const handleCreateNew = useCallback(() => {
    setEditorTemplateId(undefined);
    setEditorType(activeType);
    setIsEditorOpen(true);
  }, [activeType]);

  const handleDuplicateTemplate = useCallback((template: Template) => {
    setDuplicateTemplate(template);
    setDuplicateName(`${template.name} (Duplicate)`);
  }, []);

  const handleArchiveTemplate = useCallback(
    (template: Template) => {
      if (window.confirm(`Archive "${template.name}"?`)) {
        archiveMutation.mutate(template.id);
      }
    },
    [archiveMutation]
  );

  const handlePromoteTemplate = useCallback(
    (template: Template) => {
      setPromoteTemplate(template);
      if (template.scope === 'team') {
        setPromoteScope('org');
      } else if (currentTeam) {
        setPromoteScope('team');
      } else {
        setPromoteScope('org');
      }
    },
    [currentTeam]
  );

  const handleApplied = useCallback(
    (result: import('../template-types').ApplyTemplateResult) => {
      if (!result) return;
      if (result.roomId) {
        navigate(`/rooms/${result.roomId}/design`);
        return;
      }
      if (result.projectId) {
        navigate(`/projects/${result.projectId}`);
      }
    },
    [navigate]
  );

  const availablePromoteOptions = useMemo(() => {
    if (!promoteTemplate) return [];
    const options: Array<{ value: 'team' | 'org'; label: string }> = [];
    if (promoteTemplate.scope === 'personal' && currentTeam) {
      options.push({ value: 'team', label: 'Team' });
    }
    if (currentOrg && promoteTemplate.scope !== 'org') {
      options.push({ value: 'org', label: 'Organization' });
    }
    return options;
  }, [promoteTemplate, currentTeam, currentOrg]);

  if (error) {
    return (
      <main role="main" data-testid="templates-page">
        <ErrorState
          message={
            error instanceof Error ? error.message : 'An unexpected error occurred'
          }
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  return (
    <main role="main" data-testid="templates-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Templates</h1>
          <p className="text-text-secondary mt-1">Browse and manage reusable templates</p>
        </div>
        <Button variant="primary" onClick={handleCreateNew} disabled={!currentOrg}>
          + New Template
        </Button>
      </div>
      {!currentOrg && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-text-tertiary">
            Create an organization to manage templates.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.SETTINGS)}
          >
            Create organization
          </Button>
        </div>
      )}

      {/* Type Tabs */}
      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Filters */}
      <TemplateFiltersBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showTypeFilter={false}
      />

      {/* Template Grid */}
      <TemplateGrid
        templates={templates || []}
        isLoading={isLoading}
        onUse={handleUseTemplate}
        onEdit={handleEditTemplate}
        onFork={handleForkTemplate}
        onDuplicate={handleDuplicateTemplate}
        onPromote={handlePromoteTemplate}
        onArchive={handleArchiveTemplate}
        onDelete={handleDeleteTemplate}
        currentUserId={currentUser?.id}
        currentTeamId={currentTeam?.id ?? null}
        currentOrgId={currentOrg?.id ?? null}
        emptyMessage={`No ${activeType.replace('_', ' ')} templates found. Create one to get started.`}
      />

      <TemplateEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        templateId={editorTemplateId}
        initialType={editorType}
        onOpenVersionHistory={(id) => setVersionTemplateId(id)}
      />

      <ApplyTemplateModal
        isOpen={!!applyTemplateId}
        templateId={applyTemplateId}
        onClose={() => setApplyTemplateId(null)}
        onApplied={handleApplied}
      />

      <VersionHistoryPanel
        templateId={versionTemplateId}
        isOpen={!!versionTemplateId}
        onClose={() => setVersionTemplateId(null)}
      />

      {forkTemplate && (
        <Modal
          isOpen={!!forkTemplate}
          onClose={() => setForkTemplate(null)}
          title="Fork Template"
          description="Create a personal copy of this template."
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={forkName}
              onChange={(e) => setForkName(e.target.value)}
            />
            <div className="space-y-2">
              <label className="label" htmlFor="fork-description">
                Description
              </label>
              <textarea
                id="fork-description"
                value={forkDescription}
                onChange={(e) => setForkDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-gold resize-none"
                placeholder="Optional description"
              />
            </div>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setForkTemplate(null)} type="button">
                Cancel
              </Button>
              <Button
                type="button"
                loading={forkMutation.isPending}
                onClick={async () => {
                  if (!forkTemplate || !currentOrg) return;
                  await forkMutation.mutateAsync({
                    sourceId: forkTemplate.id,
                    data: {
                      name: forkName.trim() || `${forkTemplate.name} Copy`,
                      description: forkDescription.trim() || undefined,
                      scope: 'personal',
                    },
                    orgId: currentOrg.id,
                  });
                  setForkTemplate(null);
                }}
              >
                Create Fork
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      )}

      {duplicateTemplate && (
        <Modal
          isOpen={!!duplicateTemplate}
          onClose={() => setDuplicateTemplate(null)}
          title="Duplicate Template"
          description="Create a new template from this one."
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
            />
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setDuplicateTemplate(null)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                loading={duplicateMutation.isPending}
                onClick={async () => {
                  if (!duplicateTemplate) return;
                  await duplicateMutation.mutateAsync({
                    sourceId: duplicateTemplate.id,
                    name: duplicateName.trim() || `${duplicateTemplate.name} Copy`,
                  });
                  setDuplicateTemplate(null);
                }}
              >
                Duplicate
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      )}

      {promoteTemplate && (
        <Modal
          isOpen={!!promoteTemplate}
          onClose={() => setPromoteTemplate(null)}
          title="Promote Template"
          description="Increase template visibility to a higher scope."
        >
          <div className="space-y-4">
            <div className="input-wrapper">
              <label className="label" htmlFor="promote-scope">
                New Scope
              </label>
              <select
                id="promote-scope"
                className="input"
                value={promoteScope}
                onChange={(e) => setPromoteScope(e.target.value as 'team' | 'org')}
              >
                {availablePromoteOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setPromoteTemplate(null)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                loading={promoteMutation.isPending}
                onClick={async () => {
                  if (!promoteTemplate) return;
                  await promoteMutation.mutateAsync({
                    id: promoteTemplate.id,
                    data: {
                      scope: promoteScope,
                      teamId: promoteScope === 'team' ? currentTeam?.id : undefined,
                    },
                  });
                  setPromoteTemplate(null);
                }}
                disabled={availablePromoteOptions.length === 0}
              >
                Promote
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      )}
    </main>
  );
}
