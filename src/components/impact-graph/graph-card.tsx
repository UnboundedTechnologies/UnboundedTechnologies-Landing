'use client';
import { motion } from 'motion/react';
import { type ForwardedRef, forwardRef } from 'react';
import { Link } from '@/i18n/routing';
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
  href: string;
  color: GraphColor;
  category: GraphCategory;
  index: number;
};

// The outer motion.div is the layout / measurement target that
// useCardPositions registers via ref. The inner Link fills the parent so the
// entire card surface is clickable. This Pattern A keeps the SVG edge
// geometry intact (the measured rect is unchanged).
export const GraphCard = forwardRef<HTMLDivElement, Props>(function GraphCard(
  { label, sub, href, color, category, index }: Props,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const accent = COLOR_HEX[color];
  const number = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-80px' }}
      className={cn(
        'relative rounded-xl border border-border bg-bg-elevated/60 backdrop-blur-md',
        'min-h-[132px]',
        'transition-colors duration-300 hover:bg-bg-elevated/85 hover:border-border-hover',
      )}
      style={{ boxShadow: `inset 3px 0 0 0 ${accent}` }}
    >
      <Link
        href={href as Parameters<typeof Link>[0]['href']}
        className={cn(
          'absolute inset-0 block rounded-xl px-7 py-6 flex flex-col justify-center',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        )}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.18em] flex items-center gap-2"
          style={{ color: accent }}
        >
          <span>{number}</span>
          <span aria-hidden>·</span>
          <span>{CATEGORY_LABEL[category]}</span>
        </div>
        <div className="mt-2 text-sm md:text-base font-semibold text-text leading-snug">
          {label}
        </div>
        <div className="mt-1 font-mono text-[11px] text-text-muted">{sub}</div>
      </Link>
    </motion.div>
  );
});
