import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from 'react';

type CardVariant = 'default' | 'elevated';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  selected?: boolean;
  children: ReactNode;
}

function getCardClasses(
  variant: CardVariant,
  padding: CardPadding,
  hoverable: boolean,
  selected: boolean,
  isInteractive: boolean,
  className?: string
): string {
  const classes: string[] = [];

  // Variant classes
  if (variant === 'elevated') {
    classes.push('card-elevated');
  } else {
    classes.push('card');
  }

  // Padding classes (md is default, no class needed)
  if (padding === 'none') {
    classes.push('card-padding-none');
  } else if (padding === 'sm') {
    classes.push('card-padding-sm');
  } else if (padding === 'lg') {
    classes.push('card-padding-lg');
  }

  // State classes
  if (hoverable) {
    classes.push('card-hoverable');
  }

  if (selected) {
    classes.push('card-selected');
  }

  if (isInteractive) {
    classes.push('card-interactive');
  }

  // Custom classes
  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'default',
    padding = 'md',
    hoverable = false,
    selected = false,
    className,
    children,
    onClick,
    ...props
  },
  ref
) {
  const isInteractive = !!onClick;
  const cardClasses = getCardClasses(
    variant,
    padding,
    hoverable,
    selected,
    isInteractive,
    className
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
    }
    props.onKeyDown?.(event);
  };

  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : props.onKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-selected={selected ? 'true' : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function CardHeader({
  title,
  description,
  children,
  className,
  ...props
}: CardHeaderProps) {
  const headerClasses = ['card-header', className].filter(Boolean).join(' ');

  return (
    <div className={headerClasses} {...props}>
      {(title || description) && (
        <div className="card-header-content">
          {title && <h3 className="card-title">{title}</h3>}
          {description && <p className="card-description">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
  const bodyClasses = ['card-body', className].filter(Boolean).join(' ');

  return (
    <div className={bodyClasses} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  const footerClasses = ['card-footer', className].filter(Boolean).join(' ');

  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
}
