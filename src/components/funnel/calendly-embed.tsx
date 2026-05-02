'use client';

import { useEffect, useState } from 'react';
import { InlineWidget } from 'react-calendly';

// Calendly's free plan ignores the `backgroundColor` page setting, so the
// iframe body renders white around the dark booking card on all four
// sides. We crop the white away by rendering the iframe larger than its
// visible window and pulling it up + outward inside an overflow:hidden
// wrapper. Wrapper height matches the visible dark-card height for the
// current view; iframe is rendered at constant tall + wide dimensions so
// every white margin is clipped. Tune constants if Calendly changes layout.
// Wrapper bottom in iframe coords = TOP_OFFSET + HEIGHT_*. Keep this at
// ~980 (dark-card bottom for date picker) so the bottom-side white margin
// stays clipped. If you change TOP_OFFSET, change every HEIGHT_* by the
// inverse delta so each view's bottom edge stays anchored on its dark-card
// bottom.
const TOP_OFFSET = 72; // owner-locked: 8px AA buffer above the ribbon top
const SIDE_OFFSET = 24; // larger horizontal bleed clips the residual white edges
const IFRAME_HEIGHT = 1180; // total iframe content height (covers all views)

const HEIGHT_DATE_PICKER = 893; // 72 + 893 = 965 (dark-card bottom on event_type_viewed)
const HEIGHT_FORM = 713; // 72 + 713 = 785 (dark-card bottom on date_and_time_selected)
const HEIGHT_SCHEDULED = 513; // 72 + 513 = 585 (dark-card bottom on event_scheduled)

type Props = {
  url: string | undefined;
};

export function CalendlyEmbed({ url }: Props) {
  const [mounted, setMounted] = useState(false);
  const [height, setHeight] = useState(HEIGHT_DATE_PICKER);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== 'https://calendly.com') return;
      const data = e.data as { event?: string } | null;
      if (!data || typeof data.event !== 'string') return;
      if (
        data.event === 'calendly.event_type_viewed' ||
        data.event === 'calendly.profile_page_viewed'
      ) {
        setHeight(HEIGHT_DATE_PICKER);
      } else if (data.event === 'calendly.date_and_time_selected') {
        setHeight(HEIGHT_FORM);
      } else if (data.event === 'calendly.event_scheduled') {
        setHeight(HEIGHT_SCHEDULED);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!url) {
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
    return <div className="rounded-xl bg-[#0d0c16] min-h-[700px]" />;
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-[#0d0c16] transition-[height] duration-300 ease-out"
      style={{ height: `${height}px` }}
    >
      <div
        className="absolute"
        style={{
          top: `-${TOP_OFFSET}px`,
          left: `-${SIDE_OFFSET}px`,
          right: `-${SIDE_OFFSET}px`,
          height: `${IFRAME_HEIGHT}px`,
        }}
      >
        <InlineWidget
          url={url}
          styles={{ height: '100%', width: '100%' }}
          pageSettings={{
            backgroundColor: '0d0c16',
            textColor: 'f4f5fa',
            primaryColor: '5d6fff',
            hideEventTypeDetails: false,
            hideLandingPageDetails: true,
            hideGdprBanner: true,
          }}
        />
      </div>
    </div>
  );
}
