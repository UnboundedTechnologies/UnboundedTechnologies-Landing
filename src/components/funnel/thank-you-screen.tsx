'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Spotlight } from '@/components/primitives/spotlight';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { CalendlyEmbed } from './calendly-embed';

// Thank-you screen, two branches:
//   - qualified: celebration card + Calendly inline widget below so the
//     user can book directly without an extra step.
//   - exploratory: same celebration card, no calendar nudge, no phone.
//
// Mount-driven entrance animation:
//   1. Card itself fades + scales from 0.96 to 1 (520 ms).
//   2. Brand-blue ring scales in around the check icon (320 ms, springy).
//   3. Check stroke draws itself via stroke-dashoffset (480 ms, sequenced
//      after the ring).
//   4. Eyebrow + headline + body fade up in sequence with 90 ms staggers
//      so the eye lands on each piece in order rather than all at once.
//
// prefers-reduced-motion: card appears in final state immediately, no
// transitions; the check icon is rendered fully drawn.

type Props = {
  status: 'qualified' | 'exploratory';
  calendlyUrl: string | undefined;
};

export function ThankYouScreen({ status, calendlyUrl }: Props) {
  const t = useTranslations('contactPage.thankYou');
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    // Defer the mount flag a tick so initial styles register before the
    // transition kicks off; without this the browser collapses the start
    // and end states and skips the animation entirely.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const animate = mounted && !reducedMotion;

  return (
    <div className="mx-auto max-w-2xl">
      <div
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-border bg-bg-elevated',
          'p-6 md:p-14 text-center',
          'transition-[opacity,transform] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          animate ? 'opacity-100 scale-100' : reducedMotion ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]',
        )}
      >
        <Spotlight color="rgba(93, 111, 255, 0.22)" size={320} />
        {/* Soft brand-blue glow drifting in the top-right corner. */}
        <div
          aria-hidden
          className="services-orb absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(93, 111, 255, 0.35)' }}
        />
        {/* And a brand-purple match in the bottom-left for symmetry. */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(163, 93, 255, 0.25)' }}
        />

        {/* Check icon: ring scales in, then stroke draws itself. */}
        <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center">
          {/* Outer halo (always visible, low alpha). */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-brand-blue/15"
            style={{ filter: 'blur(8px)' }}
          />
          {/* Ring that scales in. */}
          <div
            aria-hidden
            className={cn(
              'absolute inset-0 rounded-full border-2 border-brand-blue',
              'transition-transform duration-[320ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
              animate ? 'scale-100' : reducedMotion ? 'scale-100' : 'scale-0',
            )}
          />
          {/* Filled inner pad. */}
          <div
            aria-hidden
            className={cn(
              'absolute inset-1.5 rounded-full bg-brand-blue/15',
              'transition-opacity duration-[320ms]',
              animate ? 'opacity-100' : reducedMotion ? 'opacity-100' : 'opacity-0',
            )}
            style={{ transitionDelay: animate ? '120ms' : '0ms' }}
          />
          {/* Check stroke. */}
          <svg viewBox="0 0 24 24" className="relative h-9 w-9" fill="none">
            <title>check</title>
            <path
              d="M5 12 L10 17 L19 8"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={
                reducedMotion
                  ? { strokeDashoffset: 0 }
                  : {
                      strokeDasharray: 26,
                      strokeDashoffset: animate ? 0 : 26,
                      transition: 'stroke-dashoffset 480ms cubic-bezier(0.65, 0, 0.35, 1) 360ms',
                    }
              }
            />
          </svg>
        </div>

        {/* Eyebrow */}
        <div
          className={cn(
            'transition-[opacity,transform] duration-[480ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            animate ? 'opacity-100 translate-y-0' : reducedMotion ? 'opacity-100' : 'opacity-0 translate-y-2',
          )}
          style={{ transitionDelay: animate ? '700ms' : '0ms' }}
        >
          <Eyebrow className="text-center">
            {status === 'qualified' ? t('qualifiedEyebrow') : t('exploratoryEyebrow')}
          </Eyebrow>
        </div>

        {/* Headline */}
        <h2
          className={cn(
            'mt-5 text-2xl md:text-3xl font-semibold tracking-[-0.03em] leading-tight',
            'transition-[opacity,transform] duration-[480ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            animate ? 'opacity-100 translate-y-0' : reducedMotion ? 'opacity-100' : 'opacity-0 translate-y-2',
          )}
          style={{ transitionDelay: animate ? '790ms' : '0ms' }}
        >
          {status === 'qualified' ? t('qualifiedHeadline') : t('exploratoryHeadline')}
        </h2>

        {/* Body */}
        <p
          className={cn(
            'mx-auto mt-4 max-w-md text-sm md:text-base text-text-muted leading-relaxed',
            'transition-[opacity,transform] duration-[480ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            animate ? 'opacity-100 translate-y-0' : reducedMotion ? 'opacity-100' : 'opacity-0 translate-y-2',
          )}
          style={{ transitionDelay: animate ? '880ms' : '0ms' }}
        >
          {status === 'qualified' ? t('qualifiedBody') : t('exploratoryBody')}
        </p>

        {/* Back to home */}
        <div
          className={cn(
            'mt-8',
            'transition-opacity duration-[480ms]',
            animate ? 'opacity-100' : reducedMotion ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transitionDelay: animate ? '970ms' : '0ms' }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-text transition-colors"
          >
            <span aria-hidden>&larr;</span> {t('backLabel')}
          </Link>
        </div>
      </div>

      {/* Calendly only on the qualified branch, below the celebration card. */}
      {status === 'qualified' && (
        <div className="mt-10">
          <Eyebrow className="mb-5">{t('qualifiedCalendlyEyebrow')}</Eyebrow>
          <CalendlyEmbed url={calendlyUrl} />
        </div>
      )}
    </div>
  );
}
