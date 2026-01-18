/**
 * Quotes Page
 *
 * Quotes management page wrapping the QuotePage component
 * Uses roomId from URL params
 */
import { useParams } from 'react-router-dom';
import {
  QuotePage,
  createDefaultQuote,
  createDefaultQuoteTotals,
} from '@/features/quoting';

export function QuotesPage() {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return (
      <main
        role="main"
        data-testid="quotes-page"
        className="flex items-center justify-center h-full text-text-secondary"
      >
        No room selected. Please select a room to view quotes.
      </main>
    );
  }

  // Create a default quote for the room
  // In production, this would fetch from the database
  const quote = {
    ...createDefaultQuote('proj-1', roomId),
    totals: createDefaultQuoteTotals(),
  };

  return (
    <main role="main" data-testid="quotes-page">
      <QuotePage quote={quote} />
    </main>
  );
}
