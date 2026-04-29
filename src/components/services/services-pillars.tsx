import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';

// Three service-pillar cards: Cloud Architecture (blue glow), Contact Center
// Modernization (purple glow), Serverless & Event-Driven (cyan glow). Each
// card has a corner radial-gradient overlay in the brand color, an eyebrow
// number/label, a heading, a body paragraph, and a row of tag chips.
//
// All Tailwind color classes are LITERAL strings so the v4 oxide compiler can
// detect them at build time; the brand color per card is also baked into a
// LITERAL inline style for the corner glow (interpolated CSS color values are
// safe; only Tailwind class strings need to be static).

type Pillar = {
  numKey: string;
  titleKey: string;
  bodyKey: string;
  glowColor: string;
  numClass: string;
  tagClass: string;
  tags: ReadonlyArray<string>;
};

const PILLARS: ReadonlyArray<Pillar> = [
  {
    numKey: 'p1Num',
    titleKey: 'p1Title',
    bodyKey: 'p1Body',
    glowColor: 'rgba(93,111,255,0.3)',
    numClass: 'text-brand-blue',
    tagClass: 'text-brand-blue',
    tags: ['AWS', 'Terraform', 'GCP', 'Azure'],
  },
  {
    numKey: 'p2Num',
    titleKey: 'p2Title',
    bodyKey: 'p2Body',
    glowColor: 'rgba(163,93,255,0.3)',
    numClass: 'text-brand-purple',
    tagClass: 'text-brand-purple',
    tags: ['Amazon Connect', 'End-User Messaging', 'Pinpoint'],
  },
  {
    numKey: 'p3Num',
    titleKey: 'p3Title',
    bodyKey: 'p3Body',
    glowColor: 'rgba(93,199,255,0.3)',
    numClass: 'text-brand-cyan',
    tagClass: 'text-brand-cyan',
    tags: ['Lambda', 'DynamoDB', 'API GW'],
  },
];

export function ServicesPillars() {
  const t = useTranslations('services');

  return (
    <section aria-label="Services" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow className="mb-10">{t('eyebrow')}</Eyebrow>
        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <div
              key={p.titleKey}
              className="relative overflow-hidden bg-bg-elevated border border-border rounded-xl p-8 flex flex-col"
            >
              {/* Corner glow overlay. Inline style for the brand color so each
                  card has its own; sizing/positioning kept in Tailwind. */}
              <div
                aria-hidden
                className="services-orb absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                style={{ background: p.glowColor, animationDelay: `${i * 1500}ms` }}
              />
              <div className={`relative font-mono text-xs tracking-widest ${p.numClass} mb-4`}>
                {t(p.numKey)}
              </div>
              <h3 className="relative text-xl font-semibold tracking-tight mb-3">
                {t(p.titleKey)}
              </h3>
              <p className="relative text-sm text-text-muted leading-relaxed mb-5">
                {t(p.bodyKey)}
              </p>
              <div className="relative flex flex-wrap gap-2 mt-auto">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`font-mono text-[10px] px-2 py-1 rounded ${p.tagClass} bg-surface`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
