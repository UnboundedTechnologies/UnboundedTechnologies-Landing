// Helpers for wiring per-page Open Graph + Twitter image metadata to the
// dynamic OG handler at /api/og/[...slug]. The handler accepts a path of
// shape /api/og/{locale}/{...segments} and renders a 1200x630 PNG. Pages
// pass a precomputed path to `ogImageMetadata()` and merge the result into
// their `generateMetadata` return value.

import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';

export type OgLocale = 'en' | 'fr';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unboundedtechnologies.com';

const messagesByLocale = {
  en: enMessages,
  fr: frMessages,
} as const;

// Coerce any incoming string to a known locale. The [locale] segment in the
// app router can technically receive an arbitrary value when a not-found
// fallback or a catch-all sibling route invokes generateMetadata before the
// `routing.locales.includes(...)` notFound() check fires. Default to EN so
// the metadata block stays well-formed in those edge cases.
function asOgLocale(locale: string): OgLocale {
  return locale === 'fr' ? 'fr' : 'en';
}

/**
 * Builds the absolute URL for the dynamic OG image. The handler matches a
 * catch-all at /api/og/[...slug] so any structured tail works:
 *   ogImagePath('en')                         -> /api/og/en
 *   ogImagePath('en', ['work'])               -> /api/og/en/work
 *   ogImagePath('en', ['work', 'renault'])    -> /api/og/en/work/renault
 *   ogImagePath('fr', ['a-propos'])           -> /api/og/fr/a-propos
 *
 * The handler does not consult the request URL beyond the segment list, so
 * any well-formed path is safe to pass.
 */
export function ogImagePath(locale: string, segments: ReadonlyArray<string> = []): string {
  const safe = asOgLocale(locale);
  const tail = segments.length === 0 ? '' : `/${segments.join('/')}`;
  return `${SITE_URL}/api/og/${safe}${tail}`;
}

/**
 * Returns the `openGraph.images` + `twitter` blocks for a page, ready to be
 * spread into the page's `generateMetadata` Metadata return. The alt text is
 * pulled from the i18n bundle so a screen-reader hitting a shared link gets
 * the right language.
 */
export function ogImageMetadata(
  locale: string,
  segments: ReadonlyArray<string> = [],
): {
  openGraph: { images: { url: string; width: number; height: number; alt: string }[] };
  twitter: {
    card: 'summary_large_image';
    images: { url: string; width: number; height: number; alt: string }[];
  };
} {
  const safe = asOgLocale(locale);
  const url = ogImagePath(safe, segments);
  const alt = messagesByLocale[safe].og.alt;
  const image = { url, width: 1200, height: 630, alt };
  return {
    openGraph: { images: [image] },
    twitter: { card: 'summary_large_image', images: [image] },
  };
}
