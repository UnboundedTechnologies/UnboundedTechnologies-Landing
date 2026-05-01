'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Cursor-tracking spotlight overlay. Drop inside any positioned parent
// (typically a card with `relative` and a `group` class), and the overlay
// listens for mousemove on the parent, writing the cursor's local
// coordinates into CSS custom properties that the radial-gradient consumes.
//
// The overlay is opacity:0 by default and fades in via `group-hover` so
// the highlight only appears when the user is over the card. border-radius
// is inherited from the parent so the spotlight clips to the card's
// rounded corners. Pointer-events are off so the overlay never blocks
// clicks on the card content.

type Props = {
  /** rgba spotlight color. Use a brand-tinted ~22% alpha; see accentSpotlight(). */
  color?: string;
  /** Px diameter of the spotlight halo. Default 280. */
  size?: number;
  /** Optional className overrides. */
  className?: string;
};

export function Spotlight({
  color = 'rgba(93, 111, 255, 0.22)',
  size = 280,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    function onMove(e: MouseEvent) {
      if (!el || !parent) return;
      const rect = parent.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }

    parent.addEventListener('mousemove', onMove);
    return () => {
      parent.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300',
        'group-hover:opacity-100',
        className,
      )}
      style={{
        borderRadius: 'inherit',
        background: `radial-gradient(circle ${size}px at var(--mx, -200px) var(--my, -200px), ${color}, transparent 70%)`,
      }}
    />
  );
}
