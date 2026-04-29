'use client';
import { useEffect, useRef } from 'react';
import { InfinityLogo3D } from './infinity-logo-3d';

// Layout-level WebGL Canvas owner. Mounted ONCE in [locale]/layout.tsx and
// persists across every in-app navigation, so the Canvas never has to tear
// down and rebuild.
//
// The wrapper's position is driven by an imperative requestAnimationFrame
// loop that reads the Hero anchor's bounding rect and writes inline styles
// directly to the wrapper DOM node. No React state, no observers: rAF is
// the single source of truth.
//
// IMPORTANT: the wrapper is NEVER set to display:none, and never sized to
// 0x0. When no anchor is present we move it off-screen with a large negative
// top instead. Earlier versions hid via display:none and observed that the
// browser would release the WebGL GPU context for the offscreen canvas (we
// captured `[InfinityLogo3D] WebGL context lost` in the browser console).
// When the user navigated back to /en the context was dead and the canvas
// could not redraw. Keeping the canvas continuously on the layer tree, even
// if positioned outside the viewport, keeps the context alive.

const ANCHOR_SELECTOR = '[data-hero-canvas-anchor]';
const OFFSCREEN_TOP = -10000;

export function PersistentInfinityLogo() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    let lastKey = '';

    function applyOffscreen() {
      const w = wrapperRef.current;
      if (!w) return;
      const key = 'offscreen';
      if (key === lastKey) return;
      lastKey = key;
      w.style.top = `${OFFSCREEN_TOP}px`;
      w.style.left = '0px';
      w.style.width = '400px';
      w.style.height = '400px';
      w.setAttribute('aria-hidden', 'true');
    }

    function applyRect(rect: DOMRect) {
      const w = wrapperRef.current;
      if (!w) return;
      const key = `${rect.top}|${rect.left}|${rect.width}|${rect.height}`;
      if (key === lastKey) return;
      lastKey = key;
      w.style.top = `${rect.top}px`;
      w.style.left = `${rect.left}px`;
      w.style.width = `${rect.width}px`;
      w.style.height = `${rect.height}px`;
      w.setAttribute('aria-hidden', 'false');
    }

    function tick() {
      raf = requestAnimationFrame(tick);
      const anchor = document.querySelector(ANCHOR_SELECTOR);
      if (!anchor) {
        applyOffscreen();
        return;
      }
      const rect = anchor.getBoundingClientRect();
      // Treat zero-sized anchors as "not yet laid out"; stay offscreen until
      // the layout settles so we never present a 0x0 canvas.
      if (rect.width === 0 || rect.height === 0) {
        applyOffscreen();
        return;
      }
      applyRect(rect);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // SSR markup must match what the browser sees on first paint to keep
  // hydration clean. We render position:fixed at the offscreen position so
  // the rAF loop does not have to fight an initial `display:none` step.
  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: `${OFFSCREEN_TOP}px`,
        left: 0,
        width: '400px',
        height: '400px',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <InfinityLogo3D />
    </div>
  );
}
