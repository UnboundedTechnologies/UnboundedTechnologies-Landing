import 'server-only';
import type { Lead } from '@/components/funnel/form-schema';

// Two-axis qualification: budget tier AND timeline both have to clear the bar.
// "Qualified" gates the inline Calendly embed and the phone-line confirmation
// email; "exploratory" still gets the lead saved + owner notified, but the
// applicant only sees the thank-you screen.
export function scoreLead(lead: Lead): { qualified: boolean; score: number } {
  const budgetOk = !['<25k', 'not-sure'].includes(lead.budget);
  const timelineOk = ['asap', '1-3mo', '3-6mo'].includes(lead.timeline);
  const qualified = budgetOk && timelineOk;
  const score = (budgetOk ? 50 : 0) + (timelineOk ? 30 : 0) + (lead.description?.length ? 20 : 0);
  return { qualified, score };
}
