'use client';

import { useIsTouch } from '@/lib/hooks/use-is-touch';
import { cn } from '@/lib/utils';

// Layered atmosphere:
//   - Slow morphing tri-tone nebula behind everything: a large blurred
//     conic-ish wash that rotates over 60s, giving the surface an organic
//     "alive" feel beyond what the two discrete orbs alone provide.
//   - Two original aurora orbs on top of the nebula: blue (top-left,
//     14s drift) and purple (bottom-right, 18s drift).
//
// IMPORTANT: the two nebula layers use `filter: blur(80–100px)` plus
// `mix-blend-mode: screen` plus an infinite rotation. On mobile this is
// extremely GPU-heavy: each frame requires re-rasterizing the blur pass on
// a rotating element AND a pixel-readback for the blend mode. The cost
// saturates the compositor and bleeds into input-event responsiveness
// (visible as typing lag and pill-tap delay on the contact form). We skip
// the nebula entirely on touch devices and keep just the two simpler radial
// orbs, which are cheap to animate.
//
// Desktop keeps the full nebula because mouse interaction has more
// scheduling headroom and the nebula is part of the visual identity. The
// nebula is also disabled by prefers-reduced-motion via globals.css.

export function AuroraOrbs({ className }: { className?: string }) {
  const isTouch = useIsTouch();
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      aria-hidden
    >
      {/* Mesh nebula. Two layered conic-style washes rotating opposite
          directions. Skipped on touch devices for input-latency reasons. */}
      {!isTouch && (
        <>
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
        </>
      )}
      {/* Two aurora orbs - cheap radial gradients, run on every device. */}
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
