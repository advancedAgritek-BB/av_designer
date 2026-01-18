import { forwardRef, useId, type InputHTMLAttributes } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
}

function getInputClasses(size: InputSize, hasError: boolean, className?: string): string {
  const classes = ['input'];

  if (hasError) {
    classes.push('input-error');
  }

  if (size === 'sm') {
    classes.push('input-sm');
  } else if (size === 'lg') {
    classes.push('input-lg');
  }

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id: providedId,
    label,
    error,
    helperText,
    size = 'md',
    type = 'text',
    required,
    className,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const id = providedId ?? (label ? generatedId : undefined);

  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText && !error ? `${id}-helper` : undefined;
  const describedBy = errorId ?? helperId;

  const inputClasses = getInputClasses(size, !!error, className);

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && (
            <span className="text-status-error ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-status-error text-xs mt-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-text-secondary text-xs mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
});
