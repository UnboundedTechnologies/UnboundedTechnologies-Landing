'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

// Single-line hourly-rate slider. Native <input type="range"> for keyboard
// + screen-reader support; styled to match the dark form palette via
// `accent-color` and a CSS-painted track that fills proportionally to
// match brand-blue. The current value renders inline (large, mono) above
// the track so the user always knows the exact rate they're committing to.
//
// HST is not collected as a separate field - it's a function of the rate
// and the buyer's province. The "+ HST" suffix is rendered as part of the
// readout so the buyer sees the all-in formulation.

type Props = {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
  ariaLabel?: string;
  suffix: string;
};

export function HourlyRateSlider({
  value,
  onChange,
  min,
  max,
  step,
  ariaLabel,
  suffix,
}: Props) {
  const id = useId();
  const fillPct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl md:text-3xl font-semibold tracking-tight text-text">
            CAD ${value}
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
            {suffix}
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          {min} - {max}
        </div>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'block w-full appearance-none bg-transparent cursor-pointer',
          // Track + filled portion painted via a single linear-gradient
          // background on the input itself. The thumb gets re-styled per
          // pseudo-element below for cross-browser parity.
          '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full',
          '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full',
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
          '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-blue',
          '[&::-webkit-slider-thumb]:-mt-[7px]',
          '[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(93,111,255,0.5)]',
          '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150',
          'hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-110',
          '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5',
          '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white',
          '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-blue',
          '[&::-moz-range-thumb]:shadow-[0_0_12px_rgba(93,111,255,0.5)]',
          'focus-visible:outline-none focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-brand-blue/50',
        )}
        style={
          {
            // Filled portion uses a brand-blue gradient that fades to
            // border at the current value position. The right side stays
            // muted so the "what's left to pick" range reads as inactive.
            background: `linear-gradient(to right, rgba(93,111,255,1) 0%, rgba(163,93,255,1) ${fillPct}%, rgba(255,255,255,0.08) ${fillPct}%, rgba(255,255,255,0.08) 100%)`,
            backgroundSize: '100% 6px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left center',
          } as React.CSSProperties
        }
      />
    </div>
  );
}
