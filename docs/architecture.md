# Architecture

> Engineering deep-dive companion to the README. Captures the non-obvious decisions: what was tried, what didn't work, and why the current shape exists. Re-read before editing any of the surfaces below.

## Persistent WebGL canvases

The site has three concurrent R3F set-pieces (infinity logo, photoreal globe, impact graph). The infinity logo is the only one that has to survive cross-route nav, because every page reserves a hero slot for it.

**Where it's mounted.** `src/app/layout.tsx` (the root layout) renders `<ParticleField />` and `<PersistentInfinityLogo />` once. They live above `{children}`, which means they sit behind everything and the React tree under them re-renders freely without dropping the WebGL context. The locale layout (`src/app/[locale]/layout.tsx`) is **not** allowed to own them because it re-runs whenever the `[locale]` segment changes, which would remount the Canvas and lose the context.

**How it positions itself.** An imperative `requestAnimationFrame` loop reads `document.querySelector('[data-hero-canvas-anchor]').getBoundingClientRect()` every frame and writes the dimensions onto the fixed-position Canvas. Pages that want the logo overlaid render the anchor element; pages that don't simply omit it and the `rAF` loop short-circuits. The logo module itself is dynamic-imported and only mounts once the anchor exists, saving ~354 KiB on `/services`, `/about`, `/work`, `/contact`.

**Why not `position: sticky` or a portal?** Sticky requires a single scroll container and breaks under iOS rubber-band scrolling. A portal would mount/unmount with the source component and is exactly the WebGL-context-loss bug we're avoiding. The fixed-Canvas-plus-anchor approach is the only one we found that survives every nav permutation without flicker.

