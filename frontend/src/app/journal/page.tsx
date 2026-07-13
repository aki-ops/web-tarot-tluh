'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDraws, fetchCards, deleteDraw } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Trash2, BookOpen, Calendar, HelpCircle } from 'lucide-react';

interface TarotCard {
  id: string;
  slug: string;
  nameEn: string;
  nameVi: string;
  imageUrl: string;
  uprightMeaning: string;
  reversedMeaning: string;
}

interface SavedDraw {
  id: string;
  type: string;
  intent: string | null;
  cards: { position: string; cardId: string; isReversed: boolean }[];
  createdAt: string;
}

const INTENT_LABELS: Record<string, string> = {
  today: 'Năng Lượng Ngày Mới',
  what_to_do: 'Định Hướng Hành Động',
  what_should_do: 'Tư Duy Chiêm Nghiệm',
};

export default function JournalPage() {
  const [draws, setDraws] = useState<SavedDraw[]>([]);
  const [cardsMap, setCardsMap] = useState<Record<string, TarotCard>>({});
  const [selectedDraw, setSelectedDraw] = useState<SavedDraw | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [drawsData, cardsData] = await Promise.all([fetchDraws(), fetchCards()]);

        // Create card map for quick lookup
        const cmap: Record<string, TarotCard> = {};
        cardsData.forEach((c: TarotCard) => {
          cmap[c.id] = c;
        });

        setCardsMap(cmap);
        setDraws(drawsData);
        if (drawsData.length > 0) {
          setSelectedDraw(drawsData[0]);
        }
      } catch (err) {
        console.error('Error loading journal data:', err);
        setError('Không thể tải nhật ký. Vui lòng kiểm tra lại kết nối của bạn.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lượt trải bài này khỏi nhật ký?')) return;
    try {
      await deleteDraw(id);
      setDraws((prev) => prev.filter((d) => d.id !== id));
      if (selectedDraw?.id === id) {
        const remaining = draws.filter((d) => d.id !== id);
        setSelectedDraw(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete draw:', err);
      alert('Không thể xóa lượt trải bài này.');
    }
  };

  const getPositionLabel = (pos: string) => {
    switch (pos) {
      case 'past':
        return 'Persona (Nhân dạng)';
      case 'present':
        return 'Obstacle (Trở ngại)';
      case 'future':
        return 'Solution (Giải pháp)';
      case '0':
        return 'Lá bài Thứ Nhất';
      case '1':
        return 'Lá bài Thứ Hai';
      case '2':
        return 'Lá bài Thứ Ba';
      case '3':
        return 'Lá bài Thứ Tư';
      case '4':
        return 'Lá bài Thứ Năm';
      default:
        return 'Lá bài';
    }
  };

  const getDrawTitle = (draw: SavedDraw) => {
    if (draw.type === 'three_card') return 'Chiêm Tinh Ba Ngôi';
    if (draw.intent && INTENT_LABELS[draw.intent]) {
      return INTENT_LABELS[draw.intent];
    }
    return draw.intent ? `“${draw.intent}”` : 'Phòng Tarot Đàm thoại';
  };

  const formatMeaning = (meaning: string) => {
    return meaning.replace(/^(Ý nghĩa|Dẫn nhập|Ý nghĩa lá ngược|Ý nghĩa lá xuôi):\s*/i, '');
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5f5f5] text-ink/60">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
          <p className="text-xs tracking-wider">ĐANG TẢI NHẬT KÝ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5f5f5] px-4 text-center">
        <div className="max-w-md">
          <HelpCircle className="mx-auto h-12 w-12 text-ink/20" />
          <h2 className="mt-4 text-lg font-medium text-ink">{error}</h2>
          <Button variant="pill" className="mt-6" onClick={() => window.location.reload()}>
            TẢI LẠI TRANG
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col md:flex-row bg-[#f5f5f5]">
      {/* LEFT SIDEBAR: Readings List - Đúng cấu trúc Moonlight */}
      <div className="w-full border-r border-ink/5 bg-white md:w-[360px] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6 border-b border-ink/5 sticky top-0 bg-white z-10">
          <h1 className="font-serif text-2xl text-ink">Nhật Ký</h1>
          <p className="text-[10px] tracking-widest text-ink/40 uppercase mt-1">
            {draws.length} lượt trải bài đã lưu
          </p>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {draws.length === 0 ? (
            <div className="text-center py-12 text-ink/40 text-xs">
              Chưa có lượt trải bài nào. Hãy thực hiện trải bài để lưu nhật ký.
            </div>
          ) : (
            draws.map((draw) => {
              const dateStr = new Date(draw.createdAt).toLocaleDateString('vi-VN', {
                month: 'short',
                day: 'numeric',
              });
              return (
                <button
                  key={draw.id}
                  onClick={() => setSelectedDraw(draw)}
                  className={`journal-entry-option ${
                    selectedDraw?.id === draw.id
                      ? 'border-ink/35 bg-[#fafafa]'
                      : 'border-ink/10 hover:border-ink/20 hover:bg-[#fcfcfc]'
                  }`}
                >
                  {/* Lá bài nhỏ hiển thị phía trên của box nhật ký */}
                  <div className="journal-entry-cards">
                    {draw.cards.slice(0, 5).map((dc, i) => {
                      const card = cardsMap[dc.cardId];
                      return (
                        <div key={i} className="relative w-8 h-12 overflow-hidden rounded-[2px] border border-ink/10">
                          {card && (
                            <Image
                              src={card.imageUrl}
                              alt={card.nameEn}
                              fill
                              sizes="32px"
                              className="object-cover"
                              style={{ transform: dc.isReversed ? 'rotate(180deg)' : undefined }}
                            />
                          )}
                        </div>
                      );
                    })}
                    {draw.cards.length > 5 && (
                      <span className="journal-entry-more">+{draw.cards.length - 5}</span>
                    )}
                  </div>

                  <div className="journal-entry-info mt-2">
                    <span className="journal-entry-query font-medium text-ink block text-xs truncate max-w-full text-left">
                      {getDrawTitle(draw)}
                    </span>
                    <span className="journal-entry-date text-[10px] text-ink/40 mt-1 block text-left">
                      {dateStr} • {draw.type === 'three_card' ? 'Trải 3 Lá' : draw.type === 'single_card' ? 'Rút 1 Lá' : 'Phòng Đàm Thoại 🐸'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT CONTENT: Selected reading detail view */}
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedDraw ? (
            <motion.div
              key={selectedDraw.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-12 max-w-6xl mx-auto w-full flex-1 flex flex-col"
            >
              {/* Detail Header */}
              <div className="flex items-start justify-between border-b border-ink/10 pb-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-ink/40 text-[10px] tracking-widest uppercase">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(selectedDraw.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl text-ink mt-3">
                    {getDrawTitle(selectedDraw)}
                  </h2>
                  <p className="text-ink/60 text-xs mt-2 italic font-sans">
                    {selectedDraw.type === 'three_card'
                      ? 'Trải bài Ba Ngôi: Persona - Obstacle - Solution'
                      : selectedDraw.type === 'single_card'
                        ? 'Trải bài Thông Điệp Ngày Mới (Rút 1 Lá)'
                        : 'Trải bài Phòng đàm thoại nhóm'}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-ink/30 hover:text-red-500 hover:bg-red-50"
                  onClick={() => handleDelete(selectedDraw.id)}
                  title="Xóa lượt trải bài"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Cards Grid */}
              <div
                className={`grid gap-8 md:gap-12 flex-1 items-start w-full ${
                  selectedDraw.cards.length === 1
                    ? 'grid-cols-1 max-w-xs mx-auto'
                    : selectedDraw.cards.length <= 3
                      ? 'grid-cols-1 md:grid-cols-3'
                      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-5'
                }`}
              >
                {selectedDraw.cards.map((dc, index) => {
                  const card = cardsMap[dc.cardId];
                  if (!card) return null;

                  return (
                    <div key={index} className="flex flex-col items-center text-center">
                      {/* Vị trí lá bài lớn */}
                      <span className="font-serif italic text-sm text-ink/80 mb-4 block">
                        {getPositionLabel(dc.position)}
                      </span>

                      {/* Khung bài vuông vức viền trắng bám sát ảnh mẫu */}
                      <div className="relative w-[130px] h-[220px] shadow-md border-[3px] border-white overflow-hidden bg-cream">
                        <Image
                          src={card.imageUrl}
                          alt={card.nameEn}
                          fill
                          sizes="130px"
                          className="object-fill"
                          style={{ transform: dc.isReversed ? 'rotate(180deg)' : undefined }}
                        />
                      </div>

                      {/* Tên lá bài */}
                      <h3 className="font-serif text-base text-ink mt-5">
                        {card.nameEn}
                      </h3>
                      <p className="text-[10px] tracking-widest text-ink/40 uppercase mt-1">
                        {card.nameVi} {dc.isReversed ? '(Lá Ngược)' : '(Lá Xuôi)'}
                      </p>

                      {/* Ý nghĩa chi tiết */}
                      <div className="mt-4 text-xs leading-relaxed text-ink/70 text-justify border-t border-t-ink/5 pt-4 w-full">
                        <span className="font-medium text-ink block mb-1 text-left">Ý nghĩa giải mã:</span>
                        <p className="text-left">
                          {dc.isReversed
                            ? formatMeaning(card.reversedMeaning || card.uprightMeaning)
                            : formatMeaning(card.uprightMeaning)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-ink/40">
              <BookOpen className="w-12 h-12 stroke-[1px] text-ink/20 mb-4" />
              <p className="text-sm">Chọn một lượt trải bài ở danh sách để xem chi tiết thông điệp.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
