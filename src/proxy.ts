import { randomBytes } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Build the strict, nonce-based CSP for a given per-request nonce.
//
// Allowlist mirrors spec section 9 exactly. Notes:
// - script-src: self + nonce + Cloudflare Turnstile + Calendly assets + Plausible.
//   STRICT, no 'unsafe-inline'. The single inline script (THEME_BOOT_SCRIPT in
//   src/app/layout.tsx) carries the per-request nonce; Next.js stamps the
//   same nonce on every framework script it emits.
// - style-src: self + 'unsafe-inline'. We rely on Framer Motion (and a few
//   other libraries) writing element.style.transform/opacity at runtime; CSP
//   nonces do not cover JS-set inline styles, so requiring nonces would break
//   animations across the whole site. 'unsafe-inline' for styles is the
//   industry-standard pragma when nonce-based scripts are otherwise locked
//   down: no arbitrary code execution surface, and CSS-injection is mitigated
//   by `frame-ancestors 'none'` plus `base-uri 'self'`.
// - connect-src: GitHub + Notion + Resend + Turnstile + Plausible (all the
//   APIs the contact pipeline + analytics actually touch).
// - frame-src: Calendly (booking widget) + Turnstile (challenge iframe).
// - frame-ancestors 'none' + form-action 'self' + base-uri 'self' close out
//   common framing / form-redirect / base-tag attacks.
function buildCsp(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com https://assets.calendly.com https://plausible.io`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https://avatars.githubusercontent.com`,
    `connect-src 'self' https://api.github.com https://api.notion.com https://api.resend.com https://challenges.cloudflare.com https://plausible.io`,
    `frame-src https://calendly.com https://*.calendly.com https://challenges.cloudflare.com`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');
}

export default function middleware(req: NextRequest): NextResponse {
  // Per-request nonce. 16 bytes -> 24 chars base64; matches Next.js + OWASP guidance.
  const nonce = randomBytes(16).toString('base64');
  const csp = buildCsp(nonce);

  // Mutate the incoming request headers so:
  //   1. Server components can read the nonce via `headers()` from 'next/headers'
  //      (the inline THEME_BOOT_SCRIPT in app/layout.tsx uses this).
  //   2. Next's renderer sees `Content-Security-Policy` on the request and
  //      automatically stamps `nonce={nonce}` on its own framework scripts
  //      (documented at nextjs.org/docs/app/guides/content-security-policy).
  //
  // next-intl's middleware reads `request.headers` and pipes them into its
  // NextResponse.next/rewrite call, so mutating before delegation is enough
  // to propagate.
  req.headers.set('x-nonce', nonce);
  req.headers.set('Content-Security-Policy', csp);

  const res = intlMiddleware(req);

  // Mirror nonce + CSP on the response for the browser.
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('x-nonce', nonce);

  // Existing security headers (kept verbatim from prior proxy).
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()',
  );
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  return res;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
