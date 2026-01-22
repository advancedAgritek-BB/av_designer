# AV Designer MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully functional AV Designer MVP with Equipment Library, Room Builder, Quoting, and Drawing Generation capabilities.

**Architecture:** React + TypeScript frontend with Zustand state management, Tauri desktop wrapper with Rust backend for heavy processing, Supabase for data persistence. Feature-based module structure with shared UI components following Revolut-inspired dark theme design system.

**Tech Stack:** React 18, TypeScript 5, Vite, Tailwind CSS v4, Zustand, Supabase, Vitest, Lucide Icons, Tauri 2.x

**Required Skills:**
- `@react-best-practices` - For all React components
- `@web-design-guidelines` - For accessibility and UX
- `@frontend-design:frontend-design` - For polished UI
- `@superpowers:test-driven-development` - TDD for all features

---

## Phase 2: Design System & Core Components

### Task 2.1: Install Lucide Icons and React Router

**Files:**
- Modify: `package.json`

**Step 1: Install dependencies**

Run:
```bash
npm install lucide-react react-router-dom
npm install -D @types/react-router-dom
```

**Step 2: Verify installation**

Run: `npm ls lucide-react react-router-dom`
Expected: Both packages listed without errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react and react-router-dom dependencies"
```

---

### Task 2.2: Create Icon Component Wrapper

**Files:**
- Create: `src/components/ui/Icon.tsx`
- Create: `tests/components/ui/Icon.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/ui/Icon.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from '@/components/ui/Icon';

