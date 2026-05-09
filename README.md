# Unbounded Technologies · Landing Site

[![CI](https://github.com/UnboundedTechnologies/UnboundedTechnologies-Landing/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/UnboundedTechnologies/UnboundedTechnologies-Landing/actions/workflows/ci.yml)
[![Lighthouse](https://github.com/UnboundedTechnologies/UnboundedTechnologies-Landing/actions/workflows/lighthouse.yml/badge.svg?branch=main)](https://github.com/UnboundedTechnologies/UnboundedTechnologies-Landing/actions/workflows/lighthouse.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Hosted on Vercel](https://img.shields.io/badge/hosted%20on-Vercel-000000?logo=vercel)](https://vercel.com)

> Senior cloud and CPaaS engineering for enterprises that can't afford to fail.

The official landing site for **[Unbounded Technologies Inc.](https://unboundedtechnologies.com)**, a Toronto-based engineering firm operating with multiple concurrent enterprise clients (AWS, Renault Group, Bank of Montreal). Built as a B2B portfolio + qualified-lead funnel with bilingual (EN / FR) content, four full case studies, and a live booking flow.

## Live site

- Production: https://unboundedtechnologies.com
- Capability statement (PDF): https://unboundedtechnologies.com/cv.pdf

## Highlights

- **Bilingual** EN / FR with locale-prefixed routes and per-route slug mapping (`/work` ↔ `/travaux`, `/about` ↔ `/a-propos`, `/legal/privacy` ↔ `/legal/confidentialite`).
- **Three R3F set-pieces** running concurrently: a persistent infinity logo Canvas hoisted to the **root** layout (survives locale switches and all in-app nav), an interactive photoreal globe with drag + zoom + great-circle routes, and an animated impact graph with energy edges and live stat pills.
- **Four MDX-driven case studies** with frontmatter, quantified outcome callouts, inline architecture diagrams, prev/next navigation, and circular wrap-around.
- **Qualified-lead funnel** with hidden honeypot bot mitigation, Upstash sliding-window rate limit, Notion CRM, Resend transactional email, and an outbound branded "Book a call" card to Calendly for qualified applicants.
- **Strict CSP** with a tightly scoped allowlist (script-src uses `'unsafe-inline'` + a small set of trusted origins; nonces were dropped after Next 16's notFound() flight payloads emitted `"nonce":"$undefined"` and broke the 404 page; XSS surface is controlled by `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, and a no-DOM-echo funnel), plus HSTS / X-Frame / X-CTO / Referrer / Permissions / COOP.
- **macOS Tahoe-style command palette** (cmdk) with ⌘K / Ctrl+K, fuzzy search, recent commands, theme + motion toggles, and case-study deep links.
- **Triple theme system** (Dark / Cinematic / Auto) with sunrise-sunset auto-resolve and a no-FOUC boot script applied synchronously before hydration.
- **Touch-aware motion**: every hover-only effect has an `active:` / `focus-within:` fallback plus IntersectionObserver auto-cascades on coarse-pointer devices, so mobile reads as alive.
- **Bring-your-own-PDF capability statement** rendered via `@react-pdf/renderer` and served at `/cv.pdf` with 24h `cacheLife` revalidation.
- **Dynamic OG cards** for every public route via `next/og`'s `ImageResponse` (1200×630 PNGs with aurora background + page title).
- **Branded 404** with the UT banner, aurora orbs, four destination cards (cycling brand accents), and a palette hint.

## Stack

- **Framework**: Next.js 16 App Router with `cacheComponents: true` (Cache Components / PPR)
- **Language**: TypeScript strict
- **Styling**: Tailwind CSS v4 (oxide compiler) with custom `@theme` color tokens
- **3D**: React Three Fiber + drei + postprocessing
- **Motion**: Framer Motion (motion package) with full `prefers-reduced-motion` honoring
- **i18n**: next-intl v4 with `pathnames` mapping
- **Content**: gray-matter + next-mdx-remote/rsc with Zod-validated frontmatter
- **Forms**: react-hook-form + Zod, hidden-honeypot bot mitigation, Upstash sliding-window rate limit (3/h/IP)
- **CRM**: Notion API
- **Email**: Resend (transactional) + react-email templates
- **Booking**: branded outbound CTA card to Calendly (free-tier-friendly, no inline iframe)
- **PDF**: @react-pdf/renderer (capability statement)
- **Tooling**: pnpm, Biome (lint + format), Playwright + axe-core (e2e + a11y)
- **Hosting**: Vercel (Hobby tier sufficient for v1.0 traffic)
- **DNS / registrar / email routing**: Cloudflare

## Project structure

```
src/
  app/
    [locale]/                  Locale-prefixed pages (en, fr)
      page.tsx                 Homepage
      work/                    Index + dynamic /[slug] case studies
      services/                Engagement models
      about/                   Story, operating model, stats
      contact/                 Qualified-lead funnel
      legal/{privacy,terms}/   PIPEDA-aware boilerplate (lawyer review pending)
      not-found.tsx            Branded 404
      [...rest]/               Catch-all → notFound() for branded 404
    api/
      contact/                 Funnel POST handler (rate limit + honeypot + Notion + Resend)
      og/[...slug]/            Dynamic OG image generator
    cv.pdf/                    React-PDF capability statement
    layout.tsx                 Root layout: persistent canvases + theme boot script + font setup
    sitemap.ts                 EN + FR sitemap with hreflang
    robots.ts                  Allow-everything except /api
    proxy.ts (one above)       next-intl middleware + CSP + security headers
  components/
    atmosphere/                ParticleField, AuroraOrbs, HeroAtmosphere, SectionAtmosphere
    case-study/                CaseStudyLayout (MDX renderer + outcome callouts + prev/next + diagrams)
    command-palette/           cmdk-powered ⌘K palette
    easter-egg/                Konami / hidden interactions
    funnel/                    Qualified-lead form (honeypot bot mitigation) + branded outbound Calendly card
    github-strip/              GitHub-strip live activity widget
    globe/                     R3F photoreal globe with great-circle routes
    hero/                      Persistent infinity logo Canvas (mounted in root layout, not Hero)
    impact-graph/              Self-drawing impact graph + energy edges
    nav/                       TopNav, Footer, MobileMenu, LanguageSwitcher
    outcomes/                  Outcome-callout cards used inside MDX case studies
    perf-scorecard/            Footer chip that reads public/lighthouse.json
    primitives/                Buttons, Eyebrows, Spotlight (cursor halo)
    services/                  Pillars, EngagementTimeline, HonestyList
    theme/                     Tri-state theme provider with no-FOUC boot
    trusted-by/                Trusted-by logo strip
  i18n/
    routing.ts                 next-intl routing + workHref helper
    config.ts                  Locales: en (default), fr
  lib/
    accents.ts                 Brand-color helpers (blue/purple/cyan/mixed)
    case-studies.ts            MDX loader (server-only, 'use cache' + React.cache)
    case-study-diagrams.ts     Inline architecture diagram primitives
    cv-pdf.tsx                 PDF document component (@react-pdf/renderer)
    env.ts                     Zod-validated runtime env schema
    github.ts                  GitHub API client (soft-fails if no token; rate-limit aware)
    hooks/                     Shared React hooks
    lead-score.ts              Scores funnel submissions as qualified vs exploratory
    notion.ts                  Notion CRM client (soft-fails if env absent)
    og.ts                      OG image metadata helpers
    rate-limit.ts              Upstash limiter (noop fallback if env absent)
    resend.ts                  Resend client (soft-fails if env absent)
    utils.ts                   cn() and small shared utilities
content/case-studies/          MDX files (BMO, AWS Connect, Renault Forex, ETBA ERP)
messages/                      EN + FR i18n strings
public/                        Banner images, brand logo, earth textures, world topojson, lighthouse.json
.github/workflows/             ci, lighthouse, lighthouse-weekly, react-doctor
.github/dependabot.yml         Weekly grouped npm + GH Actions PRs (Mondays 06:00 America/Toronto)
docs/                          post-launch.md (operations) + architecture.md (engineering deep-dive)
docs/superpowers/              Specs + plans (gitignored, owner-local)
tests/e2e/                     Playwright smoke + axe sweeps
scripts/                       PSI helpers (psi-weekly, psi-opportunities, lh-summary, etc.)
```

## Local development

```bash
pnpm install
cp .env.example .env.local      # fill in local-dev secrets if you want full functionality
pnpm dev                         # turbopack dev server at http://localhost:3000
```

> The funnel (Notion / Resend / Upstash) soft-fails when env vars are absent, so most surfaces work without any keys. For visual + 3D testing, run a production build (`pnpm build && pnpm start`) instead of dev. Turbopack's HMR overhead distorts WebGL timing.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Run production build locally on :3000 |
| `pnpm lint` | Biome lint + format check |
| `pnpm lint:fix` | Auto-fix lint + format |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm test` | Playwright e2e + axe sweeps |
| `pnpm format` | Biome format only (no lint) |

## CI gates

Four GitHub Actions workflows guard `main`:

| Workflow | Triggered on | Asserts |
|---|---|---|
| `ci.yml` | every push + PR | install, lint, type-check, build, Playwright suite (19 tests + 1 docs-skipped) |
| `lighthouse.yml` | every push to `main` + PRs | desktop-preset Lighthouse-CI on the runner. Thresholds: a11y ≥ 0.95 (error), best-practices ≥ 0.90 (error), SEO ≥ 0.90 (error), perf ≥ 0.85 (warn). Software-rasterized WebGL on the Ubuntu runner crushes perf scores, so the gate is informational rather than blocking. |
| `lighthouse-weekly.yml` | Mondays 09:00 UTC (cron) + manual | Real-prod PageSpeed Insights run against `/en/services` (R3F-free, representative of static-content perf). Commits the latest scores back to `public/lighthouse.json` for the footer scorecard chip. Opens a regression issue if any score drops below the configured threshold (mobile perf 90, desktop 80, a11y 95, BP 90, SEO 90). |
| `react-doctor.yml` | every push to `main` + PRs | Non-blocking sweep. Captures the score in the job summary so owners can eyeball drift PR-by-PR; most remaining findings (R3F three.js JSX props, hero-atmosphere blurs, long ambient rotations) are intentional design-intent and live-tracked in memory. |

Dependabot (`.github/dependabot.yml`) opens grouped weekly PRs Mondays 06:00 America/Toronto for npm + GitHub Actions. Three.js / R3F / drei / `@types/three` are pinned out of the bot because they coordinate together and minor bumps can produce silent peer-dep drift; bump those by hand.

## Architecture notes

A few decisions worth knowing about before editing. The deep-dive companion lives at [`docs/architecture.md`](./docs/architecture.md); operations + on-call break-glass at [`docs/post-launch.md`](./docs/post-launch.md).

- **The 3D infinity logo Canvas is owned by the root layout, not the Hero.** It's mounted once in `src/app/layout.tsx` (alongside `<ParticleField />`) as `<PersistentInfinityLogo />` and an imperative `requestAnimationFrame` loop reads `document.querySelector('[data-hero-canvas-anchor]').getBoundingClientRect()` every frame to overlay the Canvas exactly where the Hero reserves space. Mounting at the root layout (rather than `[locale]/layout.tsx`) keeps the WebGL context alive across locale switches too, since the locale layout re-runs when `[locale]` changes. The Canvas is never unmounted during in-app nav. The logo module itself is dynamic-imported and only mounted when the hero anchor exists, saving ~354 KiB on /services /about /work /contact.
- **Case-study readers are double-cached.** The inner reader functions in `src/lib/case-studies.ts` carry the `'use cache'` directive (required under `cacheComponents: true`); the exported wrappers use `React.cache` for per-render dedup across `generateStaticParams` / `generateMetadata` / page render. Don't remove either layer.
- **CSP uses `'unsafe-inline'` for both `script-src` and `style-src`, plus a tight URL allowlist.** `style-src` always needed it (Framer Motion writes `element.style.transform/opacity` at runtime, not nonce-coverable). `script-src` was switched off the per-request nonce after Next 16 emitted `"nonce":"$undefined"` for `notFound()` flight payloads. The inline boot script then violated the nonce-only directive and turned the 404 into a wall of CSP errors. Modern browsers (CSP3) ignore `'unsafe-inline'` when a nonce is present, so the "add `'unsafe-inline'` as fallback" workaround does not actually relax modern enforcement. XSS surface is controlled by `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, and a no-DOM-echo funnel; the script-src URL allowlist is small (Calendly, Plausible, Vercel analytics).
- **External services soft-fail.** Notion / Resend clients build to `null` when their env var is absent, helpers return `null`, and the route handler routes around it. Upstash falls back to a noop limiter that always returns success. This means deploys land green even before integrations are wired.
- **The contact funnel uses honeypot + Upstash, no Turnstile.** Cloudflare Turnstile (invisible mode) was removed because its always-mounted background risk-analysis ran on the main thread and produced multi-second freezes during typing/scroll on iPhone. Bot mitigation today is (1) a hidden, tab-skipped `hp_field` that humans never fill, (2) Upstash sliding-window 3-per-hour-per-IP, (3) Zod schema validation. Honeypot rejections return a 200 success-shaped envelope so the bot never learns the rejection mechanism. If spam ramps up, reintroduce Turnstile only behind an explicit signal (e.g. mount only after a first failed honeypot attempt). Never inline.
- **`<html lang>` lives only in the root layout (Next constraint) and is hardcoded to `en`.** That layout also owns the persistent WebGL canvases. Promoting `lang` per locale would require moving `<html>` into `[locale]/layout.tsx` (which the App Router doesn't allow) or remounting the canvases on locale switch. Trade accepted; per-page `<html lang>` would also fight `next-intl`'s segment routing on slug-mapped routes.

## Deployment

`main` auto-deploys to Vercel. The runtime env schema lives in `src/lib/env.ts` (Zod-validated). Production env vars expected by the code:

```
NEXT_PUBLIC_SITE_URL                  defaulted to https://unboundedtechnologies.com
PLAUSIBLE_DOMAIN                      defaulted to unboundedtechnologies.com (analytics deferred to v1.x)
RESEND_API_KEY                        optional (lead notification + applicant confirmation skipped if absent)
RESEND_FROM_EMAIL                     paired with RESEND_API_KEY (defaulted to noreply@send.unboundedtechnologies.com)
RESEND_TO_EMAIL                       paired with RESEND_API_KEY (defaulted to contact@unboundedtechnologies.com)
NOTION_API_KEY                        optional (CRM write skipped if absent)
NOTION_LEADS_DB_ID                    paired with NOTION_API_KEY
CALENDLY_URL                          optional (graceful placeholder card if absent)
GITHUB_TOKEN                          optional (raises GitHub strip API rate limit from 60/hr to 5000/hr)
UPSTASH_REDIS_REST_URL                optional (noop limiter if absent)
UPSTASH_REDIS_REST_TOKEN              paired with UPSTASH_REDIS_REST_URL
PSI_API_KEY                           CI-only (used by the lighthouse-weekly workflow)
```

Cloudflare Turnstile env vars are intentionally absent: the widget was removed in commit `0696686` because it ran continuous background risk-analysis on the main thread and caused multi-second iPhone freezes during typing/scroll. Bot mitigation is now honeypot + Upstash + Zod (see `src/app/api/contact/route.ts`).

## Browser support

Targets evergreen Chrome / Firefox / Safari / Edge. iOS 16+ and macOS 13+ for full WebGL fidelity (Bloom postprocessing skipped on touch devices for thermal headroom). No IE / legacy Edge support.

## Accessibility

- WCAG AA contrast on every text surface (verified with axe-core on every CI run)
- Reduced-motion fully honored: data-motion override + system preference both kill animations
- Keyboard nav across the entire site including the command palette and language switcher popovers
- Screen-reader landmarks: `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>` per page

## Performance budget

| Metric | Target | Notes |
|---|---|---|
| LCP | < 1.5s p75 | WebPageTest from Toronto / NY / London |
| CLS | < 0.05 | Critical content reserves space; no font-swap shift |
| TBT | < 200ms p75 | R3F set-pieces are GPU-bound, not main-thread-bound |
| Bundle (initial) | < 200kb gzipped | Atmosphere components are tiny, R3F is dynamic-imported only on routes that need it |

## Security

See [SECURITY.md](./SECURITY.md) for the responsible-disclosure policy.

## License

© 2026 Unbounded Technologies Inc. All rights reserved. See [LICENSE](./LICENSE).

This is **proprietary code** for a single business. The repo is public so prospective clients can audit the engineering, but the code is not licensed for reuse, redistribution, or derivative works without written permission.

---

Built by [Saïd Aïssani](https://www.linkedin.com/in/said-aissani/) · contact@unboundedtechnologies.com · Toronto, Canada
