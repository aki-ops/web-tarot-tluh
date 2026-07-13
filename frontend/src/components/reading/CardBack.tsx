export function CardBack({ small = false }: { small?: boolean }) {
  const corners = ['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'];

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-none"
      style={{
        background: 'linear-gradient(135deg, #AFD9EA 0%, #C3DFC8 40%, #F2CBD8 100%)',
        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.6), inset 0 -1px 3px rgba(62,66,88,0.1)',
      }}
    >
      <div
        className="absolute inset-1.5 rounded-none border"
        style={{ borderColor: 'rgba(255,255,255,0.5)' }}
      />
      <div
        className="absolute inset-2.5 rounded-none border"
        style={{ borderColor: 'rgba(62,66,88,0.1)' }}
      />
      <div className="flex flex-col items-center gap-1">
        <span style={{ fontSize: small ? 16 : 24, color: '#3E4258', opacity: 0.6 }}>✦</span>
        {!small && (
          <span
            className="text-[9px] tracking-[0.2em] text-ink/50"
            style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}
          >
            TAROT
          </span>
        )}
      </div>
      {corners.map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos}`}
          style={{ fontSize: small ? 5 : 8, color: '#3E4258', opacity: 0.35 }}
        >
          ◆
        </span>
      ))}
    </div>
  );
}
