import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientService } from '../client-service';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('ClientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all clients ordered by name', async () => {
      const mockClients = [
        {
          id: '1',
          name: 'Acme Corp',
          parent_id: null,
          industry: 'Finance',
          website: 'https://acme.com',
          logo_url: null,
          address: { street: '123 Main St', city: 'New York' },
          contact_name: 'John Doe',
          contact_email: 'john@acme.com',
          contact_phone: '555-1234',
          billing_terms: 'Net 30',
          tax_exempt: false,
          tax_exempt_id: null,
          notes: null,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          created_by: 'user1',
        },
      ];

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockClients, error: null }),
      } as never);

      const result = await ClientService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Acme Corp');
      expect(result[0].address.street).toBe('123 Main St');
    });

    it('should throw error on fetch failure', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      } as never);

      await expect(ClientService.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should fetch client by id', async () => {
      const mockClient = {
        id: '1',
        name: 'Acme Corp',
        parent_id: null,
        industry: 'Finance',
        website: null,
        logo_url: null,
        address: {},
        contact_name: null,
        contact_email: null,
        contact_phone: null,
        billing_terms: 'Net 30',
        tax_exempt: false,
        tax_exempt_id: null,
        notes: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        created_by: null,
      };

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockClient, error: null }),
      } as never);

      const result = await ClientService.getById('1');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Acme Corp');
    });

    it('should return null for non-existent client', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' },
        }),
      } as never);

      const result = await ClientService.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const mockCreatedClient = {
        id: 'new-id',
        name: 'New Client',
        parent_id: null,
        industry: 'Tech',
        website: null,
        logo_url: null,
        address: {},
        contact_name: null,
        contact_email: null,
        contact_phone: null,
        billing_terms: 'Net 30',
        tax_exempt: false,
        tax_exempt_id: null,
        notes: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        created_by: 'user1',
      };

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCreatedClient, error: null }),
      } as never);

      const result = await ClientService.create(
        { name: 'New Client', industry: 'Tech' },
        'user1'
      );

      expect(result.name).toBe('New Client');
      expect(result.id).toBe('new-id');
    });
  });

  describe('update', () => {
    it('should update an existing client', async () => {
      const mockUpdatedClient = {
        id: '1',
        name: 'Updated Name',
        parent_id: null,
        industry: 'Finance',
        website: null,
        logo_url: null,
        address: {},
        contact_name: null,
        contact_email: null,
        contact_phone: null,
        billing_terms: 'Net 30',
        tax_exempt: false,
        tax_exempt_id: null,
        notes: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-02',
        created_by: null,
      };

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedClient, error: null }),
      } as never);

      const result = await ClientService.update('1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as never);

      await expect(ClientService.delete('1')).resolves.not.toThrow();
    });
  });

  describe('getTopLevelClients', () => {
    it('should fetch only clients with no parent', async () => {
      const mockClients = [
        {
          id: '1',
          name: 'Parent Corp',
          parent_id: null,
          industry: null,
          website: null,
          logo_url: null,
          address: {},
          contact_name: null,
          contact_email: null,
          contact_phone: null,
          billing_terms: 'Net 30',
          tax_exempt: false,
          tax_exempt_id: null,
          notes: null,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          created_by: null,
        },
      ];

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockClients, error: null }),
      } as never);

      const result = await ClientService.getTopLevelClients();

      expect(result).toHaveLength(1);
      expect(result[0].parentId).toBeNull();
    });
  });
});
