import { getAllCaseStudies, type Locale } from '@/lib/case-studies';
import { CommandPalette } from './command-palette';

// Server wrapper that loads the case-study list at request time and hands
// it to the client palette. Kept as a separate file so the client palette
// stays a pure client module (no server-only imports).
export async function CommandPaletteWrapper({ locale }: { locale: Locale }) {
  const studies = await getAllCaseStudies(locale);
  return <CommandPalette caseStudies={studies.map((s) => ({ slug: s.slug, title: s.title }))} />;
}
