import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { Eyebrow } from '@/components/primitives/eyebrow';
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

      <div className="relative mx-auto max-w-5xl w-full px-6 py-14 md:py-24 flex-1 flex flex-col items-center text-center">
        <Image
          src="/ut-banner.png"
          alt="Unbounded Technologies Inc."
          width={1266}
          height={284}
          priority
          sizes="(min-width: 768px) 36rem, 22rem"
          className="h-20 sm:h-24 md:h-32 lg:h-40 w-auto max-w-full"
        />

        <div
          aria-hidden
          className="mt-10 md:mt-14 font-mono text-[11px] md:text-xs uppercase tracking-[0.32em] text-text-faint"
        >
          {t('code')}
        </div>

        <Eyebrow className="mt-4 text-brand-purple">{t('eyebrow')}</Eyebrow>

        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.05] max-w-3xl">
          {t('headlineLead')} <span className="aurora-text">{t('headlineAccent')}</span>
          <br />
          <span className="text-text-muted">{t('headlineTrail')}</span>
        </h1>

        <p className="mt-8 text-base md:text-lg text-text-muted max-w-xl leading-relaxed">
          {t('body')}
        </p>

        <div className="mt-14 md:mt-20 w-full">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint mb-6">
            {t('destinationsEyebrow')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.key}
                href={d.href}
                className="group relative block overflow-hidden rounded-xl border border-border bg-bg-elevated/60 backdrop-blur-md p-5 md:p-6 transition-colors duration-[var(--duration-short)] hover:border-border-hover hover:bg-bg-elevated/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-within:-translate-y-0.5 hover:-translate-y-0.5 active:-translate-y-0"
                style={{
                  boxShadow: `inset 3px 0 0 0 ${accentBorderColor(d.accent)}`,
                }}
              >
                <Spotlight color={accentSpotlight(d.accent)} />
                <div className="relative font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
                  {String(DESTINATIONS.indexOf(d) + 1).padStart(2, '0')}
                </div>
                <div className="relative mt-2 text-base md:text-lg font-semibold text-text">
                  {t(`destinations.${d.key}.label`)}
                </div>
                <div className="relative mt-1 text-xs md:text-sm text-text-muted">
                  {t(`destinations.${d.key}.blurb`)}
                </div>
                <span
                  aria-hidden
                  className="absolute top-5 right-5 md:top-6 md:right-6 text-text-faint transition-transform duration-[var(--duration-short)] group-hover:translate-x-1 group-hover:text-text"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-14 md:mt-20 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint flex items-center gap-2">
            <span>{t('paletteHint')}</span>
            <kbd className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text">
              ⌘K
            </kbd>
            <span aria-hidden>·</span>
            <kbd className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text">
              Ctrl+K
            </kbd>
            <span>{t('paletteHintTrail')}</span>
          </div>

          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-text transition-colors duration-[var(--duration-short)]"
          >
            <span aria-hidden>←</span> {t('homeLink')}
          </Link>
        </div>
      </div>
    </section>
  );
}