**Reduced-motion path.** `prefers-reduced-motion: reduce` and the in-app data-motion override both kill the rAF camera-rotation loop. The Canvas stays mounted (so re-enabling motion doesn't lose context) but stops invalidating frames.

## Cache Components / PPR posture

`next.config.ts` sets `cacheComponents: true` and `reactCompiler: true`. That gives us Next 16 PPR + the React Compiler's automatic memoization, but it also makes any uncached I/O (filesystem reads, fetches without `'use cache'`) a build-time error unless wrapped.

### Double-cached MDX readers

`src/lib/case-studies.ts` defines two cache layers that look redundant but aren't:

1. **Inner readers carry `'use cache'`.** `readCaseStudy`, `readCaseStudySlugs`, `readAllCaseStudies` read from disk via `node:fs/promises`. Without the directive, Cache Components flags the build.
2. **Exported wrappers use `React.cache`.** A single page render typically calls a loader three times (`generateStaticParams`, `generateMetadata`, and the page body), and `React.cache` makes those three awaits share one promise.

Either layer alone is insufficient. Removing `'use cache'` breaks the build; removing `React.cache` triple-awaits the cached function. Both stay.

### `cacheLife` choices

- `/cv.pdf` → 24h `cacheLife`. The capability statement rarely changes, but `@react-pdf/renderer` rendering is heavy.
- Public route fragments → default `cacheLife` (Cache Components's auto policy is fine for non-PII surfaces).

## Soft-fail external services

Every third-party integration in `src/lib/` is built so that a missing env var or upstream outage cannot 500 the route or block the build:

- **Notion** (`src/lib/notion.ts`): the client is `null` when `NOTION_API_KEY` is absent. `createLead()` checks for null and returns silently.
- **Resend** (`src/lib/resend.ts`): same pattern. Missing key → no email goes out, the funnel still records the lead in Notion (or nowhere if Notion is also off).
- **Upstash** (`src/lib/rate-limit.ts`): missing URL/token → swap to a noop limiter that always returns success. Local dev never hits the rate-limit gate.
- **GitHub** (`src/lib/github.ts`): no token → falls back to the unauthenticated 60/hr API rate limit. The activity strip degrades gracefully.

The contact route handler wraps Notion + Resend in `Promise.allSettled` so a single dependency failure cannot tip the request to 500. Honeypot rejections short-circuit before either integration is called and return a 200 success-shaped envelope so the bot never learns the mechanism.

## Theme boot script (no-FOUC)

`src/components/theme/theme-provider.ts` exports `THEME_BOOT_SCRIPT`, a small string of JS that the root layout injects into `<head>` via `dangerouslySetInnerHTML` before React hydrates. The script reads `localStorage` + `prefers-color-scheme` + the time-of-day for the auto / sunrise-sunset path and applies the resolved class to `<html>` synchronously. Because it runs before paint, there is no flash of the wrong palette.

CSP allows the inline script via `'unsafe-inline'` on `script-src` (see CSP rationale below). Biome flags `dangerouslySetInnerHTML` and gets a `biome-ignore` line because the constant is owned by our own module.

## CSP rationale

The current CSP profile (in `src/proxy.ts`) is:

```
default-src 'self'
script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://assets.calendly.com https://plausible.io https://va.vercel-scripts.com
style-src 'self' 'unsafe-inline'
img-src 'self' data: https://avatars.githubusercontent.com
connect-src 'self' https://api.github.com https://api.notion.com https://api.resend.com https://challenges.cloudflare.com https://plausible.io https://vitals.vercel-insights.com https://va.vercel-scripts.com
frame-src https://calendly.com https://*.calendly.com https://challenges.cloudflare.com
font-src 'self'
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
```

**Why no nonces on `script-src`.** We started with per-request nonces. Next 16 emits inline scripts on `notFound()` / `not-found.tsx` rendering, and the flight payload writes `"nonce":"$undefined"` for those scripts. The nonce-only directive then rejected them and turned the branded 404 into a wall of CSP errors. Per CSP3, modern browsers ignore `'unsafe-inline'` whenever a nonce is present on the directive, which means the textbook fallback ("add `'unsafe-inline'` next to the nonce") doesn't actually relax modern enforcement. The accepted industry pragma is `script-src 'self' 'unsafe-inline'` plus a tight URL allowlist; XSS surface is controlled by `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, and a no-DOM-echo funnel.

**Why `'unsafe-inline'` on `style-src`.** Framer Motion writes `element.style.transform/opacity` from JS at runtime. These writes are not nonce-coverable; CSS injection has no code-execution surface anyway.

**The `challenges.cloudflare.com` allowlist entries** are residual from the Turnstile era and could be tightened. Tracked as a follow-up in the post-launch playbook; not removed yet because reintroducing a smarter Turnstile challenge later remains a designed escape hatch.

## i18n routing + slug mapping

`next-intl` v4 with `defineRouting` (in `src/i18n/routing.ts`):

- Locales: `en` (default), `fr`. `localePrefix: 'always'` so every URL carries `/en` or `/fr`.
- `localeDetection: false`. Accept-Language is ignored; the bare URL resolves to English. (Rationale: this is a B2B portfolio whose default audience is English and whose URLs are shared verbatim; auto-detection produced wrong-locale shares.)
- `pathnames` mapping translates segments: `/work` ↔ `/travaux`, `/about` ↔ `/a-propos`, `/legal/privacy` ↔ `/legal/confidentialite`, `/legal/terms` ↔ `/legal/conditions`. Dynamic case-study slugs map per file (`/work/[slug]` ↔ `/travaux/[slug]`).
- `workHref(slug)` is the typed-route helper that satisfies next-intl's typed-routes machinery for the dynamic `[slug]`.

When you need to detect the current dynamic route, use `useParams().slug`, **not** `usePathname()`. The pathname's return shape varies by cache state on next-intl's typed-route helpers; `useParams` is reliable.

## Funnel pipeline

`/api/contact` is the only write endpoint on the site. The pipeline:

1. **Rate limit.** Upstash sliding-window 3 / hour / IP. Falls back to a noop locally.
2. **JSON parse.** Malformed bodies → 400.
3. **Zod validation.** `leadSchema` in `src/components/funnel/form-schema.ts`. Rejects malformed payloads cheaply.
4. **Honeypot check.** `hp_field` is visually hidden + tab-skipped. Any non-empty value short-circuits to a 200 success-shaped envelope (no Notion write, no email).
5. **Score.** `scoreLead()` in `src/lib/lead-score.ts` returns `{ qualified: boolean, ... }`.
6. **Notify.** `Promise.allSettled([createLead, sendLeadNotification])` so a single integration failure cannot 500 the route.
7. **Confirm.** Qualified applicants get the branded outbound Calendly card ("Book a call"); exploratory applicants get the warmer "thanks, three business days" copy.

### Why honeypot, not Turnstile

Cloudflare Turnstile (invisible mode) was previously deployed. It ran continuous background risk-analysis on the main thread and produced multi-second freezes during typing/scroll on iPhone, making the form effectively unusable. Removed in commit `0696686`. Honeypot + Upstash + Zod is sufficient for current traffic and contact-form-fill patterns. If spam ramps up, reintroduce Turnstile only after a first failed honeypot attempt. Never inline.

### iOS form-input quirks

Every input/textarea/select carries `font-size: 16px` minimum on mobile. iOS Safari auto-zooms on focus when font-size is below ~14px and never zooms back out, leaving the field anchored to the left of the viewport. The form had this bug (commit `76c1b41`); the fix is now load-bearing. Don't drop input font-size below 16px in form components without explicit testing on a real iPhone.

## Touch-aware motion

Every hover-only effect on the site has a touch fallback by default:

- `hover:` paired with `active:` and `focus-within:` so the same effect fires on tap or focus.
- Ambient cascades use IntersectionObserver to auto-fire on coarse-pointer (`@media (pointer: coarse)`) so the page reads alive on mobile without requiring a hover.
- Always verify on a real device. iOS Safari caches `prefers-reduced-motion: reduce` per tab. Toggling iOS Reduce Motion off in Settings does not take effect on an open tab; you need a fresh tab to test.

## Capability statement (`/cv.pdf`)

Rendered server-side via `@react-pdf/renderer` from `src/lib/cv-pdf.tsx`. Served at `/cv.pdf` with 24h `cacheLife` revalidation. Updates flow from the source TS file, so changes to engagements / insurance / contact info propagate automatically.

## OG cards

`src/app/api/og/[...slug]/route.ts` uses `next/og`'s `ImageResponse` to render 1200×630 PNGs with the aurora background and the page title. Every public route gets dynamic OG metadata wired from `src/lib/og.ts`.

## Performance envelope

- **Bundle**: initial JS < 200 KiB gzipped. R3F is dynamic-imported only on routes that need it.
- **WebGL**: postprocessing Bloom is skipped on touch devices for thermal headroom.
- **Lighthouse**: weekly real-prod PSI run on `/en/services` (R3F-free, representative of static-content perf). Homepage WebGL perf is tracked separately by `lighthouse.yml` on the runner; that one is software-rasterizer-bound and useful for regression tracking, not absolute scores.
- **Footer scorecard chip** reads `public/lighthouse.json`, which the weekly cron commits back to `main`.

## Tooling notes

- **Biome** owns lint + format. Configuration lives in `biome.json`. The trusted-by strip has a single `noRedundantRoles` override; everything else runs default-strict.
- **Playwright** runs the e2e suite (`tests/e2e/`) plus axe-core sweeps. Use real keyboard events (`page.keyboard.press`) for ⌘K / Ctrl+K palette tests. Synthetic `window.dispatchEvent(new KeyboardEvent(...))` does not reach `useEffect`-registered listeners under React 19 + reactCompiler in production builds.
- **LightningCSS** strips unprefixed `backdrop-filter` from custom CSS rules. Use the Tailwind utilities directly on `className`, not custom CSS rules, for backdrop-blur / saturate effects.
- **react-doctor** sweep runs on every push as a non-blocking informational check. The remaining findings are intentional design-intent (R3F three.js JSX props, hero-atmosphere blurs in the 80–120px range, 60s+ ambient rotations). Don't auto-fix those without sign-off; they're tuned visuals, not bugs.

## Deployment topology

- `main` auto-deploys to Vercel (Hobby tier).
- DNS / registrar / inbound email routing live on Cloudflare. Outbound transactional email goes through Resend.
- SSL is Vercel-issued via Let's Encrypt + `pki.goog`; CAA records on the apex pin both issuers.
- Env vars are managed via the Vercel dashboard. Local dev pulls them via `vercel env pull` (writes to `.env*.local`, which is gitignored).

See [`docs/post-launch.md`](./post-launch.md) for the operational playbook, on-call break-glass table, and quarterly cadence.
