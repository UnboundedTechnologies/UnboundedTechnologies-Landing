import type { MetadataRoute } from 'next';
import { getPathname, routing } from '@/i18n/routing';
import { getCaseStudySlugs } from '@/lib/case-studies';

// Sitemap covers every static route × every locale, plus every case
// study × every locale. Routes are emitted in the locale's actual
// pathname (e.g. /fr/travaux/foo, not /fr/work/foo) by running them
// through next-intl's getPathname so the FR variants map correctly.
//
// Cache: this is a Next.js metadata route. With cacheComponents on we
// run at build time for static prerendering, so re-deploying refreshes
// it. No revalidate set; case-study slugs only change between releases.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unboundedtechnologies.com';

type StaticRoute = { href: Parameters<typeof getPathname>[0]['href']; priority: number };

const STATIC_ROUTES: StaticRoute[] = [
  { href: '/', priority: 1.0 },
  { href: '/work', priority: 0.8 },
  { href: '/services', priority: 0.8 },
  { href: '/about', priority: 0.7 },
  { href: '/contact', priority: 0.9 },
  { href: '/legal/privacy', priority: 0.3 },
  { href: '/legal/terms', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getCaseStudySlugs();
  const lastModified = new Date();
  const out: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const r of STATIC_ROUTES) {
      const localizedPath = getPathname({ href: r.href, locale });
      out.push({
        url: `${SITE_URL}${localizedPath}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: r.priority,
      });
    }
    for (const slug of slugs) {
      const localizedPath = getPathname({
        href: { pathname: '/work/[slug]', params: { slug } },
        locale,
      });
      out.push({
        url: `${SITE_URL}${localizedPath}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return out;
}
