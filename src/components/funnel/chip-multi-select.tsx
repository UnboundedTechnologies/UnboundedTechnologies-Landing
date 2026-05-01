'use client';

import { cn } from '@/lib/utils';

// Generic chip multi-select. Used for project types on the contact form;
// kept generic so additional chip-style fields can reuse it later. Each chip
// is a real <button type="button"> so keyboard users get focus rings and
// space/enter selection without extra wiring.
type Option<V extends string> = { value: V; label: string };

type Props<V extends string> = {
  options: ReadonlyArray<Option<V>>;
  value: ReadonlyArray<V>;
  onChange: (next: V[]) => void;
  ariaLabel?: string;
  hasError?: boolean;
};

export function ChipMultiSelect<V extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  hasError,
}: Props<V>) {
  const toggle = (v: V) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  };

  return (
    <fieldset
      aria-label={ariaLabel}
      className={cn(
        'flex flex-wrap gap-2 border-0 p-0 m-0',
        hasError && 'ring-1 ring-error/40 rounded-md p-1 -m-1',
      )}
    >
      {options.map((opt) => {
        const active = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(opt.value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-mono tracking-wide',
              'transition-[background-color,border-color,color] duration-[var(--duration-short)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              active
                ? 'border-brand-blue/50 bg-brand-blue/15 text-brand-blue'
                : 'border-border bg-surface text-text-muted hover:border-border-hover hover:bg-surface-hover hover:text-text',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </fieldset>
  );
}
