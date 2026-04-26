import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { Link } from '@/i18n/routing';
import { LivePresence } from './live-presence';

export function TopNav() {
  const t = useTranslations('nav');
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/60 border-b border-border">
      <nav className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="font-semibold tracking-tight">
          ∞ Unbounded<span className="opacity-50">.</span>
        </Link>
        <ul className="hidden md:flex items-center gap-6 text-sm text-text-muted">
          <li>
            <Link href="/work" className="hover:text-text">
              {t('work')}
            </Link>
          </li>
          <li>
            <Link href="/services" className="hover:text-text">
              {t('services')}
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-text">
              {t('about')}
            </Link>
          </li>
        </ul>
        <div className="hidden lg:flex items-center gap-4">
          <Suspense fallback={null}>
            <LivePresence />
          </Suspense>
          <Link
            href="/contact"
            className="text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white"
          >
            {t('startProject')}
          </Link>
        </div>
        <Link
          href="/contact"
          className="lg:hidden text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white"
        >
          {t('startProject')}
        </Link>
      </nav>
    </header>
  );
}
