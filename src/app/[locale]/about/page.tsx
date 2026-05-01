import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { SectionAtmosphere } from '@/components/atmosphere/section-atmosphere';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Spotlight } from '@/components/primitives/spotlight';
import {
  ACCENT_TEXT_CLASS,
  accentGlowColor,
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
  // EN uses /about, FR uses /a-propos.
  const segment = locale === 'fr' ? 'a-propos' : 'about';
  const og = ogImageMetadata(locale as OgLocale, [segment]);
  return {
    openGraph: { images: og.openGraph.images },
    twitter: og.twitter,
  };
}

// `/about` Saïd & Unbounded page (Phase 8.2).
//
// Five sections, top to bottom:
//   1. Hero (Aurora orbs, eyebrow, two-line headline with aurora-text accent,
//      subhead). To the right on md+, the official Unbounded Technologies
//      brand logo (public/ut-logo.png) replaces the (deliberately absent)
//      portrait per spec §6.4.
//   2. The story (two short first-person paragraphs in a comfortable reading
//      width).
//   3. Operating model (six PSB-defensibility bullets, EXACT spec text in EN).
//      Each bullet renders as a stat-card row with an accent-tinted number
//      prefix; the accent cycles blue / purple / cyan across the six rows.
//   4. By the numbers (4-stat row: 10+ years, 4B+ API calls / month at peak,
//      4 languages, 3+ active enterprise engagements). Each stat tinted to
//      its accent.
//   5. Quiet capability-statement link at the bottom (placeholder href; the
//      PDF asset itself ships in Phase 13 per the master plan).
//
// Per-card brand metadata comes from `src/lib/accents.ts` so this surface
// stays in lockstep with `/services` and the case-study pages.

const OPERATING_BULLETS = [
  { key: 'op1', accent: 'blue' as SolidAccent },
  { key: 'op2', accent: 'purple' as SolidAccent },
  { key: 'op3', accent: 'cyan' as SolidAccent },
  { key: 'op4', accent: 'blue' as SolidAccent },
  { key: 'op5', accent: 'purple' as SolidAccent },
  { key: 'op6', accent: 'cyan' as SolidAccent },
] as const;

const STATS = [
  { numKey: 'stat1Number', labelKey: 'stat1Label', accent: 'blue' as SolidAccent },
  { numKey: 'stat2Number', labelKey: 'stat2Label', accent: 'purple' as SolidAccent },
  { numKey: 'stat3Number', labelKey: 'stat3Label', accent: 'cyan' as SolidAccent },
  { numKey: 'stat4Number', labelKey: 'stat4Label', accent: 'blue' as SolidAccent },
] as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('aboutPage');

  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden py-20 md:py-36">
        <AuroraOrbs />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-12 items-center">
            <div>
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
            <div className="relative h-[280px] md:h-[400px] mt-12 md:mt-0 flex items-center justify-center">
              {/* Glow halo behind the brand mark, same gradient the homepage
                  hero uses so the logo reads as one brand element across
                  surfaces. */}
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(163,93,255,0.32) 0%, rgba(93,111,255,0.18) 28%, rgba(93,199,255,0.08) 52%, transparent 72%)',
                  filter: 'blur(36px)',
                }}
              />
              <Image
                src="/ut-logo.png"
                alt="Unbounded Technologies Inc."
                width={1536}
                height={1024}
                priority
                sizes="(min-width: 768px) 28rem, 18rem"
                className="relative w-auto h-full max-h-full object-contain drop-shadow-[0_0_40px_rgba(124,142,255,0.45)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. The story */}
      <section className="relative overflow-hidden py-14 md:py-24">
        <SectionAtmosphere accent="purple" position="top-left" />
        <div className="relative mx-auto max-w-7xl px-6">
          <Eyebrow className="mb-10">{t('storyEyebrow')}</Eyebrow>
          <div className="max-w-prose space-y-6 text-base md:text-lg text-text-muted leading-relaxed">
            <p>{t('storyPara1')}</p>
            <p>{t('storyPara2')}</p>
          </div>
        </div>
      </section>

      {/* 3. Operating model */}
      <section className="relative overflow-hidden py-14 md:py-24">
        <SectionAtmosphere accent="cyan" position="top-right" />
        <div className="relative mx-auto max-w-7xl px-6">
          <Eyebrow className="mb-12">{t('operatingEyebrow')}</Eyebrow>
          <ul className="space-y-3 md:space-y-4 max-w-4xl">
            {OPERATING_BULLETS.map((bullet, idx) => {
              const accentClass = ACCENT_TEXT_CLASS[bullet.accent];
              return (
                <li
                  key={bullet.key}
                  className={cn(
                    'group relative overflow-hidden bg-bg-elevated border border-border rounded-xl',
                    'p-6 flex items-start gap-5',
                  )}
                >
                  <div
                    aria-hidden
                    className="services-orb absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-60"
                    style={{
                      background: accentGlowColor(bullet.accent, 0),
                      animationDelay: `${idx * 1200}ms`,
                    }}
                  />
                  <Spotlight color={accentSpotlight(bullet.accent)} size={220} />
                  <span
                    className={cn(
                      'relative flex-shrink-0 font-mono text-xs tracking-[0.18em]',
                      'mt-1',
                      accentClass,
                    )}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="relative text-sm md:text-base text-text leading-relaxed">
                    {t(bullet.key)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 4. Stats row (By the numbers) */}
      <section className="relative overflow-hidden py-14 md:py-24">
        <SectionAtmosphere accent="blue" position="bottom-left" />
        <div className="relative mx-auto max-w-7xl px-6">
          <Eyebrow className="mb-12">{t('statsEyebrow')}</Eyebrow>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {STATS.map((s) => {
              const accentClass = ACCENT_TEXT_CLASS[s.accent];
              return (
                <div
                  key={s.numKey}
                  className="group relative overflow-hidden border border-border rounded-xl p-6 bg-bg-elevated"
                >
                  <Spotlight color={accentSpotlight(s.accent)} size={220} />
                  <div
                    className={cn(
                      'relative font-mono text-4xl md:text-5xl font-semibold tracking-tight',
                      accentClass,
                    )}
                  >
                    {t(s.numKey)}
                  </div>
                  <div className="relative mt-3 font-mono text-[10px] md:text-xs uppercase tracking-[0.18em] text-text-muted leading-relaxed">
                    {t(s.labelKey)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Capability statement link */}
      {/* The PDF is build-time-rendered at /cv.pdf (Phase 13.1). Locale-agnostic
          path: FR users still download the EN PDF for v1.0. */}
      <section className="py-16 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <a
            href="/cv.pdf"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-text transition-colors"
          >
            {t('capabilityLink')}
          </a>
        </div>
      </section>
    </>
  );
}
