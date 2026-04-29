import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';

// Grayscale logo strip. Logos render desaturated and dimmed by default; on hover
// the entire row gains color. Renault, BMO, Melty, ETBA are SVGs already in
// public/logos/. AWS and S.i Systems render as styled wordmarks because the
// owner explicitly asked for AWS as a wordmark, and the available S.i Systems
// asset is a multi-color JPEG with a white background that does not survive
// a grayscale + opacity treatment cleanly.
//
// Each SVG entry carries its own `sizeClass` because the source files have
// wildly different aspect ratios. Without per-logo sizing, h-8 w-auto would
// make wide wordmarks (Melty) huge and square logos (ETBA) tiny. Hand-tuned
// widths and heights normalize the visual weight across the row.

type Client =
  | { name: string; kind: 'wordmark' }
  | { name: string; kind: 'svg'; src: string; sizeClass: string };

const CLIENTS: ReadonlyArray<Client> = [
  { name: 'AWS', kind: 'wordmark' },
  { name: 'Renault', kind: 'svg', src: '/logos/renault.svg', sizeClass: 'h-9 max-w-[120px]' },
  { name: 'BMO', kind: 'svg', src: '/logos/bmo.svg', sizeClass: 'h-8 max-w-[110px]' },
  { name: 'Melty', kind: 'svg', src: '/logos/melty.svg', sizeClass: 'h-5 max-w-[100px]' },
  { name: 'ETBA', kind: 'svg', src: '/logos/etba.svg', sizeClass: 'h-12 max-w-[60px]' },
  { name: 'S.i Systems', kind: 'wordmark' },
];

export function TrustedByStrip() {
  const t = useTranslations('trustedBy');

  return (
    <section aria-label={t('eyebrow')} className="py-20 border-y border-border">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow className="text-center mb-10">{t('eyebrow')}</Eyebrow>
        <ul
          role="list"
          className="flex flex-wrap items-center justify-around gap-x-12 gap-y-8 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-[opacity,filter] duration-[var(--duration-medium)]"
        >
          {CLIENTS.map((c) =>
            c.kind === 'wordmark' ? (
              <li
                key={c.name}
                className="flex items-center justify-center h-12 text-xl font-semibold tracking-tight text-text whitespace-nowrap"
              >
                {c.name}
              </li>
            ) : (
              <li key={c.name} className="flex items-center justify-center h-12">
                {/* biome-ignore lint/performance/noImgElement: SVG logos are tiny; next/image requires dangerouslyAllowSVG */}
                <img
                  src={c.src}
                  alt={c.name}
                  className={`${c.sizeClass} w-auto object-contain`}
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
