export function PageBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 40%, var(--cream) 0%, var(--sky-light) 70%, #d8ecf4 100%)',
      }}
    />
  );
}
