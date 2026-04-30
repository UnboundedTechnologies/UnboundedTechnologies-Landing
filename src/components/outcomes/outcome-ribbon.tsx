import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Link, workHref } from '@/i18n/routing';

// Three quantified-outcome cards. Each card has a brand-color stat number, a
// short unit label, and a one-line context line. Stat colors are LITERAL Tailwind
// classes (text-brand-blue, etc.) NOT interpolated, so the v4 oxide compiler
// can detect them at build time.
//
// As of Phase 7.3 each card is wrapped in an i18n-aware Link to its case
// study. The "Read case study" mono affordance + arrow appears on hover so
// the cards still read as outcome stats first.

type Slug = 'renault-forex' | 'etba-erp';

type Outcome = {
  slug: Slug;
  statKey: string;
  unitKey: string;
  contextKey: string;
  statClass: string;
  glowColor: string;
};

const OUTCOMES: ReadonlyArray<Outcome> = [
  {
    slug: 'renault-forex',
    statKey: 'renaultStat',
    unitKey: 'renaultUnit',
    contextKey: 'renaultContext',
    statClass: 'text-brand-blue',
    glowColor: 'rgba(93,111,255,0.3)',
  },
  {
    slug: 'etba-erp',
    statKey: 'etbaStat',
    unitKey: 'etbaUnit',
    contextKey: 'etbaContext',
    statClass: 'text-brand-purple',
    glowColor: 'rgba(163,93,255,0.3)',
  },
  {
    slug: 'renault-forex',
    statKey: 'uptimeStat',
    unitKey: 'uptimeUnit',
    contextKey: 'uptimeContext',
    statClass: 'text-brand-cyan',
    glowColor: 'rgba(93,199,255,0.3)',
  },
];

export function OutcomeRibbon() {
  const t = useTranslations('outcomes');
  const tWork = useTranslations('work');

  return (
    <section aria-label={t('eyebrow')} className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow className="mb-10">{t('eyebrow')}</Eyebrow>
        <div className="grid md:grid-cols-3 gap-6">
          {OUTCOMES.map((o, i) => {
            return (
              <Link
                key={o.contextKey}
                href={workHref(o.slug)}
                className="group relative overflow-hidden block bg-bg-elevated border border-border rounded-xl p-8 transition-colors duration-[var(--duration-short)] hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <div
                  aria-hidden
                  className="services-orb absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                  style={{ background: o.glowColor, animationDelay: `${i * 1500}ms` }}
                />
                <div
                  className={`relative font-mono text-4xl font-semibold tracking-tight ${o.statClass}`}
                >
                  {t(o.statKey)}
                </div>
                <div className="relative mt-2 text-text font-medium">{t(o.unitKey)}</div>
                <div className="relative mt-3 text-sm text-text-muted">{t(o.contextKey)}</div>
                <div className="relative mt-5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint opacity-70 group-hover:opacity-100 transition-opacity duration-[var(--duration-short)]">
                  <span>{tWork('readCaseStudy')}</span>
                  <span
                    aria-hidden
                    className="transition-transform duration-[var(--duration-short)] group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
