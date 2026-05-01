'use client';

// Visible break between two adjacent cards on mobile when they belong to
// different case studies (no edge connects them, and on desktop they sit
// in different rows of the impact graph). Without this, the empty grid
// gap between e.g. "Amazon Connect" (end of AWS narrative) and "2,500
// internal clients" (start of Renault narrative) reads as a missing
// connector / bug. With this, the user sees a clear "next case starts
// here" signal.
//
// Renders as a centered pill with a small hairline on each side. The
// label is derived from the case-study slug for now; could later come
// from an i18n key per slug if we want fancier copy.

const SLUG_LABEL: Record<string, string> = {
  'aws-connect-ivr': 'AWS · Customer Reach',
  'renault-forex': 'Renault · Forex Platform',
  'etba-erp': 'ETBA · Procurement',
  'bmo-platform': 'BMO · Platform',
};

type Props = {
  /** href of the case study the next card belongs to. */
  nextHref: string;
};

export function MobileGraphBreak({ nextHref }: Props) {
  const slug = nextHref.replace(/^\/work\//, '');
  const label = SLUG_LABEL[slug] ?? slug.replace(/-/g, ' ');

  return (
    <div className="md:hidden flex items-center gap-3 my-8">
      <span aria-hidden className="flex-1 h-px bg-border" />
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint whitespace-nowrap">
        {label}
      </span>
      <span aria-hidden className="flex-1 h-px bg-border" />
    </div>
  );
}
