import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { CommandPaletteWrapper } from '@/components/command-palette/command-palette-wrapper';
import { DevToolsGreeting } from '@/components/easter-egg/devtools-greeting';
import { Footer } from '@/components/nav/footer';
import { TopNav } from '@/components/nav/top-nav';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { type Locale, routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
