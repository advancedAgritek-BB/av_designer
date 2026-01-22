/**
 * Feature Error Boundary Component
 *
 * Specialized error boundary for individual features/sections.
 * Provides a lighter-weight error UI suitable for nested components.
 */
import { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface FeatureErrorBoundaryProps {
  feature: string;
  children: ReactNode;
}

/**
 * Wraps a feature section with error handling.
 *
 * Displays a compact error message when the wrapped feature crashes,
 * preventing the entire application from failing.
 */
export function FeatureErrorBoundary({ feature, children }: FeatureErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="feature-error">
          <h3>Unable to load {feature}</h3>
          <p>Please try refreshing the page.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
