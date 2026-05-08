import { useTranslations } from 'next-intl';
import { SectionAtmosphere } from '@/components/atmosphere/section-atmosphere';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Spotlight } from '@/components/primitives/spotlight';
import {
  ACCENT_TEXT_CLASS,
  accentGlowColor,
  accentHoverBorder,
  accentHoverShadow,
  accentSpotlight,
  type SolidAccent,
} from '@/lib/accents';

// Three service-pillar cards: Cloud Architecture (blue glow), Contact Center
// Modernization (purple glow), Serverless & Event-Driven (cyan glow). Each
// card has a corner radial-gradient overlay in the brand color, an eyebrow
// number/label, a heading, a body paragraph, and a row of tag chips.
//
// Per-card brand metadata (text class, glow color, hover border, hover shadow)
// comes from `src/lib/accents.ts` so this component stays in lockstep with
// the `/services` engagement-card surface.

type Pillar = {
  accent: SolidAccent;
  numKey: string;
  titleKey: string;
  bodyKey: string;
  tags: ReadonlyArray<string>;
};

const PILLARS: ReadonlyArray<Pillar> = [
  {
    accent: 'blue',
    numKey: 'p1Num',
    titleKey: 'p1Title',
    bodyKey: 'p1Body',
    tags: ['AWS', 'Terraform', 'GCP', 'Azure'],
  },
  {
    accent: 'purple',
    numKey: 'p2Num',
    titleKey: 'p2Title',
    bodyKey: 'p2Body',
    tags: ['Amazon Connect', 'End-User Messaging', 'Pinpoint'],
  },
  {
    accent: 'cyan',
    numKey: 'p3Num',
    titleKey: 'p3Title',
    bodyKey: 'p3Body',
    tags: ['Lambda', 'DynamoDB', 'API GW'],
  },
];

export function ServicesPillars() {
  const t = useTranslations('services');

  return (
    <section aria-label="Services" className="relative overflow-hidden py-20">
      <SectionAtmosphere accent="purple" position="top-left" />
      <div className="relative mx-auto max-w-7xl px-6">
        <Eyebrow className="mb-10">{t('eyebrow')}</Eyebrow>
        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => {
            const accentClass = ACCENT_TEXT_CLASS[p.accent];
            return (
              <div
                key={p.titleKey}
                className="group relative overflow-hidden backdrop-blur-xl backdrop-saturate-150 bg-bg-elevated/70 border border-white/[0.08] rounded-xl p-8 flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_-12px_rgba(0,0,0,0.4)] transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:[border-color:var(--card-hover-border)] hover:shadow-[var(--card-hover-shadow)] active:-translate-y-0.5 focus-within:-translate-y-1 focus-within:[border-color:var(--card-hover-border)]"
                style={
                  {
                    ['--card-hover-border' as string]: accentHoverBorder(p.accent),
                    ['--card-hover-shadow' as string]: accentHoverShadow(p.accent),
                  } as React.CSSProperties
                }
              >
                {/* Corner glow overlay. Inline style for the brand color so each
                    card has its own; sizing/positioning kept in Tailwind. */}
                <div
                  aria-hidden
                  className="services-orb absolute top-0 right-0 size-32 rounded-full blur-2xl pointer-events-none"
                  style={{
                    background: accentGlowColor(p.accent, 0),
                    animationDelay: `${i * 1500}ms`,
                  }}
                />
                <Spotlight color={accentSpotlight(p.accent)} />
                <div
                  className={`relative font-mono text-xs tracking-widest ${accentClass} mb-4 transition-[letter-spacing] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:tracking-[0.3em]`}
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
                      className={`font-mono text-[10px] px-2 py-1 rounded ${accentClass} bg-surface transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-surface-hover`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
