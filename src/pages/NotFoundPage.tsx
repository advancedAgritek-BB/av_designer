/**
 * Not Found Page (404)
 *
 * Displayed when no route matches
 */
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <main
      role="main"
      data-testid="not-found-page"
      className="flex flex-col items-center justify-center h-full space-y-6"
    >
      <div className="text-6xl font-bold text-text-tertiary">404</div>
      <h1 className="text-2xl font-semibold text-text-primary">Page Not Found</h1>
      <p className="text-text-secondary text-center max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Go to Home</Button>
      </Link>
    </main>
  );
}
