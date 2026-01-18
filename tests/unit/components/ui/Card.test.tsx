import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';

describe('Card', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders as a div element by default', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card.tagName).toBe('DIV');
    });

    it('renders with base card class', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card');
    });

    it('forwards ref to the div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('variants', () => {
    it('applies default variant styles', () => {
      render(<Card data-testid="card">Default</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card');
      expect(screen.getByTestId('card')).not.toHaveClass('card-elevated');
    });

    it('applies elevated variant styles', () => {
      render(
        <Card variant="elevated" data-testid="card">
          Elevated
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('card-elevated');
    });
  });

  describe('hover state', () => {
    it('applies hoverable class when hoverable prop is true', () => {
      render(
        <Card hoverable data-testid="card">
          Hoverable
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('card-hoverable');
    });

    it('does not apply hoverable class by default', () => {
      render(<Card data-testid="card">Not hoverable</Card>);
      expect(screen.getByTestId('card')).not.toHaveClass('card-hoverable');
    });
  });

  describe('selected state', () => {
    it('applies selected class when selected prop is true', () => {
      render(
        <Card selected data-testid="card">
          Selected
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('card-selected');
    });

    it('does not apply selected class by default', () => {
      render(<Card data-testid="card">Not selected</Card>);
      expect(screen.getByTestId('card')).not.toHaveClass('card-selected');
    });

    it('has aria-selected attribute when selected', () => {
      render(
        <Card selected data-testid="card">
          Selected
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute('aria-selected', 'true');
    });

    it('does not have aria-selected when not selected', () => {
      render(<Card data-testid="card">Not selected</Card>);
      expect(screen.getByTestId('card')).not.toHaveAttribute('aria-selected');
    });
  });

  describe('interactive behavior', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} data-testid="card">
          Clickable
        </Card>
      );
      await userEvent.click(screen.getByTestId('card'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies interactive class when onClick is provided', () => {
      render(
        <Card onClick={() => {}} data-testid="card">
          Interactive
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('card-interactive');
    });

    it('does not apply interactive class when no onClick', () => {
      render(<Card data-testid="card">Not interactive</Card>);
      expect(screen.getByTestId('card')).not.toHaveClass('card-interactive');
    });

    it('has role button when interactive', () => {
      render(
        <Card onClick={() => {}} data-testid="card">
          Interactive
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute('role', 'button');
    });

    it('has tabIndex 0 when interactive', () => {
      render(
        <Card onClick={() => {}} data-testid="card">
          Interactive
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveAttribute('tabIndex', '0');
    });

    it('can be activated with Enter key when interactive', async () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} data-testid="card">
          Interactive
        </Card>
      );
      const card = screen.getByTestId('card');
      card.focus();
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be activated with Space key when interactive', async () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} data-testid="card">
          Interactive
        </Card>
      );
      const card = screen.getByTestId('card');
      card.focus();
      await userEvent.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('padding', () => {
    it('applies default padding (md)', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('card-padding-none', 'card-padding-sm', 'card-padding-lg');
    });

    it('applies no padding when padding is none', () => {
      render(
        <Card padding="none" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('card-padding-none');
    });

    it('applies small padding', () => {
      render(
        <Card padding="sm" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('card-padding-sm');
    });

    it('applies large padding', () => {
      render(
        <Card padding="lg" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('card-padding-lg');
    });
  });

  describe('className prop', () => {
    it('merges custom className with default classes', () => {
      render(
        <Card className="custom-class" data-testid="card">
          Custom
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('card', 'custom-class');
    });
  });
});

describe('CardHeader', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('renders with card-header class', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId('header')).toHaveClass('card-header');
    });

    it('renders as a div element', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId('header').tagName).toBe('DIV');
    });
  });

  describe('title and description', () => {
    it('renders title when provided', () => {
      render(<CardHeader title="Card Title" />);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders title with heading class', () => {
      render(<CardHeader title="Card Title" />);
      expect(screen.getByText('Card Title')).toHaveClass('card-title');
    });

    it('renders description when provided', () => {
      render(<CardHeader description="Card description text" />);
      expect(screen.getByText('Card description text')).toBeInTheDocument();
    });

    it('renders description with description class', () => {
      render(<CardHeader description="Description" />);
      expect(screen.getByText('Description')).toHaveClass('card-description');
    });

    it('renders both title and description', () => {
      render(<CardHeader title="Title" description="Description" />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders children alongside title and description', () => {
      render(
        <CardHeader title="Title" description="Description">
          <button>Action</button>
        </CardHeader>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('merges custom className with default classes', () => {
      render(
        <CardHeader className="custom-header" data-testid="header">
          Header
        </CardHeader>
      );
      expect(screen.getByTestId('header')).toHaveClass('card-header', 'custom-header');
    });
  });
});

describe('CardBody', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<CardBody>Body content</CardBody>);
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('renders with card-body class', () => {
      render(<CardBody data-testid="body">Body</CardBody>);
      expect(screen.getByTestId('body')).toHaveClass('card-body');
    });

    it('renders as a div element', () => {
      render(<CardBody data-testid="body">Body</CardBody>);
      expect(screen.getByTestId('body').tagName).toBe('DIV');
    });
  });

  describe('className prop', () => {
    it('merges custom className with default classes', () => {
      render(
        <CardBody className="custom-body" data-testid="body">
          Body
        </CardBody>
      );
      expect(screen.getByTestId('body')).toHaveClass('card-body', 'custom-body');
    });
  });
});

describe('CardFooter', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders with card-footer class', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId('footer')).toHaveClass('card-footer');
    });

    it('renders as a div element', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId('footer').tagName).toBe('DIV');
    });
  });

  describe('className prop', () => {
    it('merges custom className with default classes', () => {
      render(
        <CardFooter className="custom-footer" data-testid="footer">
          Footer
        </CardFooter>
      );
      expect(screen.getByTestId('footer')).toHaveClass('card-footer', 'custom-footer');
    });
  });
});

describe('Card composition', () => {
  it('renders Card with all slot components', () => {
    render(
      <Card data-testid="card">
        <CardHeader title="Title" description="Description" />
        <CardBody>Main content</CardBody>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(within(card).getByText('Title')).toBeInTheDocument();
    expect(within(card).getByText('Description')).toBeInTheDocument();
    expect(within(card).getByText('Main content')).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('renders Card with header and body only', () => {
    render(
      <Card data-testid="card">
        <CardHeader title="Header" />
        <CardBody>Body content</CardBody>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(within(card).getByText('Header')).toBeInTheDocument();
    expect(within(card).getByText('Body content')).toBeInTheDocument();
  });

  it('renders Card with body only', () => {
    render(
      <Card data-testid="card">
        <CardBody>Just body</CardBody>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(within(card).getByText('Just body')).toBeInTheDocument();
  });
});
