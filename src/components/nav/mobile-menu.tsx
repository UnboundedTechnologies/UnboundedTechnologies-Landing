'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';

// Mobile-only nav drawer. Hamburger button on the left, opens a full-
// screen overlay with all navigation entries + language switcher + CTA.
// Hidden at md+ where the inline nav is plenty.
//
// Built on Radix Dialog for free a11y (focus trap, scroll lock, Esc to
// close) and visual consistency with the command palette.

const NAV_LINKS = [
  { href: '/work' as const, key: 'work' },
  { href: '/services' as const, key: 'services' },
  { href: '/about' as const, key: 'about' },
  { href: '/contact' as const, key: 'contact' },
];

type Props = {
  current: 'en' | 'fr';
};

export function MobileMenu({ current }: Props) {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  // Close on route change. We can't easily detect that here without a
  // pathname listener, but Radix Dialog manages its own portal and
  // we tear down by listening for popstate as a stand-in for nav.
  useEffect(() => {
    const onPop = () => setOpen(false);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t('menuOpen')}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full cursor-pointer text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <title>Menu</title>
            <path
              d="M4 7 H20 M4 12 H20 M4 17 H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-[150] bg-bg/70 backdrop-blur-md',
            'data-[state=open]:animate-[palette-overlay-in_240ms_ease-out]',
            'data-[state=closed]:animate-[palette-overlay-out_180ms_ease-out]',
          )}
        />
        <Dialog.Content
          aria-label="Menu"
          className={cn(
            'fixed top-0 left-0 right-0 z-[151] mx-auto',
            'border-b border-white/[0.08] bg-bg-elevated/95 backdrop-blur-3xl',
            '[box-shadow:0_24px_60px_-12px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)]',
            'data-[state=open]:animate-[mobile-menu-in_240ms_cubic-bezier(0.16,1,0.3,1)]',
            'data-[state=closed]:animate-[mobile-menu-out_180ms_cubic-bezier(0.16,1,0.3,1)]',
          )}
        >
          <Dialog.Title className="sr-only">{t('menuOpen')}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Site navigation, language and contact actions.
          </Dialog.Description>

          {/* Header row: matches the nav height + close button on the right */}
          <div className="flex items-center justify-between h-16 px-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
              MENU
            </span>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t('menuClose')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full cursor-pointer text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <title>Close</title>
                  <path
                    d="M6 6 L18 18 M18 6 L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Big tappable nav links */}
          <ul className="px-6 pt-2 pb-6 space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium text-text',
                    'hover:bg-surface-hover active:bg-surface-hover',
                    'transition-colors duration-150',
                  )}
                >
                  <span>{t(l.key)}</span>
                  <span aria-hidden className="text-text-faint">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Footer row: language switcher + CTA. Switcher uses direction="up"
              so its dropdown opens above the trigger - the dialog has
              overflow:hidden and a downward dropdown gets clipped. */}
          <div className="px-6 pb-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
            <LanguageSwitcher current={current} direction="up" />
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold px-4 py-2.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white active:scale-95 transition-transform duration-150"
            >
              {t('startProject')}
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
