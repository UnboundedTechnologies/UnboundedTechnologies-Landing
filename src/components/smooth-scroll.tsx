'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

/**
 * Mounts a Lenis smooth-scroll loop for the lifetime of the page. The lerp
 * value picks how quickly the actual scroll catches up to the target on each
 * frame (lower = slower, smoother glide); 0.075 lands close to Apple's
 * marketing-page feel without lagging past comfortable.
 *
 * Respects prefers-reduced-motion: when the user opts out of motion we leave
 * native scroll alone entirely.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
