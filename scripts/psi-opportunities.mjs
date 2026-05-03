// Inspect a PSI JSON to surface the top performance opportunities.
import { readFileSync } from 'node:fs';

const file = process.argv[2] ?? '/tmp/psi-out/psi-mobile.json';
const j = JSON.parse(readFileSync(file, 'utf8'));
const audits = j.lighthouseResult?.audits ?? {};

const metrics = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive',
];

console.log(`\n=== ${file} ===`);
console.log('\n## Metrics');
for (const m of metrics) {
  const a = audits[m];
  if (!a) continue;
  console.log(
    `${m.padEnd(28)}  ${(a.displayValue || '').padEnd(10)}  score: ${Math.round((a.score ?? 0) * 100)}`,
  );
}

console.log('\n## Top opportunities (with potential savings)');
const opps = Object.values(audits)
  .filter((a) => a.details?.type === 'opportunity' && a.numericValue > 0)
  .sort((a, b) => (b.numericValue ?? 0) - (a.numericValue ?? 0));
for (const a of opps.slice(0, 10)) {
  console.log(`${a.title.slice(0, 60).padEnd(62)}  saves ~${Math.round(a.numericValue)}ms`);
}

console.log('\n## Failed diagnostics (score < 0.9)');
const failed = Object.values(audits)
  .filter((a) => a.score !== null && a.score !== undefined && a.score < 0.9 && a.details)
  .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
for (const a of failed.slice(0, 10)) {
  console.log(
    `${(a.title || '').slice(0, 60).padEnd(62)}  score: ${Math.round((a.score ?? 0) * 100)}  ${a.displayValue ?? ''}`,
  );
}
