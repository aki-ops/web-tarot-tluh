import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ──────────────────────────────────────────────────────────────────
type Phase = "shuffle" | "fan" | "reveal";

interface TarotCard {
  id: number;
  name: string;
  symbol: string;
  meaning: string;
  reversedMeaning: string;
  color: string;
  accentColor: string;
}

interface PlacedCard {
  cardId: number;
  zone: "past" | "present" | "future";
  revealed: boolean;
  reversed: boolean;
}

// ─── Tarot Deck Data ─────────────────────────────────────────────────────────
const TAROT_CARDS: TarotCard[] = [
  { id: 0, name: "The Fool", symbol: "☉", meaning: "New beginnings, spontaneity, free spirit", reversedMeaning: "Recklessness, naivety, risk", color: "#E4F3F8", accentColor: "#AFD9EA" },
  { id: 1, name: "The Magician", symbol: "☿", meaning: "Manifestation, resourcefulness, power", reversedMeaning: "Manipulation, poor planning", color: "#FBF4E8", accentColor: "#F2CBD8" },
  { id: 2, name: "The High Priestess", symbol: "☽", meaning: "Intuition, sacred knowledge, divine feminine", reversedMeaning: "Secrets, disconnected intuition", color: "#F2CBD8", accentColor: "#C3DFC8" },
  { id: 3, name: "The Empress", symbol: "♀", meaning: "Femininity, beauty, nature, abundance", reversedMeaning: "Creative block, dependence", color: "#C3DFC8", accentColor: "#AFD9EA" },
  { id: 4, name: "The Emperor", symbol: "♂", meaning: "Authority, structure, stability", reversedMeaning: "Domination, excessive control", color: "#AFD9EA", accentColor: "#FBF4E8" },
  { id: 5, name: "The Hierophant", symbol: "♃", meaning: "Tradition, spiritual wisdom, conformity", reversedMeaning: "Rebellion, subversiveness", color: "#E4F3F8", accentColor: "#C3DFC8" },
  { id: 6, name: "The Lovers", symbol: "♋", meaning: "Love, harmony, relationships, values", reversedMeaning: "Disharmony, imbalance, bad values", color: "#F2CBD8", accentColor: "#FBF4E8" },
  { id: 7, name: "The Chariot", symbol: "♈", meaning: "Control, willpower, success, action", reversedMeaning: "Lack of control, aggression", color: "#AFD9EA", accentColor: "#E4F3F8" },
  { id: 8, name: "Strength", symbol: "♌", meaning: "Courage, persuasion, inner strength", reversedMeaning: "Self doubt, low energy, weakness", color: "#C3DFC8", accentColor: "#F2CBD8" },
  { id: 9, name: "The Hermit", symbol: "⊕", meaning: "Soul searching, introspection, guidance", reversedMeaning: "Isolation, loneliness, lost your way", color: "#FBF4E8", accentColor: "#AFD9EA" },
  { id: 10, name: "Wheel of Fortune", symbol: "☸", meaning: "Good luck, karma, life cycles", reversedMeaning: "Bad luck, resistance to change", color: "#E4F3F8", accentColor: "#F2CBD8" },
  { id: 11, name: "Justice", symbol: "⚖", meaning: "Justice, fairness, truth, cause and effect", reversedMeaning: "Unfairness, dishonesty, lack of accountability", color: "#AFD9EA", accentColor: "#C3DFC8" },
  { id: 12, name: "The Hanged Man", symbol: "♆", meaning: "Pause, surrender, letting go, new perspectives", reversedMeaning: "Delays, resistance, stalling", color: "#F2CBD8", accentColor: "#E4F3F8" },
  { id: 13, name: "Death", symbol: "♏", meaning: "Endings, change, transformation, transition", reversedMeaning: "Resistance to change, stagnation", color: "#C3DFC8", accentColor: "#AFD9EA" },
  { id: 14, name: "Temperance", symbol: "⚗", meaning: "Balance, moderation, patience, purpose", reversedMeaning: "Imbalance, excess, lack of long-term vision", color: "#FBF4E8", accentColor: "#F2CBD8" },
  { id: 15, name: "The Devil", symbol: "♑", meaning: "Shadow self, attachment, addiction, restriction", reversedMeaning: "Releasing limiting beliefs, exploring dark thoughts", color: "#E4F3F8", accentColor: "#C3DFC8" },
  { id: 16, name: "The Tower", symbol: "♜", meaning: "Sudden change, upheaval, chaos, revelation", reversedMeaning: "Personal transformation, fear of change", color: "#AFD9EA", accentColor: "#FBF4E8" },
  { id: 17, name: "The Star", symbol: "★", meaning: "Hope, spirituality, renewal, serenity", reversedMeaning: "Lack of faith, despair, discouragement", color: "#F2CBD8", accentColor: "#AFD9EA" },
  { id: 18, name: "The Moon", symbol: "☾", meaning: "Illusion, fear, the unconscious, confusion", reversedMeaning: "Release of fear, repressed emotion", color: "#C3DFC8", accentColor: "#E4F3F8" },
  { id: 19, name: "The Sun", symbol: "☀", meaning: "Positivity, fun, warmth, success, vitality", reversedMeaning: "Negativity, depression, sadness", color: "#FBF4E8", accentColor: "#C3DFC8" },
  { id: 20, name: "Judgement", symbol: "⚡", meaning: "Reflection, reckoning, awakening, absolution", reversedMeaning: "Failure to learn from the past, self doubt", color: "#AFD9EA", accentColor: "#F2CBD8" },
  { id: 21, name: "The World", symbol: "♾", meaning: "Completion, integration, accomplishment, travel", reversedMeaning: "Seeking personal closure, short-cuts", color: "#E4F3F8", accentColor: "#AFD9EA" },
];

