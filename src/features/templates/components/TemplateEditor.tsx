/**
 * Template Editor
 *
 * Creates or edits templates with type-specific content editors.
 */
import { useMemo, useState } from 'react';
import { Button, Input, Modal, ModalFooter } from '@/components/ui';
import { useAuthStore } from '@/features/auth/auth-store';
import type { Organization, Team } from '@/features/auth/auth-types';
import {
  useCreateTemplate,
  useUpdateTemplate,
  useUpdateTemplateContent,
  useTemplateWithVersion,
} from '../use-templates';
import { createEmptyTemplateContent } from '../template-utils';
import { RoomTemplateEditor } from './RoomTemplateEditor';
import { PackageEditor } from './PackageEditor';
import { ProjectTemplateEditor } from './ProjectTemplateEditor';
import { QuoteTemplateEditor } from './QuoteTemplateEditor';
import type {
  Template,
  TemplateContent,
  TemplateScope,
  TemplateType,
  TemplateWithVersion,
  RoomTemplateContent,
  EquipmentPackageContent,
  ProjectTemplateContent,
  QuoteTemplateContent,
} from '../template-types';

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  initialType?: TemplateType;
  onSaved?: (template: Template) => void;
  onOpenVersionHistory?: (templateId: string) => void;
}

const SCOPE_LABELS: Record<TemplateScope, string> = {
  personal: 'Personal',
  team: 'Team',
  org: 'Organization',
  system: 'System',
};

interface TemplateEditorFormState {
  type: TemplateType;
  name: string;
  description: string;
  tagsInput: string;
  scope: TemplateScope;
  content: TemplateContent;
}

interface TemplateEditorFormProps {
  isEditing: boolean;
  templateId?: string;
  templateData: TemplateWithVersion | null;
  initialState: TemplateEditorFormState;
  currentOrg: Organization | null;
  currentTeam: Team | null;
  onClose: () => void;
  onSaved?: (template: Template) => void;
  onOpenVersionHistory?: (templateId: string) => void;
}

