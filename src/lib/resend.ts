import 'server-only';
import { Resend } from 'resend';
import type { Lead } from '@/components/funnel/form-schema';
import {
  ExploratoryConfirmationEmail,
  LeadNotificationEmail,
  QualifiedConfirmationEmail,
} from '@/components/funnel/lead-email';
import { env } from './env';

// Resend client lazily-built so dev / preview without an API key doesn't
// crash at import. All send helpers noop when the key is missing - the route
// still resolves successfully so local form testing works without secrets.
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

async function send(params: Parameters<NonNullable<typeof resend>['emails']['send']>[0]) {
  if (!resend) return null;
  try {
    const result = await resend.emails.send(params);
    if ((result as { error?: unknown }).error) {
      console.error('[resend] send failed', {
        params: { to: params.to, from: params.from, subject: params.subject },
        error: (result as { error: unknown }).error,
      });
    }
    return result;
  } catch (err) {
    console.error('[resend] send threw', {
      params: { to: params.to, from: params.from, subject: params.subject },
      err,
    });
    return null;
  }
}

export async function sendLeadNotification(
  lead: Lead,
  meta: { qualified: boolean; score: number },
) {
  return send({
    from: env.RESEND_FROM_EMAIL,
    to: env.RESEND_TO_EMAIL,
    replyTo: lead.email,
    subject: `${meta.qualified ? '[Qualified]' : '[Exploratory]'} ${lead.name} (${lead.company})`,
    react: LeadNotificationEmail({ lead, qualified: meta.qualified, score: meta.score }),
  });
}

export async function sendQualifiedConfirmation(lead: Lead) {
  return send({
    from: env.RESEND_FROM_EMAIL,
    to: lead.email,
    subject: 'Thanks - next step at Unbounded Technologies Inc.',
    react: QualifiedConfirmationEmail({ lead }),
  });
}

export async function sendExploratoryConfirmation(lead: Lead) {
  return send({
    from: env.RESEND_FROM_EMAIL,
    to: lead.email,
    subject: 'Thanks for reaching out',
    react: ExploratoryConfirmationEmail({ lead }),
  });
}
