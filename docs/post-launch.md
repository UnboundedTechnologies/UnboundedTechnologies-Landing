# Post-launch playbook

> Operational reference for the live `unboundedtechnologies.com` site after the `v1.0` cut. Tracks the recurring tasks, the deferred items, and the things to watch in the first 90 days.

## Owners

| Role | Owner |
|---|---|
| Site / engineering | Saïd Aïssani (owner) |
| Hosting | Vercel (project `unboundedtechnologies-projects/unboundedtechnologies-landing`) |
| DNS / registrar | Cloudflare |
| Inbound email | Cloudflare Email Routing → owner Gmail |
| Outbound email | Resend (`noreply@unboundedtechnologies.com`) |
| CRM | Notion (`Unbounded · Leads` database) |
| Booking | Calendly (free tier, `unboundedtechnologies/discovery-call-unbounded-technologies-inc`) |
| Rate limit storage | Upstash Redis (`unbounded-rate-limit`, `us-east-1`, free tier) |
| Perf monitoring | Google PageSpeed Insights API (key in Vercel `PSI_API_KEY` + GitHub secret `PSI_API_KEY`) |

## Cadence

### Daily — passive

- **Inbox** (Resend → Gmail): owner-facing lead notifications land within seconds of submission. Reply within the stated three-business-day window.
- **Notion `Unbounded · Leads`**: every submission also appears here. Use it to track outreach status (Status column).

### Weekly — automated

- **Lighthouse-weekly cron** (`.github/workflows/lighthouse-weekly.yml`) runs every Monday 09:00 UTC. Calls PSI for `/en/services` mobile + desktop, writes the latest scores to `public/lighthouse.json`, and opens a GitHub issue if any score drops below the configured threshold (mobile perf 90, desktop perf 80, a11y 95, BP 90, SEO 90). The footer perf-scorecard chip on the site reads from the committed `lighthouse.json` and shows the current Performance score.
- **Action**: if an issue lands, treat it as a regression and investigate before the following Monday.

### Week 1 (post-launch)

- **Testimonial outreach**: pick 1–2 active enterprise clients (BMO, AWS, Renault Group, ETBA, S.i Systems context). Ask for a 1–2 sentence quote that can be used on the site. Save raw quotes in `docs/testimonials.md` (gitignored, owner-local).
- **Search-engine indexing**: confirm Google Search Console + Bing Webmaster Tools show the sitemap has been crawled. Any 4xx/5xx in the coverage report is a launch-week priority.
- **Social distribution**: LinkedIn launch post (link to `unboundedtechnologies.com`), 1–2 GitHub repo links if appropriate.

### Weeks 2–4 (post-launch)

- **Inbox triage**: track the qualified vs exploratory ratio. If exploratory > 80%, the qualification copy probably reads too welcoming (tighten the project-type / hourly-rate framing). If qualified < 5%, copy probably reads too gated.
- **CRM hygiene**: every Monday, review Notion entries with Status = `New`. Move to `Replied` / `Booked` / `Closed-no-fit`.
- **Spam volume monitoring**: if the rate-limit `429`s pile up at one IP repeatedly, or honeypot-rejected submissions spike (visible only in server logs since they return a fake-success), reintroduce a smarter challenge surface. **Do not reintroduce the always-mounted Turnstile widget** — it caused multi-second iPhone main-thread freezes during typing/scroll. If a challenge is needed, render Turnstile only after a first failed honeypot attempt (server returns 400 with a specific signal; client mounts the widget).

### Month 2

- **FR translation native review** (open blocker): owner reads `messages/fr.json` and the four `*.fr.mdx` case studies, replaces machine-translated phrasing.
- **Lawyer review of `/legal/privacy` + `/legal/terms`** (open blocker): confirm PIPEDA boilerplate maps to actual data flows.
- **Insurance verification** (open blocker): confirm the `$2M E&O / $5M GL` figure asserted in the About copy is current.
- **Real S.i Systems SVG asset** (open blocker): replace the styled wordmark in the trusted-by strip with the official logo.

### Quarterly (every ~13 weeks)

