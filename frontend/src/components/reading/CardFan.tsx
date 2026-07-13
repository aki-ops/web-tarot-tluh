'use client';

import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { TarotCard } from '@/types/card';
import { CardBack } from './CardBack';

interface DraggableFanCardProps {
  card: TarotCard;
  index: number;
  total: number;
  isHidden: boolean;
  isDisabled: boolean;
  onClick?: () => void;
}

export function DraggableFanCard({
  card,
  index,
  total,
  isHidden,
  isDisabled,
  onClick,
}: DraggableFanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${card.id}`,
    disabled: isDisabled,
    data: { card },
  });

  const [spread, setSpread] = useState(280);
  const [dip, setDip] = useState(35);

  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth >= 1200) {
        setSpread(580); // Tổng sải quạt hài hoà 1160px
        setDip(65);
      } else if (window.innerWidth >= 768) {
        setSpread(420); // 840px cho tablet
        setDip(50);
      } else {
        setSpread(280); // 560px cho mobile
        setDip(35);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const mid = (total - 1) / 2;
  const offset = index - mid;
  const normalizedOffset = mid === 0 ? 0 : offset / mid;

  // Tính toán dịch chuyển: Dàn ngang đều và tạo độ trũng sâu Parabol ở hai biên
  const translateX = normalizedOffset * spread;
  const translateY = Math.pow(normalizedOffset, 2) * dip;

  const style = {
    position: 'absolute' as const,
    top: '10px',
    left: '50%',
    marginLeft: 'calc(-1 * var(--card-w) / 2)',
    transformOrigin: 'bottom center',
    zIndex: isDragging ? 1000 : index,
    opacity: isHidden ? 0 : isDisabled ? 0.35 : 1,
    cursor: isDisabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
    touchAction: 'none' as const,
    // Sử dụng x, y và scale của Framer Motion để quản lý transform độc lập không bị ghi đè
    x: isDragging ? translateX + (transform?.x || 0) : translateX,
    y: isDragging ? translateY + (transform?.y || 0) : translateY,
    scale: isDragging ? 1.15 : 1,
    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      // Dịch chuyển y trồi lên so với toạ độ translateY tĩnh khi hover
      whileHover={!isDisabled && !isDragging ? { y: translateY - 25, scale: 1.08, zIndex: 100 } : {}}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="h-[var(--card-h)] w-[var(--card-w)]"
    >
      <CardBack />
    </motion.div>
  );
}

export function DragOverlayCard() {
  return (
    <div
      className="h-[var(--card-h)] w-[var(--card-w)]"
      style={{
        transform: 'rotate(-5deg)',
        filter: 'drop-shadow(0 8px 20px rgba(62,66,88,0.25))',
      }}
    >
      <CardBack />
    </div>
  );
}
