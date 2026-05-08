import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Spotlight } from '@/components/primitives/spotlight';
import { Link, workHref } from '@/i18n/routing';
import { ACCENT_TEXT_CLASS, accentSpotlight } from '@/lib/accents';
import { getAllCaseStudies, type Locale } from '@/lib/case-studies';
import { type OgLocale, ogImageMetadata } from '@/lib/og';
import { cn } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // EN uses /work, FR uses /travaux. Mirror in the OG path so a tracker that
  // round-trips share URLs sees a coherent locale-prefixed shape.
  const segment = locale === 'fr' ? 'travaux' : 'work';
  const og = ogImageMetadata(locale as OgLocale, [segment]);
  return {
    openGraph: { images: og.openGraph.images },
    twitter: og.twitter,
  };
}

export default async function WorkIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, studies] = await Promise.all([
    getTranslations('work'),
    getAllCaseStudies(locale as Locale),
  ]);

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <AuroraOrbs />
      <div className="relative mx-auto max-w-7xl px-6">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[1.05] max-w-3xl">
          {t('indexHeadlineLead')}
          <br />
          <span className="aurora-text">{t('indexHeadlineAccent')}</span>
        </h1>
        <p className="mt-8 text-base md:text-lg text-text-muted max-w-xl leading-relaxed">
          {t('indexIntro')}
        </p>

        <ul className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {studies.map((study) => {
            const number = String(study.order).padStart(2, '0');
            const numberClass =
              study.accent === 'mixed' ? 'aurora-text' : ACCENT_TEXT_CLASS[study.accent];
            return (
              <li key={study.slug}>
                <Link
                  href={workHref(study.slug)}
                  data-accent={study.accent}
                  className={cn(
                    'group relative block rounded-xl border border-border bg-bg-elevated/60 backdrop-blur-md',
                    'p-8 md:p-10 min-h-[260px] flex flex-col',
                    'transition-all duration-[var(--duration-short)]',
                    'hover:border-border-hover hover:bg-bg-elevated/85 hover:-translate-y-1',
                    'active:-translate-y-0.5 focus-visible:-translate-y-1',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue',
                  )}
                >
                  <Spotlight color={accentSpotlight(study.accent)} />
                  <div className={cn('relative font-mono text-xs tracking-[0.18em]', numberClass)}>
                    {number}
                  </div>
                  <h2 className="mt-6 text-xl md:text-2xl font-semibold text-text leading-snug">
                    {study.title}
                  </h2>
                  <div className="mt-auto pt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint flex items-center gap-2">
                    <span>{study.client}</span>
                    <span aria-hidden>·</span>
                    <span>{study.years}</span>
                  </div>
                  <span
                    aria-hidden
                    // Desktop: nudges right on hover. Mobile: gently
                    // breathes via the work-card-arrow-hint keyframe in
                    // globals.css so the affordance is visible without
                    // hover. Reduced-motion users get a static arrow.
                    className="absolute top-8 right-8 md:top-10 md:right-10 text-text-faint transition-transform duration-[var(--duration-short)] group-hover:translate-x-1 group-hover:text-text work-card-arrow"
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
