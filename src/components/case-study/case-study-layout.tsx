import { getTranslations } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Link } from '@/i18n/routing';
import type { CaseStudy } from '@/lib/case-studies';
import { cn } from '@/lib/utils';

type Accent = CaseStudy['accent'];

// Accent -> brand color hex (mirrors the values in globals.css). Used to drive
// the hero gradient and section eyebrow tint. `mixed` is rendered through the
// aurora-text gradient instead of a single hex.
const ACCENT_HEX: Record<Exclude<Accent, 'mixed'>, string> = {
  blue: '#5d6fff',
  purple: '#a35dff',
  cyan: '#5dc7ff',
};

// Section eyebrow color class, indexed by accent. For `mixed` we cycle the
// three brand tones across the three sections so the page reads as a tri-tone.
const ACCENT_EYEBROW_CLASS: Record<Accent, [string, string, string]> = {
  blue: ['text-brand-blue', 'text-brand-blue', 'text-brand-blue'],
  purple: ['text-brand-purple', 'text-brand-purple', 'text-brand-purple'],
  cyan: ['text-brand-cyan', 'text-brand-cyan', 'text-brand-cyan'],
  mixed: ['text-brand-blue', 'text-brand-purple', 'text-brand-cyan'],
};

function heroGradient(accent: Accent): string {
  if (accent === 'mixed') {
    return 'radial-gradient(ellipse at 30% 20%, rgba(93,111,255,0.20) 0%, rgba(163,93,255,0.14) 35%, rgba(93,199,255,0.10) 65%, transparent 85%)';
  }
  // Build a soft single-color glow with two stops + transparency.
  const rgb = accent === 'blue' ? '93,111,255' : accent === 'purple' ? '163,93,255' : '93,199,255';
  return `radial-gradient(ellipse at 30% 20%, rgba(${rgb},0.22) 0%, rgba(${rgb},0.10) 45%, transparent 80%)`;
}

function accentBorderColor(accent: Accent): string {
  if (accent === 'mixed') return 'rgba(163,93,255,0.45)';
  return `${ACCENT_HEX[accent]}73`; // ~45% alpha
}

/**
 * Split a raw MDX body into exactly three prose chunks at lines beginning
 * with `## `. Order is fixed by the spec (Problem, Approach, Outcome): we
 * trust position rather than matching heading text, since FR uses different
 * heading words. The `## Heading` lines themselves are stripped; the layout
 * supplies its own labels from i18n.
 *
 * Throws if the body does not have exactly three sections.
 */
function splitBody(body: string): [string, string, string] {
  const lines = body.split(/\r?\n/);
  const chunks: string[] = [];
  let current: string[] | null = null;

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (current !== null) {
        chunks.push(current.join('\n').trim());
      }
      current = [];
      continue;
    }
    if (current !== null) {
      current.push(line);
    }
  }
  if (current !== null) {
    chunks.push(current.join('\n').trim());
  }

  if (chunks.length !== 3) {
    throw new Error(
      `Case-study body must have exactly 3 ## sections (Problem/Approach/Outcome). Found ${chunks.length}.`,
    );
  }
  return [chunks[0], chunks[1], chunks[2]];
}

type Props = {
  study: CaseStudy;
  prev: CaseStudy | null;
  next: CaseStudy | null;
};

export async function CaseStudyLayout({ study, prev, next }: Props) {
  const t = await getTranslations('work');
  const [problem, approach, outcome] = splitBody(study.body);
  const eyebrowColors = ACCENT_EYEBROW_CLASS[study.accent];
  const titleClass = study.accent === 'mixed' ? 'aurora-text' : 'text-text';

  const sections: ReadonlyArray<{
    label: string;
    body: string;
    eyebrowClass: string;
  }> = [
    { label: t('sectionProblem'), body: problem, eyebrowClass: eyebrowColors[0] },
    { label: t('sectionApproach'), body: approach, eyebrowClass: eyebrowColors[1] },
    { label: t('sectionOutcome'), body: outcome, eyebrowClass: eyebrowColors[2] },
  ];

  return (
    <article className="relative">
      {/* Back link */}
      <div className="mx-auto max-w-5xl px-6 pt-12 md:pt-16">
        <Link
          href="/work"
          className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-text transition-colors"
        >
          <span aria-hidden>←</span> {t('allWork')}
        </Link>
      </div>

      {/* Hero block */}
      <header className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: heroGradient(study.accent) }}
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-12 pb-16 md:pt-20 md:pb-24">
          <Eyebrow className={cn(eyebrowColors[0])}>{study.client}</Eyebrow>
          <h1
            className={cn(
              'mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[1.05] max-w-4xl',
              titleClass,
            )}
          >
            {study.title}
          </h1>
        </div>
      </header>

      {/* Meta strip */}
      <div className="border-y border-border bg-bg-elevated/40 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          <MetaCol label={t('metaClient')} value={study.client} />
          <MetaCol label={t('metaYears')} value={study.years} />
          <MetaCol label={t('metaRole')} value={study.role} />
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
              {t('metaStack')}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {study.stack.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-[11px] text-text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Three body sections */}
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 space-y-16 md:space-y-24">
        {sections.map((s) => (
          <section key={s.label}>
            <div className={cn('font-mono text-xs uppercase tracking-[0.18em]', s.eyebrowClass)}>
              {s.label}
            </div>
            <div className="mt-6 max-w-prose text-base md:text-lg leading-relaxed text-text-muted prose-invert space-y-5">
              <MDXRemote source={s.body} />
            </div>
          </section>
        ))}
      </div>

      {/* Prev / Next nav */}
      {(prev || next) && (
        <nav className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {prev && <AdjacentCard study={prev} label={t('prevLink')} direction="prev" />}
            {next && <AdjacentCard study={next} label={t('nextLink')} direction="next" />}
          </div>
        </nav>
      )}
    </article>
  );
}

function MetaCol({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
        {label}
      </div>
      <div className="mt-3 text-sm text-text">{value}</div>
    </div>
  );
}

function AdjacentCard({
  study,
  label,
  direction,
}: {
  study: CaseStudy;
  label: string;
  direction: 'prev' | 'next';
}) {
  const arrow = direction === 'prev' ? '←' : '→';
  const justify = direction === 'prev' ? 'text-left' : 'md:text-right';
  const slugHref = `/work/${study.slug}` as Parameters<typeof Link>[0]['href'];

  return (
    <Link
      href={slugHref}
      className={cn(
        'group relative block rounded-xl border border-border bg-bg-elevated/60 backdrop-blur-md',
        'p-6 md:p-8 transition-colors duration-[var(--duration-short)]',
        'hover:border-border-hover hover:bg-bg-elevated/85',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        justify,
      )}
      style={{
        boxShadow: `inset ${direction === 'prev' ? '3px' : '-3px'} 0 0 0 ${accentBorderColor(study.accent)}`,
      }}
    >
      <div
        className={cn(
          'font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint flex items-center gap-2',
          direction === 'next' && 'md:justify-end',
        )}
      >
        {direction === 'prev' && <span aria-hidden>{arrow}</span>}
        <span>{label}</span>
        {direction === 'next' && <span aria-hidden>{arrow}</span>}
      </div>
      <div className="mt-3 text-base md:text-lg font-semibold text-text leading-snug group-hover:text-text">
        {study.title}
      </div>
      <div className="mt-2 text-xs text-text-muted">{study.client}</div>
    </Link>
  );
}
