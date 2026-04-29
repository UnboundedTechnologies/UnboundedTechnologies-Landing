'use client';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { GlobeStatic } from './globe-static';
import { LiveCounter } from './live-counter';

// The WebGL globe is expensive to mount: it loads three, drei, and the
// postprocessing pipeline. We lazy-import it AND gate it behind an
// IntersectionObserver so the bundle and the GL context only kick in once
// the user is actually about to see the section. The static SVG snapshot
// renders in the meantime so SSR HTML still shows a globe-shaped silhouette.

const Globe = dynamic(() => import('./globe').then((m) => m.Globe), {
  ssr: false,
  loading: () => <GlobeStatic className="opacity-70" />,
});

export function GlobeSection() {
  const t = useTranslations('globe');
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(80,90,255,0.16) 0%, rgba(163,93,255,0.06) 40%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">
            {t('headlineLead')}
            <br />
            <span className="aurora-text">{t('headlineAccent')}</span>
          </h2>
          <div className="mt-10 max-w-md">
            <LiveCounter />
          </div>
        </div>
        <div className="relative aspect-square w-full max-w-[500px] mx-auto motion-reduce:contents">
          <div className="hidden motion-reduce:block w-full h-full">
            <GlobeStatic />
          </div>
          <div className="motion-reduce:hidden w-full h-full">
            {visible ? <Globe /> : <GlobeStatic className="opacity-70" />}
            <noscript>
              <GlobeStatic />
            </noscript>
          </div>
        </div>
      </div>
    </section>
  );
}