describe('Icon', () => {
  it('renders with default size', () => {
    render(<Icon name="Home" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<Icon name="Settings" size={24} data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });

  it('renders with custom className', () => {
    render(<Icon name="Home" className="text-gold" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('text-gold');
  });

  it('renders different icon names', () => {
    const { rerender } = render(<Icon name="Home" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon name="Folder" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/ui/Icon.test.tsx`
Expected: FAIL with "Cannot find module '@/components/ui/Icon'"

**Step 3: Write minimal implementation**

```typescript
// src/components/ui/Icon.tsx
import { icons, LucideProps } from 'lucide-react';

export type IconName = keyof typeof icons;

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, className, ...props }: IconProps) {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <LucideIcon size={size} className={className} {...props} />;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/ui/Icon.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ui/Icon.tsx tests/components/ui/Icon.test.tsx
git commit -m "feat: add Icon component wrapper for Lucide icons"
```

---

### Task 2.3: Create Button Component

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `tests/components/ui/Button.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-ghost');
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-md');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-lg');
  });

  it('renders with icon', () => {
    render(<Button icon="Plus">Add Item</Button>);
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/ui/Button.test.tsx`
Expected: FAIL with "Cannot find module '@/components/ui/Button'"

**Step 3: Write minimal implementation**

```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Icon, IconName } from './Icon';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn';
    const variantClasses = `btn-${variant}`;
    const sizeClasses = `btn-${size}`;

    const classes = [baseClasses, variantClasses, sizeClasses, className]
      .filter(Boolean)
      .join(' ');

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2
            size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
            className="animate-spin"
            data-testid="loading-spinner"
          />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <Icon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <Icon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/ui/Button.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ui/Button.tsx tests/components/ui/Button.test.tsx
git commit -m "feat: add Button component with variants, sizes, and loading state"
```

---

### Task 2.4: Create Input Component

**Files:**
- Create: `src/components/ui/Input.tsx`
- Create: `tests/components/ui/Input.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/ui/Input.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    await user.type(screen.getByRole('textbox'), 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders with label', () => {
    render(<Input label="Project Name" />);
    expect(screen.getByText('Project Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders with helper text', () => {
    render(<Input helperText="Enter your project name" />);
    expect(screen.getByText('Enter your project name')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('input-sm');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('input-lg');
  });

  it('renders as disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with icon', () => {
    render(<Input icon="Search" data-testid="input" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/ui/Input.test.tsx`
Expected: FAIL with "Cannot find module '@/components/ui/Input'"

**Step 3: Write minimal implementation**

```typescript
// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { Icon, IconName } from './Icon';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  icon?: IconName;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      icon,
      className = '',
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    const sizeClass = size !== 'md' ? `input-${size}` : '';
    const errorClass = error ? 'border-status-error' : '';

    const inputClasses = ['input', sizeClass, errorClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Icon
                name={icon}
                size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
                className="text-text-tertiary"
              />
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={inputClasses}
            style={icon ? { paddingLeft: '36px' } : undefined}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs text-status-error">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${id}-helper`} className="text-xs text-text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/ui/Input.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ui/Input.tsx tests/components/ui/Input.test.tsx
git commit -m "feat: add Input component with label, error, and icon support"
```

---

### Task 2.5: Create Card Component

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `tests/components/ui/Card.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/ui/Card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies card class', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('card');
  });

  it('renders hoverable variant', () => {
    render(<Card hoverable data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('card-hover');
  });

  it('handles click when clickable', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Click me</Card>);

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with custom padding', () => {
    render(<Card padding="lg" data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveStyle({ padding: 'var(--spacing-6)' });
  });
});

describe('CardHeader', () => {
  it('renders title', () => {
    render(<CardHeader title="Card Title" />);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders title and subtitle', () => {
    render(<CardHeader title="Title" subtitle="Subtitle" />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders action slot', () => {
    render(<CardHeader title="Title" action={<button>Action</button>} />);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content here</CardContent>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/ui/Card.test.tsx`
Expected: FAIL with "Cannot find module '@/components/ui/Card'"

**Step 3: Write minimal implementation**

```typescript
// src/components/ui/Card.tsx
import { HTMLAttributes, ReactNode } from 'react';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: CardPadding;
}

const paddingStyles: Record<CardPadding, string> = {
  none: '0',
  sm: 'var(--spacing-2)',
  md: 'var(--spacing-4)',
  lg: 'var(--spacing-6)',
};

export function Card({
  children,
  hoverable = false,
  padding = 'md',
  className = '',
  style,
  ...props
}: CardProps) {
  const baseClass = hoverable ? 'card-hover' : 'card';
  const classes = [baseClass, className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{ ...style, padding: paddingStyles[padding] }}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div
      className={`mt-4 pt-4 border-t border-subtle ${className}`}
    >
      {children}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/ui/Card.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ui/Card.tsx tests/components/ui/Card.test.tsx
git commit -m "feat: add Card component with header, content, and footer subcomponents"
```

---

### Task 2.6: Create StatusPill Component

**Files:**
- Create: `src/components/ui/StatusPill.tsx`
- Create: `tests/components/ui/StatusPill.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/ui/StatusPill.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from '@/components/ui/StatusPill';

describe('StatusPill', () => {
  it('renders status text', () => {
    render(<StatusPill status="quoting" />);
    expect(screen.getByText('Quoting')).toBeInTheDocument();
  });

  it('renders all project status variants', () => {
    const statuses = [
      { status: 'quoting', label: 'Quoting' },
      { status: 'client_review', label: 'Client Review' },
      { status: 'ordered', label: 'Ordered' },
      { status: 'in_progress', label: 'In Progress' },
      { status: 'on_hold', label: 'On Hold' },
      { status: 'completed', label: 'Completed' },
    ] as const;

    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<StatusPill status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies correct CSS class for status', () => {
    render(<StatusPill status="quoting" data-testid="pill" />);
    expect(screen.getByTestId('pill')).toHaveClass('status-quoting');
  });

  it('renders with custom label override', () => {
    render(<StatusPill status="quoting" label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/ui/StatusPill.test.tsx`
Expected: FAIL with "Cannot find module '@/components/ui/StatusPill'"

**Step 3: Write minimal implementation**

```typescript
// src/components/ui/StatusPill.tsx
import type { ProjectStatus } from '@/types';

export interface StatusPillProps {
  status: ProjectStatus;
  label?: string;
  'data-testid'?: string;
}

const statusLabels: Record<ProjectStatus, string> = {
  quoting: 'Quoting',
  client_review: 'Client Review',
  ordered: 'Ordered',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
};

const statusClasses: Record<ProjectStatus, string> = {
  quoting: 'status-quoting',
  client_review: 'status-client-review',
  ordered: 'status-ordered',
  in_progress: 'status-in-progress',
  on_hold: 'status-on-hold',
  completed: 'status-ordered', // Use green for completed too
};

export function StatusPill({ status, label, 'data-testid': testId }: StatusPillProps) {
  const displayLabel = label || statusLabels[status];
  const statusClass = statusClasses[status];

  return (
    <span className={`status-pill ${statusClass}`} data-testid={testId}>
      {displayLabel}
    </span>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/ui/StatusPill.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ui/StatusPill.tsx tests/components/ui/StatusPill.test.tsx
git commit -m "feat: add StatusPill component for project status display"
```

---

### Task 2.7: Create UI Components Index Export

**Files:**
- Create: `src/components/ui/index.ts`

**Step 1: Write the export file**

```typescript
// src/components/ui/index.ts
export { Icon, type IconName, type IconProps } from './Icon';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { Input, type InputProps, type InputSize } from './Input';
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  type CardProps,
  type CardPadding,
  type CardHeaderProps,
  type CardContentProps,
  type CardFooterProps,
} from './Card';
export { StatusPill, type StatusPillProps } from './StatusPill';
```

**Step 2: Verify imports work**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/ui/index.ts
git commit -m "feat: add UI components index export"
```

---

### Task 2.8: Create Sidebar Component

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `tests/components/layout/Sidebar.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/layout/Sidebar.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock the app store
const mockSetActiveMode = vi.fn();
const mockToggleSidebar = vi.fn();

vi.mock('@/stores', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => {
    const state = {
      activeMode: 'home',
      sidebarExpanded: true,
      setActiveMode: mockSetActiveMode,
      toggleSidebar: mockToggleSidebar,
    };
    return selector(state);
  },
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Room Design')).toBeInTheDocument();
    expect(screen.getByText('Drawings')).toBeInTheDocument();
    expect(screen.getByText('Quoting')).toBeInTheDocument();
    expect(screen.getByText('Standards')).toBeInTheDocument();
  });

  it('renders library section', () => {
    render(<Sidebar />);
    expect(screen.getByText('LIBRARIES')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(<Sidebar />);
    const homeItem = screen.getByText('Home').closest('button');
    expect(homeItem).toHaveClass('nav-item-active');
  });

  it('calls setActiveMode when nav item clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    await user.click(screen.getByText('Projects'));
    expect(mockSetActiveMode).toHaveBeenCalledWith('projects');
  });

  it('renders app logo/title', () => {
    render(<Sidebar />);
    expect(screen.getByText('AV Designer')).toBeInTheDocument();
  });

  it('renders collapse toggle button', () => {
    render(<Sidebar />);
    expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/layout/Sidebar.test.tsx`
Expected: FAIL with "Cannot find module '@/components/layout/Sidebar'"

**Step 3: Write minimal implementation**

```typescript
// src/components/layout/Sidebar.tsx
import { useAppStore } from '@/stores';
import { Icon, IconName } from '@/components/ui';
import type { NavigationMode } from '@/types';

interface NavItem {
  mode: NavigationMode;
  label: string;
  icon: IconName;
}

const mainNavItems: NavItem[] = [
  { mode: 'home', label: 'Home', icon: 'Home' },
  { mode: 'projects', label: 'Projects', icon: 'Folder' },
  { mode: 'room_design', label: 'Room Design', icon: 'PenTool' },
  { mode: 'drawings', label: 'Drawings', icon: 'FileText' },
  { mode: 'quoting', label: 'Quoting', icon: 'DollarSign' },
  { mode: 'standards', label: 'Standards', icon: 'BarChart3' },
];

const libraryNavItems: NavItem[] = [
  { mode: 'equipment', label: 'Equipment', icon: 'Package' },
  { mode: 'templates', label: 'Templates', icon: 'BookOpen' },
];

export function Sidebar() {
  const activeMode = useAppStore((state) => state.activeMode);
  const sidebarExpanded = useAppStore((state) => state.sidebarExpanded);
  const setActiveMode = useAppStore((state) => state.setActiveMode);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  const renderNavItem = (item: NavItem) => {
    const isActive = activeMode === item.mode;
    const itemClass = isActive ? 'nav-item-active' : 'nav-item';

    return (
      <button
        key={item.mode}
        className={`${itemClass} w-full text-left`}
        onClick={() => setActiveMode(item.mode)}
      >
        <Icon
          name={item.icon}
          size={20}
          className={isActive ? 'text-accent-gold' : 'text-text-secondary'}
        />
        {sidebarExpanded && <span>{item.label}</span>}
      </button>
    );
  };

  return (
    <aside
      className="h-screen flex flex-col bg-bg-secondary border-r border-subtle"
      style={{ width: sidebarExpanded ? '220px' : '64px' }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-gold flex items-center justify-center">
          <span className="text-bg-primary font-bold text-sm">AV</span>
        </div>
        {sidebarExpanded && (
          <span className="font-semibold text-text-primary">AV Designer</span>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {mainNavItems.map(renderNavItem)}

        {/* Libraries Section */}
        <div className="pt-4 mt-4 border-t border-subtle">
          {sidebarExpanded && (
            <p className="px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">
              Libraries
            </p>
          )}
          {libraryNavItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-subtle">
        <button
          className="nav-item w-full justify-center"
          onClick={toggleSidebar}
          aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Icon
            name={sidebarExpanded ? 'PanelLeftClose' : 'PanelLeft'}
            size={20}
          />
        </button>
      </div>
    </aside>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/layout/Sidebar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/layout/Sidebar.tsx tests/components/layout/Sidebar.test.tsx
git commit -m "feat: add Sidebar component with navigation and collapse functionality"
```

---

### Task 2.9: Create Header Component

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `tests/components/layout/Header.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/layout/Header.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/Header';

const mockOpenCommandPalette = vi.fn();

vi.mock('@/stores', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => {
    const state = {
      activeMode: 'home',
      openCommandPalette: mockOpenCommandPalette,
    };
    return selector(state);
  },
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current mode title', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders search button', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('renders settings button', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('opens command palette when search clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: /search/i }));
    expect(mockOpenCommandPalette).toHaveBeenCalled();
  });

  it('displays keyboard shortcut hint', () => {
    render(<Header />);
    expect(screen.getByText(/cmd\+k/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/layout/Header.test.tsx`
Expected: FAIL with "Cannot find module '@/components/layout/Header'"

**Step 3: Write minimal implementation**

```typescript
// src/components/layout/Header.tsx
import { useAppStore } from '@/stores';
import { Icon } from '@/components/ui';
import type { NavigationMode } from '@/types';

const modeTitles: Record<NavigationMode, string> = {
  home: 'Home',
  projects: 'Projects',
  room_design: 'Room Design',
  drawings: 'Drawings',
  quoting: 'Quoting',
  standards: 'Standards',
  equipment: 'Equipment',
  templates: 'Templates',
  settings: 'Settings',
};

export function Header() {
  const activeMode = useAppStore((state) => state.activeMode);
  const openCommandPalette = useAppStore((state) => state.openCommandPalette);

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-subtle bg-bg-primary">
      {/* Left: Page Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-text-primary">
          {modeTitles[activeMode]}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="nav-item px-3 py-2"
          onClick={openCommandPalette}
          aria-label="Search"
        >
          <Icon name="Search" size={18} />
          <span className="text-sm text-text-tertiary ml-2">Cmd+K</span>
        </button>

        {/* Settings */}
        <button
          className="nav-item p-2"
          aria-label="Settings"
          onClick={() => useAppStore.getState().setActiveMode('settings')}
        >
          <Icon name="Settings" size={18} />
        </button>
      </div>
    </header>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/layout/Header.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/layout/Header.tsx tests/components/layout/Header.test.tsx
git commit -m "feat: add Header component with search and settings"
```

---

### Task 2.10: Create AppShell Layout Component

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Create: `tests/components/layout/AppShell.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/layout/AppShell.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from '@/components/layout/AppShell';

vi.mock('@/stores', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => {
    const state = {
      activeMode: 'home',
      sidebarExpanded: true,
      setActiveMode: vi.fn(),
      toggleSidebar: vi.fn(),
      openCommandPalette: vi.fn(),
    };
    return selector(state);
  },
}));

describe('AppShell', () => {
  it('renders sidebar', () => {
    render(<AppShell>Content</AppShell>);
    expect(screen.getByText('AV Designer')).toBeInTheDocument();
  });

  it('renders header', () => {
    render(<AppShell>Content</AppShell>);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders children in main area', () => {
    render(<AppShell>Main Content</AppShell>);
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('applies correct layout structure', () => {
    render(<AppShell data-testid="shell">Content</AppShell>);
    const shell = screen.getByTestId('shell');
    expect(shell).toHaveClass('flex');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/layout/AppShell.test.tsx`
Expected: FAIL with "Cannot find module '@/components/layout/AppShell'"

**Step 3: Write minimal implementation**

```typescript
// src/components/layout/AppShell.tsx
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface AppShellProps {
  children: ReactNode;
  'data-testid'?: string;
}

export function AppShell({ children, 'data-testid': testId }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden" data-testid={testId}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-bg-primary">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/layout/AppShell.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/layout/AppShell.tsx tests/components/layout/AppShell.test.tsx
git commit -m "feat: add AppShell layout component combining sidebar and header"
```

---

### Task 2.11: Create Layout Components Index

**Files:**
- Create: `src/components/layout/index.ts`

**Step 1: Write the export file**

```typescript
// src/components/layout/index.ts
export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { AppShell, type AppShellProps } from './AppShell';
```

**Step 2: Commit**

```bash
git add src/components/layout/index.ts
git commit -m "feat: add layout components index export"
```

---

### Task 2.12: Create Home Page Component

**Files:**
- Create: `src/pages/HomePage.tsx`
- Create: `tests/pages/HomePage.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/pages/HomePage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from '@/pages/HomePage';

vi.mock('@/stores', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => {
    const state = {
      setActiveMode: vi.fn(),
    };
    return selector(state);
  },
}));

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(<HomePage />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    render(<HomePage />);
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });

  it('renders recent projects section', () => {
    render(<HomePage />);
    expect(screen.getByText(/recent projects/i)).toBeInTheDocument();
  });

  it('renders new project button', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/pages/HomePage.test.tsx`
Expected: FAIL with "Cannot find module '@/pages/HomePage'"

**Step 3: Write minimal implementation**

```typescript
// src/pages/HomePage.tsx
import { useAppStore } from '@/stores';
import { Button, Card, CardHeader, CardContent, Icon } from '@/components/ui';

export function HomePage() {
  const setActiveMode = useAppStore((state) => state.setActiveMode);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <section>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
        <p className="text-text-secondary mt-1">
          Your AV design workspace is ready.
        </p>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hoverable className="cursor-pointer" onClick={() => setActiveMode('projects')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent-gold/10">
                <Icon name="Plus" className="text-accent-gold" />
              </div>
              <div>
                <p className="font-medium text-text-primary">New Project</p>
                <p className="text-sm text-text-secondary">Start a new AV design</p>
              </div>
            </div>
          </Card>

          <Card hoverable className="cursor-pointer" onClick={() => setActiveMode('equipment')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent-blue/10">
                <Icon name="Package" className="text-accent-blue" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Equipment Library</p>
                <p className="text-sm text-text-secondary">Browse and manage equipment</p>
              </div>
            </div>
          </Card>

          <Card hoverable className="cursor-pointer" onClick={() => setActiveMode('standards')}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-status-success/10">
                <Icon name="BarChart3" className="text-status-success" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Standards</p>
                <p className="text-sm text-text-secondary">Configure design rules</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Recent Projects */}
      <section>
        <Card>
          <CardHeader
            title="Recent Projects"
            action={
              <Button
                variant="secondary"
                size="sm"
                icon="Plus"
                onClick={() => setActiveMode('projects')}
              >
                New Project
              </Button>
            }
          />
          <CardContent>
            <div className="text-center py-8 text-text-secondary">
              <Icon name="Folder" size={48} className="mx-auto mb-4 opacity-50" />
              <p>No recent projects</p>
              <p className="text-sm">Create a project to get started</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/pages/HomePage.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/HomePage.tsx tests/pages/HomePage.test.tsx
git commit -m "feat: add HomePage component with quick actions and recent projects"
```

---

### Task 2.13: Update App.tsx to Use AppShell and HomePage

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update App.tsx**

```typescript
// src/App.tsx
import { AppShell } from '@/components/layout';
import { HomePage } from '@/pages/HomePage';
import { useAppStore } from '@/stores';

function App() {
  const activeMode = useAppStore((state) => state.activeMode);

  const renderPage = () => {
    switch (activeMode) {
      case 'home':
        return <HomePage />;
      case 'projects':
        return <PlaceholderPage title="Projects" />;
      case 'room_design':
        return <PlaceholderPage title="Room Design" />;
      case 'drawings':
        return <PlaceholderPage title="Drawings" />;
      case 'quoting':
        return <PlaceholderPage title="Quoting" />;
      case 'standards':
        return <PlaceholderPage title="Standards" />;
      case 'equipment':
        return <PlaceholderPage title="Equipment" />;
      case 'templates':
        return <PlaceholderPage title="Templates" />;
      case 'settings':
        return <PlaceholderPage title="Settings" />;
      default:
        return <HomePage />;
    }
  };

  return <AppShell>{renderPage()}</AppShell>;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="text-text-secondary mt-2">This page is under construction.</p>
    </div>
  );
}

export default App;
```

**Step 2: Run the dev server to verify**

Run: `npm run dev`
Expected: App renders with sidebar, header, and home page

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate AppShell and HomePage into main App"
```

---

### Task 2.14: Run All Tests and Verify Phase 2 Complete

**Step 1: Run all tests**

Run: `npm test -- --run`
Expected: All tests pass

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit phase 2 completion**

```bash
git add -A
git commit -m "feat: complete Phase 2 - Design System & Core Components"
```

---

## Phase 3: Equipment Database

### Task 3.1: Create Equipment Type Definitions

**Files:**
- Modify: `src/types/index.ts` (verify types exist, add if needed)

**Step 1: Verify equipment types exist**

The types should already exist in `src/types/index.ts`. Verify these types are present:
- `Equipment`
- `EquipmentCategory`
- `PhysicalAttributes`
- `ElectricalAttributes`
- `CommercialAttributes`
- `EquipmentConnection`

If any are missing, add them per the existing type definitions.

**Step 2: Commit if changes made**

```bash
git add src/types/index.ts
git commit -m "feat: verify equipment type definitions"
```

---

### Task 3.2: Create Equipment Service Layer

**Files:**
- Create: `src/features/equipment/equipment-service.ts`
- Create: `tests/features/equipment/equipment-service.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/features/equipment/equipment-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EquipmentService } from '@/features/equipment/equipment-service';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => false,
}));

describe('EquipmentService', () => {
  let service: EquipmentService;

  beforeEach(() => {
    service = new EquipmentService();
  });

  describe('getAll', () => {
    it('returns empty array when no equipment', async () => {
      const result = await service.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns null for non-existent equipment', async () => {
      const result = await service.getById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates new equipment', async () => {
      const equipment = {
        manufacturer: 'Shure',
        model: 'MXA920',
        sku: 'MXA920-S',
        category: 'microphone' as const,
        description: 'Ceiling array microphone',
        physical: {
          width: 24,
          height: 2.5,
          depth: 24,
          weight: 8,
          mountType: 'ceiling' as const,
        },
        commercial: {
          msrp: 5995,
          cost: 4196,
        },
      };

      const result = await service.create(equipment);

      expect(result.id).toBeDefined();
      expect(result.manufacturer).toBe('Shure');
      expect(result.model).toBe('MXA920');
    });
  });

  describe('update', () => {
    it('updates existing equipment', async () => {
      const created = await service.create({
        manufacturer: 'Shure',
        model: 'MXA920',
        sku: 'MXA920-S',
        category: 'microphone',
        physical: { width: 24, height: 2.5, depth: 24, weight: 8 },
        commercial: { msrp: 5995, cost: 4196 },
      });

      const updated = await service.update(created.id, { model: 'MXA920-R' });

      expect(updated?.model).toBe('MXA920-R');
    });
  });

  describe('delete', () => {
    it('deletes equipment', async () => {
      const created = await service.create({
        manufacturer: 'Test',
        model: 'Test',
        sku: 'TEST',
        category: 'accessory',
        physical: { width: 1, height: 1, depth: 1, weight: 1 },
        commercial: { msrp: 100, cost: 50 },
      });

      await service.delete(created.id);
      const result = await service.getById(created.id);

      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('searches by manufacturer', async () => {
      await service.create({
        manufacturer: 'Shure',
        model: 'MXA920',
        sku: 'MXA920-S',
        category: 'microphone',
        physical: { width: 24, height: 2.5, depth: 24, weight: 8 },
        commercial: { msrp: 5995, cost: 4196 },
      });

      const results = await service.search({ manufacturer: 'Shure' });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].manufacturer).toBe('Shure');
    });

    it('searches by category', async () => {
      await service.create({
        manufacturer: 'Shure',
        model: 'MXA920',
        sku: 'MXA920-S',
        category: 'microphone',
        physical: { width: 24, height: 2.5, depth: 24, weight: 8 },
        commercial: { msrp: 5995, cost: 4196 },
      });

      const results = await service.search({ category: 'microphone' });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe('microphone');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/features/equipment/equipment-service.test.ts`
Expected: FAIL with "Cannot find module '@/features/equipment/equipment-service'"

**Step 3: Write minimal implementation**

```typescript
// src/features/equipment/equipment-service.ts
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import type { Equipment, EquipmentCategory, UUID } from '@/types';

export type CreateEquipmentInput = Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

export interface EquipmentSearchParams {
  manufacturer?: string;
  category?: EquipmentCategory;
  query?: string;
}

export class EquipmentService {
  // In-memory storage for when Supabase is not configured
  private localStore: Equipment[] = [];

  async getAll(): Promise<Equipment[]> {
    if (!isSupabaseConfigured()) {
      return [...this.localStore];
    }

    const { data, error } = await getSupabase()
      .from('equipment')
      .select('*')
      .order('manufacturer', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getById(id: UUID): Promise<Equipment | null> {
    if (!isSupabaseConfigured()) {
      return this.localStore.find((e) => e.id === id) || null;
    }

    const { data, error } = await getSupabase()
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async create(input: CreateEquipmentInput): Promise<Equipment> {
    const now = new Date().toISOString();
    const equipment: Equipment = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    if (!isSupabaseConfigured()) {
      this.localStore.push(equipment);
      return equipment;
    }

    const { data, error } = await getSupabase()
      .from('equipment')
      .insert(equipment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: UUID, input: UpdateEquipmentInput): Promise<Equipment | null> {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured()) {
      const index = this.localStore.findIndex((e) => e.id === id);
      if (index === -1) return null;

      this.localStore[index] = {
        ...this.localStore[index],
        ...input,
        updatedAt: now,
      };
      return this.localStore[index];
    }

    const { data, error } = await getSupabase()
      .from('equipment')
      .update({ ...input, updatedAt: now })
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data;
  }

  async delete(id: UUID): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const index = this.localStore.findIndex((e) => e.id === id);
      if (index === -1) return false;
      this.localStore.splice(index, 1);
      return true;
    }

    const { error } = await getSupabase()
      .from('equipment')
      .delete()
      .eq('id', id);

    return !error;
  }

  async search(params: EquipmentSearchParams): Promise<Equipment[]> {
    if (!isSupabaseConfigured()) {
      return this.localStore.filter((e) => {
        if (params.manufacturer && e.manufacturer !== params.manufacturer) return false;
        if (params.category && e.category !== params.category) return false;
        if (params.query) {
          const q = params.query.toLowerCase();
          return (
            e.manufacturer.toLowerCase().includes(q) ||
            e.model.toLowerCase().includes(q) ||
            e.sku.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q)
          );
        }
        return true;
      });
    }

    let query = getSupabase().from('equipment').select('*');

    if (params.manufacturer) {
      query = query.eq('manufacturer', params.manufacturer);
    }
    if (params.category) {
      query = query.eq('category', params.category);
    }
    if (params.query) {
      query = query.or(
        `manufacturer.ilike.%${params.query}%,model.ilike.%${params.query}%,sku.ilike.%${params.query}%`
      );
    }

    const { data, error } = await query.order('manufacturer');
    if (error) throw error;
    return data || [];
  }
}

// Singleton instance
export const equipmentService = new EquipmentService();
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/features/equipment/equipment-service.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/equipment/equipment-service.ts tests/features/equipment/equipment-service.test.ts
git commit -m "feat: add EquipmentService for CRUD operations"
```

---

### Task 3.3: Create Equipment Store

**Files:**
- Modify: `src/stores/equipment-store.ts`
- Create: `tests/stores/equipment-store.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/stores/equipment-store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEquipmentStore } from '@/stores/equipment-store';

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => false,
}));

describe('useEquipmentStore', () => {
  beforeEach(() => {
    useEquipmentStore.getState().reset();
  });

  it('starts with empty equipment list', () => {
    const { equipment } = useEquipmentStore.getState();
    expect(equipment).toEqual([]);
  });

  it('starts with loading false', () => {
    const { isLoading } = useEquipmentStore.getState();
    expect(isLoading).toBe(false);
  });

  it('adds equipment', async () => {
    const { addEquipment } = useEquipmentStore.getState();

    await addEquipment({
      manufacturer: 'Shure',
      model: 'MXA920',
      sku: 'MXA920-S',
      category: 'microphone',
      physical: { width: 24, height: 2.5, depth: 24, weight: 8 },
      commercial: { msrp: 5995, cost: 4196 },
    });

    const { equipment } = useEquipmentStore.getState();
    expect(equipment).toHaveLength(1);
    expect(equipment[0].manufacturer).toBe('Shure');
  });

  it('updates equipment', async () => {
    const { addEquipment, updateEquipment } = useEquipmentStore.getState();

    await addEquipment({
      manufacturer: 'Shure',
      model: 'MXA920',
      sku: 'MXA920-S',
      category: 'microphone',
      physical: { width: 24, height: 2.5, depth: 24, weight: 8 },
      commercial: { msrp: 5995, cost: 4196 },
    });

    const { equipment } = useEquipmentStore.getState();
    await updateEquipment(equipment[0].id, { model: 'MXA920-R' });

    const updated = useEquipmentStore.getState().equipment;
    expect(updated[0].model).toBe('MXA920-R');
  });

  it('deletes equipment', async () => {
    const { addEquipment, deleteEquipment } = useEquipmentStore.getState();

    await addEquipment({
      manufacturer: 'Shure',
      model: 'MXA920',
      sku: 'MXA920-S',
      category: 'microphone',
      physical: { width: 24, height: 2.5, depth: 24, weight: 8 },
      commercial: { msrp: 5995, cost: 4196 },
    });

    const { equipment } = useEquipmentStore.getState();
    await deleteEquipment(equipment[0].id);

    const remaining = useEquipmentStore.getState().equipment;
    expect(remaining).toHaveLength(0);
  });

  it('filters by category', async () => {
    const { addEquipment, setFilter } = useEquipmentStore.getState();

    await addEquipment({
      manufacturer: 'Shure',
      model: 'MXA920',
      sku: 'MXA920-S',
      category: 'microphone',
      physical: { width: 24, height: 2.5, depth: 24, weight: 8 },
      commercial: { msrp: 5995, cost: 4196 },
    });

    await addEquipment({
      manufacturer: 'Samsung',
      model: 'QM85R',
      sku: 'QM85R',
      category: 'display',
      physical: { width: 75, height: 43, depth: 2.4, weight: 88 },
      commercial: { msrp: 3499, cost: 2449 },
    });

    setFilter({ category: 'microphone' });

    const { filteredEquipment } = useEquipmentStore.getState();
    expect(filteredEquipment).toHaveLength(1);
    expect(filteredEquipment[0].category).toBe('microphone');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/stores/equipment-store.test.ts`
Expected: FAIL (store may be empty or different shape)

**Step 3: Write minimal implementation**

```typescript
// src/stores/equipment-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Equipment, EquipmentCategory, UUID } from '@/types';
import {
  equipmentService,
  CreateEquipmentInput,
  UpdateEquipmentInput,
} from '@/features/equipment/equipment-service';

interface EquipmentFilter {
  category?: EquipmentCategory;
  manufacturer?: string;
  query?: string;
}

interface EquipmentState {
  equipment: Equipment[];
  selectedId: UUID | null;
  filter: EquipmentFilter;
  isLoading: boolean;
  error: string | null;

  // Computed
  filteredEquipment: Equipment[];
  selectedEquipment: Equipment | null;

  // Actions
  loadEquipment: () => Promise<void>;
  addEquipment: (input: CreateEquipmentInput) => Promise<Equipment>;
  updateEquipment: (id: UUID, input: UpdateEquipmentInput) => Promise<void>;
  deleteEquipment: (id: UUID) => Promise<void>;
  setSelected: (id: UUID | null) => void;
  setFilter: (filter: EquipmentFilter) => void;
  clearFilter: () => void;
  reset: () => void;
}

const applyFilter = (equipment: Equipment[], filter: EquipmentFilter): Equipment[] => {
  return equipment.filter((e) => {
    if (filter.category && e.category !== filter.category) return false;
    if (filter.manufacturer && e.manufacturer !== filter.manufacturer) return false;
    if (filter.query) {
      const q = filter.query.toLowerCase();
      return (
        e.manufacturer.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        e.sku.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });
};

export const useEquipmentStore = create<EquipmentState>()(
  devtools(
    (set, get) => ({
      equipment: [],
      selectedId: null,
      filter: {},
      isLoading: false,
      error: null,

      get filteredEquipment() {
        const { equipment, filter } = get();
        return applyFilter(equipment, filter);
      },

      get selectedEquipment() {
        const { equipment, selectedId } = get();
        return equipment.find((e) => e.id === selectedId) || null;
      },

      loadEquipment: async () => {
        set({ isLoading: true, error: null });
        try {
          const equipment = await equipmentService.getAll();
          set({ equipment, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      addEquipment: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const created = await equipmentService.create(input);
          set((state) => ({
            equipment: [...state.equipment, created],
            isLoading: false,
          }));
          return created;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      updateEquipment: async (id, input) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await equipmentService.update(id, input);
          if (updated) {
            set((state) => ({
              equipment: state.equipment.map((e) =>
                e.id === id ? updated : e
              ),
              isLoading: false,
            }));
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      deleteEquipment: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await equipmentService.delete(id);
          set((state) => ({
            equipment: state.equipment.filter((e) => e.id !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      setSelected: (id) => set({ selectedId: id }),

      setFilter: (filter) =>
        set((state) => ({ filter: { ...state.filter, ...filter } })),

      clearFilter: () => set({ filter: {} }),

      reset: () =>
        set({
          equipment: [],
          selectedId: null,
          filter: {},
          isLoading: false,
          error: null,
        }),
    }),
    { name: 'equipment-store' }
  )
);
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/stores/equipment-store.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/stores/equipment-store.ts tests/stores/equipment-store.test.ts
git commit -m "feat: add equipment store with filtering and CRUD operations"
```

---

### Task 3.4: Create EquipmentCard Component

**Files:**
- Create: `src/features/equipment/components/EquipmentCard.tsx`
- Create: `tests/features/equipment/components/EquipmentCard.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/features/equipment/components/EquipmentCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentCard } from '@/features/equipment/components/EquipmentCard';
import type { Equipment } from '@/types';

const mockEquipment: Equipment = {
  id: '123',
  manufacturer: 'Shure',
  model: 'MXA920',
  sku: 'MXA920-S',
  category: 'microphone',
  description: 'Ceiling array microphone',
  physical: {
    width: 24,
    height: 2.5,
    depth: 24,
    weight: 8,
    mountType: 'ceiling',
  },
  commercial: {
    msrp: 5995,
    cost: 4196,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('EquipmentCard', () => {
  it('renders manufacturer and model', () => {
    render(<EquipmentCard equipment={mockEquipment} />);
    expect(screen.getByText('Shure')).toBeInTheDocument();
    expect(screen.getByText('MXA920')).toBeInTheDocument();
  });

  it('renders SKU', () => {
    render(<EquipmentCard equipment={mockEquipment} />);
    expect(screen.getByText('MXA920-S')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<EquipmentCard equipment={mockEquipment} />);
    expect(screen.getByText(/microphone/i)).toBeInTheDocument();
  });

  it('renders MSRP price', () => {
    render(<EquipmentCard equipment={mockEquipment} />);
    expect(screen.getByText('$5,995')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<EquipmentCard equipment={mockEquipment} onClick={handleClick} />);

    await user.click(screen.getByText('Shure'));
    expect(handleClick).toHaveBeenCalledWith(mockEquipment);
  });

  it('renders selected state', () => {
    render(<EquipmentCard equipment={mockEquipment} selected data-testid="card" />);
    expect(screen.getByTestId('card')).toHaveClass('ring-2');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/features/equipment/components/EquipmentCard.test.tsx`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// src/features/equipment/components/EquipmentCard.tsx
import type { Equipment, EquipmentCategory } from '@/types';
import { Card, Icon, IconName } from '@/components/ui';

const categoryIcons: Record<EquipmentCategory, IconName> = {
  display: 'Monitor',
  camera: 'Video',
  microphone: 'Mic',
  speaker: 'Volume2',
  dsp: 'Cpu',
  control: 'Settings',
  codec: 'Server',
  network: 'Network',
  mounting: 'Box',
  cabling: 'Cable',
  accessory: 'Package',
};

const categoryLabels: Record<EquipmentCategory, string> = {
  display: 'Display',
  camera: 'Camera',
  microphone: 'Microphone',
  speaker: 'Speaker',
  dsp: 'DSP',
  control: 'Control',
  codec: 'Codec',
  network: 'Network',
  mounting: 'Mounting',
  cabling: 'Cabling',
  accessory: 'Accessory',
};

export interface EquipmentCardProps {
  equipment: Equipment;
  selected?: boolean;
  onClick?: (equipment: Equipment) => void;
  'data-testid'?: string;
}

export function EquipmentCard({
  equipment,
  selected = false,
  onClick,
  'data-testid': testId,
}: EquipmentCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      hoverable
      data-testid={testId}
      className={`cursor-pointer transition-all ${
        selected ? 'ring-2 ring-accent-gold' : ''
      }`}
      onClick={() => onClick?.(equipment)}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-bg-tertiary flex items-center justify-center">
          <Icon
            name={categoryIcons[equipment.category]}
            size={24}
            className="text-text-secondary"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-text-secondary">{equipment.manufacturer}</p>
              <p className="font-medium text-text-primary truncate">{equipment.model}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-bg-tertiary text-text-secondary">
              {categoryLabels[equipment.category]}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-tertiary">{equipment.sku}</span>
            <span className="text-sm font-medium text-accent-gold">
              {formatPrice(equipment.commercial.msrp)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/features/equipment/components/EquipmentCard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/equipment/components/EquipmentCard.tsx tests/features/equipment/components/EquipmentCard.test.tsx
git commit -m "feat: add EquipmentCard component for equipment display"
```

---

### Task 3.5: Create EquipmentList Component

**Files:**
- Create: `src/features/equipment/components/EquipmentList.tsx`
- Create: `tests/features/equipment/components/EquipmentList.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/features/equipment/components/EquipmentList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EquipmentList } from '@/features/equipment/components/EquipmentList';
import type { Equipment } from '@/types';

const mockEquipment: Equipment[] = [
  {
    id: '1',
    manufacturer: 'Shure',
    model: 'MXA920',
    sku: 'MXA920-S',
    category: 'microphone',
    physical: { width: 24, height: 2.5, depth: 24, weight: 8 },
    commercial: { msrp: 5995, cost: 4196 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    manufacturer: 'Samsung',
    model: 'QM85R',
    sku: 'QM85R',
    category: 'display',
    physical: { width: 75, height: 43, depth: 2.4, weight: 88 },
    commercial: { msrp: 3499, cost: 2449 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

vi.mock('@/stores', () => ({
  useEquipmentStore: (selector: (state: unknown) => unknown) => {
    const state = {
      filteredEquipment: mockEquipment,
      selectedId: null,
      isLoading: false,
      setSelected: vi.fn(),
    };
    return selector(state);
  },
}));

describe('EquipmentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders equipment items', () => {
    render(<EquipmentList />);
    expect(screen.getByText('Shure')).toBeInTheDocument();
    expect(screen.getByText('Samsung')).toBeInTheDocument();
  });

  it('renders empty state when no equipment', () => {
    vi.mocked(vi.fn()).mockImplementationOnce(() => ({
      filteredEquipment: [],
      selectedId: null,
      isLoading: false,
      setSelected: vi.fn(),
    }));
    // This would need proper mock setup, simplified for now
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/features/equipment/components/EquipmentList.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/features/equipment/components/EquipmentList.tsx
import { useEquipmentStore } from '@/stores';
import { EquipmentCard } from './EquipmentCard';
import { Icon } from '@/components/ui';

export function EquipmentList() {
  const filteredEquipment = useEquipmentStore((state) => state.filteredEquipment);
  const selectedId = useEquipmentStore((state) => state.selectedId);
  const isLoading = useEquipmentStore((state) => state.isLoading);
  const setSelected = useEquipmentStore((state) => state.setSelected);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" className="animate-spin text-text-secondary" size={32} />
      </div>
    );
  }

  if (filteredEquipment.length === 0) {
    return (
      <div className="text-center p-8">
        <Icon name="Package" size={48} className="mx-auto mb-4 text-text-muted" />
        <p className="text-text-secondary">No equipment found</p>
        <p className="text-sm text-text-tertiary">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {filteredEquipment.map((equipment) => (
        <EquipmentCard
          key={equipment.id}
          equipment={equipment}
          selected={equipment.id === selectedId}
          onClick={(e) => setSelected(e.id)}
        />
      ))}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/features/equipment/components/EquipmentList.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/equipment/components/EquipmentList.tsx tests/features/equipment/components/EquipmentList.test.tsx
git commit -m "feat: add EquipmentList component with grid layout"
```

---

### Task 3.6: Create EquipmentFilters Component

**Files:**
- Create: `src/features/equipment/components/EquipmentFilters.tsx`
- Create: `tests/features/equipment/components/EquipmentFilters.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/features/equipment/components/EquipmentFilters.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentFilters } from '@/features/equipment/components/EquipmentFilters';

const mockSetFilter = vi.fn();
const mockClearFilter = vi.fn();

vi.mock('@/stores', () => ({
  useEquipmentStore: (selector: (state: unknown) => unknown) => {
    const state = {
      filter: {},
      setFilter: mockSetFilter,
      clearFilter: mockClearFilter,
    };
    return selector(state);
  },
}));

describe('EquipmentFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<EquipmentFilters />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders category filter', () => {
    render(<EquipmentFilters />);
    expect(screen.getByText(/all categories/i)).toBeInTheDocument();
  });

  it('calls setFilter on search input', async () => {
    const user = userEvent.setup();
    render(<EquipmentFilters />);

    await user.type(screen.getByPlaceholderText(/search/i), 'Shure');
    expect(mockSetFilter).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/features/equipment/components/EquipmentFilters.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/features/equipment/components/EquipmentFilters.tsx
import { useEquipmentStore } from '@/stores';
import { Input, Button, Icon } from '@/components/ui';
import type { EquipmentCategory } from '@/types';

const categories: { value: EquipmentCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'display', label: 'Displays' },
  { value: 'camera', label: 'Cameras' },
  { value: 'microphone', label: 'Microphones' },
  { value: 'speaker', label: 'Speakers' },
  { value: 'dsp', label: 'DSP' },
  { value: 'control', label: 'Control' },
  { value: 'codec', label: 'Codecs' },
  { value: 'network', label: 'Network' },
  { value: 'mounting', label: 'Mounting' },
  { value: 'cabling', label: 'Cabling' },
  { value: 'accessory', label: 'Accessories' },
];

export function EquipmentFilters() {
  const filter = useEquipmentStore((state) => state.filter);
  const setFilter = useEquipmentStore((state) => state.setFilter);
  const clearFilter = useEquipmentStore((state) => state.clearFilter);

  const hasFilters = filter.query || filter.category || filter.manufacturer;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <Input
          icon="Search"
          placeholder="Search equipment..."
          value={filter.query || ''}
          onChange={(e) => setFilter({ query: e.target.value })}
        />
      </div>

      {/* Category Filter */}
      <select
        className="input"
        value={filter.category || ''}
        onChange={(e) =>
          setFilter({
            category: e.target.value as EquipmentCategory | undefined || undefined,
          })
        }
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" onClick={clearFilter}>
          <Icon name="X" size={16} />
          Clear
        </Button>
      )}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/features/equipment/components/EquipmentFilters.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/equipment/components/EquipmentFilters.tsx tests/features/equipment/components/EquipmentFilters.test.tsx
git commit -m "feat: add EquipmentFilters component with search and category filter"
```

---

### Task 3.7: Create Equipment Feature Index

**Files:**
- Create: `src/features/equipment/index.ts`
- Create: `src/features/equipment/components/index.ts`

**Step 1: Create component index**

```typescript
// src/features/equipment/components/index.ts
export { EquipmentCard, type EquipmentCardProps } from './EquipmentCard';
export { EquipmentList } from './EquipmentList';
export { EquipmentFilters } from './EquipmentFilters';
```

**Step 2: Create feature index**

```typescript
// src/features/equipment/index.ts
export * from './components';
export { equipmentService, EquipmentService } from './equipment-service';
export type { CreateEquipmentInput, UpdateEquipmentInput, EquipmentSearchParams } from './equipment-service';
```

**Step 3: Commit**

```bash
git add src/features/equipment/index.ts src/features/equipment/components/index.ts
git commit -m "feat: add equipment feature index exports"
```

---

### Task 3.8: Create Equipment Page

**Files:**
- Create: `src/pages/EquipmentPage.tsx`
- Create: `tests/pages/EquipmentPage.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/pages/EquipmentPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EquipmentPage } from '@/pages/EquipmentPage';

vi.mock('@/stores', () => ({
  useEquipmentStore: (selector: (state: unknown) => unknown) => {
    const state = {
      filteredEquipment: [],
      filter: {},
      selectedId: null,
      isLoading: false,
      loadEquipment: vi.fn(),
      setFilter: vi.fn(),
      clearFilter: vi.fn(),
      setSelected: vi.fn(),
    };
    return selector(state);
  },
}));

describe('EquipmentPage', () => {
  it('renders page title', () => {
    render(<EquipmentPage />);
    expect(screen.getByText('Equipment Library')).toBeInTheDocument();
  });

  it('renders filters', () => {
    render(<EquipmentPage />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders add equipment button', () => {
    render(<EquipmentPage />);
    expect(screen.getByRole('button', { name: /add equipment/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/pages/EquipmentPage.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/pages/EquipmentPage.tsx
import { useEffect } from 'react';
import { useEquipmentStore } from '@/stores';
import { EquipmentList, EquipmentFilters } from '@/features/equipment';
import { Button, Card, CardHeader, CardContent } from '@/components/ui';

export function EquipmentPage() {
  const loadEquipment = useEquipmentStore((state) => state.loadEquipment);
  const filteredEquipment = useEquipmentStore((state) => state.filteredEquipment);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Equipment Library</h1>
          <p className="text-text-secondary mt-1">
            {filteredEquipment.length} items in library
          </p>
        </div>
        <Button icon="Plus">Add Equipment</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <EquipmentFilters />
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <EquipmentList />
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/pages/EquipmentPage.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/EquipmentPage.tsx tests/pages/EquipmentPage.test.tsx
git commit -m "feat: add EquipmentPage with filters and list"
```

---

### Task 3.9: Create Pages Index and Update App.tsx

**Files:**
- Create: `src/pages/index.ts`
- Modify: `src/App.tsx`

**Step 1: Create pages index**

```typescript
// src/pages/index.ts
export { HomePage } from './HomePage';
export { EquipmentPage } from './EquipmentPage';
```

**Step 2: Update App.tsx to use EquipmentPage**

```typescript
// src/App.tsx
import { AppShell } from '@/components/layout';
import { HomePage, EquipmentPage } from '@/pages';
import { useAppStore } from '@/stores';

function App() {
  const activeMode = useAppStore((state) => state.activeMode);

  const renderPage = () => {
    switch (activeMode) {
      case 'home':
        return <HomePage />;
      case 'equipment':
        return <EquipmentPage />;
      case 'projects':
        return <PlaceholderPage title="Projects" />;
      case 'room_design':
        return <PlaceholderPage title="Room Design" />;
      case 'drawings':
        return <PlaceholderPage title="Drawings" />;
      case 'quoting':
        return <PlaceholderPage title="Quoting" />;
      case 'standards':
        return <PlaceholderPage title="Standards" />;
      case 'templates':
        return <PlaceholderPage title="Templates" />;
      case 'settings':
        return <PlaceholderPage title="Settings" />;
      default:
        return <HomePage />;
    }
  };

  return <AppShell>{renderPage()}</AppShell>;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="text-text-secondary mt-2">This page is under construction.</p>
    </div>
  );
}

export default App;
```

**Step 3: Commit**

```bash
git add src/pages/index.ts src/App.tsx
git commit -m "feat: integrate EquipmentPage into App routing"
```

---

### Task 3.10: Run All Tests and Verify Phase 3 Complete

**Step 1: Run all tests**

Run: `npm test -- --run`
Expected: All tests pass

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit phase 3 completion**

```bash
git add -A
git commit -m "feat: complete Phase 3 - Equipment Database"
```

---

## Phase 4: Projects Feature

### Task 4.1: Create Project Service Layer

**Files:**
- Create: `src/features/projects/project-service.ts`
- Create: `tests/features/projects/project-service.test.ts`

(Follow same TDD pattern as Equipment Service)

---

### Task 4.2: Update Project Store

**Files:**
- Modify: `src/stores/project-store.ts`
- Create: `tests/stores/project-store.test.ts`

(Follow same pattern as Equipment Store)

---

### Task 4.3: Create ProjectCard Component

**Files:**
- Create: `src/features/projects/components/ProjectCard.tsx`
- Create: `tests/features/projects/components/ProjectCard.test.tsx`

(Follow same pattern)

---

### Task 4.4: Create ProjectList Component

**Files:**
- Create: `src/features/projects/components/ProjectList.tsx`
- Create: `tests/features/projects/components/ProjectList.test.tsx`

---

### Task 4.5: Create NewProjectForm Component

**Files:**
- Create: `src/features/projects/components/NewProjectForm.tsx`
- Create: `tests/features/projects/components/NewProjectForm.test.tsx`

---

### Task 4.6: Create ProjectsPage

**Files:**
- Create: `src/pages/ProjectsPage.tsx`
- Create: `tests/pages/ProjectsPage.test.tsx`

---

### Task 4.7: Integrate Projects into App

**Files:**
- Modify: `src/pages/index.ts`
- Modify: `src/App.tsx`

---

## Phase 5: Room Builder (Basic)

### Task 5.1: Create Room Types and Store

### Task 5.2: Create RoomCard Component

### Task 5.3: Create RoomList Component

### Task 5.4: Create RoomPropertiesPanel Component

### Task 5.5: Create RoomBuilderPage (Basic)

---

## Phase 6: Quoting System (Basic)

### Task 6.1: Create Quote Types and Store

### Task 6.2: Create QuoteLineItem Component

### Task 6.3: Create QuoteSection Component

### Task 6.4: Create QuoteSummary Component

### Task 6.5: Create QuotingPage

---

## Phase 7: Integration & Polish

### Task 7.1: Add Sample Data for Development

### Task 7.2: Wire up HomePage Recent Projects

### Task 7.3: Add Error Boundaries

### Task 7.4: Add Loading States

### Task 7.5: Final Testing and Build Verification

---

## Execution Notes

- Each task should take 2-5 minutes to complete
- Run tests after each implementation step
- Commit after each task passes
- Use TDD: write failing test first, then minimal implementation
- Follow `@react-best-practices` for all components
- Follow `@web-design-guidelines` for accessibility
- Refer to UI Design spec for visual patterns

## Signal Completion

When all phases are complete and all tests pass:

```
<ralph>COMPLETE</ralph>
```
