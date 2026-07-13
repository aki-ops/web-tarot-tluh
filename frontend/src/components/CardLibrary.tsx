'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import type { TarotCard } from '@/types/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getVietnameseName } from '@/lib/card-names';

type FilterType = 'ALL' | 'MAJOR' | 'WANDS' | 'CUPS' | 'SWORDS' | 'PENTACLES';

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Ẩn Chính', value: 'MAJOR' },
  { label: 'Gậy', value: 'WANDS' },
  { label: 'Cúp', value: 'CUPS' },
  { label: 'Kiếm', value: 'SWORDS' },
  { label: 'Tiền', value: 'PENTACLES' },
];

interface CardLibraryProps {
  cards: TarotCard[];
}

export default function CardLibrary({ cards }: CardLibraryProps) {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = useMemo(() => {
    let result = cards;

    if (filter === 'MAJOR') {
      result = result.filter((c) => c.arcanaType === 'major');
    } else if (filter !== 'ALL') {
      result = result.filter(
        (c) => c.arcanaType === 'minor' && c.suit?.toUpperCase() === filter
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => {
        const names = getVietnameseName(c.slug, c.nameVi, c.nameEn);
        return (
          names.vi.toLowerCase().includes(q) ||
          names.en.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [cards, filter, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-12">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-ink font-normal">Cổ Thư Tarot</h1>
        <p className="mt-3 text-sm md:text-base text-ink/75 max-w-xl mx-auto">
          Tra cứu ý nghĩa đầy đủ của bộ bài Rider-Waite-Smith huyền thoại
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-ink/10 bg-cream/50 p-6 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList className="h-auto flex-wrap gap-1">
            {FILTER_OPTIONS.map((opt) => (
              <TabsTrigger key={opt.value} value={opt.value} className="text-xs lg:text-sm font-bold">
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <Input
            placeholder="Tìm lá bài..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm h-10"
          />
        </div>
      </div>

      <p className="mb-6 text-right text-xs md:text-sm tracking-wide text-ink/50 font-medium">
        {filteredCards.length} / {cards.length} lá bài
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filteredCards.map((card) => {
          const name = getVietnameseName(card.slug, card.nameVi, card.nameEn);
          return (
            <Link
              key={card.id}
              href={`/thu-vien-la-bai/${card.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-ink/8 bg-cream/40 p-3.5 transition-all hover:-translate-y-1 hover:border-ink/15 hover:bg-cream/80 hover:shadow-sm"
            >
              <div className="relative aspect-[120/205] overflow-hidden rounded-xl border border-ink/8">
                <Image
                  src={card.imageUrl}
                  alt={name.vi}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 200px"
                />
              </div>
              <div className="text-center mt-1">
                <p className="text-sm font-bold text-ink">{name.vi}</p>
                {name.vi.toLowerCase() !== name.en.toLowerCase() && (
                  <p className="text-xs italic text-ink/55 mt-0.5">{name.en}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <p className="py-20 text-center font-serif italic text-ink/50">
          Không tìm thấy lá bài nào phù hợp.
        </p>
      )}
    </div>
  );
}
