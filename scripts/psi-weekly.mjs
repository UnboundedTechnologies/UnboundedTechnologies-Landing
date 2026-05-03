// Used by .github/workflows/lighthouse-weekly.yml. Reads the PSI JSON for
// mobile + desktop from out/, applies per-strategy score thresholds, writes
// a markdown summary, and emits GitHub Action outputs (failed flag + summary
// for the issue body).
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

// Per-strategy thresholds. Real Chrome on real GPU should comfortably hit
// these. If any score drops below, we mark failed=true and the workflow opens
// a regression issue. A11y/BP/SEO stay flat at 95/90/90 across strategies.
const THRESHOLDS = {
  // Real-prod baseline (post-PSI tuning 2026-05-03):
  //   mobile  perf 97 / a11y 98 / bp 100 / seo 92
  //   desktop perf 87 / a11y 98 / bp 100 / seo 92
  // Thresholds are set ~10pts below current scores so they catch real
  // regressions but don't spam issues for normal small drift.
  mobile: { performance: 90, accessibility: 95, 'best-practices': 90, seo: 90 },
  desktop: { performance: 80, accessibility: 95, 'best-practices': 90, seo: 90 },
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
