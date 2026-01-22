/**
 * Core Type Definitions for AV Designer
 */

// ============================================================================
// Common Types
// ============================================================================

export type UUID = string;

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Project Types
// ============================================================================

export interface Project extends Timestamps {
  id: UUID;
  name: string;
  clientName: string;
  status: ProjectStatus;
  rooms: Room[];
}

export type ProjectStatus =
  | 'draft'
  | 'quoting'
  | 'client_review'
  | 'ordered'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

// ============================================================================
// Room Types
// ============================================================================

export interface Room extends Timestamps {
  id: UUID;
  projectId: UUID;
  name: string;
  roomType: RoomType;
  platform: CollaborationPlatform;
  ecosystem: HardwareEcosystem;
  qualityTier: QualityTier;
  dimensions: RoomDimensions;
  equipment: PlacedEquipment[];
}

export type RoomType =
  | 'huddle'
  | 'small_conference'
  | 'medium_conference'
  | 'large_conference'
  | 'boardroom'
  | 'training'
  | 'auditorium'
  | 'open_collaboration';

export type CollaborationPlatform = 'teams' | 'zoom' | 'cisco' | 'google' | 'generic';

export type HardwareEcosystem =
  | 'poly'
  | 'logitech'
  | 'crestron'
  | 'cisco'
  | 'neat'
  | 'yealink'
  | 'mixed';

export type QualityTier = 'budget' | 'standard' | 'premium' | 'executive';

export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
  unit: 'feet' | 'meters';
}

// ============================================================================
// Equipment Types
// ============================================================================

export interface Equipment extends Timestamps {
  id: UUID;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  specifications: EquipmentSpecifications;
  pricing: EquipmentPricing;
  compatibility: EquipmentCompatibility;
  imageUrl?: string;
}

export type EquipmentCategory =
  | 'display'
  | 'audio'
  | 'video'
  | 'control'
  | 'infrastructure'
  | 'furniture'
  | 'cable'
  | 'accessory';

export interface EquipmentSpecifications {
  physical: PhysicalSpecs;
  electrical: ElectricalSpecs;
  connectivity: ConnectivitySpecs;
}

export interface PhysicalSpecs {
  width: number;
  height: number;
  depth: number;
  weight: number;
  mountingType: MountingType[];
  rackUnits?: number;
}

export type MountingType = 'wall' | 'ceiling' | 'floor' | 'table' | 'rack' | 'cart';

export interface ElectricalSpecs {
  powerDraw: number;
  voltage: number;
  poePower?: number;
  poeClass?: string;
}

export interface ConnectivitySpecs {
  inputs: ConnectionPort[];
  outputs: ConnectionPort[];
  network: NetworkSpec[];
}

export interface ConnectionPort {
  type: ConnectionType;
  count: number;
  label?: string;
}

export type ConnectionType =
  | 'hdmi'
  | 'displayport'
  | 'usb_a'
  | 'usb_c'
  | 'usb_b'
  | 'ethernet'
  | 'xlr'
  | 'trs'
  | 'rca'
  | 'bnc'
  | 'sdi'
  | 'fiber'
  | 'dante'
  | 'control';

export interface NetworkSpec {
  type: 'ethernet' | 'wifi' | 'bluetooth';
  speed?: string;
  poe?: boolean;
}

export interface EquipmentPricing {
  msrp: number;
  cost: number;
  currency: string;
}

export interface EquipmentCompatibility {
  platforms: CollaborationPlatform[];
  ecosystems: HardwareEcosystem[];
  certifications: string[];
}

// ============================================================================
// Placed Equipment (Equipment in a Room)
// ============================================================================

export interface PlacedEquipment {
  id: UUID;
  equipmentId: UUID;
  equipment: Equipment;
  position: Position;
  rotation: number;
  connections: Connection[];
  notes?: string;
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface Connection {
  id: UUID;
  sourcePortType: ConnectionType;
  targetEquipmentId: UUID;
  targetPortType: ConnectionType;
  cableType?: string;
  cableLength?: number;
}

// ============================================================================
// Standards Types
// ============================================================================

export interface Standard extends Timestamps {
  id: UUID;
  name: string;
  description: string;
  rules: StandardRule[];
  priority: number;
  isActive: boolean;
}

export interface StandardRule {
  id: UUID;
  type: RuleType;
  condition: RuleCondition;
  requirement: RuleRequirement;
  severity: RuleSeverity;
  message: string;
}

export type RuleType = 'equipment' | 'connection' | 'placement' | 'quantity' | 'budget';

export type RuleSeverity = 'error' | 'warning' | 'suggestion';

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: unknown;
}

export interface RuleRequirement {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: unknown;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
}

export interface ValidationIssue {
  id: UUID;
  severity: RuleSeverity;
  ruleId: UUID;
  message: string;
  affectedEquipmentIds: UUID[];
  suggestedFix?: string;
}

// ============================================================================
// Quote Types
// ============================================================================

export interface Quote extends Timestamps {
  id: UUID;
  projectId: UUID;
  roomId: UUID;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  validUntil: string;
}

export interface QuoteItem {
  id: UUID;
  equipmentId: UUID;
  equipment: Equipment;
  quantity: number;
  unitPrice: number;
  markup: number;
  lineTotal: number;
  notes?: string;
}

// ============================================================================
// Drawing Types
// ============================================================================

export type DrawingType =
  | 'electrical_line'
  | 'elevation'
  | 'rcp'
  | 'rack'
  | 'rack_wiring'
  | 'network'
  | 'cable_schedule'
  | 'floor_plan';

export interface Drawing extends Timestamps {
  id: UUID;
  roomId: UUID;
  type: DrawingType;
  title: string;
  revision: number;
  layers: DrawingLayer[];
  annotations: Annotation[];
}

export interface DrawingLayer {
  id: UUID;
  name: string;
  type: 'architectural' | 'av_equipment' | 'annotations' | 'dimensions' | 'notes';
  isVisible: boolean;
  isLocked: boolean;
  elements: DrawingElement[];
}

export interface DrawingElement {
  id: UUID;
  type: 'equipment' | 'cable' | 'symbol' | 'text' | 'dimension';
  position: Position;
  properties: Record<string, unknown>;
}

export interface Annotation {
  id: UUID;
  type: 'callout' | 'leader' | 'dimension' | 'note';
  position: Position;
  text: string;
  style: AnnotationStyle;
}

export interface AnnotationStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
}

// ============================================================================
// App State Types
// ============================================================================

export type AppMode =
  | 'home'
  | 'projects'
  | 'clients'
  | 'room_design'
  | 'drawings'
  | 'quoting'
  | 'standards'
  | 'equipment'
  | 'templates'
  | 'settings';

export interface AppState {
  currentMode: AppMode;
  currentProjectId: UUID | null;
  currentRoomId: UUID | null;
  sidebarExpanded: boolean;
}
