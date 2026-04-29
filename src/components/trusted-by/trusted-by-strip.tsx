import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';

// Full-color logo strip with a staggered entrance fade-up and a gentle hover
// lift.
//
// Each SVG carries its own height class because the source files have
// different internal padding ratios. Sizing all SVGs to the same container
// height looks uneven because Melty's "melty." text fills its full viewBox
// (no padding), while Renault Group's stacked "Renault / Group" leaves
// vertical room above and below the strokes. Per-logo heights are tuned
// for optical letter-size parity (each visible letter is ~20-24px tall):
//
//   BMO at h-9    -> ~28px letters (BMO seal+text uses most of the viewBox)
//   Renault at h-12 -> "Renault" word ~20px, "Group" subtext smaller
//   Melty at h-6  -> "melty." body text ~22px (text fills the viewBox)
//   text-2xl wordmarks -> caps ~22px (matches the letter heights above)

type Client =
  | { name: string; kind: 'wordmark' }
  | { name: string; kind: 'svg'; src: string; sizeClass: string };

const CLIENTS: ReadonlyArray<Client> = [
  { name: 'AWS', kind: 'wordmark' },
  { name: 'BMO', kind: 'svg', src: '/logos/bmo.svg', sizeClass: 'h-9 max-w-[120px]' },
  { name: 'S.i Systems', kind: 'wordmark' },
  {
    name: 'Renault Group',
    kind: 'svg',
    src: '/logos/renault.svg',
    sizeClass: 'h-12 max-w-[140px]',
  },
  { name: 'Melty', kind: 'svg', src: '/logos/melty.svg', sizeClass: 'h-6 max-w-[110px]' },
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
