import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders an input element', () => {
      render(<Input aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with the input base class', () => {
      render(<Input aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toHaveClass('input');
    });

    it('renders with a default type of text', () => {
      render(<Input aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('renders with a custom type', () => {
      render(<Input type="email" aria-label="Email input" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('renders with a placeholder', () => {
      render(<Input placeholder="Enter text" aria-label="Test input" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('forwards ref to the input element', () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} aria-label="Test input" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('label', () => {
    it('renders a label when label prop is provided', () => {
      render(<Input label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('associates the label with the input via htmlFor', () => {
      render(<Input id="username" label="Username" />);
      const label = screen.getByText('Username');
      expect(label).toHaveAttribute('for', 'username');
    });

    it('generates an id if not provided and label is present', () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id');
      expect(input.id).toBeTruthy();
    });

    it('uses label class for styling', () => {
      render(<Input label="Username" />);
      const label = screen.getByText('Username');
      expect(label).toHaveClass('label');
    });
  });

  describe('error state', () => {
    it('renders error message when error prop is provided', () => {
      render(<Input error="This field is required" aria-label="Test input" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('applies error styling to input when error is present', () => {
      render(<Input error="Invalid input" aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toHaveClass('input-error');
    });

    it('sets aria-invalid when error is present', () => {
      render(<Input error="Error message" aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with input via aria-describedby', () => {
      render(<Input id="test" error="Error message" aria-label="Test input" />);
      const input = screen.getByRole('textbox');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });

    it('uses error text styling', () => {
      render(<Input error="Error message" aria-label="Test input" />);
      const errorText = screen.getByText('Error message');
      expect(errorText).toHaveClass('text-status-error');
    });
  });

  describe('helper text', () => {
    it('renders helper text when helperText prop is provided', () => {
      render(<Input helperText="Enter your email address" aria-label="Test input" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('uses secondary text styling for helper text', () => {
      render(<Input helperText="Helper message" aria-label="Test input" />);
      const helperText = screen.getByText('Helper message');
      expect(helperText).toHaveClass('text-text-secondary');
    });

    it('associates helper text with input via aria-describedby', () => {
      render(<Input id="test" helperText="Helper message" aria-label="Test input" />);
      const input = screen.getByRole('textbox');
      const helperId = input.getAttribute('aria-describedby');
      expect(helperId).toBeTruthy();
      expect(screen.getByText('Helper message')).toHaveAttribute('id', helperId);
    });

    it('prioritizes error message over helper text in aria-describedby', () => {
      render(
        <Input
          id="test"
          error="Error message"
          helperText="Helper message"
          aria-label="Test input"
        />
      );
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      // Error should be associated, helper text may also be visible but error takes priority
      expect(screen.getByText('Error message')).toHaveAttribute('id', describedBy);
    });

    it('hides helper text when error is present', () => {
      render(
        <Input
          error="Error message"
          helperText="Helper message"
          aria-label="Test input"
        />
      );
      expect(screen.queryByText('Helper message')).not.toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies default (md) size when no size prop provided', () => {
      render(<Input aria-label="Test input" />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('input-sm', 'input-lg');
    });

    it('applies small size class', () => {
      render(<Input size="sm" aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toHaveClass('input-sm');
    });

    it('applies large size class', () => {
      render(<Input size="lg" aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toHaveClass('input-lg');
    });
  });

  describe('disabled state', () => {
    it('disables the input when disabled prop is true', () => {
      render(<Input disabled aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('prevents typing when disabled', async () => {
      render(<Input disabled aria-label="Test input" />);
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');
      expect(input).toHaveValue('');
    });
  });

  describe('required state', () => {
    it('marks input as required when required prop is true', () => {
      render(<Input required aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('shows required indicator in label when required', () => {
      render(<Input label="Username" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('allows typing in the input', async () => {
      render(<Input aria-label="Test input" />);
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'hello world');
      expect(input).toHaveValue('hello world');
    });

    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} aria-label="Test input" />);
      await userEvent.type(screen.getByRole('textbox'), 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('calls onBlur when focus leaves', async () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} aria-label="Test input" />);
      const input = screen.getByRole('textbox');
      await userEvent.click(input);
      await userEvent.tab();
      expect(handleBlur).toHaveBeenCalled();
    });

    it('calls onFocus when input receives focus', async () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} aria-label="Test input" />);
      await userEvent.click(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('is focusable via tab', async () => {
      render(<Input aria-label="Test input" />);
      await userEvent.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('supports custom aria-label', () => {
      render(<Input aria-label="Search" />);
      expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
    });

    it('supports autocomplete attribute', () => {
      render(<Input autoComplete="email" aria-label="Email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email');
    });
  });

  describe('className prop', () => {
    it('merges custom className with default classes', () => {
      render(<Input className="custom-class" aria-label="Test input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('input', 'custom-class');
    });
  });

  describe('value control', () => {
    it('accepts a controlled value', () => {
      render(<Input value="controlled" onChange={() => {}} aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toHaveValue('controlled');
    });

    it('accepts a defaultValue for uncontrolled usage', () => {
      render(<Input defaultValue="default" aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toHaveValue('default');
    });
  });

  describe('wrapper', () => {
    it('wraps the input in a container div', () => {
      const { container } = render(<Input label="Test" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('input-wrapper');
    });
  });
});
