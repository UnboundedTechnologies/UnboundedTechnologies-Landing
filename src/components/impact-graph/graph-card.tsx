'use client';
import { motion } from 'motion/react';
import { type ForwardedRef, forwardRef } from 'react';
import { Spotlight } from '@/components/primitives/spotlight';
import { Link, workHref } from '@/i18n/routing';
import { accentSpotlight } from '@/lib/accents';
import { cn } from '@/lib/utils';
import { COLOR_HEX, type GraphCategory, type GraphColor } from './graph-data';

const CATEGORY_LABEL: Record<GraphCategory, string> = {
  origin: 'Origin',
  capability: 'Capability',
  outcome: 'Outcome',
};

type Props = {
  label: string;
  sub: string;
  /**
   * When undefined or empty, the card renders as informational (no Link
   * wrapping). Used by case-study pages to suppress self-links on the active
   * slug. Pattern A is preserved either way: the outer motion.div remains the
   * measurement target.
   */
  href?: string;
  color: GraphColor;
  category: GraphCategory;
  index: number;
};

// The outer motion.div is the layout / measurement target that
// useCardPositions registers via ref. The inner Link (or static content) fills
// the parent so the entire card surface is clickable when linked. This
// Pattern A keeps the SVG edge geometry intact (the measured rect is
// unchanged regardless of inner element).
export const GraphCard = forwardRef<HTMLDivElement, Props>(function GraphCard(
  { label, sub, href, color, category, index }: Props,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const accent = COLOR_HEX[color];
  const number = String(index + 1).padStart(2, '0');
  const isLinked = typeof href === 'string' && href.length > 0;

  const innerContent = (
    <>
      <div
        className="font-mono text-[10px] uppercase tracking-[0.18em] flex items-center gap-2"
        style={{ color: accent }}
      >
        <span>{number}</span>
        <span aria-hidden>·</span>
        <span>{CATEGORY_LABEL[category]}</span>
      </div>
      <div className="mt-2 text-sm md:text-base font-semibold text-text leading-snug">{label}</div>
      <div className="mt-1 font-mono text-[11px] text-text-muted">{sub}</div>
    </>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-80px' }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-bg-elevated/60 backdrop-blur-md',
        'min-h-[132px]',
        isLinked &&
          'transition-colors duration-300 hover:bg-bg-elevated/85 hover:border-border-hover',
      )}
      style={{ boxShadow: `inset 3px 0 0 0 ${accent}` }}
      aria-current={isLinked ? undefined : 'page'}
    >
      <Spotlight color={accentSpotlight(color)} />
      {/* Mobile-only "tappable" affordance: a small arrow in the top-right
          corner so a phone user knows the card is a link. Desktop uses
          hover states + the cursor change for the same signal, so we
          hide this at md+. */}
      {isLinked && (
        <span
          aria-hidden
          className="md:hidden absolute top-3 right-3 z-10 text-text-faint pointer-events-none"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <title>Open</title>
            <path
              d="M5 11 L11 5 M11 5 H6.5 M11 5 V9.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      {isLinked ? (
        <Link
          href={workHref(href.replace(/^\/work\//, ''))}
          className={cn(
            'absolute inset-0 block rounded-xl px-7 py-6 flex flex-col justify-center',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          )}
        >
          {innerContent}
        </Link>
      ) : (
        <div className="absolute inset-0 block rounded-xl px-7 py-6 flex flex-col justify-center">
          {innerContent}
        </div>
      )}
    </motion.div>
  );
});
