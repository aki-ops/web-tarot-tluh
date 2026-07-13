import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchCard, fetchCards } from '@/lib/api';
import { cleanMeaningText } from '@/types/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    const cards = await fetchCards();
    return cards.map((card: { slug: string }) => ({ slug: card.slug }));
  } catch {
    return [];
  }
}

async function getCard(slug: string) {
  return fetchCard(slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCard(slug);
  if (!card) notFound();

  const actionGroups = (card.actionGroups ?? []) as { title: string; items: string[] }[];
  const opposingCardSlugs = (card.opposingCardSlugs ?? []) as string[];
  const supportingCardSlugs = (card.supportingCardSlugs ?? []) as string[];

  const getCardTypeDisplay = () => {
    if (card.arcanaType === 'major') return `Lá Ẩn Chính số ${card.number}`;
    const suitNames: Record<string, string> = {
      wands: 'Gậy (Wands)',
      cups: 'Cúp (Cups)',
      swords: 'Kiếm (Swords)',
      pentacles: 'Tiền (Pentacles)',
    };
    return `Lá Ẩn Phụ — Bộ ${suitNames[card.suit || ''] || ''} (Lá ${card.number})`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-12">
      <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col items-center gap-6 lg:sticky lg:top-24 lg:self-start">
          <Link
            href="/thu-vien-la-bai"
            className="flex items-center gap-2 self-start text-sm font-bold tracking-wide text-ink/50 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại thư viện
          </Link>

          <div className="relative overflow-hidden rounded-2xl border border-ink/10 shadow-md"
            style={{ width: 220, height: 377 }}
          >
            <Image
              src={card.imageUrl}
              alt={card.nameVi}
              fill
              className="object-cover"
              sizes="220px"
              priority
            />
          </div>

          <p className="text-center text-xs italic text-ink/40">
            Hình ảnh chuẩn Rider-Waite-Smith 1909
          </p>
        </aside>

        <article className="min-w-0">
          <p className="text-xs md:text-sm tracking-[0.2em] font-semibold text-ink/45 uppercase">{getCardTypeDisplay()}</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl text-ink font-normal leading-tight">{card.nameVi}</h1>
          <p className="mt-1 text-base italic text-ink/60">{card.nameEn}</p>

          {card.keywords?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {card.keywords.map((kw: string) => (
                <Badge key={kw} variant="outline" className="text-xs py-1 px-3">
                  {kw}
                </Badge>
              ))}
            </div>
          )}

          <section className="mt-8">
            <h2 className="mb-3 text-sm font-bold tracking-[0.2em] text-ink/55 uppercase">
              Ý nghĩa sơ lược
            </h2>
            <p className="font-serif text-xl italic leading-relaxed text-ink/80">
              &ldquo;{card.quickMeaning}&rdquo;
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-sm font-bold tracking-[0.2em] text-ink/55 uppercase">
              Mô tả chi tiết
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-ink/75">{card.detailedDescription}</p>
          </section>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink/8 bg-sky-primary/10 p-5">
              <h3 className="mb-3 text-sm font-bold tracking-[0.15em] text-ink/50 uppercase">
                Giải nghĩa xuôi
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-ink/75">
                {cleanMeaningText(card.uprightMeaning ?? '')}
              </p>
            </div>
            <div className="rounded-2xl border border-ink/8 bg-blush/15 p-5">
              <h3 className="mb-3 text-sm font-bold tracking-[0.15em] text-ink/50 uppercase">
                Giải nghĩa ngược
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-ink/75">
                {cleanMeaningText(card.reversedMeaning ?? '')}
              </p>
            </div>
          </div>

          {actionGroups.length > 1 && (
            <section className="mt-8">
              <h2 className="mb-4 text-sm font-bold tracking-[0.2em] text-ink/55 uppercase">
                Trong hành động
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {actionGroups.slice(1).map((grp, i) => (
                  <div key={i} className="rounded-2xl border border-ink/8 bg-cream/50 p-5">
                    <p className="mb-2 text-sm md:text-base font-bold text-ink">{grp.title}</p>
                    <ul className="list-disc space-y-1 pl-4 text-sm md:text-base text-ink/70">
                      {grp.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {opposingCardSlugs.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs tracking-[0.15em] text-ink/45 uppercase">
                  Lá bài đối lập
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opposingCardSlugs.map((s, i) => (
                    <Link
                      key={i}
                      href={`/thu-vien-la-bai/${s}`}
                      className="rounded-full border border-ink/10 bg-cream/60 px-3 py-1 text-xs text-ink/70 transition-colors hover:border-ink/20 hover:text-ink"
                    >
                      {s.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {supportingCardSlugs.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs tracking-[0.15em] text-ink/45 uppercase">
                  Lá bài hỗ trợ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {supportingCardSlugs.map((s, i) => (
                    <Link
                      key={i}
                      href={`/thu-vien-la-bai/${s}`}
                      className="rounded-full border border-ink/10 bg-cream/60 px-3 py-1 text-xs text-ink/70 transition-colors hover:border-ink/20 hover:text-ink"
                    >
                      {s.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
