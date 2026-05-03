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
//      changes; the [pathname] effect fires and clears state.
//   2. Browser back/forward (bfcache restore). The pageshow event fires
//      with `event.persisted === true` whether or not React remounted;
//      we listen and clear state.
//   3. Tab restoration after long idle. Same pageshow path.
type Status = 'qualified' | 'exploratory';

type Props = {
  calendlyUrl: string | undefined;
};

export function ContactSurface({ calendlyUrl }: Props) {
  const [status, setStatus] = useState<Status | null>(null);
  const pathname = usePathname();

  // Reset on every pathname change (covers client-side nav away + back).
  // Submitting the form doesn't touch pathname so the thank-you state
  // sticks while the user remains on /contact.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a read value
  useEffect(() => {
    setStatus(null);
  }, [pathname]);

  // On form-submit success the parent flips status from null to qualified
  // or exploratory. ContactSurface re-renders inside the same scroll
  // container, so the window scroll position is preserved - on mobile that
  // leaves the user looking at the bottom of the new screen and missing the
  // celebration card. Scroll to top on the transition so the thank-you
  // content is visible above the fold.
  useEffect(() => {
    if (status !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status]);

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

  if (status === null) {
    return <QualificationForm onSuccess={(s) => setStatus(s)} />;
  }
  return <ThankYouScreen status={status} calendlyUrl={calendlyUrl} />;
}
