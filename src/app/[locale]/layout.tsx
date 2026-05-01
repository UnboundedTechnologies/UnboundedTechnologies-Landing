import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { CommandPaletteWrapper } from '@/components/command-palette/command-palette-wrapper';
import { DevToolsGreeting } from '@/components/easter-egg/devtools-greeting';
import { Footer } from '@/components/nav/footer';
import { TopNav } from '@/components/nav/top-nav';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { type Locale, routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unboundedtechnologies.com';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// hreflang alternates: every page declares the locale of its current
// rendering plus pointers to the EN and FR variants of the same route,
// plus an x-default that points to the EN home (search engines fall
// back to it for unmatched locales). Per-page metadata can override
// these via its own generateMetadata; this is the safe default for
// every route under [locale].
export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        fr: `${SITE_URL}/fr`,
        'x-default': `${SITE_URL}/en`,
      },
    },
    openGraph: {
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      alternateLocale: locale === 'fr' ? 'en_CA' : 'fr_CA',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <DevToolsGreeting />
        <div className="grain min-h-screen flex flex-col">
          <TopNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CommandPaletteWrapper locale={locale as Locale} />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
