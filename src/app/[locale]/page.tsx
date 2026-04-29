import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/hero/hero';
import { OutcomeRibbon } from '@/components/outcomes/outcome-ribbon';
import { ServicesPillars } from '@/components/services/services-pillars';
import { TrustedByStrip } from '@/components/trusted-by/trusted-by-strip';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <TrustedByStrip />
      <OutcomeRibbon />
      <ServicesPillars />
    </>
  );
}
