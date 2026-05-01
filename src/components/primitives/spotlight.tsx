'use client';

import { useEffect, useRef } from 'react';
import { useIsTouch } from '@/lib/hooks/use-is-touch';
import { cn } from '@/lib/utils';

// Cursor-tracking spotlight overlay. Drop inside any positioned parent
// (typically a card with `relative` and a `group` class), and the overlay
// listens for mousemove on the parent, writing the cursor's local
// coordinates into CSS custom properties that the radial-gradient consumes.
//
// On a coarse-pointer device (touch), there's no cursor to track, so we
// fall back to a slow auto-orbit animation defined in globals.css. The
// gradient still reads as the same brand-warm card surface; mobile just
// gets it driven by CSS keyframes instead of mouse position.
//
// Pointer-events are off so the overlay never blocks clicks on the card
// content.

type Props = {
  /** rgba spotlight color. Use a brand-tinted ~22% alpha; see accentSpotlight(). */
  color?: string;
  /** Px diameter of the spotlight halo. Default 280. */
  size?: number;
  /** Optional className overrides. */
  className?: string;
};

export function Spotlight({ color = 'rgba(93, 111, 255, 0.22)', size = 280, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();

  useEffect(() => {
    // Touch devices use the CSS-driven orbit; no listeners needed.
    if (isTouch) return;

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
  }, [isTouch]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'absolute inset-0 pointer-events-none',
        // Hover-driven path: invisible until the parent's :hover puts
        // the cursor near the gradient origin. Touch path: ambient,
        // always visible at reduced opacity, animated via keyframes.
        isTouch
          ? 'spotlight-touch'
          : 'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        className,
      )}
      style={{
        borderRadius: 'inherit',
        background: `radial-gradient(circle ${size}px at var(--mx, -200px) var(--my, -200px), ${color}, transparent 70%)`,
      }}
    />
  );
}
