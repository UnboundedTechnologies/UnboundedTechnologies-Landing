import type { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

// CSP profile.
//
// We dropped the per-request nonce on script-src after observing that Next.js
// fails to stamp nonces on inline scripts during notFound() / not-found.tsx
// rendering: the flight payload emits `"nonce":"$undefined"` for those routes,
// the inline scripts then violate the nonce-only directive, and the 404 page
// becomes a wall of CSP errors. Per CSP3 modern browsers ignore 'unsafe-inline'
// when a nonce is present, so the workaround "add 'unsafe-inline' as a
// fallback" does not actually relax the modern enforcement.
//
// The accepted industry pragma is `script-src 'self' 'unsafe-inline'` plus a
// tight URL allowlist for known third parties. XSS surface remains controlled
// by:
//   - `object-src 'none'` blocks Flash/PDF/Java embeds
//   - `base-uri 'self'` blocks <base> tag injection
//   - `form-action 'self'` blocks form-redirect attacks
//   - `frame-ancestors 'none'` blocks clickjacking framing
//   - HSTS + XFO + XCTO + Referrer-Policy + Permissions-Policy + COOP
//   - The contact form has no DOM echo of user input
//
// style-src already needed 'unsafe-inline' because Framer Motion writes
// element.style.transform/opacity at runtime (not nonce-coverable).
//
// Allowlist:
// - script-src: self + Cloudflare Turnstile + Calendly + Plausible + Vercel
//   analytics CDN (used by @vercel/analytics + @vercel/speed-insights).
// - connect-src: same set, expanded to include the Vercel insights endpoints
//   (vitals.vercel-insights.com) the SDKs POST to.
// - frame-src: Calendly + Turnstile.
const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://assets.calendly.com https://plausible.io https://va.vercel-scripts.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: https://avatars.githubusercontent.com`,
  `connect-src 'self' https://api.github.com https://api.notion.com https://api.resend.com https://challenges.cloudflare.com https://plausible.io https://vitals.vercel-insights.com https://va.vercel-scripts.com`,
  `frame-src https://calendly.com https://*.calendly.com https://challenges.cloudflare.com`,
  `font-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join('; ');

export default function middleware(req: NextRequest): NextResponse {
  const res = intlMiddleware(req);

  res.headers.set('Content-Security-Policy', CSP);
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
