'use client';

import { useEffect, useState } from 'react';
import { InlineWidget } from 'react-calendly';

// Inline Calendly widget shown only on the qualified branch of the
// thank-you screen. We delay-mount via useEffect to avoid the iframe
// participating in initial paint (it's heavy and not above the fold during
// the form pass), and to side-step react-calendly's hard-coded reliance on
// `document` during render.
type Props = {
  url: string | undefined;
};

export function CalendlyEmbed({ url }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!url) {
    // No CALENDLY_URL configured (env-less local dev). Show a graceful
    // placeholder with the email fallback so QA can still complete the
    // qualified flow end-to-end.
    return (
      <div className="rounded-xl border border-border bg-bg-elevated p-8 text-center">
        <p className="text-sm text-text-muted">Calendly is not configured in this environment.</p>
        <p className="mt-2 text-sm text-text-muted">
          Email{' '}
          <a
            className="text-brand-blue hover:underline"
            href="mailto:contact@unboundedtechnologies.com"
          >
            contact@unboundedtechnologies.com
          </a>{' '}
          to schedule.
        </p>
      </div>
    );
  }

  if (!mounted) {
    return <div className="rounded-xl border border-border bg-bg-elevated min-h-[700px]" />;
  }

  return (
    // Wrapper drives the height responsively (560px on phones, 720px
    // md+) since the InlineWidget styles prop wants a fixed pixel value.
    // We let the iframe inherit 100% so it tracks the wrapper.
    <div className="overflow-hidden rounded-xl border border-border bg-bg-elevated h-[560px] md:h-[720px]">
      <InlineWidget
        url={url}
        styles={{ height: '100%', width: '100%' }}
        pageSettings={{
          backgroundColor: '0d0c16',
          textColor: 'f4f5fa',
          primaryColor: '5d6fff',
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
        }}
      />
    </div>
  );
}
