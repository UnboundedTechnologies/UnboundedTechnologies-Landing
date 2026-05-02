import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './language-switcher';
import { MobileMenu } from './mobile-menu';
import { NavSearchButton } from './nav-search-button';

export function TopNav() {
  const t = useTranslations('nav');
  const locale = useLocale() as 'en' | 'fr';
  return (
    <header className="sticky top-0 z-40 backdrop-blur-3xl backdrop-saturate-200 bg-bg/90 border-b border-white/[0.08] pt-[env(safe-area-inset-top)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_-16px_rgba(0,0,0,0.5)]">
      <nav className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
        {/* Left cluster: hamburger (mobile only) + logo */}
        <div className="flex items-center gap-2">
          <MobileMenu current={locale} />
          <Link href="/" aria-label="Unbounded Technologies Inc." className="flex items-center">
            <Image
              src="/ut-banner.png"
              alt="Unbounded Technologies Inc."
              width={1266}
              height={284}
              priority
              sizes="(min-width: 768px) 12rem, 9rem"
              className="h-7 md:h-8 w-auto"
            />
          </Link>
        </div>

        {/* Inline nav links: visible md+ */}
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

        {/* Right cluster: search + language + CTA on md+, just search on
            mobile (the CTA + language live inside the mobile menu). */}
        <div className="hidden md:flex items-center gap-2">
          <NavSearchButton />
          <LanguageSwitcher current={locale} />
          <Link
            href="/contact"
            className="ml-1 text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white active:scale-95 transition-transform duration-150"
          >
            {t('startProject')}
          </Link>
        </div>
        <div className="md:hidden flex items-center">
          <NavSearchButton />
        </div>
      </nav>
    </header>
  );
}
