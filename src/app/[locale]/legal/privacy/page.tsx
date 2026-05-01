// LAWYER REVIEW REQUIRED before public launch
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionAtmosphere } from '@/components/atmosphere/section-atmosphere';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Spotlight } from '@/components/primitives/spotlight';
import { Link } from '@/i18n/routing';
import { accentSpotlight, type SolidAccent } from '@/lib/accents';
import { cn } from '@/lib/utils';

const ACCENT_CYCLE: ReadonlyArray<SolidAccent> = ['blue', 'purple', 'cyan'];

// `/legal/privacy` Privacy Policy page (Phase 8.3).
//
// Sober legal surface. No AuroraOrbs, no aurora-text accent, no per-section
// brand colors. Server component, statically generated for both locales.
//
// Section structure:
//   1. Hero  - eyebrow / h1 / effective-date subhead.
//   2. Body  - 10 numbered topical sections (PIPEDA-aware boilerplate).
//   3. Foot  - last-updated mono line plus a Link back to /contact.
//
// All copy is BOILERPLATE pending lawyer review per the launch checklist.

const SECTIONS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'] as const;

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('privacyPage');

  return (
    <>
      {/* Hero + body share one continuous section so the atmosphere flows
          from headline through the last card with no visible boundary. */}
      <section className="relative overflow-hidden pt-20 md:pt-28 pb-16 md:pb-20">
        <SectionAtmosphere accent="blue" position="top-right" intensity={0.7} />
        <SectionAtmosphere accent="purple" position="bottom-left" intensity={0.5} />

        {/* Hero: eyebrow, h1, effective-date, subhead. */}
        <div className="relative mx-auto max-w-3xl px-6">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-[-0.04em] leading-[1.05]">
            {t('headlineTitle')}
          </h1>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
            {t('effectiveDate')}
          </p>
          <p className="mt-6 text-base md:text-lg text-text-muted leading-relaxed max-w-prose">
            {t('subhead')}
          </p>
        </div>

        {/* Body cards: numbered sections, each carrying a brand-tinted
            cursor spotlight that cycles through the three solid accents. */}
        <div className="relative mx-auto max-w-3xl px-6 mt-16 md:mt-20">
          <ol className="space-y-6 md:space-y-8">
            {SECTIONS.map((key, idx) => {
              const accent = ACCENT_CYCLE[idx % ACCENT_CYCLE.length];
              return (
                <li
                  key={key}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border border-border bg-bg-elevated/40 backdrop-blur-sm',
                    'p-6 md:p-8 transition-colors duration-[var(--duration-short)]',
                    'hover:border-border-hover',
                  )}
                >
                  <Spotlight color={accentSpotlight(accent)} />
                  <div
                    className={cn(
                      'relative font-mono text-xs uppercase tracking-[0.18em] text-text-faint mb-3',
                    )}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h2 className="relative text-xl md:text-2xl font-semibold tracking-tight text-text mb-4">
                    {t(`${key}Title`)}
                  </h2>
                  <div className="relative text-sm md:text-base text-text-muted leading-relaxed space-y-4 max-w-prose">
                    {t(`${key}Body`)
                      .split('\n\n')
                      .map((para, pIdx) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are stable within a translation string
                        <p key={pIdx}>{para}</p>
                      ))}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 3. Footer */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="mx-auto max-w-3xl px-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
            {t('lastUpdated')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-text transition-colors"
          >
            {t('contactCta')}
          </Link>
        </div>
      </section>
    </>
  );
}
