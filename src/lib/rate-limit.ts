import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from './env';

// Per-IP sliding window of 3 contact submissions per hour. Returns a noop
// limiter (always success) if Upstash isn't configured so local dev and
// preview environments don't crash the route. Production go-live requires
// real credentials.
type LimitResult = { success: boolean };

function makeNoopLimiter(): { limit: (id: string) => Promise<LimitResult> } {
  return { limit: async () => ({ success: true }) };
}

function makeRealLimiter(url: string, token: string) {
  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'contact',
  });
}

export const contactRateLimit =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? makeRealLimiter(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN)
    : makeNoopLimiter();
