import 'server-only';

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Document, Image, Page, renderToBuffer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { cacheLife } from 'next/cache';
import { type CaseStudy, getAllCaseStudies } from '@/lib/case-studies';
import enMessages from '../../messages/en.json';

// Read the UT banner PNG into a Buffer at module load. React-PDF's <Image>
// accepts a `{ data, format }` shape that bypasses its async URL/path loader;
// passing a raw Buffer is the most reliable way to embed a local asset and
// avoids OS-specific path-resolution quirks (Windows backslashes, .next/server
// CWD differences, etc.). The transparent variant reads cleanly on the white
// PDF background where the dark-bg banner used in the nav would not.
const BANNER_BUFFER = readFileSync(path.resolve(process.cwd(), 'public/ut-banner-transparent.png'));

// Build-time-rendered Capability Statement PDF served at /cv.pdf.
//
// EN-only by design: the PDF lives outside the [locale] segment and FR users
// download the same EN PDF for v1.0. A bilingual PDF is deferred.
//
// Fonts: we use the @react-pdf/renderer built-in Helvetica + Courier fallbacks
// (no Font.register calls). This avoids a build-time network fetch to Google
// Fonts and keeps the route deterministic. Upgrading to Inter + JetBrains Mono
// is a v1.1 follow-up.

// Brand colors (matching src/app/globals.css :root tokens).
const COLOR = {
  blue: '#5d6fff',
  purple: '#a35dff',
  cyan: '#5dc7ff',
  ink: '#0d0c16',
  text: '#1a1a2e',
  textMuted: '#525266',
  textFaint: '#8a8aa3',
  border: '#e4e4ed',
  bg: '#ffffff',
  bgElevated: '#f7f7fb',
} as const;

const ACCENT_CYCLE: Array<keyof typeof COLOR> = ['blue', 'purple', 'cyan'];

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: COLOR.text,
    backgroundColor: COLOR.bg,
    lineHeight: 1.5,
  },
  // Page 1 (title page) overrides for vertical centering.
  titlePage: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: COLOR.text,
    backgroundColor: COLOR.bg,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: 'Courier',
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: COLOR.textFaint,
    marginBottom: 6,
  },
  eyebrowAccent: {
    fontFamily: 'Courier',
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  // Title page brand banner image.
  bannerImage: {
    width: 420,
    height: 'auto',
    marginBottom: 32,
  },
  titleSubtitle: {
    fontFamily: 'Helvetica',
    fontSize: 14,
    color: COLOR.textMuted,
    marginBottom: 24,
  },
  titleAccentRule: {
    width: 64,
    height: 2,
    backgroundColor: COLOR.blue,
    marginBottom: 24,
  },
  titleMetaLine: {
    fontFamily: 'Courier',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLOR.textMuted,
    marginBottom: 4,
  },
  // Section heading (used on every interior page).
  sectionHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    letterSpacing: -0.4,
    color: COLOR.text,
    marginBottom: 4,
  },
  sectionRule: {
    width: 40,
    height: 2,
    marginTop: 8,
    marginBottom: 22,
  },
  paragraph: {
    fontSize: 10.5,
    color: COLOR.textMuted,
    marginBottom: 12,
    lineHeight: 1.6,
  },
  // Operating-model bullet row.
  opRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.border,
  },
  opNumber: {
    fontFamily: 'Courier',
    fontSize: 10,
    width: 36,
    letterSpacing: 1.4,
  },
  opText: {
    flex: 1,
    fontSize: 10.5,
    color: COLOR.text,
    lineHeight: 1.55,
  },
  // Stats grid (2x2 on the by-the-numbers page).
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  statCardInner: {
    borderWidth: 0.5,
    borderColor: COLOR.border,
    borderRadius: 6,
    padding: 18,
    backgroundColor: COLOR.bgElevated,
  },
  statNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 30,
    letterSpacing: -0.6,
    // Lock line-height to 1.0 so the number's loose bold ascent doesn't bleed
    // into the label below it. Without this the page-level `lineHeight: 1.5`
    // pads the number's box by ~15px and the label visually crashes into it.
    lineHeight: 1,
  },
  statLabel: {
    fontFamily: 'Courier',
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: COLOR.textMuted,
    marginTop: 18,
    lineHeight: 1.4,
  },
  // Case-study meta strip.
  metaStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 18,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.border,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.border,
  },
  metaCol: {
    width: '50%',
    paddingRight: 12,
    marginBottom: 8,
  },
  metaLabel: {
    fontFamily: 'Courier',
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLOR.textFaint,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    color: COLOR.text,
  },
  stackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  stackChip: {
    fontFamily: 'Courier',
    fontSize: 7.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: COLOR.bgElevated,
    borderRadius: 3,
    color: COLOR.textMuted,
  },
  // Case-study body sub-section heading (Problem / Approach / Outcome).
  subEyebrow: {
    fontFamily: 'Courier',
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
  },
  // Outcome callouts (case-study stats).
  calloutsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginTop: 6,
  },
  callout: {
    width: '33.333%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  calloutInner: {
    borderWidth: 0.5,
    borderColor: COLOR.border,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: COLOR.bgElevated,
  },
  calloutNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    letterSpacing: -0.4,
    lineHeight: 1.1,
  },
  calloutUnit: {
    fontSize: 8.5,
    color: COLOR.text,
    marginTop: 8,
    lineHeight: 1.4,
  },
  calloutContext: {
    fontSize: 7.5,
    color: COLOR.textMuted,
    marginTop: 6,
    lineHeight: 1.45,
  },
  // Footer / page number rendered on every page.
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Courier',
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLOR.textFaint,
  },
  // Contact page.
  contactRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contactLabel: {
    width: 90,
    fontFamily: 'Courier',
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: COLOR.textFaint,
    paddingTop: 2,
  },
  contactValue: {
    flex: 1,
    fontSize: 11,
    color: COLOR.text,
  },
});

