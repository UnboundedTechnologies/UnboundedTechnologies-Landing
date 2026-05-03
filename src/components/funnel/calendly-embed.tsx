'use client';

// Branded "Book a call" CTA card. Replaced the inline Calendly iframe
// because the free-tier embed cannot be cleanly responsive (background /
// text / primary color settings are Pro-only, leaving white margins
// around the dark booking card on every viewport). Outbound link sidesteps
// that constraint entirely and gives us full control over the visual.
//
// The component name + props (`{ url }`) match the original so the parent
// thank-you-screen needs no edits. URL stays a server-side env var
// (CALENDLY_URL) read in /contact/page.tsx and threaded through.

import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Spotlight } from '@/components/primitives/spotlight';
import { cn } from '@/lib/utils';

type Props = {
  url: string | undefined;
};

export function CalendlyEmbed({ url }: Props) {
  const t = useTranslations('contactPage.thankYou.bookCard');

  if (!url) {
    return (
      <div className="rounded-2xl border border-border bg-bg-elevated p-8 text-center">
        <p className="text-sm text-text-muted">Calendly is not configured in this environment.</p>
        <p className="mt-2 text-sm text-text-muted">
          Email{' '}
          <a
            className="text-brand-blue hover:underline"
            href="mailto:contact@unboundedtechnologies.com"
          >
            contact@unboundedtechnologies.com
          </a>{' '}
          to schedule.
        </p>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group relative block overflow-hidden rounded-2xl',
        'border border-white/[0.08] bg-bg-elevated/70 backdrop-blur-xl backdrop-saturate-150',
        'p-8 md:p-12',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_-12px_rgba(0,0,0,0.4)]',
        'transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-0.5 hover:border-brand-blue/40',
        'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_-16px_rgba(93,111,255,0.4)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'active:-translate-y-0',
      )}
    >
      <Spotlight color="rgba(93, 111, 255, 0.22)" size={360} />

      {/* Drifting brand-blue corner glow. Inherits services-orb keyframe
          from globals.css so it matches every other card on the site. */}
      <div
        aria-hidden
        className="services-orb absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(93, 111, 255, 0.30)' }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(163, 93, 255, 0.18)' }}
      />

      <div className="relative">
        {/* Calendar icon with halo */}
        <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center">
          <div aria-hidden className="absolute inset-0 rounded-full bg-brand-blue/20 blur-xl" />
          <svg
            viewBox="0 0 24 24"
            className="relative h-7 w-7 text-brand-blue"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <title>Calendar</title>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10 H21" />
            <path d="M8 3 V7 M16 3 V7" />
            <circle cx="8.5" cy="14.5" r="1" fill="currentColor" />
            <circle cx="12" cy="14.5" r="1" fill="currentColor" />
            <circle cx="15.5" cy="14.5" r="1" fill="currentColor" />
          </svg>
        </div>

        <Eyebrow className="text-center">{t('eyebrow')}</Eyebrow>

        <h3 className="mt-5 text-center text-2xl md:text-3xl font-semibold tracking-[-0.03em] leading-tight">
          {t('heading')}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-center text-sm md:text-base text-text-muted leading-relaxed">
          {t('subhead')}
        </p>

        {/* Badges row */}
        <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-brand-blue" aria-hidden />
            {t('badgeDuration')}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-brand-purple" aria-hidden />
            {t('badgeMedium')}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-brand-cyan" aria-hidden />
            {t('badgeInvite')}
          </span>
        </div>

        {/* CTA button. Visual only - the entire card is the link, this just
            announces the action. group-hover gives the arrow a 2px nudge. */}
        <div className="mt-8 flex justify-center">
          <span
            className={cn(
              'inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-sm font-semibold',
              'bg-gradient-to-r from-brand-blue to-brand-purple text-white',
              'shadow-lg shadow-brand-purple/20',
              'transition-[transform,box-shadow] duration-300',
              'group-hover:shadow-xl group-hover:shadow-brand-purple/30',
            )}
          >
            {t('cta')}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>

        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          {t('opensInNewTab')}
        </p>
      </div>
    </a>
  );
}
