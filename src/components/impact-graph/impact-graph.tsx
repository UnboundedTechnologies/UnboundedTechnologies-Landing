'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { GraphCard } from './graph-card';
import { NODES } from './graph-data';
import { GraphEdges } from './graph-edges';
import { useCardPositions } from './use-card-positions';

const NODE_IDS = NODES.map((n) => n.id);

export function ImpactGraph() {
  const t = useTranslations('impactGraph');
  const { containerRef, register, rects, recompute } = useCardPositions(NODE_IDS);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setContainerSize({ width: el.offsetWidth, height: el.offsetHeight });
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const obs = new ResizeObserver(update);
      obs.observe(el);
      return () => obs.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [containerRef]);

  useEffect(() => {
    if (containerSize.width > 0) recompute();
  }, [containerSize.width, recompute]);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
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

        <div
          ref={containerRef}
          className="relative mt-16 grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-y-20 gap-x-8 md:gap-x-24"
        >
          {NODES.map((n, i) => (
            <GraphCard
              key={n.id}
              ref={register(n.id)}
              label={n.label}
              sub={n.sub}
              color={n.color}
              category={n.category}
              index={i}
            />
          ))}
          <div className="hidden md:block">
            <GraphEdges rects={rects} width={containerSize.width} height={containerSize.height} />
          </div>
        </div>
      </div>
    </section>
  );
}
