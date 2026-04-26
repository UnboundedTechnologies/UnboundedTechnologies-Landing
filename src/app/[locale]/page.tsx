import { setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <h1 className="text-5xl font-semibold tracking-tight">Hero coming in Phase 3</h1>
    </div>
  );
}
