'use client';
import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { GraphCanvas } from './graph-canvas';
import { EDGES, NODES } from './graph-data';

export function ImpactGraph() {
  const t = useTranslations('impactGraph');

  return (
    <section className="relative py-28 md:py-44 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at 70% 30%, rgba(80,90,255,0.15) 0%, rgba(163,93,255,0.08) 40%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] leading-[1.05] max-w-3xl">
          {t('headlineLead')}
          <br />
          <span className="aurora-text">{t('headlineAccent')}</span>
        </h2>

        <GraphCanvas nodes={NODES} edges={EDGES} variant="page" />
      </div>
    </section>
  );
}
