'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from '@/i18n/routing';
import { InfinityLogo3D } from './infinity-logo-3d';

// Layout-level WebGL Canvas owner. Mounted ONCE in [locale]/layout.tsx and
// persists across every in-app navigation, so the Canvas never has to tear
// down and rebuild. Six prior fix attempts proved that R3F + postprocessing
// + three does not survive that cycle reliably under this Next 16 + React 19
// + cacheComponents + Strict Mode + React Compiler stack.
//
// Visibility is controlled by:
// 1. The current pathname (homepage only).
// 2. The presence of a `[data-hero-canvas-anchor]` element in the DOM, which
//    the Hero renders inside its right column. The Canvas position-tracks the
//    anchor via ResizeObserver + scroll/resize listeners and overlays it with
//    position:fixed.
//
// When hidden, the Canvas keeps its WebGL context alive but pauses its R3F
// frame loop (frameloop="never") so it does not burn cycles on other routes.

const ANCHOR_SELECTOR = '[data-hero-canvas-anchor]';

type Box = { top: number; left: number; width: number; height: number };

export function PersistentInfinityLogo() {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  // Track the anchor element. Re-runs on every nav so we re-attach to a fresh
  // anchor each time the Hero remounts. ResizeObserver + scroll/resize listeners
  // keep the box live as the page reflows or scrolls.
  useEffect(() => {
    if (!isHomepage) {
      setBox(null);
      return;
    }

    let anchor: Element | null = null;
    let ro: ResizeObserver | null = null;
    let cancelled = false;

    function readBox() {
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }

    function attach() {
      if (cancelled) return;
      anchor = document.querySelector(ANCHOR_SELECTOR);
      if (!anchor) {
        // Hero has not painted yet; retry on the next frame. This loop ends
        // when either the anchor appears or the effect cleans up.
        requestAnimationFrame(attach);
        return;
      }
      ro = new ResizeObserver(readBox);
      ro.observe(anchor);
      readBox();
    }

    attach();

    const onScrollOrResize = () => readBox();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      cancelled = true;
      ro?.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isHomepage]);

  const visible = isHomepage && box !== null;

  // The Canvas is ALWAYS rendered (never unmounts). We control its visual
  // presence with display:none when off-route and with the box-tracked
  // fixed-position styles when on-route. R3F's frameloop is paused when the
  // Canvas is not visible so it costs nothing on /contact, /about, etc.
  return (
    <div
      ref={containerRef}
      aria-hidden={!visible}
      style={
        visible
          ? {
              position: 'fixed',
              top: `${box.top}px`,
              left: `${box.left}px`,
              width: `${box.width}px`,
              height: `${box.height}px`,
              pointerEvents: 'none',
              zIndex: 5,
            }
          : { display: 'none' }
      }
    >
      <InfinityLogo3D paused={!visible} />
    </div>
  );
}
