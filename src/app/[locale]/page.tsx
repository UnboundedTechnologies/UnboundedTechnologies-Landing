import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/hero/hero';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Hero />;
}
