'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { useIsTouch } from '@/lib/hooks/use-is-touch';
import { cn } from '@/lib/utils';

// "What we bring" list. Single-column commitment list (the previous
// two-column "what we don't do" version was dropped per owner direction:
// the page should welcome customers, not draw boundaries).
//
// On enter view (IntersectionObserver, threshold 0.2, fires once):
//   - Each row fades up with 8 px y-offset, staggered 100 ms per item.
//   - Each row's check icon then draws itself via SVG stroke-dashoffset
//     over 550 ms (single check stroke: M3 8 -> 6.5 11.5 -> 13 5).
//
// On hover (or focus-within) an item:
//   - The row picks up a soft cyan-tinted background (5% alpha).
//   - The icon scales 1.1.
//   - A 1px line draws across the text via scaleX from origin-left over
//     500 ms (visual underline read as commitment).
//
// prefers-reduced-motion: all transitions set to 'none' inline, icons
// appear in their final state immediately, hover only adjusts colors.

const BRING_ITEMS = [
  'bringItem1',
  'bringItem2',
  'bringItem3',
  'bringItem4',
  'bringItem5',
  'bringItem6',
] as const;

const STAGGER_MS = 100;
const FADE_MS = 500;
const ICON_DRAW_MS = 550;
const ICON_START_OFFSET_MS = 200;

export function HonestyList() {
  const t = useTranslations('servicesPage');
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isTouch = useIsTouch();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    if (mq.matches) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
            return;
          }
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto max-w-2xl">
      <Eyebrow className="mb-8">{t('bringEyebrow')}</Eyebrow>
      <ul className="space-y-2">
        {BRING_ITEMS.map((key, idx) => (
          <BringItem
            key={key}
            text={t(key)}
            inView={inView}
            delay={idx * STAGGER_MS}
            reducedMotion={reducedMotion}
            autoUnderline={isTouch}
          />
        ))}
      </ul>
    </div>
  );
}

type ItemProps = {
  text: string;
  inView: boolean;
  delay: number;
  reducedMotion: boolean;
  /** When true, the underline draws automatically as part of the
   * enter-view animation instead of waiting for hover. Used on touch
   * devices where there's no hover state to trigger it. */
  autoUnderline?: boolean;
};

function BringItem({ text, inView, delay, reducedMotion, autoUnderline = false }: ItemProps) {
  const fadeStyle: React.CSSProperties = reducedMotion
    ? { opacity: 1 }
    : {
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity ${FADE_MS}ms ease-out ${delay}ms, transform ${FADE_MS}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      };

  const strokeStyle: React.CSSProperties = reducedMotion
    ? { strokeDashoffset: 0 }
    : {
        strokeDasharray: 18,
        strokeDashoffset: inView ? 0 : 18,
        transition: `stroke-dashoffset ${ICON_DRAW_MS}ms cubic-bezier(0.65, 0, 0.35, 1) ${delay + ICON_START_OFFSET_MS}ms`,
      };

  return (
    <li
      className={cn(
        'group relative flex items-start gap-3 rounded-lg p-2 -mx-2',
        'transition-colors duration-300',
        'hover:bg-brand-cyan/[0.05] focus-within:bg-brand-cyan/[0.05]',
      )}
      style={fadeStyle}
    >
      <span
        aria-hidden
        className={cn(
          'relative mt-0.5 flex-shrink-0 inline-flex size-5 items-center justify-center rounded-full',
          'bg-brand-cyan/15 text-brand-cyan',
          'transition-transform duration-300 ease-out',
          'group-hover:scale-110 group-focus-within:scale-110',
        )}
      >
        <svg viewBox="0 0 16 16" className="size-3" fill="none">
          <title>check</title>
          <path
            d="M3 8 L6.5 11.5 L13 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={strokeStyle}
          />
        </svg>
      </span>

      <span className="relative flex-1 font-mono text-sm leading-relaxed text-text">
        {text}
        {/* Underline: on desktop draws on hover/focus; on touch (no
            hover) draws automatically as part of the enter-view sequence
            once the icon stroke has finished, giving the same visual
            beat without requiring user interaction. */}
        <span
          aria-hidden
          className={cn(
            'absolute left-0 right-0 -bottom-0.5 h-[1px] bg-brand-cyan/60 origin-left',
            'transition-transform duration-500 ease-out',
            reducedMotion && 'scale-x-0',
            !reducedMotion && autoUnderline && (inView ? 'scale-x-100' : 'scale-x-0'),
            !reducedMotion &&
              !autoUnderline &&
              'scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100',
          )}
          style={
            !reducedMotion && autoUnderline
              ? { transitionDelay: `${delay + ICON_START_OFFSET_MS + ICON_DRAW_MS}ms` }
              : undefined
          }
        />
      </span>
    </li>
  );
}
