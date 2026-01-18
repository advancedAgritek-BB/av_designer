import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EquipmentForm } from '@/features/equipment/components/EquipmentForm';
import type { Equipment } from '@/types/equipment';

// Mock the mutation hooks
vi.mock('@/features/equipment/use-equipment', () => ({
  useCreateEquipment: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useUpdateEquipment: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
}));

const mockEquipment: Equipment = {
  id: '1',
  manufacturer: 'Shure',
  model: 'MXA920',
  sku: 'MXA920-S',
  category: 'audio',
  subcategory: 'microphones',
  description: 'Ceiling array microphone with IntelliMix DSP',
  cost: 2847,
  msrp: 3500,
  dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
  weight: 6.2,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('EquipmentForm', () => {
  describe('Rendering - Create Mode', () => {
    it('renders as a form element', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('renders with accessible form name', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(
        screen.getByRole('form', { name: /add.*equipment/i })
      ).toBeInTheDocument();
    });

    it('renders manufacturer input', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
    });

    it('renders model input', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    });

    it('renders SKU input', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByLabelText(/sku/i)).toBeInTheDocument();
    });

    it('renders category select', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(
        screen.getByRole('combobox', { name: /^category/i })
      ).toBeInTheDocument();
    });

    it('renders subcategory select', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(
        screen.getByRole('combobox', { name: /^subcategory/i })
      ).toBeInTheDocument();
    });

    it('renders description textarea', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('renders cost input', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByLabelText(/cost/i)).toBeInTheDocument();
    });

    it('renders MSRP input', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByLabelText(/msrp/i)).toBeInTheDocument();
    });

    it('renders dimension inputs (height, width, depth)', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/width/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/depth/i)).toBeInTheDocument();
    });

    it('renders weight input', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
    });

    it('renders submit button with "Add Equipment" text', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(
        screen.getByRole('button', { name: /add equipment/i })
      ).toBeInTheDocument();
    });

    it('renders cancel button when onCancel provided', () => {
      render(
        <EquipmentForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />,
        { wrapper: createQueryWrapper() }
      );
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it('does not render cancel button when onCancel not provided', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(
        screen.queryByRole('button', { name: /cancel/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Rendering - Edit Mode', () => {
    it('renders with accessible form name for edit mode', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(
        screen.getByRole('form', { name: /edit.*equipment/i })
      ).toBeInTheDocument();
    });

    it('pre-fills manufacturer from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByLabelText(/manufacturer/i)).toHaveValue('Shure');
    });

    it('pre-fills model from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByLabelText(/model/i)).toHaveValue('MXA920');
    });

    it('pre-fills SKU from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByLabelText(/sku/i)).toHaveValue('MXA920-S');
    });

    it('pre-fills category from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByRole('combobox', { name: /^category/i })).toHaveValue(
        'audio'
      );
    });

    it('pre-fills subcategory from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByRole('combobox', { name: /^subcategory/i })).toHaveValue(
        'microphones'
      );
    });

    it('pre-fills description from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByLabelText(/description/i)).toHaveValue(
        'Ceiling array microphone with IntelliMix DSP'
      );
    });

    it('pre-fills cost from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByLabelText(/cost/i)).toHaveValue(2847);
    });

    it('pre-fills MSRP from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByLabelText(/msrp/i)).toHaveValue(3500);
    });

    it('pre-fills dimensions from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByLabelText(/height/i)).toHaveValue(2.5);
      expect(screen.getByLabelText(/width/i)).toHaveValue(23.5);
      expect(screen.getByLabelText(/depth/i)).toHaveValue(23.5);
    });

    it('pre-fills weight from equipment', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(screen.getByLabelText(/weight/i)).toHaveValue(6.2);
    });

    it('renders submit button with "Save Changes" text in edit mode', () => {
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={vi.fn()}
        />,
        { wrapper: createQueryWrapper() }
      );
      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
    });
  });

  describe('Category Subcategory Relationship', () => {
    it('shows video subcategories when video category selected', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      const categorySelect = screen.getByRole('combobox', { name: /^category/i });
      await userEvent.selectOptions(categorySelect, 'video');

      const subcategorySelect = screen.getByRole('combobox', {
        name: /^subcategory/i,
      });
      expect(subcategorySelect).toContainHTML('displays');
      expect(subcategorySelect).toContainHTML('cameras');
    });

    it('shows audio subcategories when audio category selected', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      const categorySelect = screen.getByRole('combobox', { name: /^category/i });
      await userEvent.selectOptions(categorySelect, 'audio');

      const subcategorySelect = screen.getByRole('combobox', {
        name: /^subcategory/i,
      });
      expect(subcategorySelect).toContainHTML('microphones');
      expect(subcategorySelect).toContainHTML('speakers');
    });

    it('shows control subcategories when control category selected', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      const categorySelect = screen.getByRole('combobox', { name: /^category/i });
      await userEvent.selectOptions(categorySelect, 'control');

      const subcategorySelect = screen.getByRole('combobox', {
        name: /^subcategory/i,
      });
      expect(subcategorySelect).toContainHTML('processors');
      expect(subcategorySelect).toContainHTML('touch-panels');
    });

    it('shows infrastructure subcategories when infrastructure category selected', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      const categorySelect = screen.getByRole('combobox', { name: /^category/i });
      await userEvent.selectOptions(categorySelect, 'infrastructure');

      const subcategorySelect = screen.getByRole('combobox', {
        name: /^subcategory/i,
      });
      expect(subcategorySelect).toContainHTML('racks');
      expect(subcategorySelect).toContainHTML('cables');
    });

    it('resets subcategory when category changes', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      const categorySelect = screen.getByRole('combobox', { name: /^category/i });
      const subcategorySelect = screen.getByRole('combobox', {
        name: /^subcategory/i,
      });

      await userEvent.selectOptions(categorySelect, 'audio');
      await userEvent.selectOptions(subcategorySelect, 'microphones');
      expect(subcategorySelect).toHaveValue('microphones');

      await userEvent.selectOptions(categorySelect, 'video');
      expect(subcategorySelect).toHaveValue('');
    });
  });

  describe('Form Validation', () => {
    it('shows error when manufacturer is empty on submit', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/manufacturer is required/i)).toBeInTheDocument();
    });

    it('shows error when model is empty on submit', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/model is required/i)).toBeInTheDocument();
    });

    it('shows error when SKU is empty on submit', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/sku is required/i)).toBeInTheDocument();
    });

    it('shows error when category is not selected', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      await userEvent.type(screen.getByLabelText(/sku/i), 'MXA920-S');
      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/^category is required$/i)).toBeInTheDocument();
    });

    it('shows error when subcategory is not selected', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      await userEvent.type(screen.getByLabelText(/sku/i), 'MXA920-S');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^category/i }),
        'audio'
      );
      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/subcategory is required/i)).toBeInTheDocument();
    });

    it('shows error when cost is negative', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      // Fill required fields first
      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      await userEvent.type(screen.getByLabelText(/sku/i), 'MXA920-S');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^category/i }),
        'audio'
      );
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^subcategory/i }),
        'microphones'
      );

      // Use fireEvent.change to bypass number input restrictions
      fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '-100' } });
      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/cost must be.*positive/i)).toBeInTheDocument();
    });

    it('shows error when MSRP is negative', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      // Fill required fields first
      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      await userEvent.type(screen.getByLabelText(/sku/i), 'MXA920-S');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^category/i }),
        'audio'
      );
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^subcategory/i }),
        'microphones'
      );

      // Use fireEvent.change to bypass number input restrictions
      fireEvent.change(screen.getByLabelText(/msrp/i), { target: { value: '-100' } });
      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/msrp must be.*positive/i)).toBeInTheDocument();
    });

    it('shows error when dimensions are negative', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      // Fill required fields first
      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      await userEvent.type(screen.getByLabelText(/sku/i), 'MXA920-S');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^category/i }),
        'audio'
      );
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^subcategory/i }),
        'microphones'
      );

      // Use fireEvent.change to bypass number input restrictions
      fireEvent.change(screen.getByLabelText(/height/i), { target: { value: '-1' } });
      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/height must be.*positive/i)).toBeInTheDocument();
    });

    it('shows error when weight is negative', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      // Fill required fields first
      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      await userEvent.type(screen.getByLabelText(/sku/i), 'MXA920-S');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^category/i }),
        'audio'
      );
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^subcategory/i }),
        'microphones'
      );

      // Use fireEvent.change to bypass number input restrictions
      fireEvent.change(screen.getByLabelText(/weight/i), { target: { value: '-1' } });
      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/weight must be.*positive/i)).toBeInTheDocument();
    });

    it('clears error when field is corrected', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/manufacturer is required/i)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');

      expect(
        screen.queryByText(/manufacturer is required/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const handleSubmit = vi.fn();
      render(<EquipmentForm mode="create" onSubmit={handleSubmit} />, {
        wrapper: createQueryWrapper(),
      });

      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      await userEvent.type(screen.getByLabelText(/sku/i), 'MXA920-S');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^category/i }),
        'audio'
      );
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^subcategory/i }),
        'microphones'
      );
      await userEvent.type(
        screen.getByLabelText(/description/i),
        'Ceiling microphone'
      );
      await userEvent.type(screen.getByLabelText(/cost/i), '2847');
      await userEvent.type(screen.getByLabelText(/msrp/i), '3500');
      await userEvent.type(screen.getByLabelText(/height/i), '2.5');
      await userEvent.type(screen.getByLabelText(/width/i), '23.5');
      await userEvent.type(screen.getByLabelText(/depth/i), '23.5');
      await userEvent.type(screen.getByLabelText(/weight/i), '6.2');

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });

      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          manufacturer: 'Shure',
          model: 'MXA920',
          sku: 'MXA920-S',
          category: 'audio',
          subcategory: 'microphones',
          description: 'Ceiling microphone',
          cost: 2847,
          msrp: 3500,
          dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
          weight: 6.2,
        })
      );
    });

    it('does not call onSubmit when form is invalid', async () => {
      const handleSubmit = vi.fn();
      render(<EquipmentForm mode="create" onSubmit={handleSubmit} />, {
        wrapper: createQueryWrapper(),
      });

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with equipment id in edit mode', async () => {
      const handleSubmit = vi.fn();
      render(
        <EquipmentForm
          mode="edit"
          equipment={mockEquipment}
          onSubmit={handleSubmit}
        />,
        { wrapper: createQueryWrapper() }
      );

      // Just change one field
      await userEvent.clear(screen.getByLabelText(/model/i));
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA910');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });

      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'MXA910',
        }),
        '1'
      );
    });
  });

  describe('Cancel Button', () => {
    it('calls onCancel when cancel button clicked', async () => {
      const handleCancel = vi.fn();
      render(
        <EquipmentForm mode="create" onSubmit={vi.fn()} onCancel={handleCancel} />,
        { wrapper: createQueryWrapper() }
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('does not submit form when cancel button clicked', async () => {
      const handleSubmit = vi.fn();
      render(
        <EquipmentForm mode="create" onSubmit={handleSubmit} onCancel={vi.fn()} />,
        { wrapper: createQueryWrapper() }
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('disables submit button when isLoading is true', () => {
      render(
        <EquipmentForm mode="create" onSubmit={vi.fn()} isLoading={true} />,
        { wrapper: createQueryWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      expect(submitButton).toBeDisabled();
    });

    it('shows loading spinner when isLoading is true', () => {
      render(
        <EquipmentForm mode="create" onSubmit={vi.fn()} isLoading={true} />,
        { wrapper: createQueryWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });

    it('disables all inputs when isLoading is true', () => {
      render(
        <EquipmentForm mode="create" onSubmit={vi.fn()} isLoading={true} />,
        { wrapper: createQueryWrapper() }
      );

      expect(screen.getByLabelText(/manufacturer/i)).toBeDisabled();
      expect(screen.getByLabelText(/model/i)).toBeDisabled();
      expect(screen.getByLabelText(/sku/i)).toBeDisabled();
    });
  });

  describe('Optional Fields', () => {
    it('renders electrical specification fields as collapsible section', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(
        screen.getByRole('button', { name: /electrical/i })
      ).toBeInTheDocument();
    });

    it('expands electrical section when clicked', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      const electricalButton = screen.getByRole('button', { name: /electrical/i });
      await userEvent.click(electricalButton);

      expect(screen.getByLabelText(/voltage/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/wattage/i)).toBeInTheDocument();
    });

    it('includes electrical specs in submission when provided', async () => {
      const handleSubmit = vi.fn();
      render(<EquipmentForm mode="create" onSubmit={handleSubmit} />, {
        wrapper: createQueryWrapper(),
      });

      // Fill required fields
      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      await userEvent.type(screen.getByLabelText(/sku/i), 'MXA920-S');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^category/i }),
        'audio'
      );
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^subcategory/i }),
        'microphones'
      );
      await userEvent.type(screen.getByLabelText(/description/i), 'Test');
      await userEvent.type(screen.getByLabelText(/cost/i), '100');
      await userEvent.type(screen.getByLabelText(/msrp/i), '150');
      await userEvent.type(screen.getByLabelText(/height/i), '1');
      await userEvent.type(screen.getByLabelText(/width/i), '1');
      await userEvent.type(screen.getByLabelText(/depth/i), '1');
      await userEvent.type(screen.getByLabelText(/weight/i), '1');

      // Expand and fill electrical section
      const electricalButton = screen.getByRole('button', { name: /electrical/i });
      await userEvent.click(electricalButton);
      await userEvent.type(screen.getByLabelText(/voltage/i), '120');
      await userEvent.type(screen.getByLabelText(/wattage/i), '10');

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            electrical: expect.objectContaining({
              voltage: 120,
              wattage: 10,
            }),
          })
        );
      });
    });

    it('renders platform certifications input', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });
      expect(screen.getByLabelText(/certifications/i)).toBeInTheDocument();
    });

    it('parses comma-separated certifications', async () => {
      const handleSubmit = vi.fn();
      render(<EquipmentForm mode="create" onSubmit={handleSubmit} />, {
        wrapper: createQueryWrapper(),
      });

      // Fill required fields
      await userEvent.type(screen.getByLabelText(/manufacturer/i), 'Shure');
      await userEvent.type(screen.getByLabelText(/model/i), 'MXA920');
      await userEvent.type(screen.getByLabelText(/sku/i), 'MXA920-S');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^category/i }),
        'audio'
      );
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /^subcategory/i }),
        'microphones'
      );
      await userEvent.type(screen.getByLabelText(/description/i), 'Test');
      await userEvent.type(screen.getByLabelText(/cost/i), '100');
      await userEvent.type(screen.getByLabelText(/msrp/i), '150');
      await userEvent.type(screen.getByLabelText(/height/i), '1');
      await userEvent.type(screen.getByLabelText(/width/i), '1');
      await userEvent.type(screen.getByLabelText(/depth/i), '1');
      await userEvent.type(screen.getByLabelText(/weight/i), '1');

      await userEvent.type(
        screen.getByLabelText(/certifications/i),
        'Teams, Zoom, Webex'
      );

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            platformCertifications: ['Teams', 'Zoom', 'Webex'],
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has no duplicate form labels', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      const labels = screen.getAllByRole('textbox').map((input) => {
        const label = input.getAttribute('aria-label') || input.id;
        return label;
      });
      const uniqueLabels = new Set(labels);
      expect(labels.length).toBe(uniqueLabels.size);
    });

    it('associates error messages with inputs', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      const manufacturerInput = screen.getByLabelText(/manufacturer/i);
      expect(manufacturerInput).toHaveAttribute('aria-invalid', 'true');
      expect(manufacturerInput).toHaveAccessibleDescription(
        /manufacturer is required/i
      );
    });

    it('focuses first invalid field on submit error', async () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      const submitButton = screen.getByRole('button', { name: /add equipment/i });
      await userEvent.click(submitButton);

      expect(screen.getByLabelText(/manufacturer/i)).toHaveFocus();
    });

    it('groups dimension inputs with fieldset', () => {
      render(<EquipmentForm mode="create" onSubmit={vi.fn()} />, {
        wrapper: createQueryWrapper(),
      });

      expect(
        screen.getByRole('group', { name: /dimensions/i })
      ).toBeInTheDocument();
    });
  });

  describe('Form Reset', () => {
    it('resets form when key changes (remount pattern)', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <EquipmentForm
            key="edit-1"
            mode="edit"
            equipment={mockEquipment}
            onSubmit={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByLabelText(/manufacturer/i)).toHaveValue('Shure');

      // Use key prop to force remount (recommended pattern)
      rerender(
        <QueryClientProvider client={queryClient}>
          <EquipmentForm key="create" mode="create" onSubmit={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/manufacturer/i)).toHaveValue('');
      });
    });
  });
});
