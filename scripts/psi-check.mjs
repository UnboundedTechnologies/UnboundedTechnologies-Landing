// One-shot PageSpeed Insights check for prod. Run with: node scripts/psi-check.mjs
const URL_TO_TEST = 'https://unboundedtechnologies.com';

async function fetchPSI(strategy) {
  const u = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  u.searchParams.set('url', URL_TO_TEST);
  u.searchParams.set('strategy', strategy);
  for (const c of ['performance', 'accessibility', 'best-practices', 'seo']) {
    u.searchParams.append('category', c);
  }
  const res = await fetch(u);
  if (!res.ok) throw new Error(`PSI ${strategy} ${res.status}`);
  return res.json();
}

async function report(strategy) {
  console.log(`\n=== ${strategy.toUpperCase()} (${URL_TO_TEST}) ===`);
  const j = await fetchPSI(strategy);
  const cats = j.lighthouseResult?.categories ?? {};
  const audits = j.lighthouseResult?.audits ?? {};
  for (const [k, v] of Object.entries(cats)) {
    console.log(k.padEnd(20), Math.round((v.score ?? 0) * 100));
  }
  console.log('');
  const metrics = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'cumulative-layout-shift',
    'total-blocking-time',
    'speed-index',
    'interactive',
  ];
  for (const m of metrics) {
    const a = audits[m];
    if (a) {
      console.log(
        m.padEnd(28),
        (a.displayValue || '').padEnd(12),
        'score:',
        Math.round((a.score ?? 0) * 100),
      );
    }
  }
}

await report('mobile');
await report('desktop');
