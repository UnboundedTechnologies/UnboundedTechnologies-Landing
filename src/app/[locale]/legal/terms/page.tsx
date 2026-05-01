// LAWYER REVIEW REQUIRED before public launch
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

// `/legal/terms` Terms of Service page (Phase 8.3).
//
// Sober legal surface paired with the privacy page. No AuroraOrbs, no
// aurora-text accent, no per-section brand colors. Server component,
// statically generated for both locales.
//
// Section structure:
//   1. Hero  - eyebrow / h1 / effective-date subhead.
//   2. Body  - 8 numbered topical sections (Ontario-governed boilerplate).
//   3. Foot  - last-updated mono line plus a Link back to /contact.
//
// All copy is BOILERPLATE pending lawyer review per the launch checklist.

const SECTIONS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'] as const;

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('termsPage');

  return (
    <>
      {/* 1. Hero */}
      <section className="relative py-20 md:py-28">
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
      </section>

      {/* 2. Body sections */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-6">
          <ol className="space-y-12 md:space-y-16">
            {SECTIONS.map((key, idx) => (
              <li key={key} className="prose prose-invert max-w-prose">
                <div
                  className={cn(
                    'font-mono text-xs uppercase tracking-[0.18em] text-text-faint',
                    'not-prose mb-3',
                  )}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h2 className="not-prose text-xl md:text-2xl font-semibold tracking-tight text-text mb-4">
                  {t(`${key}Title`)}
                </h2>
                <div className="text-sm md:text-base text-text-muted leading-relaxed space-y-4">
                  {t(`${key}Body`)
                    .split('\n\n')
                    .map((para, pIdx) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are stable within a translation string
                      <p key={pIdx}>{para}</p>
                    ))}
                </div>
              </li>
            ))}
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
