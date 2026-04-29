import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';

// Three quantified-outcome cards. Each card has a brand-color stat number, a
// short unit label, and a one-line context line. Stat colors are LITERAL Tailwind
// classes (text-brand-blue, etc.) NOT interpolated, so the v4 oxide compiler
// can detect them at build time.
//
// Phase 4 renders these as non-link <div>s. When Phase 7 ships /work/[slug]
// case-study pages, this file's `LINKS` mapping should be wired into <a>
// elements that point at /work/renault-forex, /work/etba-erp, /work/renault-forex
// respectively. Until then, dead links would 404; better to ship as cards.

type Outcome = {
  statKey: string;
  unitKey: string;
  contextKey: string;
  statClass: string;
  glowColor: string;
};

const OUTCOMES: ReadonlyArray<Outcome> = [
  {
    statKey: 'renaultStat',
    unitKey: 'renaultUnit',
    contextKey: 'renaultContext',
    statClass: 'text-brand-blue',
    glowColor: 'rgba(93,111,255,0.3)',
  },
  {
    statKey: 'etbaStat',
    unitKey: 'etbaUnit',
    contextKey: 'etbaContext',
    statClass: 'text-brand-purple',
    glowColor: 'rgba(163,93,255,0.3)',
  },
  {
    statKey: 'uptimeStat',
    unitKey: 'uptimeUnit',
    contextKey: 'uptimeContext',
    statClass: 'text-brand-cyan',
    glowColor: 'rgba(93,199,255,0.3)',
  },
];

export function OutcomeRibbon() {
  const t = useTranslations('outcomes');

  return (
    <section aria-label={t('eyebrow')} className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow className="mb-10">{t('eyebrow')}</Eyebrow>
        <div className="grid md:grid-cols-3 gap-6">
          {OUTCOMES.map((o, i) => (
            <div
              key={o.contextKey}
              className="relative overflow-hidden bg-bg-elevated border border-border rounded-xl p-8 transition-colors duration-[var(--duration-short)] hover:border-border-hover"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
