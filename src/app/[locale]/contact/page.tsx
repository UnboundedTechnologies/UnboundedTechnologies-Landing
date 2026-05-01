import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { ContactSurface } from '@/components/funnel/contact-surface';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { env } from '@/lib/env';

// `/contact` qualified-inquiry funnel (Phase 9). Server-rendered hero +
// intro paragraph; the form / thank-you state machine lives in
// ContactSurface (client component). Calendly URL is pulled here on the
// server and threaded through as a prop because CALENDLY_URL isn't a
// NEXT_PUBLIC variable.

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contactPage');

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <AuroraOrbs />
      <div className="relative mx-auto max-w-3xl px-6">
        <div className="text-center">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[1.05]">
            {t('headlineLead')}
            <br />
            <span className="aurora-text">{t('headlineAccent')}</span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            {t('intro')}
          </p>
        </div>
        <div className="mt-14 md:mt-16">
          <ContactSurface calendlyUrl={env.CALENDLY_URL} />
        </div>
      </div>
    </section>
  );
}
