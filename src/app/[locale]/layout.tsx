import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { PersistentInfinityLogo } from '@/components/hero/persistent-infinity-logo';
import { Footer } from '@/components/nav/footer';
import { TopNav } from '@/components/nav/top-nav';
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
      <div className="grain min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1">{children}</main>
        <Footer />
        <PersistentInfinityLogo />
      </div>
    </NextIntlClientProvider>
  );
}
