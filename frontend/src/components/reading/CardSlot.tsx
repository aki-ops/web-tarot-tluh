'use client';

import { cn } from '@/lib/utils';
import type { ReadingPosition } from '@/types/card';
import { CardFlip } from './CardFlip';
import type { TarotCard } from '@/types/card';

const SLOT_CONFIG = {
  past: {
    label: "Persona",
    tilt: "rotateX(20deg) scale(0.95)",
  },
  present: {
    label: "Obstacle",
    tilt: "rotateX(20deg) scale(0.95)",
  },
  future: {
    label: "Solution",
    tilt: "rotateX(20deg) scale(0.95)",
  },
};

interface CardSlotProps {
  position: ReadingPosition;
  card: TarotCard | null;
  isReversed?: boolean;
  isRevealed?: boolean;
  isOver?: boolean;
  isActive?: boolean;
  droppableRef?: (node: HTMLElement | null) => void;
  onFlip?: () => void;
  onReveal?: () => void;
}

export function CardSlot({
  position,
  card,
  isReversed = false,
  isRevealed = false,
  isOver = false,
  isActive = false,
  droppableRef,
  onFlip,
  onReveal,
}: CardSlotProps) {
  const config = SLOT_CONFIG[position];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tablet Zone - Kích thước lớn, phẳng chìm 3D nghiêng back */}
      <div
        ref={droppableRef}
        className={cn(
          'relative flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-300',
          isOver && 'shadow-lg scale-[1.02]'
        )}
        style={{
          width: 'clamp(100px, 15vw, 160px)',
          height: 'clamp(170px, 25vw, 272px)',
          background: 'rgba(242, 242, 242, 0.65)',
          boxShadow: isOver
            ? 'inset 0 4px 20px rgba(0,0,0,0.1), inset 0 -2px 8px rgba(255,255,255,0.8), 0 0 15px rgba(0,0,0,0.05)'
            : 'inset 0 4px 20px rgba(0,0,0,0.06), inset 0 -2px 8px rgba(255,255,255,0.8)',
          border: '1.2px solid rgba(0, 0, 0, 0.15)',
          transform: `perspective(1000px) ${config.tilt}`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Inset border ring - Chỉ hiển thị khi chưa có bài */}
        {!card && (
          <div
            className="absolute inset-3 rounded-xl pointer-events-none"
            style={{
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05), inset 0 -1px 3px rgba(255,255,255,0.6)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          />
        )}

        {!card ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <span className="text-3xl text-ink/40">
              {isActive ? '✦' : '○'}
            </span>
            <span className="text-xs md:text-sm lg:text-base tracking-[0.18em] text-ink/50 font-sans font-bold text-center px-3">
              {isActive ? 'THẢ LÁ BÀI VÀO' : 'CHỜ KẾT NỐI'}
            </span>
          </div>
        ) : (
          <CardFlip
            imageUrl={card.imageUrl}
            alt={card.nameVi}
            isReversed={isReversed}
            isFlipped={isRevealed}
            onClick={isRevealed ? onReveal : onFlip}
            className="!w-[88%] !h-[90%] z-10"
          />
        )}
      </div>

      {/* Label dưới bệ đá: Nghiêng, rất lớn và sang trọng */}
      <div className="text-center mt-2">
        <p className="font-serif text-3xl md:text-4xl italic text-ink/90 font-medium tracking-wider">
          {config.label}
        </p>
      </div>
    </div>
  );
}
