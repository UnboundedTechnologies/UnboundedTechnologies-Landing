'use client';

import { useEffect, useState } from 'react';
import { usePathname } from '@/i18n/routing';
import { QualificationForm } from './qualification-form';
import { ThankYouScreen } from './thank-you-screen';

// Owns the form / thank-you state so the parent server component stays
// stateless and can keep its server-rendered hero. Receives the Calendly
// URL as a prop because it isn't a NEXT_PUBLIC variable.
//
// State reset rules: the form must always show as fresh when the user
// arrives at /contact. There are three navigation paths to handle, since
// Next.js's router cache and the browser's bfcache can both keep the
// component instance alive across navigation rather than remounting it:
//   1. Client-side navigation away and back (Link clicks). usePathname
//      changes; the outer key={pathname} unmounts/remounts the inner
//      stateful component.
//   2. Browser back/forward (bfcache restore). The pageshow event fires
//      with `event.persisted === true` whether or not React remounted;
//      we listen and clear state.
//   3. Tab restoration after long idle. Same pageshow path.
type Status = 'qualified' | 'exploratory';

type Props = {
  calendlyUrl: string | undefined;
};

export function ContactSurface({ calendlyUrl }: Props) {
  const pathname = usePathname();
  return <ContactSurfaceInner key={pathname} calendlyUrl={calendlyUrl} />;
}

function ContactSurfaceInner({ calendlyUrl }: Props) {
  const [status, setStatus] = useState<Status | null>(null);

  // Reset on browser bfcache restore. event.persisted distinguishes a
  // bfcache restoration from a normal pageshow; we only clear in the
  // restore case to avoid wiping the thank-you screen the moment it
  // first paints.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setStatus(null);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const handleSuccess = (s: Status) => {
    setStatus(s);
    // Scroll to top inline so the thank-you card lands above the fold on
    // mobile, where the previous form's scroll position would otherwise
    // leave the user looking at the bottom of the new screen.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (status === null) {
    return <QualificationForm onSuccess={handleSuccess} />;
  }
  return <ThankYouScreen status={status} calendlyUrl={calendlyUrl} />;
}
