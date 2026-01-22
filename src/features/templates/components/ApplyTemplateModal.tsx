/**
 * Apply Template Modal
 *
 * Guides users through applying a template to create rooms, projects, or quotes.
 */
import { useMemo, useState } from 'react';
import { Button, Input, Modal, ModalFooter } from '@/components/ui';
import { useTemplateWithVersion, useApplyTemplate } from '../use-templates';
import { useProjectList } from '@/features/projects/use-projects';
import { useRoomsList } from '@/features/room-builder/use-rooms';
import { useClientList } from '@/features/clients/use-clients';
import type {
  ApplyTemplateData,
  ApplyTemplateResult,
  Template,
  TemplateType,
} from '../template-types';
import type { Project } from '@/types';
import type { Room } from '@/types/room';
import type { Client } from '@/features/clients/client-types';

interface ApplyTemplateModalProps {
  templateId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApplied?: (result: ApplyTemplateResult) => void;
}

interface ApplyTemplateFormProps {
  template: Template;
  projects: Project[];
  rooms: Room[];
  clients: Client[];
  onClose: () => void;
  onApplied?: (result: ApplyTemplateResult) => void;
}

function ApplyTemplateForm({
  template,
  projects,
  rooms,
  clients,
  onClose,
  onApplied,
}: ApplyTemplateFormProps) {
  const applyMutation = useApplyTemplate();

  const initialProjectId = projects[0]?.id ?? '';
  const initialRoomId = (() => {
    if (initialProjectId) {
      const match = rooms.find((room) => room.projectId === initialProjectId);
      return match?.id ?? '';
    }
    return rooms[0]?.id ?? '';
  })();

  const initialClient = clients[0];

  const [name, setName] = useState(template.name);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [roomId, setRoomId] = useState(initialRoomId);
  const [clientName, setClientName] = useState(initialClient?.name ?? '');
  const [clientId, setClientId] = useState(initialClient?.id ?? '');
  const [placementMode, setPlacementMode] = useState<'auto' | 'palette'>('auto');

  const availableRooms = useMemo(() => {
    if (!projectId) return rooms;
    return rooms.filter((room) => room.projectId === projectId);
  }, [projectId, rooms]);

  const isBusy = applyMutation.isPending;
  const type = template.type as TemplateType;

  const canApply =
    !isBusy &&
    ((type === 'room' && !!projectId && !!name.trim()) ||
      (type === 'equipment_package' && !!roomId) ||
      (type === 'project' && !!name.trim() && !!clientName.trim()) ||
      (type === 'quote' && !!projectId && !!roomId));

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    const roomsForProject = value
      ? rooms.filter((room) => room.projectId === value)
      : rooms;
    setRoomId(roomsForProject[0]?.id ?? '');
  };

  const handleApply = async () => {
    let data: ApplyTemplateData | null = null;

    if (type === 'room') {
      if (!projectId || !name.trim()) return;
      data = { name: name.trim(), projectId };
    } else if (type === 'equipment_package') {
      if (!roomId) return;
      data = { roomId, placementMode };
    } else if (type === 'project') {
      if (!name.trim() || !clientName.trim()) return;
      data = {
        name: name.trim(),
        clientId: clientId || undefined,
        clientName: clientName.trim(),
      };
    } else if (type === 'quote') {
      if (!projectId || !roomId) return;
      data = { projectId, roomId };
    }

    if (!data) return;

    try {
      const result = await applyMutation.mutateAsync({ templateId: template.id, data });
      onApplied?.(result);
      onClose();
    } catch {
      // Errors handled in mutation
    }
  };

  return (
    <div className="space-y-4">
      {type === 'room' && (
        <>
          <Input
            label="Room Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="input-wrapper">
            <label className="label" htmlFor="apply-room-project">
              Project
            </label>
            <select
              id="apply-room-project"
              className="input"
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {type === 'equipment_package' && (
        <>
          <div className="input-wrapper">
            <label className="label" htmlFor="apply-package-room">
              Room
            </label>
            <select
              id="apply-package-room"
              className="input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">Select room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-wrapper">
            <label className="label" htmlFor="apply-package-placement">
              Placement Mode
            </label>
            <select
              id="apply-package-placement"
              className="input"
              value={placementMode}
              onChange={(e) => setPlacementMode(e.target.value as 'auto' | 'palette')}
            >
              <option value="auto">Auto-place</option>
              <option value="palette">Add to palette</option>
            </select>
          </div>
        </>
      )}

      {type === 'project' && (
        <>
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="input-wrapper">
            <label className="label" htmlFor="apply-project-client">
              Client
            </label>
            <input
              id="apply-project-client"
              className="input"
              list="apply-project-client-list"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                const matched = clients.find(
                  (client) => client.name.toLowerCase() === e.target.value.toLowerCase()
                );
                setClientId(matched?.id || '');
              }}
              placeholder="Client name"
            />
            <datalist id="apply-project-client-list">
              {clients.map((client) => (
                <option key={client.id} value={client.name} />
              ))}
            </datalist>
          </div>
        </>
      )}

      {type === 'quote' && (
        <>
          <div className="input-wrapper">
            <label className="label" htmlFor="apply-quote-project">
              Project
            </label>
            <select
              id="apply-quote-project"
              className="input"
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-wrapper">
            <label className="label" htmlFor="apply-quote-room">
              Room
            </label>
            <select
              id="apply-quote-room"
              className="input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">Select room</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} type="button" disabled={isBusy}>
          Cancel
        </Button>
        <Button type="button" onClick={handleApply} loading={isBusy} disabled={!canApply}>
          Apply Template
        </Button>
      </ModalFooter>
    </div>
  );
}

export function ApplyTemplateModal({
  templateId,
  isOpen,
  onClose,
  onApplied,
}: ApplyTemplateModalProps) {
  const { data: template, isLoading } = useTemplateWithVersion(templateId || '');
  const { data: projects = [] } = useProjectList();
  const { data: rooms = [] } = useRoomsList();
  const { data: clients = [] } = useClientList();

  const formKey = `${template?.id ?? 'none'}-${projects[0]?.id ?? 'none'}-${rooms[0]?.id ?? 'none'}-${clients[0]?.id ?? 'none'}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply Template"
      description={template ? `Use "${template.name}"` : 'Use template'}
      size="md"
    >
      {isLoading || !template ? (
        <div className="text-text-secondary">Loading template...</div>
      ) : (
        <ApplyTemplateForm
          key={formKey}
          template={template}
          projects={projects}
          rooms={rooms}
          clients={clients}
          onClose={onClose}
          onApplied={onApplied}
        />
      )}
    </Modal>
  );
}
