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
- **Three R3F set-pieces** running concurrently: a persistent infinity logo Canvas hoisted to the layout level (survives in-app nav), an interactive photoreal globe with drag + zoom + great-circle routes, and an animated impact graph with energy edges and live stat pills.
- **Four MDX-driven case studies** with frontmatter, quantified outcome callouts, inline architecture diagrams, prev/next navigation, and circular wrap-around.
- **Qualified-lead funnel** with hidden honeypot bot mitigation, Upstash sliding-window rate limit, Notion CRM, Resend transactional email, and an outbound branded "Book a call" card to Calendly for qualified applicants.
- **Strict CSP** with per-request nonce, plus HSTS / X-Frame / X-CTO / Referrer / Permissions / COOP. Allowlist tightly scoped to actually-used origins.
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
    layout.tsx                 Root layout (CSP nonce + persistent canvases)
    sitemap.ts                 EN + FR sitemap with hreflang
    robots.ts                  Allow-everything except /api
  components/
    atmosphere/                ParticleField, AuroraOrbs, HeroAtmosphere, SectionAtmosphere
    case-study/                CaseStudyLayout (MDX renderer + outcome callouts + prev/next)
    command-palette/           cmdk-powered ⌘K palette
    funnel/                    Qualified-lead form, Turnstile widget, Calendly embed
    globe/                     R3F photoreal globe with great-circle routes
    hero/                      Persistent infinity logo Canvas (layout-level)
    impact-graph/              Self-drawing impact graph + energy edges
    nav/                       TopNav, Footer, MobileMenu, LanguageSwitcher
    primitives/                Buttons, Eyebrows, Spotlight (cursor halo)
    services/                  Pillars, EngagementTimeline, HonestyList
    theme/                     Tri-state theme provider with no-FOUC boot
  i18n/
    routing.ts                 next-intl routing + workHref helper
    config.ts                  Locales: en (default), fr
  lib/
    accents.ts                 Brand-color helpers (blue/purple/cyan/mixed)
    case-studies.ts            MDX loader (server-only, 'use cache' + React.cache)
    cv-pdf.tsx                 PDF document component
    notion.ts                  Notion CRM client (soft-fails if env absent)
    resend.ts                  Resend client (soft-fails if env absent)
    rate-limit.ts              Upstash limiter (noop fallback if env absent)
    turnstile.ts               Server-side Turnstile verify
    og.ts                      OG image metadata helpers
content/case-studies/          MDX files (BMO, AWS Connect, Renault Forex, ETBA ERP)
messages/                      EN + FR i18n strings
public/                        Banner images, brand logo, earth textures, world topojson
.github/workflows/             CI + Lighthouse-CI workflows
docs/superpowers/              Specs + plans (gitignored, owner-local)
tests/e2e/                     Playwright smoke + axe sweeps
```

## Local development

```bash
pnpm install
cp .env.example .env.local      # fill in local-dev secrets if you want full functionality
pnpm dev                         # turbopack dev server at http://localhost:3000
```

> The funnel (Turnstile / Notion / Resend / Upstash) soft-fails when env vars are absent, so most surfaces work without any keys. For visual + 3D testing, run a production build (`pnpm build && pnpm start`) instead of dev — turbopack's HMR overhead distorts WebGL timing.

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

Two GitHub Actions workflows guard `main`:

| Workflow | Triggered on | Asserts |
|---|---|---|
| `ci.yml` | every push + PR | install, lint, type-check, build, Playwright suite (19 tests + 1 docs-skipped) |
| `lighthouse.yml` | every push to `main` + PRs | desktop-preset Lighthouse with thresholds: a11y ≥ 0.95 (error), best-practices ≥ 0.90 (error), SEO ≥ 0.90 (error), perf ≥ 0.85 (warn — CI runners can't measure WebGL meaningfully) |

The perf gate is intentionally a warning rather than an error on CI: GitHub Actions Ubuntu runners use software-rasterized WebGL which crushes scores for any R3F-heavy site. Real-prod Lighthouse on Vercel hits the gate on real hardware. Phase 15 will add a weekly cron Lighthouse run against the production URL with a hard gate.

## Architecture notes

A few decisions worth knowing about before editing:

- **The 3D infinity logo Canvas is owned by the locale layout, not the Hero.** It's mounted once in `[locale]/layout.tsx` as `<PersistentInfinityLogo />` and an imperative `requestAnimationFrame` loop reads `document.querySelector('[data-hero-canvas-anchor]').getBoundingClientRect()` every frame to overlay the Canvas exactly where the Hero reserves space. This sidesteps a class of WebGL-context-loss bugs that lazy-loading approaches couldn't resolve. The Canvas is never unmounted during in-app nav.
- **Case-study readers are double-cached.** The inner reader functions in `src/lib/case-studies.ts` carry the `'use cache'` directive (required under `cacheComponents: true`); the exported wrappers use `React.cache` for per-render dedup across `generateStaticParams` / `generateMetadata` / page render. Don't remove either layer.
- **CSP allows `'unsafe-inline'` for styles only.** Framer Motion writes `element.style.transform/opacity` from JS at runtime, which CSP nonces don't cover. Scripts stay strict with nonce. CSS injection has no code-execution surface, and `frame-ancestors 'none'` plus `base-uri 'self'` cover the related attack patterns.
- **External services soft-fail.** Notion / Resend clients build to `null` when their env var is absent, helpers return `null`, and the route handler routes around it. Upstash falls back to a noop limiter that always returns success. This means deploys land green even before integrations are wired.
- **`<html lang>` is hardcoded to `en`.** The root layout owns the persistent canvases across locale switches, so promoting `lang` per locale would force a Canvas remount and lose the WebGL context. Trade accepted.

## Deployment

`main` auto-deploys to Vercel. Phase 14 launch runbook lives in `docs/superpowers/plans/2026-05-01-phase-14-launch-runbook.md` (gitignored, owner-local). The 12 production env vars expected by the code:

```
NEXT_PUBLIC_SITE_URL                  required
NEXT_PUBLIC_TURNSTILE_SITE_KEY        optional (form falls back to dev token)
RESEND_API_KEY                        optional (email is silently skipped if absent)
RESEND_FROM_EMAIL                     paired with RESEND_API_KEY
RESEND_TO_EMAIL                       paired with RESEND_API_KEY
TURNSTILE_SECRET_KEY                  optional (server-verify rejects without it)
NOTION_API_KEY                        optional (CRM write skipped if absent)
NOTION_LEADS_DB_ID                    paired with NOTION_API_KEY
CALENDLY_URL                          optional (graceful placeholder if absent)
UPSTASH_REDIS_REST_URL                optional (noop limiter if absent)
UPSTASH_REDIS_REST_TOKEN              paired with UPSTASH_REDIS_REST_URL
GITHUB_TOKEN                          optional (raises GitHub strip rate limit)
```

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
