/**
 * Template Types
 *
 * Types for the Templates System Phase 3
 */

import type { UUID } from '@/types';
import type { RoomType, Platform, Ecosystem, QualityTier } from '@/types/room';

// ============================================================================
// Core Template Types
// ============================================================================

export type TemplateType = 'room' | 'equipment_package' | 'project' | 'quote';
export type TemplateScope = 'personal' | 'team' | 'org' | 'system';

export interface Template {
  id: UUID;
  type: TemplateType;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  scope: TemplateScope;
  ownerId: UUID | null;
  teamId: UUID | null;
  orgId: UUID;
  categoryTags: string[];
  currentVersion: number;
  isPublished: boolean;
  isArchived: boolean;
  forkedFromId: UUID | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersion {
  id: UUID;
  templateId: UUID;
  version: number;
  content: TemplateContent;
  changeSummary: string | null;
  createdBy: UUID;
  createdAt: string;
}

// ============================================================================
// Template Content Types (JSONB structure by type)
// ============================================================================

export type TemplateContent =
  | RoomTemplateContent
  | EquipmentPackageContent
  | ProjectTemplateContent
  | QuoteTemplateContent;

export interface PlacedEquipmentItem {
  equipmentId: string;
  position: { x: number; y: number };
  rotation: number;
  label?: string;
}

export interface ConnectionItem {
  fromEquipmentId: string;
  fromPort: string;
  toEquipmentId: string;
  toPort: string;
  cableType?: string;
}

export interface RoomTemplateContent {
  type: 'room';
  roomType: RoomType;
  width: number;
  length: number;
  ceilingHeight: number;
  platform: Platform;
  ecosystem: Ecosystem;
  tier: QualityTier;
  placedEquipment: PlacedEquipmentItem[];
  connections: ConnectionItem[];
}

export interface EquipmentPackageItem {
  equipmentId: string;
  quantity: number;
  notes?: string;
}

export interface EquipmentPackageContent {
  type: 'equipment_package';
  category: string;
  items: EquipmentPackageItem[];
  totalEstimatedCost: number;
}

export interface ProjectRoomTemplate {
  templateId: string;
  defaultName: string;
  quantity: number;
}

export interface ProjectClientDefaults {
  industry?: string;
  standardsProfile?: string;
}

export interface ProjectTemplateContent {
  type: 'project';
  roomTemplates: ProjectRoomTemplate[];
  clientDefaults: ProjectClientDefaults;
  defaultMargins: {
    equipment: number;
    labor: number;
  };
}

export interface QuoteSectionConfig {
  name: string;
  category: string;
  defaultMargin: number;
}

export interface QuoteLaborRate {
  category: string;
  ratePerHour: number;
}

export interface QuoteTaxSettings {
  rate: number;
  appliesTo: string[];
}

export interface QuoteTemplateContent {
  type: 'quote';
  sections: QuoteSectionConfig[];
  defaultMargins: {
    equipment: number;
    labor: number;
  };
  laborRates: QuoteLaborRate[];
  taxSettings: QuoteTaxSettings;
  termsText: string;
}

// ============================================================================
// Create/Update Types
// ============================================================================

export interface CreateTemplateData {
  type: TemplateType;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  scope: TemplateScope;
  teamId?: UUID;
  orgId: UUID;
  categoryTags?: string[];
  isPublished?: boolean;
  forkedFromId?: UUID;
  content: TemplateContent;
  changeSummary?: string;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  categoryTags?: string[];
  isPublished?: boolean;
  isArchived?: boolean;
}

export interface UpdateTemplateContentData {
  content: TemplateContent;
  changeSummary: string;
}

export interface ForkTemplateData {
  name: string;
  description?: string;
  scope?: TemplateScope;
  teamId?: UUID;
}

export interface PromoteTemplateData {
  scope: 'team' | 'org';
  teamId?: UUID;
}

// ============================================================================
// Composite Types
// ============================================================================

export interface TemplateWithVersion extends Template {
  content: TemplateContent;
}

export interface TemplateWithVersions extends Template {
  versions: TemplateVersion[];
}

// ============================================================================
// Filter Types
// ============================================================================

export interface TemplateFilters {
  type?: TemplateType;
  scope?: TemplateScope | 'all';
  platform?: Platform | 'all';
  tier?: QualityTier | 'all';
  search?: string;
  isPublished?: boolean;
  isArchived?: boolean;
}

// ============================================================================
// Database Row Types
// ============================================================================

export interface TemplateRow {
  id: string;
  type: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  scope: string;
  owner_id: string | null;
  team_id: string | null;
  org_id: string;
  category_tags: string[];
  current_version: number;
  is_published: boolean;
  is_archived: boolean;
  forked_from_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateVersionRow {
  id: string;
  template_id: string;
  version: number;
  content: Record<string, unknown>;
  change_summary: string | null;
  created_by: string;
  created_at: string;
}

// ============================================================================
// Apply Template Types
// ============================================================================

export interface ApplyRoomTemplateData {
  name: string;
  projectId: UUID;
}

export interface ApplyEquipmentPackageData {
  roomId: UUID;
  placementMode: 'auto' | 'palette';
}

export interface ApplyProjectTemplateData {
  name: string;
  clientId?: UUID;
  clientName: string;
}

export interface ApplyQuoteTemplateData {
  projectId: UUID;
  roomId: UUID;
}

export type ApplyTemplateData =
  | ApplyRoomTemplateData
  | ApplyEquipmentPackageData
  | ApplyProjectTemplateData
  | ApplyQuoteTemplateData;

export interface ApplyTemplateResult {
  type: TemplateType;
  projectId?: UUID;
  roomId?: UUID;
  quoteId?: UUID;
}
