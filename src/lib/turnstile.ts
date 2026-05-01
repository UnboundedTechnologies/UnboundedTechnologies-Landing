import 'server-only';
import { env } from './env';

// Server-side verification of a Cloudflare Turnstile token. The site key on
// the client only proves the user solved a challenge; the secret-key call
// here proves the token is fresh and matches the request IP.
//
// Dev fallback: when TURNSTILE_SECRET_KEY is absent (local dev / preview
// without Cloudflare wiring), we accept the sentinel token emitted by the
// no-key client widget so the funnel is testable end-to-end without
// needing the full Cloudflare account. Production always has the secret
// key set, so this branch is never hit there.
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    return token === 'dev-no-turnstile';
  }
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    }),
  });
  const data = (await r.json()) as { success: boolean };
  return data.success === true;
}
