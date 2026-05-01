import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { Spotlight } from '@/components/primitives/spotlight';
import { Link } from '@/i18n/routing';
import { type Accent, accentBorderColor, accentSpotlight } from '@/lib/accents';

const DESTINATIONS: ReadonlyArray<{
  href: '/work' | '/services' | '/about' | '/contact';
  key: 'work' | 'services' | 'about' | 'contact';
  accent: Accent;
}> = [
  { href: '/work', key: 'work', accent: 'blue' },
  { href: '/services', key: 'services', accent: 'purple' },
  { href: '/about', key: 'about', accent: 'cyan' },
  { href: '/contact', key: 'contact', accent: 'mixed' },
];

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <section className="relative overflow-hidden flex-1 flex flex-col">
      <AuroraOrbs />

      <div className="relative mx-auto max-w-5xl w-full px-6 py-16 md:py-28 flex-1 flex flex-col items-center text-center">
        <Image
          src="/ut-banner.png"
          alt="Unbounded Technologies Inc."
          width={1266}
          height={284}
          priority
          sizes="(min-width: 768px) 36rem, 22rem"
          className="h-20 sm:h-24 md:h-32 lg:h-40 w-auto max-w-full"
        />

        {/* Huge aurora-gradient 404 treatment. Reads as a deliberate hero
            element instead of an afterthought, and the gradient inherits
            the same brand identity as the homepage headline. */}
        <div
          aria-hidden
          className="mt-12 md:mt-16 aurora-text font-mono font-bold tracking-[-0.04em] leading-none text-[7rem] sm:text-[9rem] md:text-[11rem] lg:text-[13rem] select-none"
        >
          {t('code')}
        </div>

        <div className="mt-2 md:mt-4 font-mono text-xs md:text-sm uppercase tracking-[0.32em] text-brand-purple">
          {t('eyebrow')}
        </div>

        <h1 className="mt-8 md:mt-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[1.1] max-w-3xl">
          {t('headlineLead')} <span className="aurora-text">{t('headlineAccent')}</span>
          <br />
          <span className="text-text-muted">{t('headlineTrail')}</span>
        </h1>

        <p className="mt-8 text-base md:text-lg text-text-muted max-w-xl leading-relaxed">
          {t('body')}
        </p>

        <div className="mt-16 md:mt-24 w-full">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-brand-blue mb-8">
            {t('destinationsEyebrow')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.key}
                href={d.href}
                className="group relative block overflow-hidden rounded-2xl border border-border bg-bg-elevated/60 backdrop-blur-md p-6 md:p-7 transition-all duration-[var(--duration-short)] hover:border-border-hover hover:bg-bg-elevated/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-within:-translate-y-0.5 hover:-translate-y-0.5 active:-translate-y-0"
                style={{
                  boxShadow: `inset 3px 0 0 0 ${accentBorderColor(d.accent)}`,
                }}
              >
                <Spotlight color={accentSpotlight(d.accent)} />
                <div className="relative font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  {String(DESTINATIONS.indexOf(d) + 1).padStart(2, '0')}
                </div>
                <div className="relative mt-3 text-lg md:text-xl font-semibold text-text leading-tight">
                  {t(`destinations.${d.key}.label`)}
                </div>
                <div className="relative mt-2 text-sm text-text-muted">
                  {t(`destinations.${d.key}.blurb`)}
                </div>
                <span
                  aria-hidden
                  className="absolute top-6 right-6 md:top-7 md:right-7 text-text-faint transition-transform duration-[var(--duration-short)] group-hover:translate-x-1 group-hover:text-text"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Palette hint chip + back link. The chip carries its own border
            and backdrop so the keys don't read as floating grey text on a
            dark page. */}
        <div className="mt-16 md:mt-24 flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-bg-elevated/60 backdrop-blur-md px-5 py-2.5 text-sm text-text-muted">
            <span>{t('paletteHint')}</span>
            <kbd className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs text-text">
              ⌘K
            </kbd>
            <span aria-hidden className="text-text-faint">
              ·
            </span>
            <kbd className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs text-text">
              Ctrl+K
            </kbd>
            <span>{t('paletteHintTrail')}</span>
          </div>

          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-text transition-colors duration-[var(--duration-short)] flex items-center gap-2"
          >
            <span aria-hidden>←</span> {t('homeLink')}
          </Link>
        </div>
      </div>
    </section>
  );
}
