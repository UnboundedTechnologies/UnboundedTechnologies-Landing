import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { type Locale, routing } from '@/i18n/routing';
import NotFound from '../not-found';

// Catch-all that renders the branded 404 UI directly for any unmatched path
// under /en/* or /fr/*. Returns 200, not 404 - the alternative (calling
// notFound() from a server component under cacheComponents: true) produces
// an incomplete RSC stream that Chrome rejects with its native error page.
// We compensate for the SEO impact with `robots: noindex,nofollow` so search
// engines don't index garbage URLs.

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, rest: ['_'] }));
}

export const metadata: Metadata = {
  title: '404 - Page not found',
  robots: { index: false, follow: false, nocache: true },
};

export default async function CatchAll({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <Suspense fallback={null}>
      <NotFound />
    </Suspense>
  );
}
