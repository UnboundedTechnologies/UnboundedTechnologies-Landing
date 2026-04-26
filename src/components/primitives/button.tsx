import { type AnchorHTMLAttributes, forwardRef } from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type Variant = 'gradient' | 'ghost' | 'mono';
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string };

const BASE =
  'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-[var(--duration-short)]';

const VARIANTS: Record<Variant, string> = {
  gradient: 'bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:opacity-90',
  ghost: 'border border-border text-text hover:bg-surface backdrop-blur-md',
  mono: 'font-mono text-xs uppercase tracking-widest text-text-muted hover:text-text',
};

function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

export const ButtonLink = forwardRef<HTMLAnchorElement, Props>(
  ({ variant = 'gradient', className, children, href, ...rest }, ref) => {
    const classes = cn(BASE, VARIANTS[variant], className);

    if (isInternalHref(href)) {
      return (
        <Link
          ref={ref}
          // next-intl Link expects a typed href union from the routing config; callers pass
          // runtime strings, so we widen here. Locale prefix is added automatically.
          href={href as Parameters<typeof Link>[0]['href']}
          className={classes}
          {...rest}
        >
          {children}
        </Link>
      );
    }

    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  },
);

ButtonLink.displayName = 'ButtonLink';
