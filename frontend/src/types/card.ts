export interface TarotCard {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  imageUrl: string;
  keywords: string[];
  arcanaType?: string;
  suit?: string | null;
  number?: number;
  actionGroups?: { title: string; items: string[] }[];
  quickMeaning?: string;
  detailedDescription?: string;
  uprightMeaning?: string;
  reversedMeaning?: string;
  opposingCardSlugs?: string[];
  supportingCardSlugs?: string[];
}

export type ReadingPosition = 'past' | 'present' | 'future';

export function cleanMeaningText(text: string): string {
  if (!text) return '';
  return text.replace(/^Dẫn nhập:\s*/i, 'Ý nghĩa: ');
}
