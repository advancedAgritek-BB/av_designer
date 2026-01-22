/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary class component.
 *
 * Must be a class component as error boundaries require
 * getDerivedStateFromError and componentDidCatch lifecycle methods.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Uncaught error in React tree', { error, errorInfo });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * Default fallback UI displayed when an error is caught.
 *
 * Shows error details in development mode only.
 */
function DefaultErrorFallback({ error, onRetry }: DefaultErrorFallbackProps) {
  return (
    <div className="error-fallback">
      <div className="error-fallback-content">
        <h2>Something went wrong</h2>
        <p>We're sorry, but something unexpected happened.</p>
        {import.meta.env.DEV && error && (
          <pre className="error-details">{error.message}</pre>
        )}
        <div className="error-actions">
          <button onClick={onRetry} className="btn btn-primary">
            Try Again
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
