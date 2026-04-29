'use client';
import { useEffect, useState } from 'react';
import { InfinityLogo3D } from './infinity-logo-3d';

// Layout-level WebGL Canvas owner. Mounted ONCE in [locale]/layout.tsx and
// persists across every in-app navigation, so the Canvas never has to tear
// down and rebuild. Six prior fix attempts proved that R3F + postprocessing
// + three does not survive that cycle reliably under this Next 16 + React 19
// + cacheComponents + Strict Mode + React Compiler stack.
//
// SOURCE OF TRUTH IS THE DOM, NOT PATHNAME. We tried gating visibility on
// usePathname() === '/'; on the second back-nav cycle the wrapper stayed
// display:none even though the Hero anchor was clearly in the DOM, meaning
// the pathname-derived state had gone stale (router cache restore, missed
// re-render, or React Compiler optimization). Switching to MutationObserver
// on document.body removes that reactivity dependency entirely: the Canvas
// is shown if and only if a Hero is currently rendering its anchor.
//
// Visibility model:
//   - The Canvas is ALWAYS mounted in the layout for the lifetime of the
//     session. Its WebGL context is created exactly once.
//   - On every DOM mutation, we check for `[data-hero-canvas-anchor]`. If
//     present, we ResizeObserve it and overlay the Canvas on its bounding
//     box via position:fixed. If absent, we hide via display:none and
//     pause the R3F frame loop.

const ANCHOR_SELECTOR = '[data-hero-canvas-anchor]';

type Box = { top: number; left: number; width: number; height: number };

export function PersistentInfinityLogo() {
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    let currentAnchor: Element | null = null;
    let ro: ResizeObserver | null = null;

    function readBox(target: Element) {
      const rect = target.getBoundingClientRect();
      setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }

    function reconcile() {
      const found = document.querySelector(ANCHOR_SELECTOR);
      if (found === currentAnchor) {
        // Same anchor as last reconcile: just re-read the box in case the
        // viewport changed underneath us.
        if (currentAnchor) readBox(currentAnchor);
        return;
      }

      // Anchor identity changed (Hero remounted, or Hero unmounted entirely).
      // Tear down any prior observer and either attach to the new anchor or
      // clear the box so the Canvas hides.
      ro?.disconnect();
      ro = null;
      currentAnchor = found;

      if (currentAnchor) {
        ro = new ResizeObserver(() => {
          if (currentAnchor) readBox(currentAnchor);
        });
        ro.observe(currentAnchor);
        readBox(currentAnchor);
      } else {
        setBox(null);
      }
    }

    // Initial reconcile in case the anchor is already in the DOM at mount.
    reconcile();

    // MutationObserver scoped to the body for childList/subtree changes.
    // Triggers on any insertion or removal anywhere in the tree, which is
    // exactly what we need to catch Hero mount/unmount across in-app navs.
    const mo = new MutationObserver(reconcile);
    mo.observe(document.body, { childList: true, subtree: true });

    const onScrollOrResize = () => {
      if (currentAnchor) readBox(currentAnchor);
    };
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      mo.disconnect();
      ro?.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  const visible = box !== null;

  return (
    <div
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
