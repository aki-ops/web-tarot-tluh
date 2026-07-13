import QuickReading from '@/components/QuickReading';
import { fetchCards } from '@/lib/api';

export default async function Page() {
  let cards = [];
  try {
    cards = await fetchCards();
    console.log('[SSR - QUICK] Successfully fetched cards. Total count:', cards.length);
  } catch (e) {
    console.error('[SSR - QUICK] Error fetching cards:', e);
  }

  return <QuickReading cards={cards} />;
}
