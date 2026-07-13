import CardLibrary from '@/components/CardLibrary';
import { fetchCards } from '@/lib/api';

export default async function Page() {
  let cards = [];
  try {
    cards = await fetchCards();
  } catch (e) {
    console.error('Error fetching cards:', e);
  }

  return <CardLibrary cards={cards} />;
}
