/**
 * Template Utilities
 *
 * Shared helpers for constructing template content objects.
 */
import type {
  TemplateContent,
  TemplateType,
  RoomTemplateContent,
  EquipmentPackageContent,
  ProjectTemplateContent,
  QuoteTemplateContent,
  QuoteSectionConfig,
} from './template-types';
import type { Room, PlacedEquipment } from '@/types/room';
import type { Quote, QuoteSection, QuoteItem } from '@/types/quote';

function getAverageMargin(items: QuoteItem[], fallback: number): number {
  if (items.length === 0) return fallback;
  const total = items.reduce((sum, item) => sum + item.marginPercentage, 0);
  return Math.round((total / items.length) * 100) / 100;
}

export function createEmptyTemplateContent(type: TemplateType): TemplateContent {
  if (type === 'room') {
    const emptyRoom: RoomTemplateContent = {
      type: 'room',
      roomType: 'conference',
      width: 20,
      length: 20,
      ceilingHeight: 9,
      platform: 'teams',
      ecosystem: 'poly',
      tier: 'standard',
      placedEquipment: [],
      connections: [],
    };
    return emptyRoom;
  }

  if (type === 'equipment_package') {
    const emptyPackage: EquipmentPackageContent = {
      type: 'equipment_package',
      category: '',
      items: [],
      totalEstimatedCost: 0,
    };
    return emptyPackage;
  }

  if (type === 'project') {
    const emptyProject: ProjectTemplateContent = {
      type: 'project',
      roomTemplates: [],
      clientDefaults: {},
      defaultMargins: { equipment: 20, labor: 30 },
    };
    return emptyProject;
  }

  const emptyQuote: QuoteTemplateContent = {
    type: 'quote',
    sections: [],
    defaultMargins: { equipment: 20, labor: 30 },
    laborRates: [],
    taxSettings: { rate: 0, appliesTo: [] },
    termsText: '',
  };
  return emptyQuote;
}

export function buildRoomTemplateContent(
  room: Room,
  options?: { includeEquipment?: boolean }
): RoomTemplateContent {
  const includeEquipment = options?.includeEquipment ?? true;
  const placedEquipment = includeEquipment
    ? room.placedEquipment.map((item: PlacedEquipment) => ({
        equipmentId: item.equipmentId,
        position: { x: item.x, y: item.y },
        rotation: item.rotation,
        label:
          typeof item.configuration?.label === 'string'
            ? item.configuration.label
            : undefined,
      }))
    : [];

  return {
    type: 'room',
    roomType: room.roomType,
    width: room.width,
    length: room.length,
    ceilingHeight: room.ceilingHeight,
    platform: room.platform,
    ecosystem: room.ecosystem,
    tier: room.tier,
    placedEquipment,
    connections: [],
  };
}

export function buildQuoteTemplateContent(quote: Quote): QuoteTemplateContent {
  const defaultMargin = Math.round(quote.totals.marginPercentage * 100) / 100;

  const sections: QuoteSectionConfig[] = quote.sections.map((section: QuoteSection) => ({
    name: section.name,
    category: section.category,
    defaultMargin: getAverageMargin(section.items, defaultMargin),
  }));

  const taxRate =
    quote.totals.subtotal > 0
      ? Math.round((quote.totals.tax / quote.totals.subtotal) * 10000) / 100
      : 0;

  return {
    type: 'quote',
    sections,
    defaultMargins: {
      equipment: defaultMargin,
      labor: defaultMargin,
    },
    laborRates: [],
    taxSettings: {
      rate: taxRate,
      appliesTo: ['equipment', 'labor'],
    },
    termsText: '',
  };
}
