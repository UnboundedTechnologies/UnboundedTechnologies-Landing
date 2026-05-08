// Single source of truth for the four brand accents that drive case-study
// layout, work-index cards, outcome ribbon, and impact-graph colors. New pages
// (About, Services, Phase 8 surfaces) should import from here so they stay
// visually consistent with the rest of the site.
//
// The four accents:
//   blue   -> single-tone glow / stripe in --color-brand-blue
//   purple -> single-tone glow / stripe in --color-brand-purple
//   cyan   -> single-tone glow / stripe in --color-brand-cyan
//   mixed  -> tri-tone aurora; rendered via the .aurora-text class for
//             headlines and via a left-edge gradient stripe for cards (see
//             globals.css [data-accent="mixed"]).

export type Accent = 'blue' | 'purple' | 'cyan' | 'mixed';
export type SolidAccent = Exclude<Accent, 'mixed'>;

// Hex values mirror the @theme tokens in globals.css. Keep them in sync.
export const BRAND_HEX: Record<SolidAccent, string> = {
  blue: '#5d6fff',
  purple: '#a35dff',
  cyan: '#5dc7ff',
} as const;

// "R, G, B" triples for use inside rgba(...) calls. Avoids per-call string
// surgery in the hero/glow gradients.
const BRAND_RGB: Record<SolidAccent, string> = {
  blue: '93, 111, 255',
  purple: '163, 93, 255',
  cyan: '93, 199, 255',
} as const;

// LITERAL Tailwind classes (not interpolated) so the v4 oxide compiler can
// detect them at build time. Do not template these into another string.
export const ACCENT_TEXT_CLASS: Record<SolidAccent, string> = {
  blue: 'text-brand-blue',
  purple: 'text-brand-purple',
  cyan: 'text-brand-cyan',
};

/**
 * CSS background-image gradient for the case-study hero glow.
 *
 * Solid accents render a soft single-tone radial. `mixed` renders a tri-tone
 * aurora ellipse with the three brand stops.
 */
export function heroGradient(accent: Accent): string {
  if (accent === 'mixed') {
    return 'radial-gradient(ellipse at 30% 20%, rgba(93,111,255,0.20) 0%, rgba(163,93,255,0.14) 35%, rgba(93,199,255,0.10) 65%, transparent 85%)';
  }
  const rgb = BRAND_RGB[accent].replace(/\s+/g, '');
  return `radial-gradient(ellipse at 30% 20%, rgba(${rgb},0.22) 0%, rgba(${rgb},0.10) 45%, transparent 80%)`;
}

/**
 * Translucent border tint for adjacent (prev/next) case-study cards. Solid
 * accents return their brand hex with ~45% alpha; `mixed` falls back to a
 * neutral purple tone (the prev/next surface is too small to render the
 * gradient stripe reliably).
 */
export function accentBorderColor(accent: Accent): string {
  if (accent === 'mixed') return 'rgba(163,93,255,0.45)';
  return `${BRAND_HEX[accent]}73`; // ~45% alpha
}

/**
 * Eyebrow color class per section in a 3-section page (Problem / Approach /
 * Outcome). Solid accents repeat their tone across all three sections; `mixed`
 * cycles blue / purple / cyan so the page reads as a tri-tone.
 */
export function sectionEyebrowClass(accent: Accent, sectionIndex: 0 | 1 | 2): string {
  if (accent === 'mixed') {
    const cycle: ReadonlyArray<string> = [
      ACCENT_TEXT_CLASS.blue,
      ACCENT_TEXT_CLASS.purple,
      ACCENT_TEXT_CLASS.cyan,
    ];
    return cycle[sectionIndex];
  }
  return ACCENT_TEXT_CLASS[accent];
}

/**
 * Tailwind text-color class for a quantified-outcome stat number on the
 * case-study layout's callout strip. Solid accents stick to their tone across
 * every card; `mixed` cycles blue / purple / cyan so a 3-card row reads as a
 * tri-tone (and a 1- or 2-card row still picks distinct stops). The index is
 * taken modulo 3 so the helper is safe for any card count.
 */
export function accentNumberClass(accent: Accent, index: number): string {
  if (accent === 'mixed') {
    const cycle: ReadonlyArray<string> = [
      ACCENT_TEXT_CLASS.blue,
      ACCENT_TEXT_CLASS.purple,
      ACCENT_TEXT_CLASS.cyan,
    ];
    return cycle[((index % 3) + 3) % 3];
  }
  return ACCENT_TEXT_CLASS[accent];
}

/**
 * `rgba(...)` glow color used by the callout strip's animated `services-orb`.
 * Mirrors `BRAND_RGB` at ~0.3 alpha. For `mixed`, cycles through the three
 * brand stops so a multi-card row reads as a tri-tone.
 */
export function accentGlowColor(accent: Accent, index: number): string {
  if (accent === 'mixed') {
    const cycle: ReadonlyArray<SolidAccent> = ['blue', 'purple', 'cyan'];
    const pick = cycle[((index % 3) + 3) % 3];
    return `rgba(${BRAND_RGB[pick].replace(/\s+/g, '')},0.3)`;
  }
  return `rgba(${BRAND_RGB[accent].replace(/\s+/g, '')},0.3)`;
}

/**
 * `rgba(...)` value for the cursor-spotlight overlay on hover-aware cards.
 * Same `BRAND_RGB` lookup as the other accent helpers, at ~22 % alpha so
 * the spotlight reads as a soft brand-tinted halo rather than a solid
 * highlight. For `mixed`, falls back to brand-purple (the visual midpoint
 * of the aurora gradient).
 */
export function accentSpotlight(accent: Accent): string {
  if (accent === 'mixed') {
    return `rgba(${BRAND_RGB.purple.replace(/\s+/g, '')},0.22)`;
  }
  return `rgba(${BRAND_RGB[accent].replace(/\s+/g, '')},0.22)`;
}

/**
 * `rgba(...)` value for tinted chip backgrounds (e.g. case-study Stack
 * pills, anywhere a small chip wants to inherit the case's accent color).
 * ~20 % alpha keeps the chip text legible against the page background.
 * `mixed` falls back to brand-purple.
 */
export function accentChipBg(accent: Accent): string {
  if (accent === 'mixed') {
    return `rgba(${BRAND_RGB.purple.replace(/\s+/g, '')},0.20)`;
  }
  return `rgba(${BRAND_RGB[accent].replace(/\s+/g, '')},0.20)`;
}

/**
 * Translucent brand-color value for the brightened border on a hovered
 * card (e.g. work-index cards, engagement cards). ~55% alpha.
 */
export function accentHoverBorder(accent: SolidAccent): string {
  return `rgba(${BRAND_RGB[accent].replace(/\s+/g, '')},0.55)`;
}

/**
 * Box-shadow value for the brand-tinted drop shadow on a hovered card.
 * Pairs with accentHoverBorder() for the work-index and services-page
 * engagement card hover treatment.
 */
export function accentHoverShadow(accent: SolidAccent): string {
  return `0 24px 60px -18px rgba(${BRAND_RGB[accent].replace(/\s+/g, '')},0.45)`;
}
