'use client';
import { useTranslations } from 'next-intl';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { ButtonLink } from '@/components/primitives/button';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { InfinityLogoStatic } from './infinity-logo-static';

// The Hero NO LONGER owns the 3D Canvas. The Canvas is mounted once inside
// the locale layout (PersistentInfinityLogo) and overlays the anchor div
// rendered below in the right column. This sidesteps the entire class of
// remount-on-back-nav bugs that six prior lazy-loading attempts could not
// fix: the Canvas now never tears down during in-app navigation.
//
// The static SVG fallback is retained for prefers-reduced-motion users.

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative -mt-16 min-h-[100svh] flex items-center overflow-hidden">
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
          {/* Glow halo behind the canvas. Stays in the Hero so the halo lives
              with the page content; only the WebGL Canvas itself was hoisted. */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(163,93,255,0.32) 0%, rgba(93,111,255,0.18) 28%, rgba(93,199,255,0.08) 52%, transparent 72%)',
              filter: 'blur(36px)',
            }}
          />
          {/* Anchor div: PersistentInfinityLogo (mounted at layout level)
              ResizeObserves this element and overlays its WebGL Canvas
              exactly here. The anchor itself is empty and reserves layout
              space; visual content comes from the layout-level Canvas. */}
          <div
            data-hero-canvas-anchor
            className="relative w-full h-full motion-reduce:hidden"
            aria-hidden
          />
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
