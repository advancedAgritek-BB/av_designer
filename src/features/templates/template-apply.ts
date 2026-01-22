/**
 * Template Apply Helpers
 *
 * Applies templates to create rooms, projects, and quotes.
 */
import { supabase } from '@/lib/supabase';
import { TemplateService } from './template-service';
import { roomService } from '@/features/room-builder/room-service';
import { projectService } from '@/features/projects/project-service';
import { quoteService } from '@/features/quoting/quote-service';
import { createDefaultQuoteTotals } from '@/types/quote';
import type { RoomFormData, PlacedEquipment } from '@/types/room';
import type {
  ApplyTemplateData,
  ApplyTemplateResult,
  ApplyRoomTemplateData,
  ApplyEquipmentPackageData,
  ApplyProjectTemplateData,
  ApplyQuoteTemplateData,
  TemplateContent,
  RoomTemplateContent,
  EquipmentPackageContent,
  ProjectTemplateContent,
  QuoteTemplateContent,
  TemplateType,
} from './template-types';

function generateId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function buildGridPositions(count: number, width: number, length: number, spacing = 2) {
  const positions: Array<{ x: number; y: number }> = [];
  const cols = Math.max(1, Math.floor(width / spacing));
  for (let i = 0; i < count; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = Math.min(width - 1, 1 + col * spacing);
    const y = Math.min(length - 1, 1 + row * spacing);
    positions.push({ x, y });
  }
  return positions;
}

async function applyRoomTemplate(
  content: RoomTemplateContent,
  data: ApplyRoomTemplateData
): Promise<ApplyTemplateResult> {
  const formData: RoomFormData = {
    name: data.name,
    roomType: content.roomType,
    width: content.width,
    length: content.length,
    ceilingHeight: content.ceilingHeight,
    platform: content.platform,
    ecosystem: content.ecosystem,
    tier: content.tier,
  };

  const room = await roomService.create(data.projectId, formData);

  if (content.placedEquipment.length > 0) {
    const placedEquipment: PlacedEquipment[] = content.placedEquipment.map((item) => ({
      id: generateId('pe'),
      equipmentId: item.equipmentId,
      x: item.position.x,
      y: item.position.y,
      rotation: item.rotation,
      mountType: 'floor',
      configuration: item.label ? { label: item.label } : undefined,
    }));

    await roomService.setPlacedEquipment(room.id, placedEquipment);
  }

  return { type: 'room', roomId: room.id, projectId: data.projectId };
}

async function applyEquipmentPackage(
  content: EquipmentPackageContent,
  data: ApplyEquipmentPackageData
): Promise<ApplyTemplateResult> {
  const room = await roomService.getById(data.roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  const items = content.items.flatMap((item) =>
    Array.from({ length: item.quantity }).map(() => ({
      equipmentId: item.equipmentId,
      notes: item.notes,
    }))
  );

  const positions = buildGridPositions(items.length, room.width, room.length);
  const newPlacements: PlacedEquipment[] = items.map((item, index) => ({
    id: generateId('pe'),
    equipmentId: item.equipmentId,
    x: positions[index]?.x ?? 1,
    y: positions[index]?.y ?? 1,
    rotation: 0,
    mountType: 'floor',
    configuration: item.notes
      ? { notes: item.notes, placementMode: data.placementMode }
      : undefined,
  }));

  await roomService.setPlacedEquipment(room.id, [
    ...room.placedEquipment,
    ...newPlacements,
  ]);

  return { type: 'equipment_package', roomId: room.id, projectId: room.projectId };
}

async function applyProjectTemplate(
  content: ProjectTemplateContent,
  data: ApplyProjectTemplateData
): Promise<ApplyTemplateResult> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('You must be logged in to apply a project template');
  }

  const project = await projectService.create(
    {
      name: data.name,
      clientName: data.clientName,
      clientId: data.clientId ?? null,
      status: 'draft',
    },
    authData.user.id
  );

  for (const roomTemplate of content.roomTemplates) {
    const templateWithVersion = await TemplateService.getWithVersion(
      roomTemplate.templateId
    );
    if (!templateWithVersion || templateWithVersion.type !== 'room') {
      continue;
    }

    const roomContent = templateWithVersion.content as RoomTemplateContent;
    const quantity = Math.max(1, roomTemplate.quantity);

    for (let i = 0; i < quantity; i += 1) {
      const suffix = quantity > 1 ? ` ${i + 1}` : '';
      const room = await roomService.create(project.id, {
        name: `${roomTemplate.defaultName}${suffix}`,
        roomType: roomContent.roomType,
        width: roomContent.width,
        length: roomContent.length,
        ceilingHeight: roomContent.ceilingHeight,
        platform: roomContent.platform,
        ecosystem: roomContent.ecosystem,
        tier: roomContent.tier,
      });

      if (roomContent.placedEquipment.length > 0) {
        const placedEquipment: PlacedEquipment[] = roomContent.placedEquipment.map(
          (item) => ({
            id: generateId('pe'),
            equipmentId: item.equipmentId,
            x: item.position.x,
            y: item.position.y,
            rotation: item.rotation,
            mountType: 'floor',
            configuration: item.label ? { label: item.label } : undefined,
          })
        );

        await roomService.setPlacedEquipment(room.id, placedEquipment);
      }
    }
  }

  return { type: 'project', projectId: project.id };
}

async function applyQuoteTemplate(
  content: QuoteTemplateContent,
  data: ApplyQuoteTemplateData
): Promise<ApplyTemplateResult> {
  const sections = content.sections.map((section) => ({
    id: generateId('section'),
    name: section.name,
    category: section.category,
    items: [],
    subtotal: 0,
  }));

  const quote = await quoteService.create({
    projectId: data.projectId,
    roomId: data.roomId,
    version: 1,
    status: 'draft',
    sections,
    totals: createDefaultQuoteTotals(),
  });

  return {
    type: 'quote',
    quoteId: quote.id,
    roomId: quote.roomId,
    projectId: quote.projectId,
  };
}

export async function applyTemplate(
  templateId: string,
  data: ApplyTemplateData
): Promise<ApplyTemplateResult> {
  const template = await TemplateService.getWithVersion(templateId);
  if (!template) throw new Error('Template not found');

  const content = template.content as TemplateContent;
  const type = template.type as TemplateType;

  if (type === 'room') {
    return applyRoomTemplate(
      content as RoomTemplateContent,
      data as ApplyRoomTemplateData
    );
  }

  if (type === 'equipment_package') {
    return applyEquipmentPackage(
      content as EquipmentPackageContent,
      data as ApplyEquipmentPackageData
    );
  }

  if (type === 'project') {
    return applyProjectTemplate(
      content as ProjectTemplateContent,
      data as ApplyProjectTemplateData
    );
  }

  return applyQuoteTemplate(
    content as QuoteTemplateContent,
    data as ApplyQuoteTemplateData
  );
}
