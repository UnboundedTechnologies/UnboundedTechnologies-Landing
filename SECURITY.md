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
- The contact funnel (`/api/contact`) and its third-party integrations as configured (Cloudflare Turnstile, Notion, Resend, Upstash, Calendly)

Out of scope:
- Findings from automated scanners that report informational issues without proof of exploitability (rate-limit guesses, CSP "could be tighter", etc.)
- Social-engineering attempts against owner accounts
- Vulnerabilities in third-party services themselves (please report directly to Cloudflare / Vercel / Notion / Resend / Calendly / Upstash)
- Pre-deployment branches, preview URLs, or unmerged PRs

## Hardening already in place

- Strict Content-Security-Policy with per-request nonce on script-src; allowlist tightly scoped to actually-used origins
- HSTS with `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY` plus CSP `frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying camera / microphone / geolocation / payment / usb / sensors
- `Cross-Origin-Opener-Policy: same-origin`
- Cloudflare Turnstile (invisible mode) on the contact form to mitigate automated abuse
- Upstash sliding-window rate limit (3 form submissions per IP per hour)
- Server-side validation of all funnel inputs via Zod
- All third-party clients (Notion, Resend, Turnstile, Upstash) soft-fail if their env var is absent so a missing secret never leaks an internal error to the user

## Responsible disclosure

We follow the principle of coordinated disclosure. We will not pursue legal action against researchers who:
- Make a good-faith effort to avoid privacy violations, destruction of data, and interruption of service
- Limit testing to accounts they own or have explicit permission to test
- Give us reasonable time to fix the issue before public disclosure

Thank you for helping keep our customers safe.
