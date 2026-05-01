import 'server-only';
import { Client } from '@notionhq/client';
import type { Lead } from '@/components/funnel/form-schema';
import { env } from './env';

// Notion client is only constructed if NOTION_API_KEY is present, so dev /
// preview without secrets doesn't blow up at module import. createLead is a
// noop in that case (the lead still goes out via Resend).
const notion = env.NOTION_API_KEY ? new Client({ auth: env.NOTION_API_KEY }) : null;

export async function createLead(lead: Lead, meta: { qualified: boolean; score: number }) {
  if (!notion || !env.NOTION_LEADS_DB_ID) return null;
  return notion.pages.create({
    parent: { database_id: env.NOTION_LEADS_DB_ID },
    properties: {
      Name: { title: [{ text: { content: lead.name } }] },
      Email: { email: lead.email },
      Company: { rich_text: [{ text: { content: lead.company } }] },
      Industry: { select: { name: lead.industry } },
      'Project type': { multi_select: lead.projectTypes.map((n) => ({ name: n })) },
      'Hourly rate (CAD)': { number: lead.hourlyRate },
      Timeline: { select: { name: lead.timeline } },
      Description: { rich_text: [{ text: { content: lead.description } }] },
      Status: { select: { name: meta.qualified ? 'Qualified' : 'Exploratory' } },
      Score: { number: meta.score },
    },
  });
}
