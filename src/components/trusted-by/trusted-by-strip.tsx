import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';

// Grayscale logo strip. Logos render desaturated and dimmed by default; on hover
// the entire row gains color. Renault, BMO, Melty, ETBA are SVGs already in
// public/logos/ (normalized by Task 1). AWS and S.i Systems render as styled
// wordmarks because the owner explicitly asked for AWS as a wordmark, and the
// available S.i Systems asset is a multi-color JPEG with a white background
// that does not survive a grayscale + opacity treatment cleanly.

type Client = { name: string; kind: 'wordmark' } | { name: string; kind: 'svg'; src: string };

const CLIENTS: ReadonlyArray<Client> = [
  { name: 'AWS', kind: 'wordmark' },
  { name: 'Renault', kind: 'svg', src: '/logos/renault.svg' },
  { name: 'BMO', kind: 'svg', src: '/logos/bmo.svg' },
  { name: 'Melty', kind: 'svg', src: '/logos/melty.svg' },
  { name: 'ETBA', kind: 'svg', src: '/logos/etba.svg' },
  { name: 'S.i Systems', kind: 'wordmark' },
];

export function TrustedByStrip() {
  const t = useTranslations('trustedBy');

  return (
    <section className="py-20 border-y border-border">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow className="text-center mb-10">{t('eyebrow')}</Eyebrow>
        <ul className="flex flex-wrap items-center justify-around gap-x-12 gap-y-8 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-[opacity,filter] duration-[var(--duration-medium)]">
          {CLIENTS.map((c) =>
            c.kind === 'wordmark' ? (
              <li key={c.name} className="text-2xl font-semibold tracking-tight text-text">
                {c.name}
              </li>
            ) : (
              <li key={c.name}>
                {/* Plain <img> rather than next/image so we don't need
                    dangerouslyAllowSVG: true. SVGs are tiny static assets. */}
                {/* biome-ignore lint/performance/noImgElement: SVG logos are tiny; next/image requires dangerouslyAllowSVG */}
                <img
                  src={c.src}
                  alt={c.name}
                  className="h-8 w-auto"
                  width={120}
                  height={32}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}
