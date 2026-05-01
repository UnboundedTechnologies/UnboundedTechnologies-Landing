import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { ButtonLink } from '@/components/primitives/button';
import { Eyebrow } from '@/components/primitives/eyebrow';
import {
  ACCENT_TEXT_CLASS,
  accentGlowColor,
  accentHoverBorder,
  accentHoverShadow,
  type SolidAccent,
} from '@/lib/accents';
import { cn } from '@/lib/utils';

// `/services` Engagement Models page (Phase 8.1).
//
// Five sections, top to bottom:
//   1. Hero (Aurora orbs, eyebrow, two-line headline with aurora-text accent,
//      subhead).
//   2. Three engagement-model cards (Fixed-Fee SOW / Retainer / Embedded),
//      each with its own brand accent. Reuses the homepage services-pillars
//      styling pattern (corner glow + hover lift + brand-tinted hover border).
//   3. "How an engagement starts" linear timeline of six steps. Renders as a
//      vertical stack on mobile and a six-column grid on md+ with light
//      connecting lines between numbered nodes.
//   4. "What we bring" / "What we don't do" two-column honesty list with
//      check / x markers and mono labels.
//   5. Closer CTA (centered headline + gradient ButtonLink to /contact).
//
// Per-card brand metadata (text class, glow color, hover border, hover shadow)
// comes from `src/lib/accents.ts` so this surface stays in lockstep with the
// homepage `services-pillars` component.

type Engagement = {
  accent: SolidAccent;
  numKey: string;
  titleKey: string;
  bodyKey: string;
  tagKeys: readonly [string, string, string];
};

const ENGAGEMENTS: ReadonlyArray<Engagement> = [
  {
    accent: 'blue',
    numKey: 'sowNumber',
    titleKey: 'sowTitle',
    bodyKey: 'sowBody',
    tagKeys: ['sowTag1', 'sowTag2', 'sowTag3'],
  },
  {
    accent: 'purple',
    numKey: 'retainerNumber',
    titleKey: 'retainerTitle',
    bodyKey: 'retainerBody',
    tagKeys: ['retainerTag1', 'retainerTag2', 'retainerTag3'],
  },
  {
    accent: 'cyan',
    numKey: 'embeddedNumber',
    titleKey: 'embeddedTitle',
    bodyKey: 'embeddedBody',
    tagKeys: ['embeddedTag1', 'embeddedTag2', 'embeddedTag3'],
  },
];

const TIMELINE_STEPS = [
  { titleKey: 'step1Title', bodyKey: 'step1Body' },
  { titleKey: 'step2Title', bodyKey: 'step2Body' },
  { titleKey: 'step3Title', bodyKey: 'step3Body' },
  { titleKey: 'step4Title', bodyKey: 'step4Body' },
  { titleKey: 'step5Title', bodyKey: 'step5Body' },
  { titleKey: 'step6Title', bodyKey: 'step6Body' },
] as const;

const BRING_ITEMS = ['bringItem1', 'bringItem2', 'bringItem3', 'bringItem4', 'bringItem5'] as const;
const DONT_DO_ITEMS = ['dontDoItem1', 'dontDoItem2', 'dontDoItem3'] as const;

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('servicesPage');

  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden py-28 md:py-36">
        <AuroraOrbs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[1.05] max-w-3xl">
            {t('headlineLead')}
            <br />
            <span className="aurora-text">{t('headlineAccent')}</span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-text-muted max-w-xl leading-relaxed">
            {t('subhead')}
          </p>
        </div>
      </section>

      {/* 2. Three engagement-model cards */}
      <section aria-label={t('eyebrow')} className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ENGAGEMENTS.map((e, i) => {
              const accentClass = ACCENT_TEXT_CLASS[e.accent];
              return (
                <article
                  key={e.titleKey}
                  className={cn(
                    'group relative overflow-hidden bg-bg-elevated border border-border rounded-xl',
                    'p-8 min-h-[320px] flex flex-col',
                    'transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    'hover:-translate-y-1 hover:[border-color:var(--card-hover-border)] hover:shadow-[var(--card-hover-shadow)]',
                  )}
                  style={
                    {
                      ['--card-hover-border' as string]: accentHoverBorder(e.accent),
                      ['--card-hover-shadow' as string]: accentHoverShadow(e.accent),
                    } as React.CSSProperties
                  }
                >
                  {/* Corner glow overlay. */}
                  <div
                    aria-hidden
                    className="services-orb absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                    style={{
                      background: accentGlowColor(e.accent, 0),
                      animationDelay: `${i * 1500}ms`,
                    }}
                  />
                  <div
                    className={cn(
                      'relative font-mono text-xs tracking-[0.18em] mb-4',
                      'transition-[letter-spacing] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                      'group-hover:tracking-[0.3em]',
                      accentClass,
                    )}
                  >
                    {t(e.numKey)}
                  </div>
                  <h3 className="relative text-xl md:text-2xl font-semibold tracking-tight mb-3">
                    {t(e.titleKey)}
                  </h3>
                  <p className="relative text-sm md:text-base text-text-muted leading-relaxed mb-6">
                    {t(e.bodyKey)}
                  </p>
                  <div className="relative flex flex-wrap gap-2 mt-auto">
                    {e.tagKeys.map((tagKey) => (
                      <span
                        key={tagKey}
                        className={cn(
                          'font-mono text-[10px] px-2 py-1 rounded bg-surface',
                          'transition-[background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                          'group-hover:bg-surface-hover',
                          accentClass,
                        )}
                      >
                        {t(tagKey)}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. "How an engagement starts" timeline */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Eyebrow className="mb-12">{t('timelineEyebrow')}</Eyebrow>
          <ol className="grid grid-cols-1 md:grid-cols-6 gap-10 md:gap-4 relative">
            {/* Connecting line on md+ behind the number circles. */}
            <div
              aria-hidden
              className="hidden md:block absolute top-5 left-[8.333%] right-[8.333%] h-px bg-gradient-to-r from-transparent via-border to-transparent"
            />
            {TIMELINE_STEPS.map((step, idx) => (
              <li
                key={step.titleKey}
                className="relative flex flex-col items-start md:items-center"
              >
                <div
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full',
                    'border border-border bg-bg-elevated font-mono text-xs tracking-widest text-brand-blue',
                  )}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="mt-4 md:text-center text-sm md:text-base font-semibold text-text leading-snug">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-2 md:text-center text-xs md:text-sm text-text-muted leading-relaxed max-w-[16rem]">
                  {t(step.bodyKey)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. "What we bring" / "What we don't do" honesty list */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <Eyebrow className="mb-8">{t('bringEyebrow')}</Eyebrow>
              <ul className="space-y-4">
                {BRING_ITEMS.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-cyan/15 text-brand-cyan font-mono text-xs"
                    >
                      {'✓'}
                    </span>
                    <span className="font-mono text-sm text-text leading-relaxed">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Eyebrow className="mb-8 text-brand-purple">{t('dontDoEyebrow')}</Eyebrow>
              <ul className="space-y-4">
                {DONT_DO_ITEMS.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple/15 text-brand-purple font-mono text-xs"
                    >
                      {'×'}
                    </span>
                    <span className="font-mono text-sm text-text leading-relaxed">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Closer CTA */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-tight">
            {t('closerHeadline')}
          </h2>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/contact" variant="gradient">
              {t('closerCta')}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
