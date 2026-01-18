/**
 * Quote Type Definitions - Test Suite
 *
 * Tests for quote types, constants, and validation functions
 * used by the Quoting & BOM feature.
 */

import { describe, it, expect } from 'vitest';
import {
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
  type Quote,
  type QuoteSection,
  type QuoteItem,
  type QuoteTotals,
  type QuoteStatus,
  type ItemStatus,
} from '@/types/quote';

// ============================================================================
// Constants Tests
// ============================================================================

describe('Quote Type Constants', () => {
  describe('QUOTE_STATUSES', () => {
    it('should contain all expected quote statuses', () => {
      expect(QUOTE_STATUSES).toContain('draft');
      expect(QUOTE_STATUSES).toContain('quoting');
      expect(QUOTE_STATUSES).toContain('client_review');
      expect(QUOTE_STATUSES).toContain('approved');
      expect(QUOTE_STATUSES).toContain('ordered');
    });

    it('should have exactly 5 quote statuses', () => {
      expect(QUOTE_STATUSES.length).toBe(5);
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(QUOTE_STATUSES)).toBe(true);
      expect(Object.isFrozen(QUOTE_STATUSES)).toBe(true);
    });
  });

  describe('ITEM_STATUSES', () => {
    it('should contain all expected item statuses', () => {
      expect(ITEM_STATUSES).toContain('quoting');
      expect(ITEM_STATUSES).toContain('client_review');
      expect(ITEM_STATUSES).toContain('ordered');
      expect(ITEM_STATUSES).toContain('delivered');
      expect(ITEM_STATUSES).toContain('installed');
    });

    it('should have exactly 5 item statuses', () => {
      expect(ITEM_STATUSES.length).toBe(5);
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(ITEM_STATUSES)).toBe(true);
      expect(Object.isFrozen(ITEM_STATUSES)).toBe(true);
    });
  });
});

// ============================================================================
// Type Tests (Compile-time, demonstrated via valid usage)
// ============================================================================

describe('Quote Types - Type Safety', () => {
  it('should allow valid QuoteStatus values', () => {
    const status: QuoteStatus = 'draft';
    expect(status).toBe('draft');
  });

  it('should allow all QuoteStatus values', () => {
    const statuses: QuoteStatus[] = ['draft', 'quoting', 'client_review', 'approved', 'ordered'];
    expect(statuses.length).toBe(5);
  });

  it('should allow valid ItemStatus values', () => {
    const status: ItemStatus = 'quoting';
    expect(status).toBe('quoting');
  });

  it('should allow all ItemStatus values', () => {
    const statuses: ItemStatus[] = [
      'quoting',
      'client_review',
      'ordered',
      'delivered',
      'installed',
    ];
    expect(statuses.length).toBe(5);
  });
});

// ============================================================================
// QuoteTotals Validation Tests
// ============================================================================

