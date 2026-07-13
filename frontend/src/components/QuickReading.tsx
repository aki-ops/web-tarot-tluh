'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveDraw, fetchCards } from '@/lib/api';
import { cleanMeaningText, type TarotCard } from '@/types/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardBack } from '@/components/reading/CardBack';
import { CardFlip } from '@/components/reading/CardFlip';
import { GuidancePill } from '@/components/reading/GuidancePill';

type Intent = 'today' | 'what_to_do' | 'what_should_do';

const INTENT_LABELS: Record<Intent, string> = {
  today: 'Năng Lượng Ngày Mới',
  what_to_do: 'Định Hướng Hành Động',
  what_should_do: 'Tư Duy Chiêm Nghiệm',
};

interface QuickReadingProps {
  cards: TarotCard[];
}

export default function QuickReading({ cards }: QuickReadingProps) {
  const [intent, setIntent] = useState<Intent>('today');
  const [phase, setPhase] = useState<'idle' | 'mixing' | 'drawn'>('idle');
  const [localCards, setLocalCards] = useState<TarotCard[]>(cards);

  useEffect(() => {
    if (localCards.length === 0) {
      fetchCards()
        .then((data) => {
          if (data && data.length > 0) {
            setLocalCards(data);
          }
        })
        .catch((err) => console.error('Failed to fetch cards client-side:', err));
    }
  }, [localCards.length]);

  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const mixingLayers = Array.from({ length: 12 });

  const startShuffling = () => {
    setPhase('mixing');
    setDrawnCard(null);
    setIsRevealed(false);
    setSaveStatus('idle');
  };

  const stopShufflingAndDraw = async () => {
    if (localCards.length === 0) return;

    const card = localCards[Math.floor(Math.random() * localCards.length)];
    const cardReversed = Math.random() > 0.5;

    setDrawnCard(card);
    setIsReversed(cardReversed);
    setPhase('drawn');

    // Tự động lưu nhật ký ngầm
    setSaveStatus('saving');
    try {
      await saveDraw({
        type: 'single_card',
        intent,
        cards: [{ position: 'single', cardId: card.id, isReversed: cardReversed }],
      });
      setSaveStatus('saved');
    } catch (e) {
      console.error('Lỗi khi lưu lịch sử trải bài:', e);
      setSaveStatus('error');
    }
  };

  const resetReading = () => {
    setPhase('idle');
    setDrawnCard(null);
    setIsRevealed(false);
    setSaveStatus('idle');
  };

  const guidance = phase === 'mixing'
    ? 'Nhắm mắt tĩnh tâm... Chạm bộ bài lần nữa để dừng và rút bài.'
    : drawnCard
      ? 'Chạm vào lá bài để hé lộ lời khuyên chiêm nghiệm.'
      : 'Chọn năng lượng chiêm tinh và chạm vào bộ bài để bắt đầu.';

  return (
    <div
      className={`relative flex w-full flex-col items-center px-4 z-10 gap-8 md:gap-12 lg:gap-14 ${
        isRevealed && drawnCard
          ? 'min-h-[calc(100dvh-4rem)] pb-32 pt-24 justify-start'
          : 'min-h-[calc(100dvh-4rem)] pb-12 pt-24 justify-center'
      }`}
    >
      <div className="text-center shrink-0 mb-2">
        <h1 className="font-serif text-3xl text-ink md:text-4xl lg:text-5xl font-normal tracking-wide">Thông Điệp Ngày Mới</h1>
        <p className="mt-2.5 text-sm md:text-base text-ink/75 max-w-xl mx-auto leading-relaxed">
          Chọn năng lượng chiêm tinh dưới đây và để biểu tượng dẫn lối cho bạn
        </p>

        <Tabs
          value={intent}
          onValueChange={(v) => phase !== 'mixing' && setIntent(v as Intent)}
          className="mt-4"
        >
          <TabsList>
            {(Object.keys(INTENT_LABELS) as Intent[]).map((type) => (
              <TabsTrigger key={type} value={type} disabled={phase === 'mixing'}>
                {INTENT_LABELS[type]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="relative flex h-[300px] w-full max-w-sm items-center justify-center shrink-0">
        <AnimatePresence mode="wait">
          {phase === 'mixing' ? (
            <motion.div
              key="shuffling"
              className="relative cursor-pointer"
              style={{ width: 'var(--card-w)', height: 'var(--card-h)', perspective: '800px' }}
              onClick={stopShufflingAndDraw}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {mixingLayers.map((_, i) => (
                <div
                  key={i}
                  className={`absolute bottom-0 left-0 h-[var(--card-h)] w-[var(--card-w)] pointer-events-none ${
                    i % 2 === 0 ? 'anim-shuffle-left' : 'anim-shuffle-right'
                  }`}
                  style={{
                    transform: `translateY(-${i * 1.5}px)`,
                    zIndex: 20 - i,
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <CardBack />
                </div>
              ))}
            </motion.div>
          ) : phase === 'drawn' && drawnCard ? (
            <motion.div
              key="drawn"
              initial={{ y: -60, rotate: 8, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.35 }}
            >
              <CardFlip
                imageUrl={drawnCard.imageUrl}
                alt={drawnCard.nameVi}
                isReversed={isReversed}
                isFlipped={isRevealed}
                onClick={() => setIsRevealed(!isRevealed)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative cursor-pointer flex flex-col items-center gap-2 hover:scale-105 transition-transform"
              onClick={startShuffling}
              style={{ width: 'var(--card-w)', height: 'var(--card-h)' }}
            >
              {mixingLayers.map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 left-0 h-[var(--card-h)] w-[var(--card-w)]"
                  style={{ transform: `translateY(-${i * 1.5}px)`, zIndex: 20 - i }}
                >
                  <CardBack />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-4 z-20 w-full shrink-0">
        <GuidancePill message={guidance} />

        <AnimatePresence>
          {isRevealed && drawnCard && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 w-full max-w-lg rounded-2xl border border-ink/10 bg-cream/80 p-6 text-center backdrop-blur-sm"
            >
              <h3 className="font-serif text-2xl text-ink">{drawnCard.nameVi}</h3>
              <p className="mt-1 text-xs tracking-widest text-ink/50 uppercase">
                {drawnCard.nameEn} {isReversed ? '(Ngược)' : '(Xuôi)'}
              </p>

              {drawnCard.keywords && drawnCard.keywords.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {drawnCard.keywords.map((kw) => (
                    <Badge key={kw} variant="outline">
                      {kw}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-5 rounded-xl bg-white/50 p-5 text-left">
                <p className="mb-2 text-xs font-medium tracking-wide text-ink/50 uppercase">
                  Thông điệp cho &ldquo;{INTENT_LABELS[intent]}&rdquo;
                </p>
                <p className="text-sm leading-relaxed text-ink/75">
                  {cleanMeaningText(
                    isReversed ? drawnCard.reversedMeaning ?? '' : drawnCard.uprightMeaning ?? ''
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-2 flex flex-col items-center gap-1.5">
          {phase === 'drawn' && (
            <Button variant="pill" onClick={resetReading}>
              Rút Bản Tin Khác 🔮
            </Button>
          )}
          {saveStatus === 'saving' && (
            <span className="text-[10px] tracking-wider text-ink/40 animate-pulse">Đang ghi nhận...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-[10px] tracking-wider text-green-600 font-medium">✓ Đã ghi nhận vào Nhật Ký</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-[10px] tracking-wider text-red-500 font-medium">⚠ Lỗi lưu nhật ký</span>
          )}
        </div>
      </div>
    </div>
  );
}
