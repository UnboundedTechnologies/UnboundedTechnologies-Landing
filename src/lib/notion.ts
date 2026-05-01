import 'server-only';
import { Client } from '@notionhq/client';
import type { Lead } from '@/components/funnel/form-schema';
import { env } from './env';

// Notion client is only constructed if NOTION_API_KEY is present, so dev /
// preview without secrets doesn't blow up at module import. createLead is a
// noop in that case (the lead still goes out via Resend).
const notion = env.NOTION_API_KEY ? new Client({ auth: env.NOTION_API_KEY }) : null;

// The form serializes enum values as URL-friendly slugs (e.g. `technology`,
// `cloud-architecture`, `1-3mo`); the Notion database stores them as display
// labels (`Technology`, `Cloud architecture`, `1-3 months`). Notion's API
// rejects any Select option name that doesn't match an existing option
// exactly, so we translate at the boundary.
const INDUSTRY_LABEL: Record<Lead['industry'], string> = {
  finance: 'Finance',
  technology: 'Technology',
  telecom: 'Telecom',
  construction: 'Construction',
  media: 'Media',
  automotive: 'Automotive',
  government: 'Government',
  other: 'Other',
};

const PROJECT_TYPE_LABEL: Record<Lead['projectTypes'][number], string> = {
  'cloud-architecture': 'Cloud architecture',
  'ccaas-connect': 'CCaaS / Connect',
  serverless: 'Serverless',
  other: 'Other',
};

const TIMELINE_LABEL: Record<Lead['timeline'], string> = {
  asap: 'ASAP',
  '1-3mo': '1-3 months',
  '3-6mo': '3-6 months',
  '1y+': '1 year+',
  exploring: 'Exploring',
};

export async function createLead(lead: Lead, meta: { qualified: boolean; score: number }) {
  if (!notion || !env.NOTION_LEADS_DB_ID) return null;

  // Append hourly rate inline to the Description so the rate is captured
  // somewhere in Notion. The database doesn't have a dedicated Hourly rate
  // column (the spec was budget-tier-based originally; the slider arrived
  // later and we keep the DB schema unchanged for v1.0).
  const descriptionWithRate = `${lead.description}\n\nHourly rate: CAD $${lead.hourlyRate}/hr`;

  return notion.pages.create({
    parent: { database_id: env.NOTION_LEADS_DB_ID },
    properties: {
      Name: { title: [{ text: { content: lead.name } }] },
      Email: { email: lead.email },
      Company: { rich_text: [{ text: { content: lead.company } }] },
      Industry: { select: { name: INDUSTRY_LABEL[lead.industry] } },
      'Project type': {
        multi_select: lead.projectTypes.map((n) => ({ name: PROJECT_TYPE_LABEL[n] })),
      },
      Timeline: { select: { name: TIMELINE_LABEL[lead.timeline] } },
      Description: { rich_text: [{ text: { content: descriptionWithRate } }] },
      Score: { number: meta.score },
      // Status is not set here - Notion's database default is "New" and the
      // owner advances it manually as the lead progresses.
    },
  });
}
