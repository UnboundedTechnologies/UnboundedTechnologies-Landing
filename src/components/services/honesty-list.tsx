'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { cn } from '@/lib/utils';

// "What we bring / What we don't do" honesty list with two paired animations.
//
// On enter view (IntersectionObserver, threshold 0.2, fires once):
//   - Each row fades up with 8 px y-offset, staggered 100 ms per item.
//   - Each row's icon then draws itself via SVG stroke-dashoffset:
//       Bring rows: a single check stroke (M3 8 -> 6.5 11.5 -> 13 5) over 550 ms.
//       Don't-do rows: two crossed strokes (M4 4 -> 12 12, then M12 4 -> 4 12)
//       at half the duration each, sequenced.
//
// On hover (or focus-within) an item:
//   - The row picks up a soft brand-tinted background (5 % alpha).
//   - The icon scales 1.1.
//   - The text picks up a 1 px line that draws across via scaleX from
//     origin-left over 500 ms: an underline for "bring" rows (commitment),
//     a strike-through for "don't do" rows (refusal). Same motion, two
//     semantics.
//
// prefers-reduced-motion: all transitions set to 'none' inline, icons
// appear in their final state immediately, hover only adjusts colors.

const BRING_ITEMS = ['bringItem1', 'bringItem2', 'bringItem3', 'bringItem4', 'bringItem5'] as const;
const DONT_DO_ITEMS = ['dontDoItem1', 'dontDoItem2', 'dontDoItem3'] as const;

const STAGGER_MS = 100;
const FADE_MS = 500;
const ICON_DRAW_MS = 550;
const ICON_START_OFFSET_MS = 200;

type Translator = (k: string) => string;

export function HonestyList() {
  const t = useTranslations('servicesPage');
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    if (mq.matches) {
      // Reduced-motion users see the final state immediately.
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
    <div ref={ref} className="grid md:grid-cols-2 gap-12 md:gap-16">
      <div>
        <Eyebrow className="mb-8">{t('bringEyebrow')}</Eyebrow>
        <ul className="space-y-2">
          {BRING_ITEMS.map((key, idx) => (
            <BringItem
              key={key}
              text={t(key)}
              inView={inView}
              delay={idx * STAGGER_MS}
              reducedMotion={reducedMotion}
            />
          ))}
        </ul>
      </div>
      <div>
        <Eyebrow className="mb-8 text-brand-purple">{t('dontDoEyebrow')}</Eyebrow>
        <ul className="space-y-2">
          {DONT_DO_ITEMS.map((key, idx) => (
            <DontDoItem
              key={key}
              text={t(key)}
              inView={inView}
              delay={idx * STAGGER_MS}
              reducedMotion={reducedMotion}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

type ItemProps = {
  text: string;
  inView: boolean;
  delay: number;
  reducedMotion: boolean;
};

function BringItem({ text, inView, delay, reducedMotion }: ItemProps) {
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
      {/* Check icon: single stroke that draws itself via stroke-dashoffset. */}
      <span
        aria-hidden
        className={cn(
          'relative mt-0.5 flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full',
          'bg-brand-cyan/15 text-brand-cyan',
          'transition-transform duration-300 ease-out',
          'group-hover:scale-110 group-focus-within:scale-110',
        )}
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
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

      {/* Text + animated underline (drawn on hover via scaleX). */}
      <span className="relative flex-1 font-mono text-sm leading-relaxed text-text">
        {text}
        <span
          aria-hidden
          className={cn(
            'absolute left-0 right-0 -bottom-0.5 h-[1px] bg-brand-cyan/60 origin-left',
            'transition-transform duration-500 ease-out',
            reducedMotion
              ? 'scale-x-0'
              : 'scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100',
          )}
        />
      </span>
    </li>
  );
}

function DontDoItem({ text, inView, delay, reducedMotion }: ItemProps) {
  const fadeStyle: React.CSSProperties = reducedMotion
    ? { opacity: 1 }
    : {
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity ${FADE_MS}ms ease-out ${delay}ms, transform ${FADE_MS}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      };

  // Two strokes drawn sequentially. Each takes half the total icon-draw time.
  const halfMs = ICON_DRAW_MS / 2;
  const strokeA: React.CSSProperties = reducedMotion
    ? { strokeDashoffset: 0 }
    : {
        strokeDasharray: 12,
        strokeDashoffset: inView ? 0 : 12,
        transition: `stroke-dashoffset ${halfMs}ms cubic-bezier(0.65, 0, 0.35, 1) ${delay + ICON_START_OFFSET_MS}ms`,
      };
  const strokeB: React.CSSProperties = reducedMotion
    ? { strokeDashoffset: 0 }
    : {
        strokeDasharray: 12,
        strokeDashoffset: inView ? 0 : 12,
        transition: `stroke-dashoffset ${halfMs}ms cubic-bezier(0.65, 0, 0.35, 1) ${delay + ICON_START_OFFSET_MS + halfMs}ms`,
      };

  return (
    <li
      className={cn(
        'group relative flex items-start gap-3 rounded-lg p-2 -mx-2',
        'transition-colors duration-300',
        'hover:bg-brand-purple/[0.05] focus-within:bg-brand-purple/[0.05]',
      )}
      style={fadeStyle}
    >
      {/* X icon: two crossed strokes that draw themselves in sequence. */}
      <span
        aria-hidden
        className={cn(
          'relative mt-0.5 flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full',
          'bg-brand-purple/15 text-brand-purple',
          'transition-transform duration-300 ease-out',
          'group-hover:scale-110 group-focus-within:scale-110',
        )}
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
          <title>cross</title>
          <path
            d="M4 4 L12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={strokeA}
          />
          <path
            d="M12 4 L4 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={strokeB}
          />
        </svg>
      </span>

      {/* Text + animated strike-through (drawn on hover via scaleX). */}
      <span className="relative flex-1 font-mono text-sm leading-relaxed text-text-muted transition-colors duration-300 group-hover:text-text group-focus-within:text-text">
        {text}
        <span
          aria-hidden
          className={cn(
            'absolute left-0 right-0 top-1/2 h-[1px] bg-brand-purple/60 origin-left',
            'transition-transform duration-500 ease-out',
            reducedMotion
              ? 'scale-x-0'
              : 'scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100',
          )}
        />
      </span>
    </li>
  );
}
