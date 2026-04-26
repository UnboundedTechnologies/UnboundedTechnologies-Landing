import { cn } from '@/lib/utils';

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('font-mono text-xs uppercase tracking-[0.18em] text-brand-blue', className)}>
      {children}
    </div>
  );
}