function TemplateEditorForm({
  isEditing,
  templateId,
  templateData,
  initialState,
  currentOrg,
  currentTeam,
  onClose,
  onSaved,
  onOpenVersionHistory,
}: TemplateEditorFormProps) {
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const updateContentMutation = useUpdateTemplateContent();

  const [type, setType] = useState<TemplateType>(initialState.type);
  const [name, setName] = useState(initialState.name);
  const [description, setDescription] = useState(initialState.description);
  const [tagsInput, setTagsInput] = useState(initialState.tagsInput);
  const [scope, setScope] = useState<TemplateScope>(initialState.scope);
  const [content, setContent] = useState<TemplateContent>(initialState.content);
  const [changeSummary, setChangeSummary] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [initialContentSnapshot] = useState(() => JSON.stringify(initialState.content));

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateContentMutation.isPending;

  const tags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput]
  );

  const canSave = !!name.trim() && !!currentOrg;
  const contentChanged = isEditing && JSON.stringify(content) !== initialContentSnapshot;

  const handleTypeChange = (nextType: TemplateType) => {
    setType(nextType);
    if (!isEditing) {
      setContent(createEmptyTemplateContent(nextType));
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!canSave || isBusy) return;
    setLocalError(null);

    if (!currentOrg) {
      setLocalError('You must belong to an organization to create templates.');
      return;
    }

    if (isEditing && contentChanged && !changeSummary.trim()) {
      setLocalError('Provide a change summary to save a new version.');
      return;
    }

    try {
      if (!isEditing) {
        const created = await createMutation.mutateAsync({
          type,
          name: name.trim(),
          description: description.trim() || undefined,
          scope,
          teamId: scope === 'team' ? currentTeam?.id : undefined,
          orgId: currentOrg.id,
          categoryTags: tags,
          isPublished: publish,
          content,
          changeSummary: 'Initial version',
        });
        onSaved?.(created);
        onClose();
        return;
      }

      if (!templateData) {
        setLocalError('Template data is unavailable.');
        return;
      }

      await updateMutation.mutateAsync({
        id: templateData.id,
        data: {
          name: name.trim(),
          description: description.trim() || null,
          categoryTags: tags,
          isPublished: publish ? true : templateData.isPublished,
        },
      });

      if (contentChanged) {
        await updateContentMutation.mutateAsync({
          id: templateData.id,
          data: {
            content,
            changeSummary: changeSummary.trim(),
          },
        });
      }

      onSaved?.({
        ...templateData,
        name: name.trim(),
        description: description.trim() || null,
        categoryTags: tags,
      });
      onClose();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to save template');
    }
  };

  const renderEditor = () => {
    if (type === 'room') {
      return (
        <RoomTemplateEditor
          value={content as RoomTemplateContent}
          onChange={setContent}
        />
      );
    }
    if (type === 'equipment_package') {
      return (
        <PackageEditor value={content as EquipmentPackageContent} onChange={setContent} />
      );
    }
    if (type === 'project') {
      return (
        <ProjectTemplateEditor
          value={content as ProjectTemplateContent}
          onChange={setContent}
        />
      );
    }
    return (
      <QuoteTemplateEditor
        value={content as QuoteTemplateContent}
        onChange={setContent}
      />
    );
  };

  return (
    <div className="space-y-6 template-editor">
      {!currentOrg && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          You need to belong to an organization before creating templates.
        </div>
      )}

      {localError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {localError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isBusy}
        />
        <Input
          label="Tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="conference, teams, premium"
          disabled={isBusy}
        />
      </div>

      <div className="space-y-2">
        <label className="label" htmlFor="template-description">
          Description
        </label>
        <textarea
          id="template-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-gold resize-none"
          placeholder="What makes this template special?"
          disabled={isBusy}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="input-wrapper">
          <label className="label" htmlFor="template-type">
            Template Type
          </label>
          <select
            id="template-type"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as TemplateType)}
            className="input"
            disabled={isEditing || isBusy}
          >
            <option value="room">Room</option>
            <option value="equipment_package">Equipment Package</option>
            <option value="project">Project</option>
            <option value="quote">Quote</option>
          </select>
        </div>

        <div className="input-wrapper">
          <label className="label" htmlFor="template-scope">
            Scope
          </label>
          {isEditing ? (
            <div className="input bg-bg-tertiary flex items-center">
              {SCOPE_LABELS[scope]}
            </div>
          ) : (
            <select
              id="template-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as TemplateScope)}
              className="input"
              disabled={isBusy}
            >
              <option value="personal">Personal</option>
              <option value="team" disabled={!currentTeam}>
                Team
              </option>
              <option value="org">Organization</option>
            </select>
          )}
        </div>
      </div>

      {isEditing && contentChanged && (
        <Input
          label="Change Summary"
          value={changeSummary}
          onChange={(e) => setChangeSummary(e.target.value)}
          placeholder="What changed in this version?"
          required
          disabled={isBusy}
        />
      )}

      {renderEditor()}

      <ModalFooter className={onOpenVersionHistory ? 'justify-between' : undefined}>
        {isEditing && onOpenVersionHistory && templateId && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => onOpenVersionHistory(templateId)}
            disabled={isBusy}
          >
            Version History
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} type="button" disabled={isBusy}>
            Cancel
          </Button>
          {!isEditing && (
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              type="button"
              disabled={!canSave || isBusy}
            >
              Save Draft
            </Button>
          )}
          {isEditing && !templateData?.isPublished && (
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              type="button"
              disabled={!canSave || isBusy}
            >
              Save Draft
            </Button>
          )}
          <Button
            type="button"
            onClick={() => handleSave(true)}
            loading={isBusy}
            disabled={!canSave || isBusy}
          >
            {isEditing ? 'Save Changes' : 'Publish'}
          </Button>
        </div>
      </ModalFooter>
    </div>
  );
}

export function TemplateEditor({
  isOpen,
  onClose,
  templateId,
  initialType = 'room',
  onSaved,
  onOpenVersionHistory,
}: TemplateEditorProps) {
  const isEditing = !!templateId;
  const { data: templateData, isLoading } = useTemplateWithVersion(templateId || '');
  const currentOrg = useAuthStore((state) => state.currentOrg);
  const currentTeam = useAuthStore((state) => state.currentTeam);

  const initialState: TemplateEditorFormState =
    isEditing && templateData
      ? {
          type: templateData.type,
          name: templateData.name,
          description: templateData.description || '',
          tagsInput: (templateData.categoryTags || []).join(', '),
          scope: templateData.scope,
          content: templateData.content as TemplateContent,
        }
      : {
          type: initialType,
          name: '',
          description: '',
          tagsInput: '',
          scope: 'personal',
          content: createEmptyTemplateContent(initialType),
        };

  const formKey = isEditing
    ? `template-editor-${templateData?.id ?? 'loading'}-${isOpen ? 'open' : 'closed'}`
    : `template-editor-new-${initialType}-${isOpen ? 'open' : 'closed'}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Template' : 'New Template'}
      description={
        isEditing
          ? 'Update template details and content.'
          : 'Create a reusable template for your workflows.'
      }
      size="lg"
    >
      {isLoading && isEditing ? (
        <div className="text-text-secondary">Loading template...</div>
      ) : isEditing && !templateData ? (
        <div className="text-text-secondary">Template not found.</div>
      ) : (
        <TemplateEditorForm
          key={formKey}
          isEditing={isEditing}
          templateId={templateId}
          templateData={templateData ?? null}
          initialState={initialState}
          currentOrg={currentOrg}
          currentTeam={currentTeam}
          onClose={onClose}
          onSaved={onSaved}
          onOpenVersionHistory={onOpenVersionHistory}
        />
      )}
    </Modal>
  );
}
