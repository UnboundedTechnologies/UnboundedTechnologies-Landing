import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

export type { Locale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/work': { en: '/work', fr: '/travaux' },
    '/work/[slug]': { en: '/work/[slug]', fr: '/travaux/[slug]' },
    '/services': { en: '/services', fr: '/services' },
    '/about': { en: '/about', fr: '/a-propos' },
    '/contact': { en: '/contact', fr: '/contact' },
    '/legal/privacy': { en: '/legal/privacy', fr: '/legal/confidentialite' },
    '/legal/terms': { en: '/legal/terms', fr: '/legal/conditions' },
  },
});

export const { Link, getPathname, redirect, usePathname, useRouter } = createNavigation(routing);
