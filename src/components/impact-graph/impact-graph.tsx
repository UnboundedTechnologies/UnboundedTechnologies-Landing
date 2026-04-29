'use client';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { EDGES, type GraphColor, NODES } from './graph-data';

const COLOR: Record<GraphColor, string> = {
  blue: '#5d6fff',
  purple: '#a35dff',
  cyan: '#5dc7ff',
};

const EASE_OUT_QUART = [0.16, 1, 0.3, 1] as const;

export function ImpactGraph() {
  const t = useTranslations('impactGraph');

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

        <svg
          viewBox="0 0 800 380"
          className="mt-12 w-full h-auto"
          role="img"
          aria-label={t('eyebrow')}
        >
          <title>{t('eyebrow')}</title>
          {EDGES.map((e, i) => {
            const from = NODES.find((n) => n.id === e.from);
            const to = NODES.find((n) => n.id === e.to);
            if (!from || !to) return null;
            const x1 = from.x + 60;
            const y1 = from.y + 20;
            const x2 = to.x;
            const y2 = to.y + 20;
            const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
            return (
              <g key={`${e.from}-${e.to}`}>
                <motion.line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={COLOR[e.color]}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.3, ease: EASE_OUT_QUART }}
                  viewport={{ once: true, margin: '-100px' }}
                />
                <motion.text
                  x={mid.x}
                  y={mid.y - 6}
                  fill={COLOR[e.color]}
                  fontSize="10"
                  fontFamily="monospace"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.3 }}
                  viewport={{ once: true }}
                >
                  {e.impact}
                </motion.text>
              </g>
            );
          })}
          {NODES.map((n, i) => (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.15 }}
              viewport={{ once: true }}
            >
              <rect
                x={n.x}
                y={n.y}
                width="120"
                height="40"
                rx="6"
                fill={`${COLOR[n.color]}1f`}
                stroke={COLOR[n.color]}
                strokeWidth="1"
              />
              <text
                x={n.x + 60}
                y={n.y + 18}
                fill="#f4f5fa"
                fontSize="11"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
                textAnchor="middle"
              >
                {n.label}
              </text>
              <text
                x={n.x + 60}
                y={n.y + 31}
                fill={COLOR[n.color]}
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {n.sub}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </section>
  );
}
