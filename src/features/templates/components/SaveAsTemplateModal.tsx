/**
 * Save As Template Modal
 *
 * Creates templates from existing rooms, projects, or quotes.
 */
import { useMemo, useState, useEffect } from 'react';
import { Button, Input, Modal, ModalFooter } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/auth-store';
import { TemplateService } from '../template-service';
import { buildQuoteTemplateContent, buildRoomTemplateContent } from '../template-utils';
import type {
  TemplateScope,
  TemplateType,
  Template,
  ProjectTemplateContent,
} from '../template-types';
import type { Room } from '@/types/room';
import type { Quote } from '@/types/quote';
import type { Project } from '@/types';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TemplateType;
  room?: Room;
  quote?: Quote;
  project?: Project;
  rooms?: Room[];
  onSaved?: (template: Template) => void;
}

export function SaveAsTemplateModal({
  isOpen,
  onClose,
  type,
  room,
  quote,
  project,
  rooms = [],
  onSaved,
}: SaveAsTemplateModalProps) {
  const currentOrg = useAuthStore((state) => state.currentOrg);
  const currentTeam = useAuthStore((state) => state.currentTeam);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [scope, setScope] = useState<TemplateScope>('personal');
  const [includeEquipment, setIncludeEquipment] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setIsSaving(false);
    setDescription('');
    setTagsInput('');
    setScope('personal');
    if (type === 'room' && room) {
      setName(`${room.name} Template`);
    } else if (type === 'quote' && quote) {
      setName(`Quote Template ${quote.id}`);
    } else if (type === 'project' && project) {
      setName(`${project.name} Template`);
    }
  }, [isOpen, type, room, quote, project]);

  const tags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput]
  );

  const handleSave = async () => {
    if (!currentOrg) {
      setError('You must belong to an organization to create templates.');
      return;
    }
    if (!name.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to create templates');
      }

      if (type === 'room') {
        if (!room) throw new Error('Room data missing');
        const content = buildRoomTemplateContent(room, { includeEquipment });
        const template = await TemplateService.create(
          {
            type: 'room',
            name: name.trim(),
            description: description.trim() || undefined,
            scope,
            teamId: scope === 'team' ? currentTeam?.id : undefined,
            orgId: currentOrg.id,
            categoryTags: tags,
            isPublished: false,
            content,
            changeSummary: 'Created from room',
          },
          authData.user.id
        );
        onSaved?.(template);
        onClose();
        return;
      }

      if (type === 'quote') {
        if (!quote) throw new Error('Quote data missing');
        const content = buildQuoteTemplateContent(quote);
        const template = await TemplateService.create(
          {
            type: 'quote',
            name: name.trim(),
            description: description.trim() || undefined,
            scope,
            teamId: scope === 'team' ? currentTeam?.id : undefined,
            orgId: currentOrg.id,
            categoryTags: tags,
            isPublished: false,
            content,
            changeSummary: 'Created from quote',
          },
          authData.user.id
        );
        onSaved?.(template);
        onClose();
        return;
      }

      if (type === 'project') {
        if (!project) throw new Error('Project data missing');
        if (rooms.length === 0) throw new Error('Project rooms not loaded');

        const roomTemplates = await Promise.all(
          rooms.map((sourceRoom) =>
            TemplateService.create(
              {
                type: 'room',
                name: `${project.name} - ${sourceRoom.name}`,
                description: `Room template from ${sourceRoom.name}`,
                scope,
                teamId: scope === 'team' ? currentTeam?.id : undefined,
                orgId: currentOrg.id,
                categoryTags: tags,
                isPublished: false,
                content: buildRoomTemplateContent(sourceRoom, { includeEquipment }),
                changeSummary: 'Created from project room',
              },
              authData.user.id
            )
          )
        );

        const content: ProjectTemplateContent = {
          type: 'project',
          roomTemplates: roomTemplates.map((template, index) => ({
            templateId: template.id,
            defaultName: rooms[index]?.name || `Room ${index + 1}`,
            quantity: 1,
          })),
          clientDefaults: {},
          defaultMargins: { equipment: 20, labor: 30 },
        };

        const template = await TemplateService.create(
          {
            type: 'project',
            name: name.trim(),
            description: description.trim() || undefined,
            scope,
            teamId: scope === 'team' ? currentTeam?.id : undefined,
            orgId: currentOrg.id,
            categoryTags: tags,
            isPublished: false,
            content,
            changeSummary: 'Created from project',
          },
          authData.user.id
        );

        onSaved?.(template);
        onClose();
        return;
      }

      throw new Error('Unsupported template type');
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to save template'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save as Template"
      description="Create a reusable template from the current item."
      size="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
            placeholder="Describe this template"
          />
        </div>

        <Input
          label="Tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="conference, teams, premium"
        />

        <div className="input-wrapper">
          <label className="label" htmlFor="save-template-scope">
            Scope
          </label>
          <select
            id="save-template-scope"
            className="input"
            value={scope}
            onChange={(e) => setScope(e.target.value as TemplateScope)}
          >
            <option value="personal">Personal</option>
            <option value="team" disabled={!currentTeam}>
              Team
            </option>
            <option value="org">Organization</option>
          </select>
        </div>

        {type === 'room' && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={includeEquipment}
              onChange={(e) => setIncludeEquipment(e.target.checked)}
              className="rounded border-border bg-bg-secondary text-accent-gold focus:ring-accent-gold"
            />
            Include equipment placements
          </div>
        )}

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} type="button" disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            loading={isSaving}
            disabled={!name.trim() || isSaving}
          >
            Create Template
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
