import { z } from 'zod';

export const projectTypes = ['cloud-architecture', 'ccaas-connect', 'serverless', 'other'] as const;
export const timelines = ['asap', '1-3mo', '3-6mo', '1y+', 'exploring'] as const;

// Hourly-rate slider bounds in CAD. Steps land on 25-dollar increments so
// the display reads cleanly on the slider and in the email/Notion record.
// HST is collected on top of the quoted rate; we don't store it separately
// since it's a function of the rate and the buyer's province.
export const HOURLY_RATE_MIN = 70;
export const HOURLY_RATE_MAX = 400;
export const HOURLY_RATE_STEP = 5;
export const HOURLY_RATE_DEFAULT = 100;
export const industries = [
  'finance',
  'technology',
  'telecom',
  'construction',
  'media',
  'automotive',
  'government',
  'other',
] as const;

export const leadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().min(2).max(100),
  industry: z.enum(industries),
  projectTypes: z.array(z.enum(projectTypes)).min(1),
  hourlyRate: z
    .number()
    .int()
    .min(HOURLY_RATE_MIN)
    .max(HOURLY_RATE_MAX),
  timeline: z.enum(timelines),
  description: z.string().min(30).max(2000),
  turnstileToken: z.string().min(1),
});

export type Lead = z.infer<typeof leadSchema>;
export type ProjectType = (typeof projectTypes)[number];
export type Timeline = (typeof timelines)[number];
export type Industry = (typeof industries)[number];
