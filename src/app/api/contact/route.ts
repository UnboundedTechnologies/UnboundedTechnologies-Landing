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

// POST /api/contact - the only write endpoint on the site. Pipeline:
//   rate limit (Upstash 3/h sliding window per IP) -> JSON parse ->
//   Zod schema validation -> honeypot check -> score ->
//   notify (Notion + owner email) -> applicant confirmation.
//
// Cloudflare Turnstile was removed because the widget's continuous
// background risk-analysis was running on the main thread and producing
// multi-second freezes during typing/scroll on iPhone, making the form
// effectively unusable. Bot protection is now a combination of:
//   1. Upstash rate limit: 3 submissions / hour / IP. Stops naive bots.
//   2. Honeypot field (`hp_field`): a visually hidden input that humans
//      never see; naive bots blindly fill every input. Any non-empty
//      value silently rejects the request.
//   3. Strict Zod schema validation: rejects malformed payloads cheaply.
// If spam volume ramps up, reintroduce a smarter challenge (e.g. Turnstile
// only after a first failed honeypot attempt) - but only behind an explicit
// signal so we never reintroduce the iPhone main-thread issue.
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

  // Honeypot: humans never fill `hp_field` (it is visually hidden and
  // tab-skipped). If we receive a non-empty value, it is a bot. Return a
  // 200 success-shaped response so the bot does not learn the rejection
  // mechanism, but skip every downstream side-effect (no Notion write, no
  // emails sent). The owner sees nothing in their inbox; the bot moves on.
  if (parsed.data.hp_field && parsed.data.hp_field.length > 0) {
    return NextResponse.json({ status: 'exploratory' });
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
