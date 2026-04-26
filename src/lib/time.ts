const TZ = 'America/Toronto';

export function torontoTimeString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date());
}

export function isWorkingHours(): boolean {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, weekday: 'short', hour: '2-digit', hour12: false });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const day = parts.weekday;
  const hour = Number(parts.hour);
  const isWeekday = !['Sat', 'Sun'].includes(day);
  return isWeekday && hour >= 9 && hour < 18;
}
