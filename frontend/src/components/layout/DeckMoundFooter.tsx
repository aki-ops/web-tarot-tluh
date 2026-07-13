const MOUND_LINES: { x: number; y2: number; opacity: number }[] = [
  { x: 0, y2: 25.76, opacity: 0.15 },
  { x: 1.41, y2: 23.79, opacity: 0.1743 },
  { x: 2.82, y2: 22.32, opacity: 0.1986 },
  { x: 4.23, y2: 21.64, opacity: 0.2228 },
  { x: 5.63, y2: 21.65, opacity: 0.2468 },
  { x: 7.04, y2: 21.93, opacity: 0.2707 },
  { x: 8.45, y2: 21.93, opacity: 0.2943 },
  { x: 9.86, y2: 21.27, opacity: 0.3176 },
  { x: 11.27, y2: 19.83, opacity: 0.3406 },
  { x: 12.68, y2: 17.91, opacity: 0.3633 },
  { x: 14.08, y2: 16.02, opacity: 0.3855 },
  { x: 15.49, y2: 14.67, opacity: 0.4073 },
  { x: 16.9, y2: 14.12, opacity: 0.4285 },
  { x: 18.31, y2: 14.26, opacity: 0.4492 },
  { x: 19.72, y2: 14.67, opacity: 0.4693 },
  { x: 21.13, y2: 14.82, opacity: 0.4888 },
  { x: 22.54, y2: 14.3, opacity: 0.5077 },
  { x: 23.94, y2: 13.02, opacity: 0.5258 },
  { x: 25.35, y2: 11.29, opacity: 0.5432 },
  { x: 26.76, y2: 9.61, opacity: 0.5598 },
  { x: 28.17, y2: 8.49, opacity: 0.5756 },
  { x: 29.58, y2: 8.19, opacity: 0.5906 },
  { x: 30.99, y2: 8.58, opacity: 0.6048 },
  { x: 32.39, y2: 9.25, opacity: 0.618 },
  { x: 33.8, y2: 9.65, opacity: 0.6303 },
  { x: 35.21, y2: 9.38, opacity: 0.6417 },
  { x: 36.62, y2: 8.37, opacity: 0.6521 },
  { x: 38.03, y2: 6.92, opacity: 0.6616 },
  { x: 39.44, y2: 5.55, opacity: 0.67 },
  { x: 40.85, y2: 4.76, opacity: 0.6774 },
  { x: 42.25, y2: 4.79, opacity: 0.6838 },
  { x: 43.66, y2: 5.52, opacity: 0.6891 },
  { x: 45.07, y2: 6.51, opacity: 0.6934 },
  { x: 46.48, y2: 7.23, opacity: 0.6966 },
  { x: 47.89, y2: 7.28, opacity: 0.6988 },
  { x: 49.3, y2: 6.6, opacity: 0.6999 },
  { x: 50.7, y2: 5.49, opacity: 0.6999 },
  { x: 52.11, y2: 4.48, opacity: 0.6988 },
  { x: 53.52, y2: 4.05, opacity: 0.6966 },
  { x: 54.93, y2: 4.45, opacity: 0.6934 },
  { x: 56.34, y2: 5.54, opacity: 0.6891 },
  { x: 57.75, y2: 6.89, opacity: 0.6838 },
  { x: 59.15, y2: 7.94, opacity: 0.6774 },
  { x: 60.56, y2: 8.33, opacity: 0.67 },
  { x: 61.97, y2: 7.98, opacity: 0.6616 },
  { x: 63.38, y2: 7.21, opacity: 0.6521 },
  { x: 64.79, y2: 6.55, opacity: 0.6417 },
  { x: 66.2, y2: 6.48, opacity: 0.6303 },
  { x: 67.61, y2: 7.23, opacity: 0.618 },
  { x: 69.01, y2: 8.66, opacity: 0.6048 },
  { x: 70.42, y2: 10.33, opacity: 0.5906 },
  { x: 71.83, y2: 11.69, opacity: 0.5756 },
  { x: 73.24, y2: 12.36, opacity: 0.5598 },
  { x: 74.65, y2: 12.3, opacity: 0.5432 },
  { x: 76.06, y2: 11.82, opacity: 0.5258 },
  { x: 77.46, y2: 11.44, opacity: 0.5077 },
  { x: 78.87, y2: 11.66, opacity: 0.4888 },
  { x: 80.28, y2: 12.7, opacity: 0.4693 },
  { x: 81.69, y2: 14.39, opacity: 0.4492 },
  { x: 83.1, y2: 16.3, opacity: 0.4285 },
  { x: 84.51, y2: 17.87, opacity: 0.4073 },
  { x: 85.92, y2: 18.74, opacity: 0.3855 },
  { x: 87.32, y2: 18.87, opacity: 0.3633 },
  { x: 88.73, y2: 18.57, opacity: 0.3406 },
  { x: 90.14, y2: 18.39, opacity: 0.3176 },
  { x: 91.55, y2: 18.79, opacity: 0.2943 },
  { x: 92.96, y2: 20, opacity: 0.2707 },
  { x: 94.37, y2: 21.84, opacity: 0.2468 },
  { x: 95.77, y2: 23.86, opacity: 0.2228 },
  { x: 97.18, y2: 25.53, opacity: 0.1986 },
  { x: 98.59, y2: 26.47, opacity: 0.1743 },
  { x: 100, y2: 26.66, opacity: 0.15 },
];

export function DeckMoundFooter() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-0 h-28 overflow-hidden">
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        style={{ height: '100%' }}
        aria-hidden
      >
        <line x1="0" y1="28" x2="100" y2="28" stroke="var(--ink)" strokeWidth="0.15" opacity="0.25" />
        {MOUND_LINES.map((line, i) => (
          <line
            key={i}
            x1={line.x}
            y1={28}
            x2={line.x}
            y2={line.y2}
            stroke="var(--ink)"
            strokeWidth="0.12"
            opacity={line.opacity}
          />
        ))}
      </svg>
    </div>
  );
}
