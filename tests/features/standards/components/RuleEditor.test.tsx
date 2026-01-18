/**
 * RuleEditor Component Tests
 *
 * Tests for the rule creation and editing form component
 * with condition builder and expression editor.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { RuleEditor } from '@/features/standards/components/RuleEditor';
import type { Rule } from '@/types/standards';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockRule: Rule = {
  id: 'rule-1',
  name: 'Teams Display Size',
  description: 'Require 75" display for Teams rooms',
  aspect: 'equipment_selection',
  expressionType: 'constraint',
  conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
  expression: 'display.size >= 75',
  priority: 80,
  isActive: true,
  createdAt: '2026-01-18T00:00:00Z',
  updatedAt: '2026-01-18T00:00:00Z',
};

describe('RuleEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders as a form element', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('has accessible name', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByRole('form')).toHaveAccessibleName(/rule/i);
    });

    it('displays create mode title', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByRole('heading', { name: /create rule/i })).toBeInTheDocument();
    });

    it('displays edit mode title', () => {
      render(<RuleEditor mode="edit" rule={mockRule} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByRole('heading', { name: /edit rule/i })).toBeInTheDocument();
    });
  });

  describe('Basic Fields', () => {
    it('renders name field', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('renders description field', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('renders aspect select', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/aspect/i)).toBeInTheDocument();
    });

    it('renders expression type select', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/expression type/i)).toBeInTheDocument();
    });

    it('renders priority field', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    });

    it('renders active toggle', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/active/i)).toBeInTheDocument();
    });
  });

  describe('Edit Mode Pre-population', () => {
    it('pre-populates name in edit mode', () => {
      render(<RuleEditor mode="edit" rule={mockRule} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/name/i)).toHaveValue('Teams Display Size');
    });

    it('pre-populates description in edit mode', () => {
      render(<RuleEditor mode="edit" rule={mockRule} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/description/i)).toHaveValue(
        'Require 75" display for Teams rooms'
      );
    });

    it('pre-populates aspect in edit mode', () => {
      render(<RuleEditor mode="edit" rule={mockRule} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/aspect/i)).toHaveValue('equipment_selection');
    });

    it('pre-populates priority in edit mode', () => {
      render(<RuleEditor mode="edit" rule={mockRule} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/priority/i)).toHaveValue(80);
    });

    it('pre-populates expression in edit mode', () => {
      render(<RuleEditor mode="edit" rule={mockRule} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/^expression$/i)).toHaveValue('display.size >= 75');
    });
  });

  describe('Condition Builder', () => {
    it('renders condition builder section', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByText(/conditions/i)).toBeInTheDocument();
    });

    it('renders add condition button', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByRole('button', { name: /add condition/i })).toBeInTheDocument();
    });

    it('adds new condition when add button clicked', async () => {
      const user = userEvent.setup();
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      const addButton = screen.getByRole('button', { name: /add condition/i });
      await user.click(addButton);

      // Should now have a dimension select
      expect(screen.getByLabelText(/dimension/i)).toBeInTheDocument();
    });

    it('displays existing conditions in edit mode', () => {
      render(<RuleEditor mode="edit" rule={mockRule} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      // The dimension select should have 'platform' selected
      const dimensionSelect = screen.getByLabelText(/dimension/i);
      expect(dimensionSelect).toHaveValue('platform');
      // The operator select should have 'equals' selected
      const operatorSelect = screen.getByLabelText(/operator/i);
      expect(operatorSelect).toHaveValue('equals');
      // The value input should have 'teams'
      expect(screen.getByDisplayValue('teams')).toBeInTheDocument();
    });

    it('can remove a condition', async () => {
      const user = userEvent.setup();
      render(<RuleEditor mode="edit" rule={mockRule} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      const removeButton = screen.getByRole('button', { name: /remove condition/i });
      await user.click(removeButton);

      // Condition should be removed
      expect(screen.queryByDisplayValue('platform')).not.toBeInTheDocument();
    });
  });

  describe('Expression Editor', () => {
    it('renders expression field', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByLabelText(/^expression$/i)).toBeInTheDocument();
    });

    it('expression is a textarea for multiline', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      const expression = screen.getByLabelText(/^expression$/i);
      expect(expression.tagName).toBe('TEXTAREA');
    });
  });

  describe('Form Actions', () => {
    it('renders submit button', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    it('renders cancel button', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('shows "Save" in edit mode', () => {
      render(<RuleEditor mode="edit" rule={mockRule} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('calls onCancel when cancel clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={handleCancel} />, {
        wrapper: createWrapper(),
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(handleCancel).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<RuleEditor mode="create" onSubmit={handleSubmit} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      // Fill required fields
      await user.type(screen.getByLabelText(/name/i), 'Test Rule');
      await user.type(screen.getByLabelText(/description/i), 'A test rule');
      await user.selectOptions(screen.getByLabelText(/aspect/i), 'equipment_selection');
      await user.selectOptions(screen.getByLabelText(/expression type/i), 'constraint');
      await user.clear(screen.getByLabelText(/priority/i));
      await user.type(screen.getByLabelText(/priority/i), '50');
      await user.type(screen.getByLabelText(/^expression$/i), 'test == true');

      // Add a condition
      await user.click(screen.getByRole('button', { name: /add condition/i }));
      await user.selectOptions(screen.getByLabelText(/dimension/i), 'platform');
      await user.selectOptions(screen.getByLabelText(/operator/i), 'equals');
      await user.type(screen.getByLabelText(/value/i), 'teams');

      // Submit
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Rule',
            description: 'A test rule',
            aspect: 'equipment_selection',
            expressionType: 'constraint',
            priority: 50,
            expression: 'test == true',
            conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
            isActive: true,
          })
        );
      });
    });
  });

  describe('Validation', () => {
    it('shows error for empty name', async () => {
      const user = userEvent.setup();
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    it('shows error for missing conditions', async () => {
      const user = userEvent.setup();
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      // Fill basic fields but no conditions
      await user.type(screen.getByLabelText(/name/i), 'Test Rule');
      await user.type(screen.getByLabelText(/description/i), 'A test rule');
      await user.selectOptions(screen.getByLabelText(/aspect/i), 'equipment_selection');
      await user.selectOptions(screen.getByLabelText(/expression type/i), 'constraint');
      await user.type(screen.getByLabelText(/^expression$/i), 'test == true');

      await user.click(screen.getByRole('button', { name: /create/i }));

      expect(screen.getByText(/at least one condition/i)).toBeInTheDocument();
    });

    it('shows error for empty expression', async () => {
      const user = userEvent.setup();
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      await user.type(screen.getByLabelText(/name/i), 'Test Rule');
      await user.click(screen.getByRole('button', { name: /create/i }));

      expect(screen.getByText(/expression is required/i)).toBeInTheDocument();
    });

    it('accepts priority within valid range', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<RuleEditor mode="create" onSubmit={handleSubmit} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      // Fill required fields
      await user.type(screen.getByLabelText(/name/i), 'Test Rule');
      await user.selectOptions(screen.getByLabelText(/aspect/i), 'equipment_selection');
      await user.selectOptions(screen.getByLabelText(/expression type/i), 'constraint');
      await user.type(screen.getByLabelText(/^expression$/i), 'test == true');

      // Add a condition
      await user.click(screen.getByRole('button', { name: /add condition/i }));
      await user.type(screen.getByLabelText(/value/i), 'teams');

      // Set valid priority
      const priorityInput = screen.getByLabelText(/priority/i);
      await user.clear(priorityInput);
      await user.type(priorityInput, '75');
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ priority: 75 })
        );
      });
    });
  });

  describe('Loading State', () => {
    it('disables submit button when loading', () => {
      render(
        <RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} isLoading={true} />,
        { wrapper: createWrapper() }
      );

      // When loading, button text changes to "Creating..."
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });

    it('shows loading text on submit button', () => {
      render(
        <RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} isLoading={true} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('all inputs have labels', () => {
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('error messages are associated with inputs', async () => {
      const user = userEvent.setup();
      render(<RuleEditor mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />, {
        wrapper: createWrapper(),
      });

      await user.click(screen.getByRole('button', { name: /create/i }));

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAccessibleDescription(/required/i);
    });
  });
});