const ZONE_LABELS = {
  past: { title: "The Past", subtitle: "Where you've been", icon: "⟲" },
  present: { title: "The Present", subtitle: "Where you stand", icon: "◉" },
  future: { title: "The Future", subtitle: "Where you're going", icon: "⟳" },
};

// ─── Spiral Background SVG ───────────────────────────────────────────────────
const SpiralTexture = () => (
  <svg
    className="fixed inset-0 w-full h-full pointer-events-none"
    style={{ opacity: 0.08, zIndex: 0 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="spiral" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#3E4258" strokeWidth="0.8" strokeDasharray="4 8" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#3E4258" strokeWidth="0.6" strokeDasharray="3 9" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="#3E4258" strokeWidth="0.4" strokeDasharray="2 10" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="#3E4258" strokeWidth="0.3" strokeDasharray="2 8" />
        <line x1="20" y1="100" x2="180" y2="100" stroke="#3E4258" strokeWidth="0.3" strokeOpacity="0.5" />
        <line x1="100" y1="20" x2="100" y2="180" stroke="#3E4258" strokeWidth="0.3" strokeOpacity="0.5" />
        <line x1="43" y1="43" x2="157" y2="157" stroke="#3E4258" strokeWidth="0.2" strokeOpacity="0.3" />
        <line x1="157" y1="43" x2="43" y2="157" stroke="#3E4258" strokeWidth="0.2" strokeOpacity="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#spiral)" />
  </svg>
);

// ─── Card Back Design ────────────────────────────────────────────────────────
const CardBack = ({ small = false }: { small?: boolean }) => (
  <div
    className="w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden"
    style={{
      background: "linear-gradient(135deg, #AFD9EA 0%, #C3DFC8 40%, #F2CBD8 100%)",
      boxShadow: "inset 0 1px 3px rgba(255,255,255,0.6), inset 0 -1px 3px rgba(62,66,88,0.1)",
    }}
  >
    <div
      className="absolute inset-2 rounded-lg border"
      style={{ borderColor: "rgba(255,255,255,0.5)", borderWidth: "1px" }}
    />
    <div
      className="absolute inset-3 rounded-lg border"
      style={{ borderColor: "rgba(62,66,88,0.1)", borderWidth: "1px" }}
    />
    <div className="flex flex-col items-center gap-1">
      <div style={{ fontSize: small ? "18px" : "28px", color: "#3E4258", opacity: 0.6 }}>✦</div>
      {!small && (
        <>
          <div style={{ fontSize: "10px", color: "#3E4258", opacity: 0.5, letterSpacing: "0.2em", fontFamily: "Jost", fontWeight: 300 }}>
            TAROT
          </div>
        </>
      )}
    </div>
    {/* Corner ornaments */}
    {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map((pos, i) => (
      <div
        key={i}
        className={`absolute ${pos}`}
        style={{ fontSize: small ? "6px" : "10px", color: "#3E4258", opacity: 0.4 }}
      >
        ◆
      </div>
    ))}
  </div>
);

// ─── Card Face Design ────────────────────────────────────────────────────────
const CardFace = ({ card, reversed = false }: { card: TarotCard; reversed?: boolean }) => (
  <div
    className="w-full h-full rounded-xl flex flex-col items-center justify-between p-3 relative overflow-hidden"
    style={{
      background: `linear-gradient(160deg, ${card.color} 0%, ${card.accentColor} 100%)`,
      boxShadow: "inset 0 1px 3px rgba(255,255,255,0.7), inset 0 -1px 3px rgba(62,66,88,0.1)",
      transform: reversed ? "rotate(180deg)" : "none",
    }}
  >
    <div
      className="absolute inset-2 rounded-lg border"
      style={{ borderColor: "rgba(255,255,255,0.5)" }}
    />
    <div className="relative z-10 text-center pt-1">
      <div style={{ fontSize: "8px", color: "#3E4258", opacity: 0.5, letterSpacing: "0.25em", fontFamily: "Jost", fontWeight: 300 }}>
        {reversed ? "REVERSED" : "ARCANA"}
      </div>
    </div>
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div style={{ fontSize: "36px", color: "#3E4258", opacity: 0.75, filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.5))" }}>
        {card.symbol}
      </div>
      <div style={{ fontSize: "9px", color: "#3E4258", fontFamily: "Jost", fontWeight: 400, textAlign: "center", letterSpacing: "0.05em", maxWidth: "80px", lineHeight: 1.3 }}>
        {reversed ? card.reversedMeaning.split(",")[0] : card.meaning.split(",")[0]}
      </div>
    </div>
    <div className="relative z-10 text-center pb-1">
      <div style={{ fontSize: "9px", color: "#3E4258", fontFamily: "Jost", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {card.name}
      </div>
    </div>
  </div>
);

// ─── Draggable Fan Card ──────────────────────────────────────────────────────
const DraggableFanCard = ({
  card,
  index,
  total,
  isSelected,
  isDisabled,
  onSelect,
}: {
  card: TarotCard;
  index: number;
  total: number;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (id: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${card.id}`,
    disabled: isDisabled,
    data: { cardId: card.id },
  });

  const mid = (total - 1) / 2;
  const offset = index - mid;
  const maxAngle = Math.min(65, total * 4.5);
  const angle = (offset / mid) * maxAngle;
  const xSpread = offset * (total > 12 ? 22 : 28);
  const yArc = Math.abs(offset) * (total > 12 ? 3 : 4);

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px) rotate(${angle}deg)`
      : `translateX(${xSpread}px) translateY(${yArc}px) rotate(${angle}deg)`,
    transformOrigin: "bottom center",
    zIndex: isDragging ? 1000 : isSelected ? 50 : index,
    opacity: isDisabled && !isSelected ? 0.4 : 1,
    cursor: isDisabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
    transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
    touchAction: "none",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={{ ...style, position: "absolute", bottom: 0 }}
      whileHover={!isDisabled && !isDragging ? { y: -20, scale: 1.08, zIndex: 100 } : {}}
      {...listeners}
      {...attributes}
      onClick={() => !isDisabled && onSelect(card.id)}
      className="w-20 h-32 md:w-24 md:h-40"
    >
      <CardBack />
      {isSelected && (
        <div
          className="absolute inset-0 rounded-xl border-2"
          style={{ borderColor: "#AFD9EA", boxShadow: "0 0 12px rgba(175,217,234,0.6)" }}
        />
      )}
    </motion.div>
  );
};

// ─── Stone Tablet Drop Zone ──────────────────────────────────────────────────
const StoneTablet = ({
  zone,
  placedCard,
  revealed,
  isActive,
}: {
  zone: "past" | "present" | "future";
  placedCard: PlacedCard | undefined;
  revealed: boolean;
  isActive: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `zone-${zone}` });
  const label = ZONE_LABELS[zone];
  const card = placedCard ? TAROT_CARDS.find((c) => c.id === placedCard.cardId) : null;

  const zoneColors = {
    past: { bg: "#AFD9EA", border: "#7BBDD6", accent: "#5AA0BF" },
    present: { bg: "#F2CBD8", border: "#E0A5BE", accent: "#CC7DA0" },
    future: { bg: "#C3DFC8", border: "#9DC5A4", accent: "#72A87A" },
  };
  const colors = zoneColors[zone];

  return (
    <div
      ref={setNodeRef}
      className="relative flex flex-col items-center"
      style={{ width: "100%", maxWidth: "220px" }}
    >
      {/* Zone label */}
      <div className="mb-3 text-center">
        <div
          style={{ fontSize: "18px", color: "#3E4258", opacity: 0.5, marginBottom: "2px" }}
        >
          {label.icon}
        </div>
        <div
          style={{ fontFamily: "Jost", fontWeight: 200, fontSize: "18px", letterSpacing: "0.2em", color: "#3E4258" }}
        >
          {label.title}
        </div>
        <div
          style={{ fontFamily: "Jost", fontWeight: 300, fontSize: "11px", letterSpacing: "0.15em", color: "#3E4258", opacity: 0.6 }}
        >
          {label.subtitle}
        </div>
      </div>

      {/* Tablet */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          width: "100%",
          height: "200px",
          background: isOver
            ? `linear-gradient(145deg, ${colors.bg}CC, ${colors.border}88)`
            : `linear-gradient(145deg, ${colors.bg}66, ${colors.border}33)`,
          boxShadow: isOver
            ? `inset 0 4px 20px rgba(62,66,88,0.25), inset 0 -2px 8px rgba(255,255,255,0.4), 0 0 20px ${colors.bg}80`
            : `inset 0 4px 20px rgba(62,66,88,0.15), inset 0 -2px 8px rgba(255,255,255,0.4)`,
          border: `1.5px solid ${isOver ? colors.accent + "88" : colors.border + "55"}`,
          transition: "all 0.3s ease",
        }}
      >
        {/* Stone texture lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.12 }}>
          {[20, 60, 100, 140, 180].map((y) => (
            <div
              key={y}
              style={{
                position: "absolute",
                left: "5%",
                right: "5%",
                top: y,
                height: "1px",
                background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
              }}
            />
          ))}
        </div>

        {/* Carved border inset */}
        <div
          className="absolute inset-3 rounded-xl pointer-events-none"
          style={{
            boxShadow: `inset 0 2px 6px rgba(62,66,88,0.2), inset 0 -1px 3px rgba(255,255,255,0.3)`,
            border: `1px solid rgba(62,66,88,0.08)`,
          }}
        />

        {/* Content */}
        {!placedCard ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              style={{ fontSize: "28px", color: colors.accent, opacity: isOver ? 0.8 : 0.35, transition: "opacity 0.2s" }}
            >
              {isActive ? "✦" : "○"}
            </div>
            <div
              style={{ fontFamily: "Jost", fontWeight: 300, fontSize: "11px", letterSpacing: "0.2em", color: "#3E4258", opacity: 0.45 }}
            >
              {isActive ? "DROP CARD HERE" : "AWAITING"}
            </div>
          </div>
        ) : card ? (
          <div className="absolute inset-0 flex items-center justify-center perspective-1000">
            <div
              className={`card-flip w-[100px] h-[160px] md:w-[110px] md:h-[176px] relative ${revealed ? "flipped" : ""}`}
              style={{
                transitionDelay: revealed ? `${zone === "past" ? 0.2 : zone === "present" ? 0.4 : 0.6}s` : "0s",
              }}
            >
              <div className="card-face absolute inset-0">
                <CardBack />
              </div>
              <div className="card-back-face absolute inset-0">
                <CardFace card={card} reversed={placedCard.reversed} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── Drag Overlay Card ───────────────────────────────────────────────────────
const DragOverlayCard = ({ cardId }: { cardId: number | null }) => {
  if (!cardId && cardId !== 0) return null;
  return (
    <div
      className="w-20 h-32 md:w-24 md:h-40"
      style={{
        transform: "rotate(-5deg)",
        filter: "drop-shadow(0 8px 20px rgba(62,66,88,0.3))",
      }}
    >
      <CardBack />
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────────────────
export default function Index() {
  const [phase, setPhase] = useState<Phase>("shuffle");
  const [isShuffling, setIsShuffling] = useState(true);
  const [fanCards, setFanCards] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [placedCards, setPlacedCards] = useState<PlacedCard[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Initialize a shuffled deck
  const getShuffledDeck = useCallback(() => {
    return [...TAROT_CARDS].sort(() => Math.random() - 0.5);
  }, []);

  // Shuffle animation: rapidly re-order stack
  useEffect(() => {
    if (phase === "shuffle" && isShuffling) {
      shuffleIntervalRef.current = setInterval(() => {
        setFanCards(getShuffledDeck());
      }, 300);
    } else {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
    }
    return () => {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
    };
  }, [phase, isShuffling, getShuffledDeck]);

  const handleStartShuffle = () => {
    setFanCards(getShuffledDeck());
    setIsShuffling(true);
    setPhase("shuffle");
    setSelectedCards([]);
    setPlacedCards([]);
    setRevealed(false);
    setShowMeaning(false);
  };

  const handleStopShuffle = () => {
    setIsShuffling(false);
    // Transition to fan phase
    setTimeout(() => setPhase("fan"), 200);
  };

  const handleSelectCard = (cardId: number) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards((prev) => prev.filter((id) => id !== cardId));
    } else if (selectedCards.length < 3) {
      setSelectedCards((prev) => [...prev, cardId]);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = Number(String(event.active.id).replace("card-", ""));
    setActiveDragId(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { over, active } = event;
    if (!over) return;

    const cardId = Number(String(active.id).replace("card-", ""));
    const zone = String(over.id).replace("zone-", "") as "past" | "present" | "future";

    // Check if zone already has a card
    const zoneOccupied = placedCards.some((p) => p.zone === zone);
    // Check if card is already placed
    const cardPlaced = placedCards.some((p) => p.cardId === cardId);

    if (zoneOccupied || cardPlaced) return;

    const newPlaced: PlacedCard = {
      cardId,
      zone,
      revealed: false,
      reversed: Math.random() < 0.25,
    };

    setPlacedCards((prev) => {
      const updated = [...prev, newPlaced];
      return updated;
    });
    setSelectedCards((prev) => [...prev, cardId]);
  };

  const allFilled = placedCards.length === 3;

  const handleReveal = () => {
    setRevealed(true);
    setTimeout(() => setShowMeaning(true), 2200);
  };

  const handleReset = () => {
    setPhase("shuffle");
    setFanCards([]);
    setSelectedCards([]);
    setPlacedCards([]);
    setRevealed(false);
    setShowMeaning(false);
    setIsShuffling(false);
    setTimeout(() => {
      setFanCards(getShuffledDeck());
      setIsShuffling(true);
    }, 100);
  };

  const placedInZone = (zone: "past" | "present" | "future") =>
    placedCards.find((p) => p.zone === zone);

  const fanCardsFiltered = fanCards.filter(
    (c) => !placedCards.some((p) => p.cardId === c.id)
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Full-bleed background */}
      <div
        className="fixed inset-0"
        style={{
          background: "linear-gradient(135deg, #AFD9EA 0%, #C3DFC8 30%, #E4F3F8 55%, #F2CBD8 80%, #AFD9EA 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 12s ease infinite",
        }}
      />
      <SpiralTexture />

      {/* Gradient animation keyframes injected inline */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Main container */}
      <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ zIndex: 1 }}>
        {/* Header */}
        <header className="pt-8 pb-4 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div
              style={{ fontFamily: "Jost", fontWeight: 100, fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: "0.4em", color: "#3E4258" }}
            >
              TAROT
            </div>
            <div
              style={{ fontFamily: "Jost", fontWeight: 300, fontSize: "clamp(11px, 2vw, 14px)", letterSpacing: "0.35em", color: "#3E4258", opacity: 0.6, marginTop: "4px" }}
            >
              REVEAL YOUR PATH
            </div>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div style={{ width: "40px", height: "1px", background: "rgba(62,66,88,0.2)" }} />
              <div style={{ color: "#3E4258", opacity: 0.4, fontSize: "10px" }}>✦</div>
              <div style={{ width: "40px", height: "1px", background: "rgba(62,66,88,0.2)" }} />
            </div>
          </motion.div>
        </header>

        {/* ── PHASE: SHUFFLE ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {phase === "shuffle" && (
            <motion.div
              key="shuffle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center px-4 py-8"
            >
              {/* Instruction */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-10 text-center"
              >
                <p style={{ fontFamily: "Jost", fontWeight: 300, fontSize: "15px", letterSpacing: "0.1em", color: "#3E4258", opacity: 0.7 }}>
                  {isShuffling ? "Concentrate on your question..." : "The cards await your choice"}
                </p>
              </motion.div>

              {/* Card Stack */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: "120px", height: "190px", perspective: "600px" }}
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const spread = i * 1.5;
                  return (
                    <div
                      key={i}
                      className={isShuffling ? "card-jitter" : ""}
                      style={{
                        position: "absolute",
                        width: "88px",
                        height: "140px",
                        bottom: 0,
                        transform: `translateY(-${spread}px) rotateY(${(i % 3 - 1) * 1.5}deg) rotateZ(${(i % 5 - 2) * 0.5}deg)`,
                        animationDelay: `${i * 0.04}s`,
                        zIndex: i,
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <CardBack />
                    </div>
                  );
                })}
              </div>

              {/* Button */}
              <motion.div className="mt-14" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                {isShuffling ? (
                  <button
                    onClick={handleStopShuffle}
                    style={{
                      fontFamily: "Jost",
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.25em",
                      color: "#3E4258",
                      background: "rgba(251,244,232,0.85)",
                      border: "1.5px solid rgba(175,217,234,0.6)",
                      borderRadius: "40px",
                      padding: "12px 32px",
                      cursor: "pointer",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 4px 20px rgba(175,217,234,0.3)",
                    }}
                  >
                    STOP SHUFFLE
                  </button>
                ) : (
                  <button
                    onClick={handleStartShuffle}
                    style={{
                      fontFamily: "Jost",
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.25em",
                      color: "#3E4258",
                      background: "rgba(251,244,232,0.85)",
                      border: "1.5px solid rgba(175,217,234,0.6)",
                      borderRadius: "40px",
                      padding: "12px 32px",
                      cursor: "pointer",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 4px 20px rgba(175,217,234,0.3)",
                    }}
                  >
                    SHUFFLE AGAIN
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ── PHASE: FAN + REVEAL ─────────────────────────────────────── */}
          {(phase === "fan" || phase === "reveal") && (
            <motion.div
              key="fan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex flex-col px-2 md:px-6 overflow-hidden"
            >
              {/* Stone Tablet Zones */}
              <div className="flex-1 flex flex-col items-center justify-start pt-4 pb-2 px-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-center mb-4 md:mb-6"
                >
                  <p style={{ fontFamily: "Jost", fontWeight: 300, fontSize: "13px", letterSpacing: "0.15em", color: "#3E4258", opacity: 0.65 }}>
                    {!allFilled
                      ? `Drag ${3 - placedCards.length} card${3 - placedCards.length !== 1 ? "s" : ""} to the tablets`
                      : revealed
                      ? "Your reading is complete"
                      : "All cards placed — reveal when ready"}
                  </p>
                </motion.div>

                {/* Three Stone Tablets */}
                <div className="flex flex-row gap-3 md:gap-6 justify-center w-full max-w-3xl flex-wrap sm:flex-nowrap">
                  {(["past", "present", "future"] as const).map((zone) => (
                    <motion.div
                      key={zone}
                      initial={{ opacity: 0, y: -30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: zone === "past" ? 0.3 : zone === "present" ? 0.45 : 0.6, duration: 0.6 }}
                      className="flex-1 min-w-[140px] flex justify-center"
                    >
                      <StoneTablet
                        zone={zone}
                        placedCard={placedInZone(zone)}
                        revealed={revealed}
                        isActive={phase === "fan" && !placedInZone(zone)}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 md:mt-6 flex-wrap justify-center">
                  {allFilled && !revealed && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleReveal}
                      style={{
                        fontFamily: "Jost",
                        fontWeight: 400,
                        fontSize: "12px",
                        letterSpacing: "0.3em",
                        color: "#3E4258",
                        background: "linear-gradient(135deg, rgba(242,203,216,0.85), rgba(195,223,200,0.85))",
                        border: "1.5px solid rgba(175,217,234,0.5)",
                        borderRadius: "40px",
                        padding: "12px 36px",
                        cursor: "pointer",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 4px 24px rgba(242,203,216,0.4)",
                      }}
                    >
                      ✦ REVEAL READING
                    </motion.button>
                  )}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    style={{
                      fontFamily: "Jost",
                      fontWeight: 300,
                      fontSize: "11px",
                      letterSpacing: "0.25em",
                      color: "#3E4258",
                      background: "rgba(251,244,232,0.6)",
                      border: "1px solid rgba(62,66,88,0.15)",
                      borderRadius: "40px",
                      padding: "10px 24px",
                      cursor: "pointer",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    NEW READING
                  </motion.button>
                </div>
              </div>

              {/* Card Meanings Panel */}
              <AnimatePresence>
                {showMeaning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-2 md:mx-6 mb-4 rounded-2xl overflow-hidden"
                    style={{
                      background: "rgba(251,244,232,0.7)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(175,217,234,0.3)",
                      boxShadow: "0 4px 20px rgba(62,66,88,0.08)",
                    }}
                  >
                    <div className="flex flex-row gap-0 divide-x divide-[rgba(175,217,234,0.3)]">
                      {(["past", "present", "future"] as const).map((zone, idx) => {
                        const placed = placedInZone(zone);
                        const card = placed ? TAROT_CARDS.find((c) => c.id === placed.cardId) : null;
                        if (!card) return null;
                        return (
                          <motion.div
                            key={zone}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.25, duration: 0.5 }}
                            className="flex-1 p-4 md:p-5 text-center"
                            style={{ borderRight: idx < 2 ? "1px solid rgba(175,217,234,0.3)" : "none" }}
                          >
                            <div style={{ fontFamily: "Jost", fontWeight: 200, fontSize: "10px", letterSpacing: "0.3em", color: "#3E4258", opacity: 0.5, marginBottom: "6px" }}>
                              {ZONE_LABELS[zone].title.toUpperCase()}
                            </div>
                            <div style={{ fontFamily: "Jost", fontWeight: 400, fontSize: "14px", color: "#3E4258", marginBottom: "4px" }}>
                              {card.name}
                              {placed?.reversed && <span style={{ fontSize: "10px", opacity: 0.6 }}> ↓</span>}
                            </div>
                            <div style={{ fontFamily: "Jost", fontWeight: 300, fontSize: "11px", color: "#3E4258", opacity: 0.7, lineHeight: 1.5 }}>
                              {placed?.reversed ? card.reversedMeaning : card.meaning}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fan of Cards */}
              <div
                className="relative w-full flex items-end justify-center"
                style={{ height: "clamp(160px, 22vh, 220px)", paddingBottom: "12px", overflow: "visible" }}
              >
                {/* Fan container — centered */}
                <div
                  className="relative flex items-end justify-center"
                  style={{
                    width: "100%",
                    maxWidth: "min(90vw, 900px)",
                    height: "100%",
                  }}
                >
                  {fanCardsFiltered.map((card, index) => (
                    <DraggableFanCard
                      key={card.id}
                      card={card}
                      index={index}
                      total={fanCardsFiltered.length}
                      isSelected={selectedCards.includes(card.id)}
                      isDisabled={
                        placedCards.some((p) => p.cardId === card.id) ||
                        (allFilled && !placedCards.some((p) => p.cardId === card.id))
                      }
                      onSelect={handleSelectCard}
                    />
                  ))}
                </div>

                {/* Fan instruction */}
                {!allFilled && (
                  <div
                    className="absolute bottom-1 left-1/2 -translate-x-1/2"
                    style={{ fontFamily: "Jost", fontWeight: 300, fontSize: "10px", letterSpacing: "0.2em", color: "#3E4258", opacity: 0.45, whiteSpace: "nowrap" }}
                  >
                    DRAG CARDS TO TABLETS ABOVE
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={{ duration: 300, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        <DragOverlayCard cardId={activeDragId} />
      </DragOverlay>
    </DndContext>
  );
}