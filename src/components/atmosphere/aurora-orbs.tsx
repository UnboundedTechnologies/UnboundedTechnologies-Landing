import { cn } from '@/lib/utils';

// Layered hero atmosphere:
//   - Slow morphing tri-tone nebula behind everything (B3 from the design
//     plan): a large blurred conic-ish wash that rotates over 60s, giving
//     the hero an organic sense of "alive" beyond what the two discrete
//     orbs alone provide.
//   - Two original aurora orbs on top of the nebula: blue (top-left,
//     14s drift) and purple (bottom-right, 18s drift), kept at the same
//     opacities so existing pages don't look different in their mid-state.
//
// The nebula is a fragment of CSS, no JS, no canvas. prefers-reduced-motion
// disables all three animations.

export function AuroraOrbs({ className }: { className?: string }) {
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      aria-hidden
    >
      {/* Mesh nebula. Two layered conic-style washes rotating opposite
          directions at very different speeds keep the cloud from ever
          repeating its visible state on a comfortable scroll. Heavy blur
          smudges the edges into a cloud rather than a disc. */}
      <div
        className="absolute -inset-1/4 opacity-40 mix-blend-screen"
        style={{
          background:
            'conic-gradient(from 0deg at 50% 50%, rgba(93,111,255,0.55), rgba(163,93,255,0.55), rgba(93,199,255,0.55), rgba(93,111,255,0.55))',
          filter: 'blur(80px)',
          animation: 'aurora-nebula-spin 60s linear infinite',
        }}
      />
      <div
        className="absolute -inset-1/4 opacity-25 mix-blend-screen"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 50%, rgba(93,199,255,0.5), rgba(93,111,255,0.5), rgba(163,93,255,0.5), rgba(93,199,255,0.5))',
          filter: 'blur(100px)',
          animation: 'aurora-nebula-spin-reverse 90s linear infinite',
        }}
      />
      {/* Original two aurora orbs, on top of the nebula. */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(93,111,255,0.55) 0%, transparent 70%)',
          animation: 'orb-drift-a 14s var(--ease-out) infinite alternate',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(163,93,255,0.5) 0%, transparent 65%)',
          animation: 'orb-drift-b 18s var(--ease-out) infinite alternate',
        }}
      />
    </div>
  );
}
