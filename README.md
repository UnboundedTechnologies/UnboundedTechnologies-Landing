# Unbounded Technologies Inc.

The official landing site for **[Unbounded Technologies Inc.](https://unboundedtechnologies.com)** — Toronto-based senior cloud architecture and CPaaS engineering.

## Stack

- Next.js 16 · TypeScript strict · Tailwind CSS v4
- React Three Fiber (set-pieces) · Motion · GSAP
- next-intl (EN · FR) · MDX (Contentlayer 2)
- Resend · Notion CRM · Cloudflare Turnstile · Upstash Redis
- Vercel hosting · Cloudflare DNS

## Local development

```bash
pnpm install
cp .env.example .env.local   # then fill in your local secrets
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Run production build locally |
| `pnpm lint` | Biome lint + format check |
| `pnpm lint:fix` | Auto-fix lint + format |
| `pnpm type-check` | TypeScript no-emit check |
| `pnpm test` | Playwright e2e + visual |

## Quality gates (CI-enforced)

- Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO
- Zero axe-core a11y violations
- Type-check + lint must pass
- Playwright visual regression must pass

## License

© 2026 Unbounded Technologies Inc. All rights reserved.
