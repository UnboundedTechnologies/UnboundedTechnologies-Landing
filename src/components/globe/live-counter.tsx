'use client';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// Cumulative API-call counter anchored to a public tenure start. The seed is
// the ballpark we want to display on first paint (and the value SSR emits);
// after hydration the client recomputes from `Date.now()` and ticks once a
// second. The seed-on-SSR pattern avoids a hydration mismatch that would
// occur if we computed the live value during render (server clock != client
// clock).
//
// Rate is intentionally a round-number narrative figure ("+47/sec, ~4B/mo")
// not a measured production metric.

const BASELINE_PER_SEC = 47;
const TENURE_START = new Date('2020-09-01T00:00:00Z').getTime();
const SEED = 4_000_000_000 * 12 * 6;

function computeCount(now: number): number {
  const secsSinceStart = (now - TENURE_START) / 1000;
  return SEED + Math.floor(secsSinceStart * BASELINE_PER_SEC);
}

export function LiveCounter() {
  const t = useTranslations('globe');
  const format = useFormatter();
  const [count, setCount] = useState(SEED);

  useEffect(() => {
    setCount(computeCount(Date.now()));
    const id = setInterval(() => setCount(computeCount(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-surface border border-border rounded-xl p-6 backdrop-blur-md">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-brand-blue">
        {t('counterTitle')}
      </div>
      <div className="font-mono text-3xl md:text-4xl font-semibold tracking-tight mt-3 tabular-nums">
        {format.number(count)}
      </div>
      <div className="font-mono text-xs text-text-muted mt-2">{t('counterUnit')}</div>
    </div>
  );
}
