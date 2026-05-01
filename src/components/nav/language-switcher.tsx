'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

// Planet-icon button in the top nav. Click opens a tiny popover with
// the available locales; picking one swaps the locale via next-intl's
// router while preserving the current route + dynamic params.
//
// Why useParams + an object href: next-intl's `usePathname()` returns
// the unlocalized route pattern (e.g. '/work/[slug]'), not the resolved
// path. Passing that string straight to the router with a locale switch
// gives '/fr/work/[slug]' literally - 404. We pull the actual params
// from Next.js's `useParams()` and pass an object href so next-intl can
// substitute placeholders AND apply the locale's pathname mapping
// (e.g. /work/[slug] -> /travaux/[slug] in FR).

const LOCALES = [
  { code: 'en' as const, label: 'English', short: 'EN' },
  { code: 'fr' as const, label: 'Français', short: 'FR' },
];

type Props = {
  current: 'en' | 'fr';
};

export function LanguageSwitcher({ current }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const switchLocale = (loc: 'en' | 'fr') => {
    setOpen(false);
    if (loc === current) return;

    // We can't trust `usePathname()` to consistently return the route
    // pattern on every render (it sometimes resolves to the literal path
    // after a few navigations, depending on router cache state). Trust
    // useParams instead: if a slug is present, we KNOW we're on the only
    // dynamic route we have today (/work/[slug]), so build the descriptor
    // explicitly. For static routes the string pathname is fine because
    // next-intl's pathnames mapping handles them deterministically.
    if (params.slug) {
      router.replace(
        // biome-ignore lint/suspicious/noExplicitAny: typed pathnames union is too narrow for runtime descriptors
        { pathname: '/work/[slug]' as any, params: { slug: params.slug } },
        { locale: loc },
      );
    } else {
      // biome-ignore lint/suspicious/noExplicitAny: same reason
      router.replace(pathname as any, { locale: loc });
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Language: ${current.toUpperCase()}`}
        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full cursor-pointer text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
      >
        <GlobeIcon className="h-4 w-4" />
        {/* Tooltip - desktop affordance only; hidden on mobile. */}
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute top-full right-0 mt-2 z-50 hidden md:flex items-center gap-2 whitespace-nowrap',
            'rounded-md border border-border bg-bg-elevated/95 backdrop-blur-md px-3 py-1.5',
            'text-xs text-text-muted',
            'opacity-0 translate-y-1 transition-[opacity,transform] duration-200',
            // Hide the tooltip while the menu is open so they don't overlap.
            !open && 'group-hover:opacity-100 group-hover:translate-y-0',
            !open && 'group-focus-visible:opacity-100 group-focus-visible:translate-y-0',
            'shadow-lg shadow-black/40',
          )}
        >
          <span>Language</span>
          <kbd className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text">
            {current.toUpperCase()}
          </kbd>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Language"
          className={cn(
            // right-2 on mobile so the menu doesn't clip past the screen
            // edge when the trigger sits flush right; right-0 on md+
            // where the nav has more breathing room.
            'absolute right-2 md:right-0 top-full mt-2 z-50 w-[180px] max-w-[calc(100vw-1rem)] origin-top-right',
            'rounded-xl border border-white/[0.08] bg-bg-elevated/90 backdrop-blur-2xl',
            '[box-shadow:0_18px_48px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]',
            'p-1.5',
            'animate-[palette-content-in_180ms_cubic-bezier(0.16,1,0.3,1)]',
          )}
        >
          {LOCALES.map((l) => {
            const isActive = l.code === current;
            return (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => switchLocale(l.code)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm cursor-pointer',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-brand-blue/10 text-text'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-text-faint w-6">{l.short}</span>
                  <span>{l.label}</span>
                </span>
                {isActive && (
                  <span aria-hidden className="text-brand-blue text-xs">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <title>Language</title>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 12 H21 M12 3 C14.5 6 14.5 18 12 21 M12 3 C9.5 6 9.5 18 12 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
