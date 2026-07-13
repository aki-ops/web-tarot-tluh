'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CardBack } from './CardBack';

interface CardFlipProps {
  imageUrl: string;
  alt: string;
  isReversed?: boolean;
  isFlipped?: boolean;
  className?: string;
  onClick?: () => void;
  flipDelay?: string;
}

export function CardFlip({
  imageUrl,
  alt,
  isReversed = false,
  isFlipped = false,
  className,
  onClick,
  flipDelay = '0s',
}: CardFlipProps) {
  return (
    <div
      className={cn('perspective-1000', onClick && 'cursor-pointer', className)}
      style={{ width: 'var(--card-w)', height: 'var(--card-h)' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      <div
        className={cn('card-flip relative h-full w-full', isFlipped && 'flipped')}
        style={{ transitionDelay: flipDelay }}
      >
        <div className="card-face absolute inset-0 overflow-hidden">
          <CardBack />
        </div>
        <div className="card-back-face absolute inset-0 overflow-hidden">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-fill"
            style={{ transform: isReversed ? 'rotate(180deg)' : undefined }}
            sizes="120px"
          />
        </div>
      </div>
    </div>
  );
}
