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

  try {
    return await notion.pages.create({
      parent: { database_id: env.NOTION_LEADS_DB_ID },
      properties: {
        Name: { title: [{ text: { content: lead.name } }] },
        Email: { email: lead.email },
        Company: { rich_text: [{ text: { content: lead.company } }] },
        Industry: { select: { name: INDUSTRY_LABEL[lead.industry] } },
        'Project type': {
          multi_select: lead.projectTypes.map((n) => ({ name: PROJECT_TYPE_LABEL[n] })),
        },
        // Budget column was originally a Select with 5 project-cost tiers; the
        // form now uses an hourly-rate slider, so we expect the column to be
        // converted to Number type and store the rate directly. If the column
        // is still a Select, this write will silently fail (caught below).
        Budget: { number: lead.hourlyRate },
        Timeline: { select: { name: TIMELINE_LABEL[lead.timeline] } },
        Description: { rich_text: [{ text: { content: lead.description } }] },
        Status: { select: { name: 'New' } },
        Score: { number: meta.score },
      },
    });
  } catch (err) {
    console.error('[notion.createLead] failed', err);
    return null;
  }
}
