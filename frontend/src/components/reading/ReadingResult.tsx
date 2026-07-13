'use client';

import { cleanMeaningText, type ReadingPosition, type TarotCard } from '@/types/card';
import { cn } from '@/lib/utils';

const POSITION_LABELS: Record<ReadingPosition, string> = {
  past: 'Quá Khứ',
  present: 'Hiện Tại',
  future: 'Tương Lai',
};

interface ReadingResultProps {
  drawn: Record<ReadingPosition, TarotCard | null>;
  reversed: Record<ReadingPosition, boolean>;
  className?: string;
}

export function ReadingResult({ drawn, reversed, className }: ReadingResultProps) {
  const positions: ReadingPosition[] = ['past', 'present', 'future'];

  return (
    <div
      className={cn(
        'w-full max-w-5xl rounded-2xl border border-ink/10 bg-cream/80 p-8 backdrop-blur-sm shadow-sm',
        className
      )}
    >
      <div className="grid gap-8 md:grid-cols-3 md:gap-4 md:divide-x md:divide-ink/10">
        {positions.map((pos) => {
          const card = drawn[pos];
          if (!card) return null;
          const isRev = reversed[pos];
          return (
            <div key={pos} className="px-3 text-center md:px-6">
              <p className="mb-3 text-xs tracking-[0.3em] text-ink/45 uppercase">
                {POSITION_LABELS[pos]}
              </p>
              <p className="font-serif text-lg md:text-xl text-ink font-semibold">
                {card.nameVi}
                <span className="ml-1.5 text-xs font-normal text-ink/50">
                  {isRev ? '(Ngược)' : '(Xuôi)'}
                </span>
              </p>
              <p className="mt-3 text-left text-sm leading-relaxed text-ink/80 md:text-center">
                {cleanMeaningText(isRev ? card.reversedMeaning ?? '' : card.uprightMeaning ?? '')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
