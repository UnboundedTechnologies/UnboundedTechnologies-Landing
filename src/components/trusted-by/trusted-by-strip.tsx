import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';

// Full-color logo strip with a staggered entrance fade-up and a gentle hover
// lift. Each logo carries its own size class because the source SVGs have
// different aspect ratios; without per-logo sizing, h-8 w-auto would make
// wide wordmarks (Melty) huge and square logos (ETBA) tiny.
//
// Animation choice (per owner request, 2026-04-29): logos render colorful
// by default. On viewport entry, each logo fades up with a staggered delay
// so the row reveals left-to-right rather than appearing all at once. On
// hover, each logo lifts ~4px and scales 1.05x. Both effects respect
// prefers-reduced-motion via the global rule in src/app/globals.css.

type Client =
  | { name: string; kind: 'wordmark' }
  | { name: string; kind: 'svg'; src: string; sizeClass: string };

const CLIENTS: ReadonlyArray<Client> = [
  { name: 'AWS', kind: 'wordmark' },
  { name: 'BMO', kind: 'svg', src: '/logos/bmo.svg', sizeClass: 'h-9 max-w-[120px]' },
  { name: 'Renault', kind: 'svg', src: '/logos/renault.svg', sizeClass: 'h-10 max-w-[130px]' },
  { name: 'Melty', kind: 'svg', src: '/logos/melty.svg', sizeClass: 'h-6 max-w-[110px]' },
  { name: 'ETBA', kind: 'svg', src: '/logos/etba.svg', sizeClass: 'h-14 max-w-[160px]' },
  { name: 'S.i Systems', kind: 'wordmark' },
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
              className="trusted-by-logo flex items-center justify-center transition-transform duration-[var(--duration-short)] hover:-translate-y-1 hover:scale-105"
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
                  className={`${c.sizeClass} w-auto object-contain`}
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
