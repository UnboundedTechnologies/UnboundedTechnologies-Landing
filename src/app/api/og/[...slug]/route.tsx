import { ImageResponse } from 'next/og';
import { getCaseStudy } from '@/lib/case-studies';
import enMessages from '../../../../../messages/en.json';
import frMessages from '../../../../../messages/fr.json';

// Dynamic Open Graph image handler.
//
// Catch-all at /api/og/[...slug]. The first segment is the locale
// (en|fr). Remaining segments resolve to a page key:
//   /api/og/en                          -> home
//   /api/og/en/work                     -> work index
//   /api/og/en/work/<slug>              -> case study (title + accent from MDX)
//   /api/og/en/services                 -> services
//   /api/og/en/about                    -> about
//   /api/og/en/contact                  -> contact
//   /api/og/en/legal/privacy            -> privacy
//   /api/og/en/legal/terms              -> terms
//   /api/og/fr/travaux                  -> work index (FR pathname)
//   /api/og/fr/travaux/<slug>           -> case study (FR pathname)
//   /api/og/fr/a-propos                 -> about (FR pathname)
//   /api/og/fr/legal/confidentialite    -> privacy (FR pathname)
//   /api/og/fr/legal/conditions         -> terms (FR pathname)
//
// The handler returns a 1200x630 PNG via next/og's ImageResponse. We use
// the default font stack (no custom Inter fetch) so the route never makes
// a network call at request time and stays deterministic across build
// environments. Caching: 1 day fresh, 1 day stale-while-revalidate via
// the Cache-Control header set in the ImageResponse options.
//
// Runtime: under Next 16 Cache Components the legacy `runtime` segment-config
// export is rejected, so we let the default node runtime handle the route.
// next/og's ImageResponse works on both edge and node and we do not need any
// edge-specific behaviour here.

type Locale = 'en' | 'fr';
type AccentKey = 'blue' | 'purple' | 'cyan' | 'mixed';

const BG = '#0d0c16';
const TEXT_PRIMARY = '#f4f5fa';
const TEXT_MUTED = '#bcbed0';
const TEXT_FAINT = '#666b80';

const ACCENT_HEX: Record<Exclude<AccentKey, 'mixed'>, string> = {
  blue: '#5d6fff',
  purple: '#a35dff',
  cyan: '#5dc7ff',
};

// Aurora radial gradient mirroring the homepage hero atmosphere.
const AURORA_BG =
  'radial-gradient(circle at 28% 38%, rgba(163,93,255,0.32) 0%, rgba(93,111,255,0.18) 28%, rgba(93,199,255,0.08) 52%, transparent 72%)';

const messagesByLocale = { en: enMessages, fr: frMessages } as const;

type PageInfo = {
  title: string;
  eyebrow: string;
  accent: AccentKey;
};

// FR localized paths from src/i18n/routing.ts pathnames table. Kept inline so
// the handler doesn't depend on next-intl runtime; the canonical mapping is
// the routing.ts file and these strings have to stay in sync.
const FR_WORK = 'travaux';
const FR_ABOUT = 'a-propos';
const FR_PRIVACY = 'confidentialite';
const FR_TERMS = 'conditions';

async function resolvePageInfo(locale: Locale, segments: ReadonlyArray<string>): Promise<PageInfo> {
  const og = messagesByLocale[locale].og;

  if (segments.length === 0) {
    return { title: og.home, eyebrow: og.homeEyebrow, accent: 'mixed' };
  }

  const [first, second] = segments;

  // Work + case studies. EN uses /work, FR uses /travaux. The slug, when
  // present, is locale-agnostic in our content set.
  if (first === 'work' || first === FR_WORK) {
    if (second) {
      const study = await getCaseStudy(second, locale);
      if (study) {
        return {
          title: study.title,
          eyebrow: og.caseStudyEyebrow,
          accent: study.accent as AccentKey,
        };
      }
      // Slug not found: fall through to a generic work card.
    }
    return { title: og.work, eyebrow: og.workEyebrow, accent: 'blue' };
  }

  if (first === 'services') {
    return { title: og.services, eyebrow: og.servicesEyebrow, accent: 'cyan' };
  }

  if (first === 'about' || first === FR_ABOUT) {
    return { title: og.about, eyebrow: og.aboutEyebrow, accent: 'purple' };
  }

  if (first === 'contact') {
    return { title: og.contact, eyebrow: og.contactEyebrow, accent: 'mixed' };
  }

  if (first === 'legal') {
    if (second === 'privacy' || second === FR_PRIVACY) {
      return { title: og.legalPrivacy, eyebrow: og.legalPrivacyEyebrow, accent: 'blue' };
    }
    if (second === 'terms' || second === FR_TERMS) {
      return { title: og.legalTerms, eyebrow: og.legalTermsEyebrow, accent: 'cyan' };
    }
  }

  // Unknown route: return the home card so the URL still resolves to a valid
  // PNG instead of a 404 (consumers like LinkedIn / Slack expect a 200).
  return { title: og.home, eyebrow: og.homeEyebrow, accent: 'mixed' };
}

// Color used for the bottom-left eyebrow stripe + small accent rule above the
// title. For `mixed` we render the rule as a tri-tone gradient and use the
// purple midpoint for the eyebrow text.
function accentColor(accent: AccentKey): string {
  if (accent === 'mixed') return ACCENT_HEX.purple;
  return ACCENT_HEX[accent];
}

function accentRuleBackground(accent: AccentKey): string {
  if (accent === 'mixed') {
    return `linear-gradient(90deg, ${ACCENT_HEX.blue} 0%, ${ACCENT_HEX.purple} 50%, ${ACCENT_HEX.cyan} 100%)`;
  }
  return ACCENT_HEX[accent];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  const { slug } = await params;
  const segments = slug ?? [];
  const localeRaw = segments[0] ?? 'en';
  const locale: Locale = localeRaw === 'fr' ? 'fr' : 'en';
  const tail = segments.slice(1);

  const info = await resolvePageInfo(locale, tail);
  const accentHex = accentColor(info.accent);
  const ruleBg = accentRuleBackground(info.accent);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BG,
        position: 'relative',
        padding: '72px 80px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Aurora atmosphere layer. Absolute so it can fully cover the card. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: AURORA_BG,
        }}
      />

      {/* Subtle vignette toward the top-right corner so the headline area
          reads warmer than a flat #0d0c16. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(93,199,255,0.10) 0%, transparent 55%)',
        }}
      />

      {/* Top row: wordmark. */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          fontSize: 22,
          letterSpacing: 4,
          color: TEXT_FAINT,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          textTransform: 'uppercase',
        }}
      >
        Unbounded
      </div>

      {/* Middle: accent rule + headline. flex:1 pushes the bottom row down. */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 96,
            height: 4,
            borderRadius: 2,
            background: ruleBg,
            marginBottom: 36,
          }}
        />
        <div
          style={{
            color: TEXT_PRIMARY,
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 980,
            // next/og renders multi-line text via an explicit display:flex on
            // the parent; the line wraps on whitespace inside satori's layout.
            display: 'flex',
          }}
        >
          {info.title}
        </div>
      </div>

      {/* Bottom row: eyebrow on the left, domain on the right. */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 20,
          letterSpacing: 2.4,
          textTransform: 'uppercase',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: accentHex,
          }}
        >
          {info.eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: TEXT_MUTED,
          }}
        >
          unboundedtechnologies.com
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        // 1 day fresh, then 1 day stale-while-revalidate. Mirrors the cache
        // window used by /cv.pdf so any CDN sitting in front of this route
        // can reuse the same shape.
        'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
      },
    },
  );
}
