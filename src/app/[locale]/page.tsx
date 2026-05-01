import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { GitHubActivityStrip } from '@/components/github-strip/github-activity-strip';
import { GlobeSection } from '@/components/globe/globe-section';
import { Hero } from '@/components/hero/hero';
import { ImpactGraph } from '@/components/impact-graph/impact-graph';
import { OutcomeRibbon } from '@/components/outcomes/outcome-ribbon';
import { ServicesPillars } from '@/components/services/services-pillars';
import { TrustedByStrip } from '@/components/trusted-by/trusted-by-strip';
import { type OgLocale, ogImageMetadata } from '@/lib/og';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const og = ogImageMetadata(locale as OgLocale);
  return {
    openGraph: { images: og.openGraph.images },
    twitter: og.twitter,
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <TrustedByStrip />
      <OutcomeRibbon />
      <GlobeSection />
      <ServicesPillars />
      <ImpactGraph />
      <GitHubActivityStrip />
    </>
  );
}
