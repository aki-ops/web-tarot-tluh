'use client';

import { cn } from '@/lib/utils';

interface GuidancePillProps {
  message: string;
  className?: string;
}

export function GuidancePill({ message, className }: GuidancePillProps) {
  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <div
        className="h-0 w-0 border-x-[6px] border-b-[6px] border-x-transparent border-b-ink"
        aria-hidden
      />
      <div className="rounded-full bg-ink px-10 py-3 text-center text-sm md:text-base font-semibold text-cream shadow-xl tracking-[0.05em]">
        {message}
      </div>
    </div>
  );
}
