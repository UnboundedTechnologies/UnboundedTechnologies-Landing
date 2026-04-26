'use client';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { ButtonLink } from '@/components/primitives/button';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { InfinityLogoStatic } from './infinity-logo-static';

const InfinityLogo3D = dynamic(() => import('./infinity-logo-3d').then((m) => m.InfinityLogo3D), {
  ssr: false,
  loading: () => (
    <InfinityLogoStatic className="w-64 h-40 drop-shadow-[0_0_40px_rgba(124,142,255,0.6)]" />
  ),
});

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <AuroraOrbs />
      <div className="relative mx-auto max-w-7xl w-full px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.02]">
            {t('headlineLead')}
            <br />
            <span className="aurora-text">{t('headlineAccent')}</span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-text-muted max-w-md leading-relaxed">
            {t('subhead')}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/contact" variant="gradient">
              {t('ctaPrimary')} →
            </ButtonLink>
            <ButtonLink href="/work" variant="ghost">
              {t('ctaSecondary')}
            </ButtonLink>
          </div>
        </div>
        <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
          {/* Glow halo behind the canvas. The WebGL scene cannot illuminate the DOM,
              so this radial gradient fakes the illusion that the logo casts brand-colored
              light onto the surrounding hero area, removing the visible canvas boundary. */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(163,93,255,0.32) 0%, rgba(93,111,255,0.18) 28%, rgba(93,199,255,0.08) 52%, transparent 72%)',
              filter: 'blur(36px)',
            }}
          />
          <div className="relative w-full h-full motion-reduce:hidden">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <InfinityLogoStatic className="w-64 h-40 drop-shadow-[0_0_40px_rgba(124,142,255,0.6)]" />
                </div>
              }
            >
              <InfinityLogo3D />
            </Suspense>
          </div>
          <div className="hidden motion-reduce:block relative">
            <InfinityLogoStatic className="w-64 h-40 drop-shadow-[0_0_40px_rgba(124,142,255,0.6)]" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-6 right-6 flex justify-between font-mono text-[10px] text-text-faint">
        <span>↓ {t('scrollCue').toUpperCase()}</span>
        <span>v1.0 · Unbounded Technologies Inc. · 2026</span>
      </div>
    </section>
  );
}
