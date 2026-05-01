import { z } from 'zod';

export const projectTypes = ['cloud-architecture', 'ccaas-connect', 'serverless', 'other'] as const;
export const budgets = ['<25k', '25k-100k', '100k-500k', '500k+', 'not-sure'] as const;
export const timelines = ['asap', '1-3mo', '3-6mo', 'exploring'] as const;
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
  budget: z.enum(budgets),
  timeline: z.enum(timelines),
  description: z.string().max(500).optional(),
  turnstileToken: z.string().min(1),
});

export type Lead = z.infer<typeof leadSchema>;
export type ProjectType = (typeof projectTypes)[number];
export type Budget = (typeof budgets)[number];
export type Timeline = (typeof timelines)[number];
export type Industry = (typeof industries)[number];