- **Dependency sweep**: `pnpm outdated` + manual review. Major updates (Next.js, React, Tailwind, R3F) get their own PR and a full Lighthouse + Playwright pass before merge. Patch versions can ship in a single bundle.
- **Content refresh**: review the four case-study MDX files. Update outcome callouts with current metrics if engagements have advanced. Add a new case study if a new public-disclosure-friendly engagement has shipped.
- **Capability statement (`/cv.pdf`)**: confirm the listed engagements + insurance + contact info are still accurate. The PDF is rendered fresh by `@react-pdf/renderer` so updates flow from `src/lib/cv-pdf.tsx` automatically.
- **Perf budget**: review the median PSI scores across the quarter (artifacts are retained 30 days per run, so review the most recent month). If any category has trended down by ≥5 points, dig into the largest offender via the artifact's full Lighthouse JSON.

## Deferred to v1.x

These are tracked features that did not make the v1.0 cut. Each can ship as a small isolated PR.

- **Plausible analytics** (CSP allowlist already in place from Phase 12; see `src/proxy.ts`). To enable: add the script tag in `[locale]/layout.tsx`, sign up at plausible.io with the `unboundedtechnologies.com` domain. ~$9/mo.
- **Arabic locale** (currently EN + FR). Adds a third entry to `routing.locales`, a third messages file, and locale-specific `pathnames`. Owner-blocked: needs a native AR translator.
- **OG card variants per case study** — currently every case study uses the same template. Could pull from `case-study.heroImage` if added to frontmatter.
- **Smarter bot challenge** — replace the honeypot with a server-issued challenge served only after first suspicious submission. Could reuse Cloudflare Turnstile in popup mode (NOT inline).
- **Real testimonials section** — copy lives in i18n messages but has no surface yet. Drop after Week 1 outreach yields quotable lines.

## On-call / break-glass

| Symptom | First step |
|---|---|
| Site returns 5xx | `vercel ls --prod` to find the latest Ready deploy. If recent deploy is broken, click Promote to Production on a previous Ready deploy in the Vercel dashboard. Code-fix follows. |
| `/api/contact` returns 500 | Check Vercel logs for the offending deploy. Most likely an env-var unset or a Notion/Resend API outage. Both are wrapped in `Promise.allSettled` so a single dependency failure should not 500 — investigate the throw. |
| `/api/contact` returns 429 to a real lead | Upstash rate-limit hit (3/h/IP). Tell the lead to email `contact@unboundedtechnologies.com` directly. Do **not** raise the limit unless you see a pattern. |
| Inbox not receiving lead notifications | Check Resend dashboard for delivery failures. Confirm the apex domain DNS records are still verified. Owner Gmail spam folder is a common cause too. |
| Bot/spam flood | If submissions look like garbage in Notion, check the volume in Resend's `Sent` log. If the honeypot is being bypassed, ship a smarter challenge (see "deferred to v1.x"). |
| DNS / SSL issue | Cloudflare DNS is the source of truth. Vercel issues SSL via Let's Encrypt + `pki.goog` per the CAA records on the apex. If SSL fails to renew, check the CAA records (Cloudflare DNS → CAA records) and the Vercel domain attachment. |
| Lighthouse-weekly opens a regression issue | The artifact attached to the run has the full Lighthouse JSON. `scripts/psi-opportunities.mjs` parses it for the top opportunities. Investigate the largest opportunity first. |

## Versioning

- `main` is always the deployed branch.
- `v1.0` tagged at first public launch (May 2026).
- Subsequent feature work goes into the working tree directly; tag minor versions (`v1.1`, `v1.2`) when bundling several user-visible changes for an "update" comms moment. Patch fixes (perf, copy, bug fixes) ship without a tag.

## Memory

Operational memory (per-session learnings, anti-patterns, gotchas) lives in `~/.claude/projects/.../memory/` and is automatically picked up by Claude Code sessions opened in this directory. Entries that may matter for future engineering:

- iPhone form-input auto-zoom (Safari 14px threshold)
- iOS Safari `prefers-reduced-motion` per-tab cache
- Calendly free-tier `backgroundColor` is Pro-only (and the related "use a branded outbound CTA card, not the inline iframe")
- Lockstep rule when re-tuning the Calendly card crop constants (legacy from when we tried to embed the iframe)
- Turnstile invisible-mode causes iPhone main-thread freezes; replaced with honeypot
- LightningCSS strips unprefixed `backdrop-filter` from custom CSS rules — use Tailwind utilities instead
- React 19 `reactCompiler` synthetic-keydown filter — use Playwright real keyboard events in tests

Each lesson is a separate file in the memory directory. Read those before reasoning about the same surface again.
