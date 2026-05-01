'use client';

import { useEffect, useState } from 'react';

// Footer chip showing the latest production Lighthouse Performance score.
// The CI workflow (Phase 12.2) writes /lighthouse.json with at minimum
// `{ performance: number }`. Until that workflow exists, the file is
// absent and this component renders nothing - graceful invisibility.
//
// Lives in the footer so it doesn't compete for hero attention but
// signals to a casual visitor that we're not just talking about quality
// - we're metering it in CI.

type LighthouseScores = {
  performance?: number;
  accessibility?: number;
  bestPractices?: number;
  seo?: number;
  fetchedAt?: string;
};

export function PerfScorecard() {
  const [scores, setScores] = useState<LighthouseScores | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/lighthouse.json', { cache: 'force-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LighthouseScores | null) => {
        if (!cancelled && data && typeof data.performance === 'number') {
          setScores(data);
        }
      })
      .catch(() => {
        /* ignore - file probably doesn't exist yet */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!scores || typeof scores.performance !== 'number') return null;
  const score = Math.round(scores.performance);
  const tone =
    score >= 95
      ? 'text-success border-success/40'
      : score >= 85
        ? 'text-warn border-warn/40'
        : 'text-error border-error/40';

  return (
    <a
      href="https://pagespeed.web.dev/?url=https%3A%2F%2Funboundedtechnologies.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide transition-opacity hover:opacity-80 ${tone}`}
      title="Latest Lighthouse Performance score (PageSpeed Insights)"
    >
      <span aria-hidden>▴</span>
      <span>{score} / 100</span>
    </a>
  );
}
