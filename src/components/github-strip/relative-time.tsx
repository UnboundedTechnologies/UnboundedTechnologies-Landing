'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Tiny client component that renders a "Xm ago" string and refreshes
// every minute. Lives in client land because Date.now() in a Cache
// Components prerender is disallowed. SSR renders an empty span; the
// formatted value pops in after hydration.
type Props = {
  iso: string;
  className?: string;
};

function format(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function RelativeTime({ iso, className }: Props) {
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    setLabel(format(iso));
    const id = setInterval(() => setLabel(format(iso)), 60_000);
    return () => clearInterval(id);
  }, [iso]);

  return <span className={cn('tabular-nums', className)}>{label}</span>;
}
