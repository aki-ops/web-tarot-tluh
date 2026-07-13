'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DndContext,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  rectIntersection,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { saveDraw, fetchCards } from '@/lib/api';
import { cleanMeaningText, type ReadingPosition, type TarotCard } from '@/types/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CardSlot } from '@/components/reading/CardSlot';
import { CardBack } from '@/components/reading/CardBack';
import { DraggableFanCard } from '@/components/reading/CardFan';
import { ReadingResult } from '@/components/reading/ReadingResult';

const FAN_SIZE = 22;

type Phase = 'idle' | 'mixing' | 'fanout' | 'revealed';

// Thuật toán va chạm lai ghép: ưu tiên diện tích đè lên nhiều nhất (rectIntersection),
// nếu không đè lên ô nào thì dùng khoảng cách gần nhất (closestCenter) để làm mốc rơi.
const customCollisionDetection = (args: any) => {
  const rectCollisions = rectIntersection(args);
  if (rectCollisions.length > 0) {
    return rectCollisions;
  }
  return closestCenter(args);
};

function DroppableSlot({
  position,
  ...props
}: React.ComponentProps<typeof CardSlot> & { position: ReadingPosition }) {
  const { setNodeRef, isOver } = useDroppable({ id: `zone-${position}` });
  return <CardSlot position={position} droppableRef={setNodeRef} isOver={isOver} {...props} />;
}

function getGuidanceMessage(
  phase: Phase,
  drawn: Record<ReadingPosition, TarotCard | null>,
  allDrawn: boolean
): string {
  if (phase === 'idle') return 'Hãy tập trung tâm trí vào câu hỏi của bạn...';
  if (phase === 'mixing') return 'Lá bài đang kết nối với năng lượng của bạn...';
  if (phase === 'revealed') return 'Nhấn vào các lá bài để xem chi tiết ý nghĩa';

  if (!drawn.past) return 'Lá bài nào đại diện cho bản thân bạn lúc này? (Persona)';
  if (!drawn.present) return 'Điều gì đang cản trở hoặc thử thách bạn? (Obstacle)';
  if (!drawn.future) return 'Chìa khóa nào sẽ giúp bạn vượt qua vấn đề? (Solution)';
  return 'Nhấn "Hé Lộ Thông Điệp" ở bên dưới để khám phá kết quả';
}

interface ThreeCardReadingProps {
  cards: TarotCard[];
}

