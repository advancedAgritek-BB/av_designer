/**
 * Drawings Page Wrapper
 *
 * Wraps the DrawingsPage component and provides roomId from URL params
 */
import { useParams } from 'react-router-dom';
import { DrawingsPage } from '@/features/drawings';

export function DrawingsPageWrapper() {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return (
      <div
        role="main"
        data-testid="drawings-page"
        className="flex items-center justify-center h-full text-text-secondary"
      >
        No room selected. Please select a room to view drawings.
      </div>
    );
  }

  // DrawingsPage component provides its own main element and testid
  return <DrawingsPage roomId={roomId} />;
}
