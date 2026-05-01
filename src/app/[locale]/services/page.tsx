import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { SectionAtmosphere } from '@/components/atmosphere/section-atmosphere';
import { ButtonLink } from '@/components/primitives/button';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Spotlight } from '@/components/primitives/spotlight';
import { EngagementTimeline } from '@/components/services/engagement-timeline';
import { HonestyList } from '@/components/services/honesty-list';
import {
  ACCENT_TEXT_CLASS,
  accentGlowColor,
  accentHoverBorder,
  accentHoverShadow,
  accentSpotlight,
  type SolidAccent,
} from '@/lib/accents';
import { type OgLocale, ogImageMetadata } from '@/lib/og';
import { cn } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const og = ogImageMetadata(locale as OgLocale, ['services']);
  return {
    openGraph: { images: og.openGraph.images },
    twitter: og.twitter,
  };
}

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

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('servicesPage');

  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden py-20 md:py-36">
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
      <section aria-label={t('eyebrow')} className="relative overflow-hidden py-12 md:py-20">
        <SectionAtmosphere accent="blue" position="top-right" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ENGAGEMENTS.map((e, i) => {
              const accentClass = ACCENT_TEXT_CLASS[e.accent];
              return (
                <article
                  key={e.titleKey}
                  className={cn(
                    'group relative overflow-hidden bg-bg-elevated border border-border rounded-xl',
                    'p-6 md:p-8 min-h-[260px] md:min-h-[320px] flex flex-col',
                    'transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    'hover:-translate-y-1 hover:[border-color:var(--card-hover-border)] hover:shadow-[var(--card-hover-shadow)]',
                    // Touch + keyboard fallback: tapping/active gives a
                    // smaller lift so the surface acknowledges contact;
                    // focus-visible mirrors hover for keyboard users.
                    'active:-translate-y-0.5 focus-within:-translate-y-1',
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
                  <Spotlight color={accentSpotlight(e.accent)} />
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

      {/* 3. "How an engagement starts" timeline. Interactive cascade lives in
          EngagementTimeline (client component): hovering any step starts an
          auto-advancing chain that lights subsequent steps with an aurora
          fill bar growing left-to-right. */}
      <section className="relative overflow-hidden py-14 md:py-24">
        <SectionAtmosphere accent="purple" position="top-left" />
        <div className="relative mx-auto max-w-7xl px-6">
          <Eyebrow className="mb-12">{t('timelineEyebrow')}</Eyebrow>
          <EngagementTimeline />
        </div>
      </section>

      {/* 4. "What we bring" / "What we don't do" honesty list */}
      <section className="relative overflow-hidden py-14 md:py-24">
        <SectionAtmosphere accent="cyan" position="top-right" />
        <div className="relative mx-auto max-w-7xl px-6">
          <HonestyList />
        </div>
      </section>

      {/* 5. Closer CTA */}
      <section className="relative overflow-hidden py-16 md:py-32">
        <SectionAtmosphere accent="mixed" position="center" intensity={1.2} />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
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
