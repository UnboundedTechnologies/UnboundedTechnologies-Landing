import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuroraOrbs } from '@/components/atmosphere/aurora-orbs';
import { Eyebrow } from '@/components/primitives/eyebrow';

// Placeholder /contact page. The qualified-inquiry funnel (form, Turnstile,
// rate-limit, Notion CRM, Resend email) ships in Phase 9; until then this
// page exists to (1) give visitors a real way to start a conversation by
// email and (2) keep the route present so RSC prefetches from the nav and
// CTAs across the site stop returning 404.

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contactPage');

  return (
    <section className="relative overflow-hidden py-28 md:py-40">
      <AuroraOrbs />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[1.05]">
          {t('headlineLead')}
          <br />
          <span className="aurora-text">{t('headlineAccent')}</span>
        </h1>
        <p className="mt-10 text-base md:text-lg text-text-muted leading-relaxed">{t('body1')}</p>
        <p className="mt-5 text-sm text-text-faint leading-relaxed">{t('body2')}</p>
        <div className="mt-12">
          <a
            href="mailto:contact@unboundedtechnologies.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {t('ctaLabel')}
          </a>
        </div>
      </div>
    </section>
  );
}
