'use client';
import { motion } from 'motion/react';
import { type ForwardedRef, forwardRef } from 'react';
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
  color: GraphColor;
  category: GraphCategory;
  index: number;
};

export const GraphCard = forwardRef<HTMLDivElement, Props>(function GraphCard(
  { label, sub, color, category, index }: Props,
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
        'px-5 py-4 min-h-[96px] flex flex-col justify-center',
        'transition-colors duration-300 hover:bg-bg-elevated/85 hover:border-border-hover',
      )}
      style={{ boxShadow: `inset 3px 0 0 0 ${accent}` }}
    >
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
    </motion.div>
  );
});
