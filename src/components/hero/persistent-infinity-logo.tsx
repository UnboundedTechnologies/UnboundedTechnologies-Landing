'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { CanvasErrorBoundary } from './canvas-error-boundary';
import { InfinityLogoStatic } from './infinity-logo-static';

// Dynamic import for InfinityLogo3D so the Three.js + R3F + drei +
// postprocessing bundles (~354 KiB) are NOT shipped on pages that don't
// have a hero anchor. Without this, navigating to /services or /about pulls
// the entire R3F runtime even though no Canvas ever renders there - which
// shows up as "Reduce unused JavaScript" in PSI / Lighthouse and tanks TBT.
// `ssr: false` because the canvas is client-only anyway, and a null fallback
// because the wrapper handles "anchor present" gating below.
const InfinityLogo3D = dynamic(
  () => import('./infinity-logo-3d').then((m) => ({ default: m.InfinityLogo3D })),
  { ssr: false, loading: () => null },
);

// Layout-level WebGL Canvas owner. Mounted ONCE in app/layout.tsx and
// persists across every in-app navigation, so the Canvas never has to tear
// down and rebuild.
//
// Positioning model: position:absolute relative to <html>, with top/left
// computed in DOCUMENT coordinates from the hero anchor's bounding rect
// (rect.top + window.scrollY). The wrapper scrolls naturally with the page
// because it is in the document flow's positioning context, not the
// viewport's. iOS Safari has a long-standing visual lag when the styles of
// position:fixed elements update during momentum scroll; using
// position:absolute sidesteps that entirely. The browser handles scroll
// natively, and our rAF loop only writes when layout actually changes
// (during pure scroll, the document coords don't change so the key check
// short-circuits and no DOM writes happen).
//
// IMPORTANT: the wrapper is NEVER set to display:none, and never sized to
// 0x0. When no anchor is present we move it off-screen with a large negative
// top instead. Earlier versions hid via display:none and observed that the
// browser would release the WebGL GPU context for the offscreen canvas (we
// captured `[InfinityLogo3D] WebGL context lost` in the browser console).
// Keeping the canvas continuously on the layer tree, even if positioned
// outside the viewport in document coords, keeps the context alive.

const ANCHOR_SELECTOR = '[data-hero-canvas-anchor]';
const OFFSCREEN_TOP = -10000;

export function PersistentInfinityLogo() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // hasAnchor flips state-only when an anchor presence/absence transition
  // happens (NOT every rAF tick) so the InfinityLogo3D dynamic chunk is
  // requested only on pages that actually have a hero. The hasAnchorRef
  // mirrors the state inside the rAF closure to avoid stale-closure reads.
  const [hasAnchor, setHasAnchor] = useState(false);
  const hasAnchorRef = useRef(false);

  useEffect(() => {
    let raf = 0;
    let lastKey = '';

    function applyOffscreen() {
      const w = wrapperRef.current;
      if (!w) return;
      if (hasAnchorRef.current) {
        hasAnchorRef.current = false;
        setHasAnchor(false);
      }
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
      if (!hasAnchorRef.current) {
        hasAnchorRef.current = true;
        setHasAnchor(true);
      }
      // Convert viewport-relative rect to document-relative coords so the
      // wrapper can use position:absolute and scroll natively with the
      // page. On iOS Safari this avoids the position:fixed momentum-scroll
      // lag where JS-driven style updates trail the actual scroll.
      const docTop = rect.top + window.scrollY;
      const docLeft = rect.left + window.scrollX;
      const key = `${docTop}|${docLeft}|${rect.width}|${rect.height}`;
      if (key === lastKey) return;
      lastKey = key;
      w.style.top = `${docTop}px`;
      w.style.left = `${docLeft}px`;
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
  // hydration clean. We render position:absolute at the offscreen position
  // so the rAF loop does not have to fight an initial `display:none` step.
  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: `${OFFSCREEN_TOP}px`,
        left: 0,
        width: '400px',
        height: '400px',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {/* Conditionally mount InfinityLogo3D only when a hero anchor is on
          the page. Pages without a hero (services, about, work index, contact,
          legal) skip the Three.js + R3F bundle entirely - that's the 354 KiB
          unused-JS savings PSI was flagging. */}
      {hasAnchor ? (
        <CanvasErrorBoundary
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <InfinityLogoStatic className="w-64 h-40 drop-shadow-[0_0_40px_rgba(124,142,255,0.6)]" />
            </div>
          }
        >
          <InfinityLogo3D />
        </CanvasErrorBoundary>
      ) : null}
    </div>
  );
}
