import 'server-only';
import type { Lead } from '@/components/funnel/form-schema';

// Hourly rate at which we treat the offer as serious. Below this is
// below-market for senior cloud architecture work in the Toronto market
// and gets routed to the exploratory branch.
const HOURLY_RATE_QUALIFIED_THRESHOLD = 150;

// Two-axis qualification: hourly rate AND timeline both have to clear the
// bar. "Qualified" gates the inline Calendly embed and the phone-line
// confirmation email; "exploratory" still gets the lead saved + owner
// notified, but the applicant only sees the thank-you screen.
export function scoreLead(lead: Lead): { qualified: boolean; score: number } {
  const rateOk = lead.hourlyRate >= HOURLY_RATE_QUALIFIED_THRESHOLD;
  const timelineOk = ['asap', '1-3mo', '3-6mo', '1y+'].includes(lead.timeline);
  const qualified = rateOk && timelineOk;
  const score = (rateOk ? 50 : 0) + (timelineOk ? 30 : 0) + (lead.description?.length ? 20 : 0);
  return { qualified, score };
}
