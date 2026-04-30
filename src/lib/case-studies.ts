import 'server-only';

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'case-studies');

const FrontmatterSchema = z.object({
  slug: z.string(),
  locale: z.enum(['en', 'fr']),
  title: z.string(),
  client: z.string(),
  years: z.string(),
  role: z.string(),
  stack: z.array(z.string()),
  accent: z.enum(['blue', 'purple', 'cyan', 'mixed']),
  order: z.number().int(),
});

export type CaseStudyMeta = z.infer<typeof FrontmatterSchema>;
export type CaseStudy = CaseStudyMeta & { body: string };

export type Locale = 'en' | 'fr';

/**
 * Read a single case-study MDX file at content/case-studies/{slug}.{locale}.mdx.
 * Returns null if the file is missing. Throws if the frontmatter is invalid.
 */
export async function getCaseStudy(slug: string, locale: Locale): Promise<CaseStudy | null> {
  const filePath = path.join(CONTENT_DIR, `${slug}.${locale}.mdx`);

  let raw: string;
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (err) {
    if (isNodeError(err) && err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }

  const parsed = matter(raw);
  const result = FrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in ${filePath}: ${JSON.stringify(result.error.flatten(), null, 2)}`,
    );
  }

  // Cross-check that frontmatter slug + locale match the filename, fail-fast on drift.
  if (result.data.slug !== slug) {
    throw new Error(
      `Frontmatter slug mismatch in ${filePath}: file slug "${slug}" vs frontmatter slug "${result.data.slug}".`,
    );
  }
  if (result.data.locale !== locale) {
    throw new Error(
      `Frontmatter locale mismatch in ${filePath}: file locale "${locale}" vs frontmatter locale "${result.data.locale}".`,
    );
  }

  return { ...result.data, body: parsed.content };
}

/**
 * Read every unique slug from the content directory. A slug is the prefix
 * before the first `.` in `{slug}.{locale}.mdx`.
 */
export async function getCaseStudySlugs(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR);
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (!entry.endsWith('.mdx')) continue;
    const match = entry.match(/^(.+?)\.(en|fr)\.mdx$/);
    if (!match) continue;
    slugs.add(match[1]);
  }
  return Array.from(slugs).sort();
}

/**
 * Read all case studies for a given locale, sorted by `order` ascending.
 *
 * Build-time invariant: every slug present in the content directory must have
 * BOTH an `.en.mdx` and an `.fr.mdx` file. If either is missing for any slug,
 * this function throws so the build fails fast.
 */
export async function getAllCaseStudies(locale: Locale): Promise<CaseStudy[]> {
  const entries = await readdir(CONTENT_DIR);

  const grouped = new Map<string, Set<Locale>>();
  for (const entry of entries) {
    if (!entry.endsWith('.mdx')) continue;
    const match = entry.match(/^(.+?)\.(en|fr)\.mdx$/);
    if (!match) continue;
    const slug = match[1];
    const fileLocale = match[2] as Locale;
    if (!grouped.has(slug)) {
      grouped.set(slug, new Set());
    }
    grouped.get(slug)?.add(fileLocale);
  }

  const missing: string[] = [];
  for (const [slug, locales] of grouped) {
    if (!locales.has('en') || !locales.has('fr')) {
      const have = Array.from(locales).sort().join(', ') || 'none';
      missing.push(`${slug} (have: ${have})`);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Case-study locale parity violation. Every slug must have both en and fr MDX files. Missing: ${missing.join('; ')}`,
    );
  }

  const slugs = Array.from(grouped.keys());
  const studies = await Promise.all(
    slugs.map(async (slug) => {
      const study = await getCaseStudy(slug, locale);
      if (!study) {
        throw new Error(
          `Case study "${slug}" missing for locale "${locale}" despite directory parity check.`,
        );
      }
      return study;
    }),
  );

  return studies.sort((a, b) => a.order - b.order);
}

/**
 * Return the previous and next case study (by `order`) for a given slug, with
 * circular wrap-around: the first study's `prev` is the last study, and the
 * last study's `next` is the first study. Returns `{ prev: null, next: null }`
 * when the slug isn't found or is the only study.
 */
export async function getAdjacentCaseStudies(
  slug: string,
  locale: Locale,
): Promise<{ prev: CaseStudy | null; next: CaseStudy | null }> {
  const all = await getAllCaseStudies(locale);
  if (all.length === 0) {
    return { prev: null, next: null };
  }

  const idx = all.findIndex((s) => s.slug === slug);
  if (idx === -1) {
    return { prev: null, next: null };
  }
  if (all.length === 1) {
    return { prev: null, next: null };
  }

  const prev = all[(idx - 1 + all.length) % all.length] ?? null;
  const next = all[(idx + 1) % all.length] ?? null;
  return { prev, next };
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}
