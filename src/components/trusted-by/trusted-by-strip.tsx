import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';

// Full-color logo strip with a staggered entrance fade-up and a gentle hover
// lift.
//
// Visual harmony approach: every <li> is a uniform-height (h-10 = 40px)
// flex container. Every logo - text wordmark or SVG - is centered inside.
// SVGs use `max-h-full max-w-[150px] w-auto object-contain` so they scale
// down to fit the 40px row regardless of their native viewBox aspect ratio.
// Wordmarks use text-2xl which optically pairs with a 40px row when the
// SVG content fills the row vertically.

type Client = { name: string; kind: 'wordmark' } | { name: string; kind: 'svg'; src: string };

const CLIENTS: ReadonlyArray<Client> = [
  { name: 'AWS', kind: 'wordmark' },
  { name: 'BMO', kind: 'svg', src: '/logos/bmo.svg' },
  { name: 'S.i Systems', kind: 'wordmark' },
  { name: 'Renault Group', kind: 'svg', src: '/logos/renault.svg' },
  { name: 'Melty', kind: 'svg', src: '/logos/melty.svg' },
  { name: 'ETBA', kind: 'wordmark' },
];

export function TrustedByStrip() {
  const t = useTranslations('trustedBy');

  return (
    <section aria-label={t('eyebrow')} className="py-20 border-y border-border">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow className="text-center mb-10">{t('eyebrow')}</Eyebrow>
        <ul role="list" className="flex flex-wrap items-center justify-around gap-x-12 gap-y-8">
          {CLIENTS.map((c, i) => (
            <li
              key={c.name}
              className="trusted-by-logo flex items-center justify-center h-10 transition-transform duration-[var(--duration-short)] hover:-translate-y-1 hover:scale-105"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {c.kind === 'wordmark' ? (
                <span className="text-2xl font-semibold tracking-tight text-text whitespace-nowrap">
                  {c.name}
                </span>
              ) : (
                // biome-ignore lint/performance/noImgElement: SVG logos are tiny; next/image requires dangerouslyAllowSVG
                <img
                  src={c.src}
                  alt={c.name}
                  className="max-h-full w-auto max-w-[150px] object-contain"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
