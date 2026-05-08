import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://unboundedtechnologies.com'),
  PLAUSIBLE_DOMAIN: z.string().default('unboundedtechnologies.com'),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@send.unboundedtechnologies.com'),
  RESEND_TO_EMAIL: z.string().email().default('contact@unboundedtechnologies.com'),
  NOTION_API_KEY: z.string().min(1).optional(),
  NOTION_LEADS_DB_ID: z.string().min(1).optional(),
  CALENDLY_URL: z.string().url().optional(),
  GITHUB_TOKEN: z.string().optional(),
  PSI_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
