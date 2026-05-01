import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './language-switcher';
import { NavSearchButton } from './nav-search-button';

export function TopNav() {
  const t = useTranslations('nav');
  const locale = useLocale() as 'en' | 'fr';
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/60 border-b border-border">
      <nav className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6">
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
        {/* Action cluster: search -> language -> CTA. Same order on
            mobile, just with tighter spacing. */}
        <div className="hidden lg:flex items-center gap-2">
          <NavSearchButton />
          <LanguageSwitcher current={locale} />
          <Link
            href="/contact"
            className="ml-1 text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white"
          >
            {t('startProject')}
          </Link>
        </div>
        <div className="lg:hidden flex items-center gap-1">
          <NavSearchButton />
          <LanguageSwitcher current={locale} />
          <Link
            href="/contact"
            className="ml-1 text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white"
          >
            {t('startProject')}
          </Link>
        </div>
      </nav>
    </header>
  );
}
