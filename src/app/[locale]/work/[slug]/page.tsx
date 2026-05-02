import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CaseStudyLayout } from '@/components/case-study/case-study-layout';
import {
  getAdjacentCaseStudies,
  getCaseStudy,
  getCaseStudySlugs,
  type Locale,
} from '@/lib/case-studies';
import { type OgLocale, ogImageMetadata } from '@/lib/og';

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const study = await getCaseStudy(slug, locale as Locale);
  if (!study) {
    return { title: 'Unbounded Technologies Inc.' };
  }

  // First non-empty paragraph from the body, capped at ~160 chars, used as the
  // meta description. The body always starts with a `## Problem` heading so we
  // skip the heading line and pick the first prose paragraph that follows.
  const firstParagraph = study.body
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.startsWith('#'))[0]
    ?.trim();

  const description = firstParagraph
    ? firstParagraph.length > 160
      ? `${firstParagraph.slice(0, 157)}...`
      : firstParagraph
    : study.title;

  // EN uses /work/<slug>, FR uses /travaux/<slug>. Slug is locale-agnostic.
  const segment = locale === 'fr' ? 'travaux' : 'work';
  const og = ogImageMetadata(locale as OgLocale, [segment, slug]);

  return {
    title: `${study.title} | Unbounded Technologies Inc.`,
    description,
    openGraph: {
      title: study.title,
      description,
      images: og.openGraph.images,
    },
    twitter: { ...og.twitter, title: study.title, description },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const study = await getCaseStudy(slug, locale as Locale);
  if (!study) {
    notFound();
  }

  const { prev, next } = await getAdjacentCaseStudies(slug, locale as Locale);

  return <CaseStudyLayout study={study} prev={prev} next={next} />;
}
