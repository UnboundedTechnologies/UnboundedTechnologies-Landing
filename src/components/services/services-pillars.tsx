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
  orbClass: 'orb-a' | 'orb-b' | 'orb-c';
  orbDur: string;
  orbDelay: string;
  hoverBorderColor: string;
  hoverShadow: string;
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
    orbClass: 'orb-c',
    orbDur: '10.6s',
    orbDelay: '420ms',
    hoverBorderColor: 'rgba(93,111,255,0.55)',
    hoverShadow: '0 24px 60px -18px rgba(93,111,255,0.45)',
  },
  {
    numKey: 'p2Num',
    titleKey: 'p2Title',
    bodyKey: 'p2Body',
    glowColor: 'rgba(163,93,255,0.3)',
    numClass: 'text-brand-purple',
    tagClass: 'text-brand-purple',
    tags: ['Amazon Connect', 'End-User Messaging', 'Pinpoint'],
    orbClass: 'orb-a',
    orbDur: '12.3s',
    orbDelay: '980ms',
    hoverBorderColor: 'rgba(163,93,255,0.55)',
    hoverShadow: '0 24px 60px -18px rgba(163,93,255,0.45)',
  },
  {
    numKey: 'p3Num',
    titleKey: 'p3Title',
    bodyKey: 'p3Body',
    glowColor: 'rgba(93,199,255,0.3)',
    numClass: 'text-brand-cyan',
    tagClass: 'text-brand-cyan',
    tags: ['Lambda', 'DynamoDB', 'API GW'],
    orbClass: 'orb-b',
    orbDur: '14.5s',
    orbDelay: '1620ms',
    hoverBorderColor: 'rgba(93,199,255,0.55)',
    hoverShadow: '0 24px 60px -18px rgba(93,199,255,0.45)',
  },
];

export function ServicesPillars() {
  const t = useTranslations('services');

  return (
    <section aria-label="Services" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow className="mb-10">{t('eyebrow')}</Eyebrow>
        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p) => (
            <div
              key={p.titleKey}
              className="group relative overflow-hidden bg-bg-elevated border border-border rounded-xl p-8 flex flex-col transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:[border-color:var(--card-hover-border)] hover:shadow-[var(--card-hover-shadow)]"
              style={
                {
                  ['--card-hover-border' as string]: p.hoverBorderColor,
                  ['--card-hover-shadow' as string]: p.hoverShadow,
                } as React.CSSProperties
              }
            >
              {/* Corner glow overlay. Inline CSS vars feed the per-card orb
                  variant (different keyframe / duration / delay) so the three
                  lights are visibly out of sync. On hover the parent's `group`
                  state intensifies the orb (faster duration + brightness boost
                  via globals.css). */}
              <div
                aria-hidden
                className={`${p.orbClass} absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none`}
                style={
                  {
                    background: p.glowColor,
                    ['--orb-dur' as string]: p.orbDur,
                    ['--orb-delay' as string]: p.orbDelay,
                  } as React.CSSProperties
                }
              />
              <div
                className={`relative font-mono text-xs tracking-widest ${p.numClass} mb-4 transition-[letter-spacing] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:tracking-[0.3em]`}
              >
                {t(p.numKey)}
              </div>
              <h3 className="relative text-xl font-semibold tracking-tight mb-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
                {t(p.titleKey)}
              </h3>
              <p className="relative text-sm text-text-muted leading-relaxed mb-5">
                {t(p.bodyKey)}
              </p>
              <div className="relative flex flex-wrap gap-2 mt-auto">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`font-mono text-[10px] px-2 py-1 rounded ${p.tagClass} bg-surface transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-surface-hover`}
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
