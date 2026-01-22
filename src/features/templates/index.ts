// Template Service & Types
export { TemplateService } from './template-service';

// Extended Template Types
export type {
  TemplateType,
  TemplateScope,
  Template,
  TemplateVersion,
  TemplateContent,
  RoomTemplateContent,
  EquipmentPackageContent,
  ProjectTemplateContent,
  QuoteTemplateContent,
  PlacedEquipmentItem,
  ConnectionItem,
  EquipmentPackageItem,
  ProjectRoomTemplate,
  ProjectClientDefaults,
  QuoteSectionConfig,
  QuoteLaborRate,
  QuoteTaxSettings,
  CreateTemplateData,
  UpdateTemplateData,
  UpdateTemplateContentData,
  ForkTemplateData,
  PromoteTemplateData,
  TemplateWithVersion,
  TemplateWithVersions,
  TemplateFilters,
  ApplyRoomTemplateData,
  ApplyEquipmentPackageData,
  ApplyProjectTemplateData,
  ApplyQuoteTemplateData,
  ApplyTemplateData,
  ApplyTemplateResult,
} from './template-types';

// Template Hooks
export {
  TEMPLATE_KEYS,
  useTemplateList,
  useTemplatesByType,
  useTemplate,
  useTemplateWithVersion,
  useCreateTemplate,
  useUpdateTemplate,
  useUpdateTemplateContent,
  useDeleteTemplate,
  useArchiveTemplate,
  usePublishTemplate,
  useForkTemplate,
  useDuplicateTemplate,
  usePromoteTemplate,
  useApplyTemplate,
  useTemplateVersions,
  useTemplateVersion,
  useRestoreVersion,
} from './use-templates';

// Components
export {
  TemplateCard,
  ScopeBadge,
  TypeBadge,
  SCOPE_CONFIG,
  TYPE_CONFIG,
} from './components/TemplateCard';
export { TemplateGrid } from './components/TemplateGrid';
export { TemplateFiltersBar } from './components/TemplateFilters';
export { TemplatesPage } from './components/TemplatesPage';
export { TemplateEditor } from './components/TemplateEditor';
export { ApplyTemplateModal } from './components/ApplyTemplateModal';
export { SaveAsTemplateModal } from './components/SaveAsTemplateModal';
export { VersionHistoryPanel } from './components/VersionHistoryPanel';
