export function InfinityLogoStatic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" className={className} aria-label="Unbounded Technologies">
      <defs>
        <linearGradient id="ul-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5d6fff" />
          <stop offset="50%" stopColor="#a35dff" />
          <stop offset="100%" stopColor="#5dc7ff" />
        </linearGradient>
      </defs>
      <path
        d="M50,50 C50,20 80,20 100,50 C120,80 150,80 150,50 C150,20 120,20 100,50 C80,80 50,80 50,50 Z"
        fill="none"
        stroke="url(#ul-grad)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M148,42 L162,28 M162,28 L150,28 M162,28 L162,40"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
