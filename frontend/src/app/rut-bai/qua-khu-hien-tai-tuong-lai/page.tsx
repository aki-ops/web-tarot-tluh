import ThreeCardReading from '@/components/ThreeCardReading';
import { fetchCards } from '@/lib/api';

export default async function Page() {
  let cards = [];
  try {
    cards = await fetchCards();
    console.log('[SSR] Successfully fetched cards. Total count:', cards.length);
  } catch (e) {
    console.error('[SSR] Error fetching cards:', e);
  }

  return <ThreeCardReading cards={cards} />;
}
