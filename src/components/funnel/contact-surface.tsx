'use client';

import { useState } from 'react';
import { QualificationForm } from './qualification-form';
import { ThankYouScreen } from './thank-you-screen';

// Owns the form / thank-you state so the parent server component stays
// stateless and can keep its server-rendered hero. Receives the Calendly
// URL as a prop because it isn't a NEXT_PUBLIC variable.
type Status = 'qualified' | 'exploratory';

type Props = {
  calendlyUrl: string | undefined;
};

export function ContactSurface({ calendlyUrl }: Props) {
  const [status, setStatus] = useState<Status | null>(null);

  if (status === null) {
    return <QualificationForm onSuccess={(s) => setStatus(s)} />;
  }
  return <ThankYouScreen status={status} calendlyUrl={calendlyUrl} />;
}
