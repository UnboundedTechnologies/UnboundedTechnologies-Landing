import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from './config';

export type { Locale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // English is the default and the bare URL (any path that gets to the locale middleware
  // without an /en or /fr prefix) MUST resolve to English. Browser Accept-Language is ignored.
  localeDetection: false,
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

/**
 * Build a typed `/work/{slug}` href for `<Link>`. Centralizes the cast that
 * tells next-intl's typed-routes machinery the dynamic slug is a valid
 * `[slug]` for the `/work/[slug]` pathname.
 */
export const workHref = (slug: string) => `/work/${slug}` as Parameters<typeof Link>[0]['href'];
