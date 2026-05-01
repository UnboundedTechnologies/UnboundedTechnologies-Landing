import { type NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/components/funnel/form-schema';
import { scoreLead } from '@/lib/lead-score';
import { createLead } from '@/lib/notion';
import { contactRateLimit } from '@/lib/rate-limit';
import {
  sendExploratoryConfirmation,
  sendLeadNotification,
  sendQualifiedConfirmation,
} from '@/lib/resend';
import { verifyTurnstile } from '@/lib/turnstile';

// POST /api/contact - the only write endpoint on the site. Pipeline:
//   rate limit -> schema parse -> Turnstile verify -> score ->
//   notify (Notion + owner email) -> applicant confirmation.
//
// Notion / Resend writes happen in parallel; the applicant confirmation is
// sent serially after so a failed write doesn't leave the user with a
// confirmation about a record that doesn't exist. All third-party writes
// soft-fail (their lib helpers noop) when env keys aren't configured, so
// local dev still resolves to {status: 'qualified'|'exploratory'} without
// secrets.
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const { success } = await contactRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid', issues: parsed.error.issues }, { status: 400 });
  }

  const ok = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!ok) {
    return NextResponse.json({ error: 'turnstile-failed' }, { status: 400 });
  }

  const meta = scoreLead(parsed.data);

  await Promise.allSettled([
    createLead(parsed.data, meta),
    sendLeadNotification(parsed.data, meta),
  ]);

  if (meta.qualified) {
    await sendQualifiedConfirmation(parsed.data);
  } else {
    await sendExploratoryConfirmation(parsed.data);
  }

  return NextResponse.json({ status: meta.qualified ? 'qualified' : 'exploratory' });
}
