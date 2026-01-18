import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

function Spinner() {
  return (
    <svg
      data-testid="button-spinner"
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function getButtonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string
): string {
  const baseClasses = ['btn'];

  // Variant classes
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };
  baseClasses.push(variantClasses[variant]);

  // Size classes (md is default, no class needed)
  if (size === 'sm') {
    baseClasses.push('btn-sm');
  } else if (size === 'lg') {
    baseClasses.push('btn-lg');
  }

  // Custom classes
  if (className) {
    baseClasses.push(className);
  }

  return baseClasses.join(' ');
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    className,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const buttonClasses = getButtonClasses(variant, size, className);

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      className={buttonClasses}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});
