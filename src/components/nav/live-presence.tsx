'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { isWorkingHours, torontoTimeString } from '@/lib/time';

export function LivePresence() {
  const t = useTranslations('presence');
  const [time, setTime] = useState(torontoTimeString);
  const [working, setWorking] = useState(isWorkingHours);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(torontoTimeString());
      setWorking(isWorkingHours());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono backdrop-blur-md">
      <span
        className={`h-1.5 w-1.5 rounded-full ${working ? 'bg-success animate-pulse' : 'bg-text-faint'}`}
      />
      <span className="uppercase tracking-widest text-text-muted">
        {working ? t('available') : t('offline')} · Toronto · {time} EDT
      </span>
    </div>
  );
}
