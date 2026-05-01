import type { MetadataRoute } from 'next';

// Robots.txt: open to crawlers, with /api blocked (POST-only contact
// endpoint, nothing to index). Sitemap pointer goes to the production
// host so search engines find every locale × every route.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unboundedtechnologies.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
