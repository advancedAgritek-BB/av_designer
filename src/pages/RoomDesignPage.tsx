/**
 * Room Design Page
 *
 * Room builder page wrapping the RoomBuilder component
 * Uses roomId from URL params
 */
import { useParams } from 'react-router-dom';
import { RoomBuilder } from '@/features/room-builder';

export function RoomDesignPage() {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return (
      <main
        role="main"
        data-testid="room-design-page"
        className="flex items-center justify-center h-full text-text-secondary"
      >
        No room selected. Please select a room from the projects page.
      </main>
    );
  }

  return (
    <main role="main" data-testid="room-design-page">
      <RoomBuilder roomId={roomId} />
    </main>
  );
}
