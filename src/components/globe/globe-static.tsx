import { cn } from '@/lib/utils';

// Static SVG snapshot of the globe used as the SSR/reduced-motion/no-JS
// fallback for the WebGL <Globe />. The wireframe and city dots are tuned to
// match the live globe's silhouette closely enough that swapping the WebGL
// Canvas in after hydration does not feel like a separate component popping
// in.

export function GlobeStatic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={cn('w-full h-full', className)}
      role="img"
      aria-label="Stylised globe with city markers"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Stylised globe with city markers</title>
      <defs>
        <radialGradient id="globe-static-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(93,111,255,0.32)" />
          <stop offset="55%" stopColor="rgba(163,93,255,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id="globe-static-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(93,111,255,0.55)" />
          <stop offset="50%" stopColor="rgba(163,93,255,0.55)" />
          <stop offset="100%" stopColor="rgba(93,199,255,0.55)" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" r="180" fill="url(#globe-static-glow)" />

      <g fill="none" stroke="url(#globe-static-stroke)" strokeWidth="0.75" opacity="0.6">
        <circle cx="200" cy="200" r="140" />
        <ellipse cx="200" cy="200" rx="140" ry="35" />
        <ellipse cx="200" cy="200" rx="140" ry="70" />
        <ellipse cx="200" cy="200" rx="140" ry="105" />
        <ellipse cx="200" cy="200" rx="35" ry="140" />
        <ellipse cx="200" cy="200" rx="70" ry="140" />
        <ellipse cx="200" cy="200" rx="105" ry="140" />
      </g>

      {[
        { cx: 152, cy: 168, color: '#5d6fff' },
        { cx: 226, cy: 142, color: '#a35dff' },
        { cx: 268, cy: 184, color: '#5dc7ff' },
        { cx: 134, cy: 246, color: '#5d6fff' },
        { cx: 282, cy: 232, color: '#a35dff' },
        { cx: 248, cy: 208, color: '#5dc7ff' },
      ].map((c) => (
        <g key={`${c.cx}-${c.cy}`}>
          <circle cx={c.cx} cy={c.cy} r="6" fill={c.color} opacity="0.18" />
          <circle cx={c.cx} cy={c.cy} r="2.5" fill={c.color} />
        </g>
      ))}
    </svg>
  );
}
