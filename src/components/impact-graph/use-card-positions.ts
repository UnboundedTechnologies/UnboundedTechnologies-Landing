'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export type CardRect = { x: number; y: number; width: number; height: number };

export function useCardPositions(ids: ReadonlyArray<string>) {
  const elements = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rects, setRects] = useState<Record<string, CardRect>>({});

  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerBox = container.getBoundingClientRect();
    const next: Record<string, CardRect> = {};
    for (const id of ids) {
      const el = elements.current.get(id);
      if (!el) continue;
      const box = el.getBoundingClientRect();
      next[id] = {
        x: box.left - containerBox.left,
        y: box.top - containerBox.top,
        width: box.width,
        height: box.height,
      };
    }
    setRects(next);
  }, [ids]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      recompute();
      return;
    }
    const obs = new ResizeObserver(() => recompute());
    if (containerRef.current) obs.observe(containerRef.current);
    for (const el of elements.current.values()) obs.observe(el);
    recompute();
    window.addEventListener('resize', recompute);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [recompute]);

  const register = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) elements.current.set(id, el);
      else elements.current.delete(id);
    },
    [],
  );

  return { containerRef, register, rects, recompute };
}
