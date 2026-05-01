import { getTranslations } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { SectionAtmosphere } from '@/components/atmosphere/section-atmosphere';
import { GraphCanvas } from '@/components/impact-graph/graph-canvas';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Link, workHref } from '@/i18n/routing';
import {
  accentBorderColor,
  accentGlowColor,
  accentNumberClass,
  heroGradient,
  sectionEyebrowClass,
} from '@/lib/accents';
import type { CaseStudy } from '@/lib/case-studies';
import { getCaseStudyDiagram } from '@/lib/case-study-diagrams';
import { cn } from '@/lib/utils';

/**
 * Split a raw MDX body into exactly three prose chunks at lines beginning
 * with `## `. Order is fixed by the spec (Problem, Approach, Outcome): we
 * trust position rather than matching heading text, since FR uses different
 * heading words. The `## Heading` lines themselves are stripped; the layout
 * supplies its own labels from i18n.
 *
 * Expects exactly 3 `## ` headings at column 0 and no `## ` lines inside
 * fenced code blocks (current MDX content has no code fences). Throws if the
 * body does not have exactly three sections.
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
  const titleClass = study.accent === 'mixed' ? 'aurora-text' : 'text-text';

  const sections: ReadonlyArray<{
    label: string;
    body: string;
    eyebrowClass: string;
  }> = [
    {
      label: t('sectionProblem'),
      body: problem,
      eyebrowClass: sectionEyebrowClass(study.accent, 0),
    },
    {
      label: t('sectionApproach'),
      body: approach,
      eyebrowClass: sectionEyebrowClass(study.accent, 1),
    },
    {
      label: t('sectionOutcome'),
      body: outcome,
      eyebrowClass: sectionEyebrowClass(study.accent, 2),
    },
  ];

  return (
    <article className="relative">
      {/* Hero region: back link + title + meta strip share a single gradient
          backdrop so there is no visible seam where the hero ends and the meta
          begins. The gradient fades to transparent at its lower edge, blending
          into the body sections below. */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: heroGradient(study.accent) }}
        />

        {/* Back link */}
        <div className="relative mx-auto max-w-5xl px-6 pt-12 md:pt-16">
          <Link
            href="/work"
            className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-text transition-colors"
          >
            <span aria-hidden>←</span> {t('allWork')}
          </Link>
        </div>

        {/* Title block */}
        <header className="relative mx-auto max-w-5xl px-6 pt-12 pb-12 md:pt-16 md:pb-16">
          <Eyebrow className={cn(sectionEyebrowClass(study.accent, 0))}>{study.client}</Eyebrow>
          <h1
            className={cn(
              'mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[1.05] max-w-4xl',
              titleClass,
            )}
          >
            {study.title}
          </h1>
        </header>

        {/* Meta strip (no bg / no border, shares the hero gradient above) */}
        <div className="relative mx-auto max-w-5xl px-6 pb-16 md:pb-24 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
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
      <div className="relative overflow-hidden">
        <SectionAtmosphere accent={study.accent} position="top-right" intensity={0.7} />
        <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24 space-y-16 md:space-y-24">
          {sections.map((s) => (
            <section key={s.label}>
              <div
                className={cn('font-mono text-xs uppercase tracking-[0.18em]', s.eyebrowClass)}
              >
                {s.label}
              </div>
              <div className="mt-6 max-w-prose text-base md:text-lg leading-relaxed text-text-muted prose-invert space-y-5">
                <MDXRemote source={s.body} />
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Quantified outcome callouts (spec 6.2 item 5). Renders only when
          the case study declares a non-empty `stats` array in frontmatter. */}
      {study.stats && study.stats.length > 0 && (
        <section
          aria-labelledby="outcome-callouts"
          className="border-t border-border bg-bg-elevated/30"
        >
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
            <h2
              id="outcome-callouts"
              className={cn(
                'font-mono text-xs uppercase tracking-[0.18em]',
                sectionEyebrowClass(study.accent, 2),
              )}
            >
              {t('outcomeCallouts')}
            </h2>
            <div
              className={cn(
                'mt-8 grid gap-6',
                study.stats.length === 1
                  ? 'md:grid-cols-1 max-w-md'
                  : study.stats.length === 2
                    ? 'md:grid-cols-2'
                    : 'md:grid-cols-3',
              )}
            >
              {study.stats.map((s, i) => (
                <div
                  key={`${s.number}-${s.unit}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-bg-elevated p-8 transition-colors duration-[var(--duration-short)] hover:border-border-hover"
                >
                  <div
                    aria-hidden
                    className="services-orb absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                    style={{
                      background: accentGlowColor(study.accent, i),
                      animationDelay: `${i * 1500}ms`,
                    }}
                  />
                  <div
                    className={cn(
                      'relative font-mono text-4xl font-semibold tracking-tight',
                      accentNumberClass(study.accent, i),
                    )}
                  >
                    {s.number}
                  </div>
                  <div className="relative mt-2 text-text font-medium">{s.unit}</div>
                  {s.context && (
                    <div className="relative mt-3 text-sm text-text-muted">{s.context}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Inline tech diagram (spec 6.2 item 4). Renders only when frontmatter
          declares a `diagram` preset that resolves in case-study-diagrams.ts.
          BMO has no diagram per NDA. Self-links are suppressed via
          `activeSlug`. */}
      {(() => {
        if (!study.diagram) return null;
        const diagram = getCaseStudyDiagram(study.diagram);
        if (!diagram) return null;
        return (
          <section aria-labelledby="architecture-diagram" className="border-t border-border">
            <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
              <div
                className={cn(
                  'font-mono text-xs uppercase tracking-[0.18em]',
                  sectionEyebrowClass(study.accent, 1),
                )}
              >
                {t('architectureEyebrow')}
              </div>
              <h2
                id="architecture-diagram"
                className="mt-4 text-2xl md:text-3xl font-semibold tracking-[-0.02em] leading-tight max-w-2xl"
              >
                {t('architectureHeading')}
              </h2>
              <GraphCanvas
                nodes={diagram.nodes}
                edges={diagram.edges}
                variant="inline"
                activeSlug={study.slug}
              />
            </div>
          </section>
        );
      })()}

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

  return (
    <Link
      href={workHref(study.slug)}
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
