/**
 * Quoting Feature Module
 *
 * Exports all quoting-related functionality including:
 * - Service layer for CRUD operations
 * - React Query hooks for data fetching
 * - BOM generator for bill of materials
 * - Pricing engine for calculations
 * - Components for quote cards and pages
 * - Re-exports of quote types for convenience
 */

// ============================================================================
// Service Layer
// ============================================================================

export { QuoteService, quoteService } from './quote-service';

// ============================================================================
// React Query Hooks
// ============================================================================

export {
  useQuotesList,
  useQuotesByProject,
  useQuotesByRoom,
  useQuote,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
} from './use-quotes';

// ============================================================================
// BOM Generator
// ============================================================================

export {
  generateBOM,
  aggregateDuplicates,
  groupByCategory,
  createBOMItem,
  type BOMItem,
  type BOMResult,
  type BOMTotals,
  type BOMByCategory,
} from './bom-generator';

// ============================================================================
// Pricing Engine
// ============================================================================

export {
  calculateMargin,
  calculateMarkup,
  applyMarginPercentage,
  applyMarkupPercentage,
  calculateLabor,
  calculateTax,
  calculateQuoteTotals,
  type LaborConfig,
  type TaxConfig,
  type PricingResult,
} from './pricing-engine';

// ============================================================================
// Components
// ============================================================================

export { QuoteCard } from './components/QuoteCard';
export type { QuoteCardProps } from './components/QuoteCard';

export { QuotePage } from './components/QuotePage';
export type { QuotePageProps } from './components/QuotePage';

// ============================================================================
// Re-exported Types (convenience exports from @/types/quote)
// ============================================================================

export type {
  Quote,
  QuoteSection,
  QuoteItem,
  QuoteTotals,
  QuoteStatus,
  ItemStatus,
} from '@/types/quote';

export {
  QUOTE_STATUSES,
  ITEM_STATUSES,
  isValidQuote,
  isValidQuoteSection,
  isValidQuoteItem,
  isValidQuoteTotals,
  createDefaultQuote,
  createDefaultQuoteSection,
  createDefaultQuoteItem,
  createDefaultQuoteTotals,
} from '@/types/quote';
