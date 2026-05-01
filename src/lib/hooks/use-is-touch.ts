'use client';

import { useEffect, useState } from 'react';

// `matchMedia('(pointer: coarse)')` is the cleanest signal for "this is
// a touch device, not a mouse." Hover effects that rely on cursor
// movement are wasted on coarse-pointer devices, and conversely a few
// effects need a touch-only fallback. Both cases want the same hook.
//
// Returns false on the first render (SSR + first paint) so client/server
// markup matches; flips to true after mount on touch devices. That
// brief asymmetry is fine because the touch fallbacks are progressive
// enhancements, not load-blocking layout.

export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isTouch;
}
