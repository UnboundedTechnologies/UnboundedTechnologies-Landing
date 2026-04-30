import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Link } from '@/i18n/routing';
import { type CaseStudy, getAllCaseStudies, type Locale } from '@/lib/case-studies';
import { cn } from '@/lib/utils';

const ACCENT_INSET: Record<CaseStudy['accent'], string> = {
  blue: 'inset 3px 0 0 0 #5d6fff',
  purple: 'inset 3px 0 0 0 #a35dff',
  cyan: 'inset 3px 0 0 0 #5dc7ff',
  // Mixed: a layered tri-stop using all three brand tones along the left edge.
  mixed:
    'inset 3px 0 0 0 #5d6fff, inset 3px 0 0 0 rgba(163,93,255,0.6), inset 3px 0 0 0 rgba(93,199,255,0.4)',
};

const ACCENT_NUMBER_CLASS: Record<CaseStudy['accent'], string> = {
  blue: 'text-brand-blue',
  purple: 'text-brand-purple',
  cyan: 'text-brand-cyan',
  mixed: 'aurora-text',
};

export default async function WorkIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('work');
  const studies = await getAllCaseStudies(locale as Locale);

  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
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
            const slugHref = `/work/${study.slug}` as Parameters<typeof Link>[0]['href'];
            return (
              <li key={study.slug}>
                <Link
                  href={slugHref}
                  className={cn(
                    'group relative block rounded-xl border border-border bg-bg-elevated/60 backdrop-blur-md',
                    'p-8 md:p-10 min-h-[260px] flex flex-col',
                    'transition-all duration-[var(--duration-short)]',
                    'hover:border-border-hover hover:bg-bg-elevated/85 hover:-translate-y-1',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                  )}
                  style={{ boxShadow: ACCENT_INSET[study.accent] }}
                >
                  <div
                    className={cn(
                      'font-mono text-xs tracking-[0.18em]',
                      ACCENT_NUMBER_CLASS[study.accent],
                    )}
                  >
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
                    className="absolute top-8 right-8 md:top-10 md:right-10 text-text-faint transition-transform duration-[var(--duration-short)] group-hover:translate-x-1 group-hover:text-text"
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