describe('isValidQuoteTotals', () => {
  const validTotals: QuoteTotals = {
    equipment: 10000,
    labor: 2000,
    subtotal: 12000,
    tax: 1200,
    total: 13200,
    margin: 3000,
    marginPercentage: 25,
  };

  it('should return true for valid quote totals', () => {
    expect(isValidQuoteTotals(validTotals)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidQuoteTotals(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidQuoteTotals(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidQuoteTotals('string')).toBe(false);
    expect(isValidQuoteTotals(123)).toBe(false);
  });

  it('should return false for array', () => {
    expect(isValidQuoteTotals([validTotals])).toBe(false);
  });

  it('should return false for missing equipment', () => {
    const { equipment: _, ...rest } = validTotals;
    expect(isValidQuoteTotals(rest)).toBe(false);
  });

  it('should return false for missing labor', () => {
    const { labor: _, ...rest } = validTotals;
    expect(isValidQuoteTotals(rest)).toBe(false);
  });

  it('should return false for missing subtotal', () => {
    const { subtotal: _, ...rest } = validTotals;
    expect(isValidQuoteTotals(rest)).toBe(false);
  });

  it('should return false for missing tax', () => {
    const { tax: _, ...rest } = validTotals;
    expect(isValidQuoteTotals(rest)).toBe(false);
  });

  it('should return false for missing total', () => {
    const { total: _, ...rest } = validTotals;
    expect(isValidQuoteTotals(rest)).toBe(false);
  });

  it('should return false for missing margin', () => {
    const { margin: _, ...rest } = validTotals;
    expect(isValidQuoteTotals(rest)).toBe(false);
  });

  it('should return false for missing marginPercentage', () => {
    const { marginPercentage: _, ...rest } = validTotals;
    expect(isValidQuoteTotals(rest)).toBe(false);
  });

  it('should return false for non-number equipment', () => {
    expect(isValidQuoteTotals({ ...validTotals, equipment: 'abc' })).toBe(false);
  });

  it('should return false for negative equipment', () => {
    expect(isValidQuoteTotals({ ...validTotals, equipment: -100 })).toBe(false);
  });

  it('should return false for negative labor', () => {
    expect(isValidQuoteTotals({ ...validTotals, labor: -100 })).toBe(false);
  });

  it('should allow zero values', () => {
    const zeroTotals: QuoteTotals = {
      equipment: 0,
      labor: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      margin: 0,
      marginPercentage: 0,
    };
    expect(isValidQuoteTotals(zeroTotals)).toBe(true);
  });
});

// ============================================================================
// QuoteItem Validation Tests
// ============================================================================

describe('isValidQuoteItem', () => {
  const validItem: QuoteItem = {
    id: 'item-1',
    equipmentId: 'equip-123',
    quantity: 2,
    unitCost: 500,
    unitPrice: 750,
    margin: 250,
    total: 1500,
    status: 'quoting',
  };

  it('should return true for valid quote item', () => {
    expect(isValidQuoteItem(validItem)).toBe(true);
  });

  it('should return true for quote item with optional notes', () => {
    expect(isValidQuoteItem({ ...validItem, notes: 'Special order' })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidQuoteItem(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidQuoteItem(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidQuoteItem('string')).toBe(false);
    expect(isValidQuoteItem(123)).toBe(false);
  });

  it('should return false for array', () => {
    expect(isValidQuoteItem([validItem])).toBe(false);
  });

  it('should return false for missing id', () => {
    const { id: _, ...rest } = validItem;
    expect(isValidQuoteItem(rest)).toBe(false);
  });

  it('should return false for empty id', () => {
    expect(isValidQuoteItem({ ...validItem, id: '' })).toBe(false);
  });

  it('should return false for non-string id', () => {
    expect(isValidQuoteItem({ ...validItem, id: 123 })).toBe(false);
  });

  it('should return false for missing equipmentId', () => {
    const { equipmentId: _, ...rest } = validItem;
    expect(isValidQuoteItem(rest)).toBe(false);
  });

  it('should return false for empty equipmentId', () => {
    expect(isValidQuoteItem({ ...validItem, equipmentId: '' })).toBe(false);
  });

  it('should return false for missing quantity', () => {
    const { quantity: _, ...rest } = validItem;
    expect(isValidQuoteItem(rest)).toBe(false);
  });

  it('should return false for non-positive quantity', () => {
    expect(isValidQuoteItem({ ...validItem, quantity: 0 })).toBe(false);
    expect(isValidQuoteItem({ ...validItem, quantity: -1 })).toBe(false);
  });

  it('should return false for non-integer quantity', () => {
    expect(isValidQuoteItem({ ...validItem, quantity: 1.5 })).toBe(false);
  });

  it('should return false for missing unitCost', () => {
    const { unitCost: _, ...rest } = validItem;
    expect(isValidQuoteItem(rest)).toBe(false);
  });

  it('should return false for negative unitCost', () => {
    expect(isValidQuoteItem({ ...validItem, unitCost: -100 })).toBe(false);
  });

  it('should return false for missing unitPrice', () => {
    const { unitPrice: _, ...rest } = validItem;
    expect(isValidQuoteItem(rest)).toBe(false);
  });

  it('should return false for negative unitPrice', () => {
    expect(isValidQuoteItem({ ...validItem, unitPrice: -100 })).toBe(false);
  });

  it('should return false for missing margin', () => {
    const { margin: _, ...rest } = validItem;
    expect(isValidQuoteItem(rest)).toBe(false);
  });

  it('should return false for missing total', () => {
    const { total: _, ...rest } = validItem;
    expect(isValidQuoteItem(rest)).toBe(false);
  });

  it('should return false for negative total', () => {
    expect(isValidQuoteItem({ ...validItem, total: -100 })).toBe(false);
  });

  it('should return false for missing status', () => {
    const { status: _, ...rest } = validItem;
    expect(isValidQuoteItem(rest)).toBe(false);
  });

  it('should return false for invalid status', () => {
    expect(isValidQuoteItem({ ...validItem, status: 'invalid' })).toBe(false);
  });

  it('should allow zero unitCost', () => {
    expect(isValidQuoteItem({ ...validItem, unitCost: 0 })).toBe(true);
  });

  it('should allow zero unitPrice', () => {
    expect(isValidQuoteItem({ ...validItem, unitPrice: 0 })).toBe(true);
  });

  it('should allow negative margin (selling below cost)', () => {
    expect(isValidQuoteItem({ ...validItem, margin: -50 })).toBe(true);
  });

  it('should return false for non-string notes when provided', () => {
    expect(isValidQuoteItem({ ...validItem, notes: 123 })).toBe(false);
  });
});

// ============================================================================
// QuoteSection Validation Tests
// ============================================================================

describe('isValidQuoteSection', () => {
  const validItem: QuoteItem = {
    id: 'item-1',
    equipmentId: 'equip-123',
    quantity: 2,
    unitCost: 500,
    unitPrice: 750,
    margin: 250,
    total: 1500,
    status: 'quoting',
  };

  const validSection: QuoteSection = {
    id: 'section-1',
    name: 'Video Equipment',
    category: 'video',
    items: [validItem],
    subtotal: 1500,
  };

  it('should return true for valid quote section', () => {
    expect(isValidQuoteSection(validSection)).toBe(true);
  });

  it('should return true for section with empty items', () => {
    expect(isValidQuoteSection({ ...validSection, items: [], subtotal: 0 })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidQuoteSection(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidQuoteSection(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidQuoteSection('string')).toBe(false);
    expect(isValidQuoteSection(123)).toBe(false);
  });

  it('should return false for array', () => {
    expect(isValidQuoteSection([validSection])).toBe(false);
  });

  it('should return false for missing id', () => {
    const { id: _, ...rest } = validSection;
    expect(isValidQuoteSection(rest)).toBe(false);
  });

  it('should return false for empty id', () => {
    expect(isValidQuoteSection({ ...validSection, id: '' })).toBe(false);
  });

  it('should return false for non-string id', () => {
    expect(isValidQuoteSection({ ...validSection, id: 123 })).toBe(false);
  });

  it('should return false for missing name', () => {
    const { name: _, ...rest } = validSection;
    expect(isValidQuoteSection(rest)).toBe(false);
  });

  it('should return false for empty name', () => {
    expect(isValidQuoteSection({ ...validSection, name: '' })).toBe(false);
  });

  it('should return false for non-string name', () => {
    expect(isValidQuoteSection({ ...validSection, name: 123 })).toBe(false);
  });

  it('should return false for missing category', () => {
    const { category: _, ...rest } = validSection;
    expect(isValidQuoteSection(rest)).toBe(false);
  });

  it('should return false for empty category', () => {
    expect(isValidQuoteSection({ ...validSection, category: '' })).toBe(false);
  });

  it('should return false for non-string category', () => {
    expect(isValidQuoteSection({ ...validSection, category: 123 })).toBe(false);
  });

  it('should return false for missing items', () => {
    const { items: _, ...rest } = validSection;
    expect(isValidQuoteSection(rest)).toBe(false);
  });

  it('should return false for non-array items', () => {
    expect(isValidQuoteSection({ ...validSection, items: 'not-array' })).toBe(false);
  });

  it('should return false for items containing invalid item', () => {
    const invalidItem = { ...validItem, id: '' };
    expect(isValidQuoteSection({ ...validSection, items: [invalidItem] })).toBe(false);
  });

  it('should return false for missing subtotal', () => {
    const { subtotal: _, ...rest } = validSection;
    expect(isValidQuoteSection(rest)).toBe(false);
  });

  it('should return false for non-number subtotal', () => {
    expect(isValidQuoteSection({ ...validSection, subtotal: 'abc' })).toBe(false);
  });

  it('should return false for negative subtotal', () => {
    expect(isValidQuoteSection({ ...validSection, subtotal: -100 })).toBe(false);
  });

  it('should validate multiple items in section', () => {
    const item2: QuoteItem = { ...validItem, id: 'item-2' };
    const sectionWithMultipleItems = { ...validSection, items: [validItem, item2] };
    expect(isValidQuoteSection(sectionWithMultipleItems)).toBe(true);
  });
});

// ============================================================================
// Quote Validation Tests
// ============================================================================

describe('isValidQuote', () => {
  const validItem: QuoteItem = {
    id: 'item-1',
    equipmentId: 'equip-123',
    quantity: 2,
    unitCost: 500,
    unitPrice: 750,
    margin: 250,
    total: 1500,
    status: 'quoting',
  };

  const validSection: QuoteSection = {
    id: 'section-1',
    name: 'Video Equipment',
    category: 'video',
    items: [validItem],
    subtotal: 1500,
  };

  const validTotals: QuoteTotals = {
    equipment: 1500,
    labor: 500,
    subtotal: 2000,
    tax: 200,
    total: 2200,
    margin: 500,
    marginPercentage: 25,
  };

  const validQuote: Quote = {
    id: 'quote-1',
    projectId: 'proj-123',
    roomId: 'room-456',
    version: 1,
    status: 'draft',
    sections: [validSection],
    totals: validTotals,
    createdAt: '2026-01-18T00:00:00.000Z',
    updatedAt: '2026-01-18T00:00:00.000Z',
  };

  it('should return true for valid quote', () => {
    expect(isValidQuote(validQuote)).toBe(true);
  });

  it('should return true for quote with empty sections', () => {
    const emptyTotals: QuoteTotals = {
      equipment: 0,
      labor: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      margin: 0,
      marginPercentage: 0,
    };
    expect(isValidQuote({ ...validQuote, sections: [], totals: emptyTotals })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidQuote(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidQuote(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidQuote('string')).toBe(false);
    expect(isValidQuote(123)).toBe(false);
  });

  it('should return false for array', () => {
    expect(isValidQuote([validQuote])).toBe(false);
  });

  it('should return false for missing id', () => {
    const { id: _, ...rest } = validQuote;
    expect(isValidQuote(rest)).toBe(false);
  });

  it('should return false for empty id', () => {
    expect(isValidQuote({ ...validQuote, id: '' })).toBe(false);
  });

  it('should return false for non-string id', () => {
    expect(isValidQuote({ ...validQuote, id: 123 })).toBe(false);
  });

  it('should return false for missing projectId', () => {
    const { projectId: _, ...rest } = validQuote;
    expect(isValidQuote(rest)).toBe(false);
  });

  it('should return false for empty projectId', () => {
    expect(isValidQuote({ ...validQuote, projectId: '' })).toBe(false);
  });

  it('should return false for non-string projectId', () => {
    expect(isValidQuote({ ...validQuote, projectId: 123 })).toBe(false);
  });

  it('should return false for missing roomId', () => {
    const { roomId: _, ...rest } = validQuote;
    expect(isValidQuote(rest)).toBe(false);
  });

  it('should return false for empty roomId', () => {
    expect(isValidQuote({ ...validQuote, roomId: '' })).toBe(false);
  });

  it('should return false for non-string roomId', () => {
    expect(isValidQuote({ ...validQuote, roomId: 123 })).toBe(false);
  });

  it('should return false for missing version', () => {
    const { version: _, ...rest } = validQuote;
    expect(isValidQuote(rest)).toBe(false);
  });

  it('should return false for non-positive version', () => {
    expect(isValidQuote({ ...validQuote, version: 0 })).toBe(false);
    expect(isValidQuote({ ...validQuote, version: -1 })).toBe(false);
  });

  it('should return false for non-integer version', () => {
    expect(isValidQuote({ ...validQuote, version: 1.5 })).toBe(false);
  });

  it('should return false for missing status', () => {
    const { status: _, ...rest } = validQuote;
    expect(isValidQuote(rest)).toBe(false);
  });

  it('should return false for invalid status', () => {
    expect(isValidQuote({ ...validQuote, status: 'invalid' })).toBe(false);
  });

  it('should return false for missing sections', () => {
    const { sections: _, ...rest } = validQuote;
    expect(isValidQuote(rest)).toBe(false);
  });

  it('should return false for non-array sections', () => {
    expect(isValidQuote({ ...validQuote, sections: 'not-array' })).toBe(false);
  });

  it('should return false for sections containing invalid section', () => {
    const invalidSection = { ...validSection, id: '' };
    expect(isValidQuote({ ...validQuote, sections: [invalidSection] })).toBe(false);
  });

  it('should return false for missing totals', () => {
    const { totals: _, ...rest } = validQuote;
    expect(isValidQuote(rest)).toBe(false);
  });

  it('should return false for invalid totals', () => {
    const invalidTotals = { ...validTotals, equipment: -100 };
    expect(isValidQuote({ ...validQuote, totals: invalidTotals })).toBe(false);
  });

  it('should return false for missing createdAt', () => {
    const { createdAt: _, ...rest } = validQuote;
    expect(isValidQuote(rest)).toBe(false);
  });

  it('should return false for empty createdAt', () => {
    expect(isValidQuote({ ...validQuote, createdAt: '' })).toBe(false);
  });

  it('should return false for non-string createdAt', () => {
    expect(isValidQuote({ ...validQuote, createdAt: 123 })).toBe(false);
  });

  it('should return false for missing updatedAt', () => {
    const { updatedAt: _, ...rest } = validQuote;
    expect(isValidQuote(rest)).toBe(false);
  });

  it('should return false for empty updatedAt', () => {
    expect(isValidQuote({ ...validQuote, updatedAt: '' })).toBe(false);
  });

  it('should return false for non-string updatedAt', () => {
    expect(isValidQuote({ ...validQuote, updatedAt: 123 })).toBe(false);
  });

  it('should validate all quote statuses', () => {
    const statuses: QuoteStatus[] = ['draft', 'quoting', 'client_review', 'approved', 'ordered'];
    statuses.forEach((status) => {
      expect(isValidQuote({ ...validQuote, status })).toBe(true);
    });
  });

  it('should validate multiple sections in quote', () => {
    const section2: QuoteSection = { ...validSection, id: 'section-2', name: 'Audio Equipment' };
    const quoteWithMultipleSections = { ...validQuote, sections: [validSection, section2] };
    expect(isValidQuote(quoteWithMultipleSections)).toBe(true);
  });
});

// ============================================================================
// Default Factory Functions Tests
// ============================================================================

describe('createDefaultQuoteTotals', () => {
  it('should create quote totals with all zero values', () => {
    const totals = createDefaultQuoteTotals();
    expect(totals.equipment).toBe(0);
    expect(totals.labor).toBe(0);
    expect(totals.subtotal).toBe(0);
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(0);
    expect(totals.margin).toBe(0);
    expect(totals.marginPercentage).toBe(0);
  });

  it('should create valid quote totals', () => {
    const totals = createDefaultQuoteTotals();
    expect(isValidQuoteTotals(totals)).toBe(true);
  });
});

describe('createDefaultQuoteItem', () => {
  it('should create quote item with required fields', () => {
    const item = createDefaultQuoteItem('equip-123');
    expect(item.id).toBeDefined();
    expect(item.id.length).toBeGreaterThan(0);
    expect(item.equipmentId).toBe('equip-123');
    expect(item.quantity).toBe(1);
    expect(item.unitCost).toBe(0);
    expect(item.unitPrice).toBe(0);
    expect(item.margin).toBe(0);
    expect(item.total).toBe(0);
    expect(item.status).toBe('quoting');
  });

  it('should create valid quote item', () => {
    const item = createDefaultQuoteItem('equip-123');
    expect(isValidQuoteItem(item)).toBe(true);
  });

  it('should create unique ids for each call', () => {
    const item1 = createDefaultQuoteItem('equip-123');
    const item2 = createDefaultQuoteItem('equip-123');
    expect(item1.id).not.toBe(item2.id);
  });
});

describe('createDefaultQuoteSection', () => {
  it('should create quote section with required fields', () => {
    const section = createDefaultQuoteSection('Video Equipment', 'video');
    expect(section.id).toBeDefined();
    expect(section.id.length).toBeGreaterThan(0);
    expect(section.name).toBe('Video Equipment');
    expect(section.category).toBe('video');
    expect(section.items).toEqual([]);
    expect(section.subtotal).toBe(0);
  });

  it('should create valid quote section', () => {
    const section = createDefaultQuoteSection('Audio Equipment', 'audio');
    expect(isValidQuoteSection(section)).toBe(true);
  });

  it('should create unique ids for each call', () => {
    const section1 = createDefaultQuoteSection('Section 1', 'video');
    const section2 = createDefaultQuoteSection('Section 2', 'video');
    expect(section1.id).not.toBe(section2.id);
  });
});

describe('createDefaultQuote', () => {
  it('should create quote with required fields', () => {
    const quote = createDefaultQuote('proj-123', 'room-456');
    expect(quote.id).toBeDefined();
    expect(quote.id.length).toBeGreaterThan(0);
    expect(quote.projectId).toBe('proj-123');
    expect(quote.roomId).toBe('room-456');
    expect(quote.version).toBe(1);
    expect(quote.status).toBe('draft');
    expect(quote.sections).toEqual([]);
    expect(quote.totals).toEqual(createDefaultQuoteTotals());
    expect(quote.createdAt).toBeDefined();
    expect(quote.updatedAt).toBeDefined();
  });

  it('should create valid quote', () => {
    const quote = createDefaultQuote('proj-123', 'room-456');
    expect(isValidQuote(quote)).toBe(true);
  });

  it('should create unique ids for each call', () => {
    const quote1 = createDefaultQuote('proj-123', 'room-456');
    const quote2 = createDefaultQuote('proj-123', 'room-456');
    expect(quote1.id).not.toBe(quote2.id);
  });

  it('should create timestamps as valid ISO strings', () => {
    const quote = createDefaultQuote('proj-123', 'room-456');
    expect(() => new Date(quote.createdAt)).not.toThrow();
    expect(() => new Date(quote.updatedAt)).not.toThrow();
    expect(new Date(quote.createdAt).toISOString()).toBe(quote.createdAt);
    expect(new Date(quote.updatedAt).toISOString()).toBe(quote.updatedAt);
  });
});

// ============================================================================
// Edge Cases and Integration Tests
// ============================================================================

describe('Quote Types - Edge Cases', () => {
  it('should handle deeply nested quote with many sections and items', () => {
    const items: QuoteItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: `item-${i}`,
      equipmentId: `equip-${i}`,
      quantity: i + 1,
      unitCost: 100 * (i + 1),
      unitPrice: 150 * (i + 1),
      margin: 50 * (i + 1),
      total: 150 * (i + 1) * (i + 1),
      status: 'quoting' as ItemStatus,
    }));

    const sections: QuoteSection[] = Array.from({ length: 5 }, (_, i) => ({
      id: `section-${i}`,
      name: `Section ${i}`,
      category: `category-${i}`,
      items: items.slice(i * 2, i * 2 + 2),
      subtotal: items.slice(i * 2, i * 2 + 2).reduce((sum, item) => sum + item.total, 0),
    }));

    const quote: Quote = {
      id: 'quote-complex',
      projectId: 'proj-123',
      roomId: 'room-456',
      version: 5,
      status: 'client_review',
      sections,
      totals: {
        equipment: 50000,
        labor: 10000,
        subtotal: 60000,
        tax: 6000,
        total: 66000,
        margin: 15000,
        marginPercentage: 25,
      },
      createdAt: '2026-01-18T00:00:00.000Z',
      updatedAt: '2026-01-18T12:00:00.000Z',
    };

    expect(isValidQuote(quote)).toBe(true);
  });

  it('should validate quote item with maximum reasonable values', () => {
    const item: QuoteItem = {
      id: 'item-max',
      equipmentId: 'equip-max',
      quantity: 1000,
      unitCost: 1000000,
      unitPrice: 1500000,
      margin: 500000,
      total: 1500000000,
      status: 'ordered',
    };
    expect(isValidQuoteItem(item)).toBe(true);
  });

  it('should handle quote item at cost (zero margin)', () => {
    const item: QuoteItem = {
      id: 'item-at-cost',
      equipmentId: 'equip-1',
      quantity: 1,
      unitCost: 1000,
      unitPrice: 1000,
      margin: 0,
      total: 1000,
      status: 'quoting',
    };
    expect(isValidQuoteItem(item)).toBe(true);
  });

  it('should handle quote item below cost (loss leader)', () => {
    const item: QuoteItem = {
      id: 'item-loss',
      equipmentId: 'equip-1',
      quantity: 1,
      unitCost: 1000,
      unitPrice: 800,
      margin: -200,
      total: 800,
      status: 'quoting',
    };
    expect(isValidQuoteItem(item)).toBe(true);
  });
});
