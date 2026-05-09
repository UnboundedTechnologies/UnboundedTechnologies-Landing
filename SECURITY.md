# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in this site or its supporting infrastructure, please report it privately so we can fix it before it's disclosed publicly.

**Contact**: contact@unboundedtechnologies.com

Please include:
- A clear description of the issue
- Steps to reproduce (URLs, payloads, request/response samples)
- Affected commit SHA or production URL if known
- Your assessment of severity and potential impact
- Whether you've already shared the issue with anyone else

We aim to acknowledge reports within 2 business days and to ship a fix or mitigation within 30 days for medium / high severity issues. We will credit reporters in the release notes if you'd like (let us know in the report).

Please **do not** open public GitHub issues for security disclosures.

## Scope

In scope:
- Production site at `https://unboundedtechnologies.com`
- Source code in this repository
- The contact funnel (`/api/contact`) and its third-party integrations as configured (Notion, Resend, Upstash, Calendly)

Out of scope:
- Findings from automated scanners that report informational issues without proof of exploitability (rate-limit guesses, CSP "could be tighter", etc.)
- Social-engineering attempts against owner accounts
- Vulnerabilities in third-party services themselves (please report directly to Vercel / Cloudflare / Notion / Resend / Calendly / Upstash)
- Pre-deployment branches, preview URLs, or unmerged PRs

## Hardening already in place

- Content-Security-Policy with a tightly scoped URL allowlist. `script-src` uses `'unsafe-inline'` plus a small set of trusted origins (Calendly, Plausible, Vercel analytics). Per-request nonces were dropped after Next 16 emitted `"nonce":"$undefined"` for `notFound()` flight payloads, which broke the 404 page; per CSP3 modern browsers ignore `'unsafe-inline'` when a nonce is present, so the "fallback" workaround would not actually relax modern enforcement. XSS surface is controlled by `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, and a no-DOM-echo funnel
- HSTS with `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY` plus CSP `frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying camera / microphone / geolocation / payment / usb / sensors
- `Cross-Origin-Opener-Policy: same-origin`
- Hidden `hp_field` honeypot input on the contact form (visually hidden + tab-skipped). Humans never fill it; naive bots blindly fill every input. Honeypot rejections return a 200 success-shaped response so the bot never learns the rejection mechanism
- Upstash sliding-window rate limit (3 form submissions per IP per hour) on `/api/contact`
- Server-side validation of all funnel inputs via Zod (`leadSchema`)
- All third-party clients (Notion, Resend, Upstash) soft-fail if their env var is absent so a missing secret never leaks an internal error to the user; `Promise.allSettled` around CRM + email writes means a single integration outage cannot 500 the route

> **Note on Turnstile**: Cloudflare Turnstile (invisible mode) was previously deployed on the contact form. It was removed in May 2026 because its always-mounted background risk-analysis ran on the main thread and produced multi-second freezes during typing/scroll on iPhone, making the form effectively unusable. If a smarter challenge is reintroduced later, it will only mount after a first failed honeypot attempt to avoid that regression.

## Responsible disclosure

We follow the principle of coordinated disclosure. We will not pursue legal action against researchers who:
- Make a good-faith effort to avoid privacy violations, destruction of data, and interruption of service
- Limit testing to accounts they own or have explicit permission to test
- Give us reasonable time to fix the issue before public disclosure

Thank you for helping keep our customers safe.
