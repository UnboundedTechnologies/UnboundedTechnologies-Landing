// Summarize the Lighthouse-CI artifact: median scores per URL, key metrics.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = process.argv[2] ?? '/tmp/lh-out';
const files = readdirSync(dir).filter((f) => f.endsWith('.report.json'));

const byUrl = new Map();
for (const f of files) {
  const j = JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
  const u = j.finalUrl ?? j.requestedUrl ?? f;
  const path = new URL(u).pathname;
  const cats = j.categories ?? {};
  const audits = j.audits ?? {};
  const metric = (k) => audits[k]?.numericValue ?? null;
  const row = {
    perf: Math.round((cats.performance?.score ?? 0) * 100),
    a11y: Math.round((cats.accessibility?.score ?? 0) * 100),
    bp: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
    fcp: metric('first-contentful-paint'),
    lcp: metric('largest-contentful-paint'),
    cls: metric('cumulative-layout-shift'),
    tbt: metric('total-blocking-time'),
    si: metric('speed-index'),
    tti: metric('interactive'),
  };
  if (!byUrl.has(path)) byUrl.set(path, []);
  byUrl.get(path).push(row);
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

console.log('\nURL                              perf  a11y  bp   seo   FCP    LCP    TBT   SI     TTI');
console.log('-'.repeat(100));
for (const [path, rows] of [...byUrl.entries()].sort()) {
  const med = (k) => median(rows.map((r) => r[k]));
  console.log(
    path.padEnd(30),
    String(med('perf')).padEnd(5),
    String(med('a11y')).padEnd(5),
    String(med('bp')).padEnd(4),
    String(med('seo')).padEnd(5),
    `${(med('fcp') / 1000).toFixed(1)}s`.padEnd(6),
    `${(med('lcp') / 1000).toFixed(1)}s`.padEnd(6),
    `${med('tbt')}ms`.padEnd(6),
    `${(med('si') / 1000).toFixed(1)}s`.padEnd(6),
    `${(med('tti') / 1000).toFixed(1)}s`,
  );
}
