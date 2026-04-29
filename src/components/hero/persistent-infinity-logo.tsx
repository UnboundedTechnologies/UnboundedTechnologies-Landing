'use client';
import { useEffect, useState } from 'react';
import { InfinityLogo3D } from './infinity-logo-3d';

// Layout-level WebGL Canvas owner. See project_back_nav_bug.md / commit history
// for the full story; in short: the Canvas is mounted ONCE in the layout and
// never tears down across in-app navigation. Visibility is determined by
// whether `[data-hero-canvas-anchor]` exists in the DOM.
//
// Diagnostic build: console.logs are intentionally present while the back-nav
// bug is being chased. Once the fix lands and is verified, the logs go away.

const ANCHOR_SELECTOR = '[data-hero-canvas-anchor]';
const LOG_PREFIX = '[PersistentInfinityLogo]';

type Box = { top: number; left: number; width: number; height: number };

export function PersistentInfinityLogo() {
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    console.log(`${LOG_PREFIX} effect mount`);
    let currentAnchor: Element | null = null;
    let ro: ResizeObserver | null = null;
    let reconcileCount = 0;

    function readBox(target: Element) {
      const rect = target.getBoundingClientRect();
      console.log(`${LOG_PREFIX} readBox`, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }

    function reconcile(reason: string) {
      reconcileCount += 1;
      const found = document.querySelector(ANCHOR_SELECTOR);
      console.log(`${LOG_PREFIX} reconcile #${reconcileCount} reason=${reason}`, {
        foundAnchor: !!found,
        sameAsCurrent: found === currentAnchor,
        currentAnchorWas: !!currentAnchor,
      });
      if (found === currentAnchor) {
        if (currentAnchor) readBox(currentAnchor);
        return;
      }
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
        console.log(`${LOG_PREFIX} clearing box (no anchor)`);
        setBox(null);
      }
    }

    reconcile('initial');

    const mo = new MutationObserver(() => reconcile('mutation'));
    mo.observe(document.body, { childList: true, subtree: true });

    const onScrollOrResize = () => {
      if (currentAnchor) readBox(currentAnchor);
    };
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      console.log(`${LOG_PREFIX} effect cleanup`);
      mo.disconnect();
      ro?.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  const visible = box !== null;
  console.log(`${LOG_PREFIX} render`, { visible, box });

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