const aboutT = enMessages.aboutPage;

const OPERATING_KEYS: Array<keyof typeof aboutT> = ['op1', 'op2', 'op3', 'op4', 'op5', 'op6'];
type AboutKey = keyof typeof aboutT;

const STATS = [
  { numberKey: 'stat1Number' as AboutKey, labelKey: 'stat1Label' as AboutKey },
  { numberKey: 'stat2Number' as AboutKey, labelKey: 'stat2Label' as AboutKey },
  { numberKey: 'stat3Number' as AboutKey, labelKey: 'stat3Label' as AboutKey },
  { numberKey: 'stat4Number' as AboutKey, labelKey: 'stat4Label' as AboutKey },
];

// Strip leading "- " (the eyebrow prefix style used by the site) when reusing
// strings as PDF eyebrows; the PDF eyebrow style draws no dash glyph itself.
function cleanEyebrow(value: string): string {
  return value.replace(/^[-]\s*/, '');
}

// Long-form months for the "Generated" line on the title page. We avoid
// Intl.DateTimeFormat with a locale so the rendered string is deterministic
// across build environments.
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function generatedLabel(now: Date): string {
  return `${MONTH_NAMES[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
}

// Mirror of `splitBody` in src/components/case-study/case-study-layout.tsx.
// Splits the MDX body at lines starting with `## ` and returns exactly three
// trimmed prose chunks (Problem / Approach / Outcome). Throws if not exactly
// three sections, matching the case-study layout's invariant.
function splitBody(body: string): [string, string, string] {
  const lines = body.split(/\r?\n/);
  const chunks: string[] = [];
  let current: string[] | null = null;

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (current !== null) {
        chunks.push(current.join('\n').trim());
      }
      current = [];
      continue;
    }
    if (current !== null) {
      current.push(line);
    }
  }
  if (current !== null) {
    chunks.push(current.join('\n').trim());
  }

  if (chunks.length !== 3) {
    throw new Error(
      `Case-study body must have exactly 3 ## sections (Problem/Approach/Outcome). Found ${chunks.length}.`,
    );
  }
  return [chunks[0], chunks[1], chunks[2]];
}

