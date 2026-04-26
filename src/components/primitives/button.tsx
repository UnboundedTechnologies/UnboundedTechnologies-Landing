import { cn } from '@/lib/utils';
import { type AnchorHTMLAttributes, forwardRef } from 'react';

type Variant = 'gradient' | 'ghost' | 'mono';
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant };

export const ButtonLink = forwardRef<HTMLAnchorElement, Props>(({ variant = 'gradient', className, children, ...rest }, ref) => {
  const base = 'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-[var(--duration-short)]';
  const variants = {
    gradient: 'bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:opacity-90',
    ghost: 'border border-border text-text hover:bg-surface backdrop-blur-md',
    mono: 'font-mono text-xs uppercase tracking-widest text-text-muted hover:text-text',
  };
  return <a ref={ref} className={cn(base, variants[variant], className)} {...rest}>{children}</a>;
});
ButtonLink.displayName = 'ButtonLink';
