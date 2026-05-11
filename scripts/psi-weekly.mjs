// Used by .github/workflows/lighthouse-weekly.yml. Reads the PSI JSON for
// mobile + desktop from out/, applies per-strategy score thresholds, writes
// a markdown summary, and emits GitHub Action outputs (failed flag + summary
// for the issue body).
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

// Per-strategy thresholds. Real Chrome on real GPU should comfortably hit
// these. If any score drops below, we mark failed=true and the workflow opens
// a regression issue. A11y/BP/SEO stay flat at 95/90/90 across strategies.
const THRESHOLDS = {
  // Observed real-prod scores over four weekly PSI runs (2026-05-03 to
  // 2026-05-11):
  //   mobile  perf 95-97 (very stable; one outlier at 86 on 2026-05-04)
  //   desktop perf 69-87 (median 77; ~20pt spread of pure noise)
  // Mobile a11y/bp/seo stay flat at 98/100/92 every run.
  //
  // Desktop perf is dominated by Total Blocking Time on PSI's shared cloud
  // Lighthouse runner. With FCP 0.4s, LCP 0.7s, CLS 0, TTI 1.1s on every
  // run, the only thing moving the desktop score is TBT variance from
  // runner CPU contention (PSI desktop has no throttling, so contention is
  // the dominant signal). This is real lab noise, not a real regression.
  //
  // Threshold policy: ~10pts below the typical floor of the observed range,
  // so the workflow only opens an issue on real regressions, not on weekly
  // PSI runner jitter. Desktop floor is ~75, so threshold 65. Mobile is
  // tight, so threshold stays at 90.
  mobile: { performance: 90, accessibility: 95, 'best-practices': 90, seo: 90 },
  desktop: { performance: 65, accessibility: 95, 'best-practices': 90, seo: 90 },
};

const lines = [];
let failed = false;
const mobileScores = {};

for (const strat of ['mobile', 'desktop']) {
  const j = JSON.parse(readFileSync(`out/psi-${strat}.json`, 'utf8'));
  const cats = j.lighthouseResult?.categories ?? {};
  lines.push('');
  lines.push(`### ${strat[0].toUpperCase() + strat.slice(1)}`);
  lines.push('| Category | Score | Threshold | Status |');
  lines.push('|---|---|---|---|');
  for (const [k, t] of Object.entries(THRESHOLDS[strat])) {
    const score = Math.round((cats[k]?.score ?? 0) * 100);
    const ok = score >= t;
    if (!ok) failed = true;
    lines.push(`| ${k} | ${score} | ${t} | ${ok ? 'OK' : 'FAIL'} |`);
    if (strat === 'mobile') mobileScores[k] = score;
  }
}

const md = lines.join('\n');
writeFileSync('out/summary.md', md);
console.log(md);

// Update public/lighthouse.json with the latest mobile scores so the footer
// PerfScorecard chip shows real numbers. Mobile is the more conservative
// signal (worst-case real user). The PerfScorecard component reads the
// `performance` field as the primary number.
const lighthouseJson = {
  performance: mobileScores.performance,
  accessibility: mobileScores.accessibility,
  bestPractices: mobileScores['best-practices'],
  seo: mobileScores.seo,
  fetchedAt: new Date().toISOString(),
  _note:
    'Updated weekly by .github/workflows/lighthouse-weekly.yml from PageSpeed Insights mobile run.',
};
writeFileSync('public/lighthouse.json', `${JSON.stringify(lighthouseJson, null, 2)}\n`);

// Emit GitHub Action outputs.
const out = process.env.GITHUB_OUTPUT;
if (out) {
  appendFileSync(out, `failed=${failed}\n`);
  appendFileSync(out, `summary<<__EOF__\n${md}\n__EOF__\n`);
}
