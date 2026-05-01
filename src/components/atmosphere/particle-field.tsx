import { cn } from '@/lib/utils';

// Subtle stardust layer mounted once at the layout level. Pure CSS, no JS,
// no canvas. A handful of pre-positioned 1-2px white dots drift on long
// staggered keyframe loops; the result reads as ambient atmosphere rather
// than as discrete moving objects.
//
// All positions are deterministic so SSR markup and client markup match.
// `prefers-reduced-motion` users get the dots without animation (set via
// the .particle CSS class in globals.css).

type Particle = {
  /** Percent across viewport from left. */
  x: number;
  /** Percent down viewport from top. */
  y: number;
  /** Px diameter. */
  size: number;
  /** Seconds for one drift loop. */
  duration: number;
  /** Seconds of negative delay so particles don't all start at phase 0. */
  delay: number;
  /** 0..1 base opacity (multiplied with the keyframe's own fade). */
  opacity: number;
  /** Which drift keyframe to use; particles share a few canonical paths. */
  variant: 1 | 2 | 3;
};

const PARTICLES: ReadonlyArray<Particle> = [
  { x: 6, y: 12, size: 1, duration: 28, delay: 0, opacity: 0.45, variant: 1 },
  { x: 18, y: 47, size: 2, duration: 36, delay: -12, opacity: 0.5, variant: 2 },
  { x: 31, y: 8, size: 1, duration: 24, delay: -6, opacity: 0.35, variant: 3 },
  { x: 42, y: 73, size: 1, duration: 32, delay: -18, opacity: 0.4, variant: 1 },
  { x: 55, y: 21, size: 2, duration: 40, delay: -3, opacity: 0.55, variant: 2 },
  { x: 67, y: 56, size: 1, duration: 30, delay: -22, opacity: 0.42, variant: 3 },
  { x: 78, y: 14, size: 1, duration: 34, delay: -9, opacity: 0.38, variant: 1 },
  { x: 88, y: 62, size: 2, duration: 38, delay: -15, opacity: 0.5, variant: 2 },
  { x: 95, y: 33, size: 1, duration: 26, delay: -2, opacity: 0.32, variant: 3 },
  { x: 13, y: 84, size: 1, duration: 33, delay: -20, opacity: 0.4, variant: 1 },
  { x: 26, y: 28, size: 1, duration: 29, delay: -7, opacity: 0.38, variant: 2 },
  { x: 49, y: 91, size: 2, duration: 42, delay: -25, opacity: 0.46, variant: 3 },
  { x: 62, y: 38, size: 1, duration: 27, delay: -11, opacity: 0.36, variant: 1 },
  { x: 73, y: 79, size: 1, duration: 31, delay: -4, opacity: 0.42, variant: 2 },
  { x: 84, y: 4, size: 1, duration: 25, delay: -17, opacity: 0.34, variant: 3 },
  { x: 4, y: 64, size: 2, duration: 39, delay: -13, opacity: 0.48, variant: 1 },
  { x: 37, y: 51, size: 1, duration: 23, delay: -19, opacity: 0.36, variant: 2 },
  { x: 58, y: 6, size: 1, duration: 35, delay: -8, opacity: 0.4, variant: 3 },
  { x: 71, y: 95, size: 1, duration: 28, delay: -1, opacity: 0.38, variant: 1 },
  { x: 90, y: 77, size: 1, duration: 30, delay: -14, opacity: 0.4, variant: 2 },
  { x: 22, y: 36, size: 1, duration: 26, delay: -23, opacity: 0.32, variant: 3 },
  { x: 45, y: 16, size: 1, duration: 37, delay: -10, opacity: 0.38, variant: 1 },
  { x: 76, y: 45, size: 2, duration: 41, delay: -16, opacity: 0.46, variant: 2 },
  { x: 9, y: 58, size: 1, duration: 24, delay: -5, opacity: 0.34, variant: 3 },
];

export function ParticleField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('fixed inset-0 pointer-events-none overflow-hidden z-0', className)}
    >
      {PARTICLES.map((p) => (
        <span
          key={`${p.x}-${p.y}-${p.variant}`}
          className={`particle particle-v${p.variant}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
