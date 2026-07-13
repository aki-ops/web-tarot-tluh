import { fetchCards } from '@/lib/api';
import RoomClient from './RoomClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: PageProps) {
  const { id } = await params;
  let cards = [];
  try {
    cards = await fetchCards();
  } catch (e) {
    console.error('[Room Page] Error fetching cards:', e);
  }

  return <RoomClient roomId={id.toUpperCase()} cards={cards} />;
}