export default function ThreeCardReading({ cards }: ThreeCardReadingProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [localCards, setLocalCards] = useState<TarotCard[]>(cards);
  const [fanCards, setFanCards] = useState<TarotCard[]>([]);

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

  const [drawn, setDrawn] = useState<Record<ReadingPosition, TarotCard | null>>({
    past: null,
    present: null,
    future: null,
  });
  const [reversed, setReversed] = useState<Record<ReadingPosition, boolean>>({
    past: false,
    present: false,
    future: false,
  });
  const [revealed, setRevealed] = useState<Record<ReadingPosition, boolean>>({
    past: false,
    present: false,
    future: false,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [detailCard, setDetailCard] = useState<{
    card: TarotCard;
    position: ReadingPosition;
  } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const mixingLayers = useMemo(() => Array.from({ length: 12 }), []);

  const shuffleDeck = useCallback(() => {
    return [...localCards].sort(() => Math.random() - 0.5);
  }, [localCards]);

  useEffect(() => {
    if (localCards.length > 0 && fanCards.length === 0 && phase === 'idle') {
      setFanCards(shuffleDeck().slice(0, FAN_SIZE));
    }
  }, [localCards, fanCards.length, phase, shuffleDeck]);

  const allDrawn = Boolean(drawn.past && drawn.present && drawn.future);
  const activeSlot: ReadingPosition | null = !drawn.past
    ? 'past'
    : !drawn.present
      ? 'present'
      : !drawn.future
        ? 'future'
        : null;

  const startReading = () => {
    setPhase('mixing');
    setDrawn({ past: null, present: null, future: null });
    setReversed({ past: false, present: false, future: false });
    setRevealed({ past: false, present: false, future: false });
    setSaveStatus('idle');
  };

  const stopShuffling = () => {
    setFanCards(shuffleDeck().slice(0, FAN_SIZE));
    setPhase('fanout');
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || phase !== 'fanout') return;

    const card = active.data.current?.card as TarotCard;
    const position = String(over.id).replace('zone-', '') as ReadingPosition;
    if (!card || !['past', 'present', 'future'].includes(position)) return;
    if (drawn[position]) return;
    if (Object.values(drawn).some((c) => c?.id === card.id)) return;

    setDrawn((p) => ({ ...p, [position]: card }));
    setReversed((p) => ({ ...p, [position]: Math.random() > 0.5 }));
  };

  const revealAll = useCallback(async () => {
    const isAllDrawn = Boolean(drawn.past && drawn.present && drawn.future);
    if (!isAllDrawn) return;
    setRevealed({ past: true, present: true, future: true });
    setPhase('revealed');
    setSaveStatus('saving');
    try {
      await saveDraw({
        type: 'three_card',
        cards: (['past', 'present', 'future'] as ReadingPosition[]).map((pos) => ({
          position: pos,
          cardId: drawn[pos]!.id,
          isReversed: reversed[pos],
        })),
      });
      setSaveStatus('saved');
    } catch (e) {
      console.error('Failed to save draw:', e);
      setSaveStatus('error');
    }
  }, [drawn, reversed]);

  // Tự động kích hoạt revealAll khi cả 3 lá bài đều được bốc và đều được lật ngửa
  useEffect(() => {
    const isAllDrawn = Boolean(drawn.past && drawn.present && drawn.future);
    const isAllRevealed = Boolean(revealed.past && revealed.present && revealed.future);
    if (isAllDrawn && isAllRevealed && phase === 'fanout') {
      revealAll();
    }
  }, [drawn, revealed, phase, revealAll]);

  const resetReading = () => {
    setDrawn({ past: null, present: null, future: null });
    setReversed({ past: false, present: false, future: false });
    setRevealed({ past: false, present: false, future: false });
    setFanCards(shuffleDeck().slice(0, FAN_SIZE));
    setPhase('idle');
    setSaveStatus('idle');
  };

  const handleFlip = (position: ReadingPosition) => {
    setRevealed((p) => ({ ...p, [position]: true }));
  };

  const fanVisible = fanCards.filter(
    (c) => !Object.values(drawn).some((d) => d?.id === c.id)
  );

  const phaseTitles: Record<Phase, { title: string; subtitle: string }> = {
    idle: {
      title: 'Chiêm Tinh Ba Ngôi',
      subtitle: 'Nhắm mắt tĩnh tâm, tập trung vào câu hỏi của bạn và chạm vào bộ bài để bắt đầu xào bài.',
    },
    mixing: {
      title: 'Trộn Bài Thần Bí',
      subtitle: 'Hãy cảm nhận dòng năng lượng tuôn trào, chạm vào bộ bài một lần nữa để dừng xào và xòe bài.',
    },
    fanout: {
      title: 'Lựa Chọn Định Mệnh',
      subtitle: 'Kéo hoặc chạm 3 lá bài bạn cảm thấy kết nối nhất vào các vị trí phía trên.',
    },
    revealed: {
      title: 'Thông Điệp Đã Hé Lộ',
      subtitle: 'Hé mở tấm màn bí ẩn. Nhấn vào từng lá bài để đón nhận chi tiết thông điệp.',
    },
  };

  const { title, subtitle } = phaseTitles[phase];

  return (
    <div
      className={`relative flex w-full flex-col items-center px-4 z-10 gap-2 md:gap-3 lg:gap-4 ${
        phase === 'revealed'
          ? 'min-h-[calc(100dvh-4rem)] pb-20 pt-4 justify-start'
          : 'min-h-[calc(100dvh-4rem)] pb-4 pt-4 justify-center'
      }`}
    >
      {/* Background textures */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: 0.08, zIndex: -1 }}>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="spiral" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#111111" strokeWidth="0.8" strokeDasharray="4 8" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#111111" strokeWidth="0.6" strokeDasharray="3 9" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="#111111" strokeWidth="0.4" strokeDasharray="2 10" />
              <circle cx="100" cy="100" r="20" fill="none" stroke="#111111" strokeWidth="0.3" strokeDasharray="2 8" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="#111111" strokeWidth="0.3" strokeOpacity="0.5" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="#111111" strokeWidth="0.3" strokeOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#spiral)" />
        </svg>
      </div>

      {/* Header tối giản đúng ảnh mẫu với chữ lớn và sang trọng */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center shrink-0 mb-1"
      >
        <h1 className="font-sans text-3xl tracking-[0.45em] font-bold text-ink uppercase md:text-4xl lg:text-5xl">TAROT</h1>
        <p className="mt-1 text-[10px] tracking-[0.4em] text-ink/40 font-semibold uppercase">REVEAL YOUR PATH</p>
        <h2 className="font-serif text-2xl text-ink mt-3 font-normal tracking-wide md:text-3xl">{title}</h2>
        
        {(phase === 'idle' || phase === 'revealed') && (
          <>
            <p className="text-xs md:text-sm text-ink/75 mt-1.5 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="w-8 h-[1px] bg-ink/20" />
              <div className="text-xs text-ink/40">✦</div>
              <div className="w-8 h-[1px] bg-ink/20" />
            </div>
          </>
        )}
      </motion.div>

      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Drop zones */}
        <div className="flex w-full max-w-[1440px] flex-wrap items-start justify-center gap-6 sm:flex-nowrap sm:gap-14 md:gap-20 px-6 md:px-12 z-10">
          {(['past', 'present', 'future'] as ReadingPosition[]).map((pos) => (
            <DroppableSlot
              key={pos}
              position={pos}
              card={drawn[pos]}
              isReversed={reversed[pos]}
              isRevealed={revealed[pos]}
              isActive={phase === 'fanout' && activeSlot === pos}
              onFlip={() => handleFlip(pos)}
              onReveal={() => drawn[pos] && setDetailCard({ card: drawn[pos]!, position: pos })}
            />
          ))}
        </div>

        {/* Khối Tooltip Chỉ dẫn và Nút Hành động kết hợp giúp tiết kiệm chiều cao */}
        <div className="flex flex-col items-center gap-2 z-20 w-full mt-1 shrink-0">
          {/* Dải Tooltip Đen */}
          <div className="flex justify-center h-8 items-center">
            <motion.div
              key={getGuidanceMessage(phase, drawn, allDrawn)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full bg-black px-6 py-1.5 text-center text-xs tracking-[0.08em] font-medium text-white shadow-md font-sans"
            >
              {getGuidanceMessage(phase, drawn, allDrawn)}
            </motion.div>
          </div>

          {/* Nút bấm hành động */}
          <div className="flex justify-center h-10 items-center gap-4">
            {phase === 'fanout' && allDrawn && (
              <Button variant="pill" onClick={revealAll}>
                ✦ HÉ LỘ THÔNG ĐIỆP
              </Button>
            )}
            {phase === 'fanout' && !allDrawn && (
              <Button
                variant="outline"
                className="rounded-full px-6 py-2 text-xs tracking-wider border-ink/20 hover:bg-ink/5"
                onClick={resetReading}
              >
                HỦY / TRẢI LẠI
              </Button>
            )}
            {phase === 'revealed' && (
              <div className="flex flex-col items-center gap-1.5">
                <Button variant="pill" onClick={resetReading}>
                  TRẢI BÀI MỚI
                </Button>
                {saveStatus === 'saving' && (
                  <span className="text-[10px] tracking-wider text-ink/40 animate-pulse">Đang lưu vào nhật ký...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-[10px] tracking-wider text-green-600 font-medium">✓ Đã lưu vào nhật ký</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-[10px] tracking-wider text-red-500 font-medium">⚠ Lỗi lưu nhật ký</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Shuffling & Fan Area với Baseline và Hoạt ảnh xáo 3D */}
        <div className="fan-container shrink-0">
          <div className="baseline-line" />

          {phase === 'idle' && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer hover:scale-105 transition-transform"
              style={{ width: 'var(--card-w)', height: 'var(--card-h)' }}
              onClick={startReading}
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
            </div>
          )}

          {phase === 'mixing' && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer"
              style={{ width: 'var(--card-w)', height: 'var(--card-h)', perspective: '800px' }}
              onClick={stopShuffling}
            >
              {mixingLayers.map((_, i) => (
                <div
                  key={i}
                  className={`absolute bottom-0 left-0 h-[var(--card-h)] w-[var(--card-w)] pointer-events-none ${i % 2 === 0 ? 'anim-shuffle-left' : 'anim-shuffle-right'}`}
                  style={{
                    transform: `translateY(-${i * 1.5}px)`,
                    zIndex: 20 - i,
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <CardBack />
                </div>
              ))}
            </div>
          )}

          {phase === 'fanout' && fanVisible.map((card, i) => {
            const isPlaced = Object.values(drawn).some((d) => d?.id === card.id);
            return (
              <DraggableFanCard
                key={card.id}
                card={card}
                index={i}
                total={fanVisible.length}
                isHidden={isPlaced}
                isDisabled={allDrawn || isPlaced}
                onClick={() => {
                  if (activeSlot && !isPlaced && !allDrawn) {
                    setDrawn((p) => ({ ...p, [activeSlot]: card }));
                    setReversed((p) => ({ ...p, [activeSlot]: Math.random() > 0.5 }));
                  }
                }}
              />
            );
          })}
        </div>
      </DndContext>

      {phase === 'revealed' && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 w-full max-w-5xl px-4 z-10 flex justify-center"
        >
          <ReadingResult drawn={drawn} reversed={reversed} />
        </motion.div>
      )}

      <Dialog open={!!detailCard} onOpenChange={(open) => !open && setDetailCard(null)}>
        <DialogContent>
          {detailCard && (
            <>
              <DialogHeader>
                <DialogTitle>{detailCard.card.nameVi}</DialogTitle>
                <DialogDescription>
                  {detailCard.card.nameEn}{' '}
                  {reversed[detailCard.position] ? '(Ngược)' : '(Xuôi)'}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-6 sm:flex-row">
                <div
                  className="relative mx-auto shrink-0 overflow-hidden rounded-none border-[3px] border-white shadow-md"
                  style={{ width: 160, height: 272 }}
                >
                  <Image
                    src={detailCard.card.imageUrl}
                    alt={detailCard.card.nameVi}
                    fill
                    className="object-cover"
                    style={{
                      transform: reversed[detailCard.position] ? 'rotate(180deg)' : undefined,
                    }}
                    sizes="160px"
                  />
                </div>
                <div className="flex-1">
                  {detailCard.card.keywords?.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {detailCard.card.keywords.map((kw) => (
                        <Badge key={kw} variant="outline">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {detailCard.card.quickMeaning && (
                    <p className="mb-4 rounded-xl bg-blush/20 p-4 text-sm italic text-ink/80">
                      &ldquo;{detailCard.card.quickMeaning}&rdquo;
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-ink/75">
                    {cleanMeaningText(
                      reversed[detailCard.position]
                        ? detailCard.card.reversedMeaning ?? ''
                        : detailCard.card.uprightMeaning ?? ''
                    )}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
