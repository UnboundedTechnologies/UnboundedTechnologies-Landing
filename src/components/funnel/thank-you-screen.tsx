'use client';

import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/primitives/eyebrow';
import { Link } from '@/i18n/routing';
import { CalendlyEmbed } from './calendly-embed';

// Thank-you screen, two branches:
//   - qualified: warm headline + Calendly inline widget so the user can
//     book directly, no extra step.
//   - exploratory: warm headline + body, no calendar nudge. Kept as
//     understated as possible so leads who are exploring don't feel
//     dismissed.
type Props = {
  status: 'qualified' | 'exploratory';
  calendlyUrl: string | undefined;
};

export function ThankYouScreen({ status, calendlyUrl }: Props) {
  const t = useTranslations('contactPage.thankYou');

  if (status === 'qualified') {
    return (
      <div className="space-y-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-tight">
            {t('qualifiedHeadline')}
          </h2>
          <p className="mt-5 text-base md:text-lg text-text-muted leading-relaxed max-w-2xl">
            {t('qualifiedBody')}
          </p>
        </div>
        <div>
          <Eyebrow className="mb-6">{t('qualifiedCalendlyEyebrow')}</Eyebrow>
          <CalendlyEmbed url={calendlyUrl} />
        </div>
        <div>
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-text transition-colors"
          >
            <span aria-hidden>&larr;</span> {t('backLabel')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-tight">
          {t('exploratoryHeadline')}
        </h2>
        <p className="mt-5 text-base md:text-lg text-text-muted leading-relaxed max-w-2xl">
          {t('exploratoryBody')}
        </p>
      </div>
      <div>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted hover:text-text transition-colors"
        >
          <span aria-hidden>&larr;</span> {t('backLabel')}
        </Link>
      </div>
    </div>
  );
}