// MDX prose in our content set is plain Markdown paragraphs separated by blank
// lines; there are no images, links, or code fences. We split on blank lines
// and render each chunk as a <Text> paragraph.
function paragraphs(prose: string): string[] {
  return prose
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

// Order matches the homepage outcome ribbon: BMO -> AWS Connect -> Renault Forex -> ETBA ERP.
const CASE_STUDY_ORDER = ['bmo-platform', 'aws-connect-ivr', 'renault-forex', 'etba-erp'];

function orderedCaseStudies(all: CaseStudy[]): CaseStudy[] {
  const bySlug = new Map(all.map((s) => [s.slug, s]));
  const out: CaseStudy[] = [];
  for (const slug of CASE_STUDY_ORDER) {
    const study = bySlug.get(slug);
    if (study) out.push(study);
  }
  return out;
}

function PageFooter({ pageLabel }: { pageLabel: string }) {
  return (
    <View style={styles.pageFooter} fixed>
      <Text>Unbounded Technologies Inc.</Text>
      <Text>{pageLabel}</Text>
    </View>
  );
}

function SectionHeading({
  eyebrow,
  title,
  accent,
}: {
  eyebrow: string;
  title: string;
  accent: keyof typeof COLOR;
}) {
  return (
    <View>
      <Text style={[styles.eyebrowAccent, { color: COLOR[accent] }]}>{cleanEyebrow(eyebrow)}</Text>
      <Text style={styles.sectionHeading}>{title}</Text>
      <View style={[styles.sectionRule, { backgroundColor: COLOR[accent] }]} />
    </View>
  );
}

function CaseStudyPage({ study, index }: { study: CaseStudy; index: number }) {
  const accent: keyof typeof COLOR = ACCENT_CYCLE[index % ACCENT_CYCLE.length];
  const [problem, approach, outcome] = splitBody(study.body);

  return (
    <Page size="LETTER" style={styles.page}>
      <SectionHeading
        eyebrow={`Selected work / 0${index + 1}`}
        title={study.title}
        accent={accent}
      />

      <View style={styles.metaStrip}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Client</Text>
          <Text style={styles.metaValue}>{study.client}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Years</Text>
          <Text style={styles.metaValue}>{study.years}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Role</Text>
          <Text style={styles.metaValue}>{study.role}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Stack</Text>
          <View style={styles.stackRow}>
            {study.stack.map((item) => (
              <Text key={item} style={styles.stackChip}>
                {item}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <Text style={[styles.subEyebrow, { color: COLOR[accent] }]}>Problem</Text>
      {paragraphs(problem).map((p) => (
        <Text key={`${study.slug}-problem-${p.slice(0, 32)}`} style={styles.paragraph}>
          {p}
        </Text>
      ))}

      <Text style={[styles.subEyebrow, { color: COLOR[accent] }]}>Approach</Text>
      {paragraphs(approach).map((p) => (
        <Text key={`${study.slug}-approach-${p.slice(0, 32)}`} style={styles.paragraph}>
          {p}
        </Text>
      ))}

      <Text style={[styles.subEyebrow, { color: COLOR[accent] }]}>Outcome</Text>
      {paragraphs(outcome).map((p) => (
        <Text key={`${study.slug}-outcome-${p.slice(0, 32)}`} style={styles.paragraph}>
          {p}
        </Text>
      ))}

      {study.stats && study.stats.length > 0 && (
        <View>
          <Text style={[styles.subEyebrow, { color: COLOR[accent] }]}>Outcome callouts</Text>
          <View style={styles.calloutsRow}>
            {study.stats.map((s) => (
              <View key={`${s.number}-${s.unit}`} style={styles.callout}>
                <View style={styles.calloutInner}>
                  <Text style={[styles.calloutNumber, { color: COLOR[accent] }]}>{s.number}</Text>
                  <Text style={styles.calloutUnit}>{s.unit}</Text>
                  {s.context && <Text style={styles.calloutContext}>{s.context}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <PageFooter pageLabel={`Selected work / 0${index + 1}`} />
    </Page>
  );
}

export function CvDocument({
  caseStudies,
  generatedAt,
}: {
  caseStudies: CaseStudy[];
  generatedAt: Date;
}) {
  const ordered = orderedCaseStudies(caseStudies);

  return (
    <Document
      title="Unbounded Technologies Inc., Capability Statement"
      author="Said Aissani"
      creator="Unbounded Technologies Inc."
      producer="Unbounded Technologies Inc."
      subject="Capability Statement"
      keywords="cloud architecture, AWS, CPaaS, Toronto, Canada, Unbounded Technologies Inc., capability statement"
    >
      {/* Page 1: title page */}
      <Page size="LETTER" style={styles.titlePage}>
        {/* Brand banner. Native size 1266x284 = 4.46:1 aspect; rendered at
            280px wide it lands at ~63px tall, dominant but not loud. */}
        <Image src={{ data: BANNER_BUFFER, format: 'png' }} style={styles.bannerImage} />
        <Text style={[styles.eyebrowAccent, { color: COLOR.blue }]}>Capability Statement</Text>
        <Text style={styles.titleSubtitle}>
          Senior cloud and CPaaS engineering for enterprises that can&apos;t afford to fail.
        </Text>
        <View style={styles.titleAccentRule} />
        <Text style={styles.titleMetaLine}>Said Aissani</Text>
        <Text style={styles.titleMetaLine}>Senior Cloud Architect</Text>
        <Text style={styles.titleMetaLine}>Toronto, Canada</Text>
        <View style={{ height: 24 }} />
        <Text style={styles.titleMetaLine}>Generated {generatedLabel(generatedAt)}</Text>
        <PageFooter pageLabel="Capability Statement" />
      </Page>

      {/* Page 2: the story */}
      <Page size="LETTER" style={styles.page}>
        <SectionHeading
          eyebrow={aboutT.storyEyebrow}
          title={`${aboutT.headlineLead} ${aboutT.headlineAccent}`}
          accent="purple"
        />
        <Text style={styles.paragraph}>{aboutT.storyPara1}</Text>
        <Text style={styles.paragraph}>{aboutT.storyPara2}</Text>
        <PageFooter pageLabel="The story" />
      </Page>

      {/* Page 3: operating model */}
      <Page size="LETTER" style={styles.page}>
        <SectionHeading eyebrow={aboutT.operatingEyebrow} title="Operating model" accent="cyan" />
        {OPERATING_KEYS.map((key, idx) => {
          const accent = ACCENT_CYCLE[idx % ACCENT_CYCLE.length];
          return (
            <View key={key} style={styles.opRow}>
              <Text style={[styles.opNumber, { color: COLOR[accent] }]}>
                {String(idx + 1).padStart(2, '0')}
              </Text>
              <Text style={styles.opText}>{aboutT[key]}</Text>
            </View>
          );
        })}
        <PageFooter pageLabel="Operating model" />
      </Page>

      {/* Page 4: by the numbers */}
      <Page size="LETTER" style={styles.page}>
        <SectionHeading eyebrow={aboutT.statsEyebrow} title="By the numbers" accent="blue" />
        <View style={styles.statsGrid}>
          {STATS.map((s, idx) => {
            const accent = ACCENT_CYCLE[idx % ACCENT_CYCLE.length];
            return (
              <View key={s.numberKey} style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <Text style={[styles.statNumber, { color: COLOR[accent] }]}>
                    {aboutT[s.numberKey]}
                  </Text>
                  <Text style={styles.statLabel}>{aboutT[s.labelKey]}</Text>
                </View>
              </View>
            );
          })}
        </View>
        <PageFooter pageLabel="By the numbers" />
      </Page>

      {/* Pages 5-8: case studies */}
      {ordered.map((study, idx) => (
        <CaseStudyPage key={study.slug} study={study} index={idx} />
      ))}

      {/* Final page: contact */}
      <Page size="LETTER" style={styles.page}>
        <SectionHeading eyebrow="Contact" title="Get in touch" accent="purple" />
        <Text style={styles.paragraph}>
          Engagements run on Master Service Agreement plus per-project Statement of Work, with $2M
          Errors &amp; Omissions and $5M General Liability insurance. Reach out to start the
          conversation; we will follow up within one business day.
        </Text>
        <View style={{ height: 12 }} />
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>contact@unboundedtechnologies.com</Text>
        </View>
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Web</Text>
          <Text style={styles.contactValue}>unboundedtechnologies.com</Text>
        </View>
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Office</Text>
          <Text style={styles.contactValue}>Toronto, Ontario, Canada</Text>
        </View>
        <PageFooter pageLabel="Contact" />
      </Page>
    </Document>
  );
}

// Render the CV document to a PDF and return the bytes. Called from
// src/app/cv.pdf/route.ts; kept here so the route handler stays thin.
//
// `'use cache'` + `cacheLife('days')` caches the rendered bytes for ~24h
// under Next 16 Cache Components. Without this the route would fail to
// prerender (renderToBuffer is uncached I/O) and would re-render on every
// request, which is wasteful for content that only changes between deploys.
//
// We return a Uint8Array (not Buffer) so the value serializes cleanly across
// the cache boundary, and we capture `Date.now()` *inside* the cache to keep
// the cache key deterministic across renders.
export async function renderCvPdf(): Promise<Uint8Array> {
  'use cache';
  cacheLife('days');

  const caseStudies = await getAllCaseStudies('en');
  const generatedAt = new Date();
  const buffer = await renderToBuffer(
    <CvDocument caseStudies={caseStudies} generatedAt={generatedAt} />,
  );
  return new Uint8Array(buffer);
}
