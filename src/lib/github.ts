import 'server-only';
import { env } from './env';

// GitHub events fetcher for the activity strip (Phase 10.3). We hit the
// public events endpoint with a 10-minute revalidate window so we stay
// well under the 60-req/h unauthenticated rate limit (or 5000/h with a
// token). On any failure - rate limit, network, malformed JSON - we
// return an empty array so the consumer can render its own fallback
// rather than throwing in a server component.

export type GitHubEvent = {
  id: string;
  type: string;
  repo: { name: string };
  payload: { ref?: string; commits?: Array<{ message: string }>; action?: string };
  created_at: string;
};

const ENDPOINT = 'https://api.github.com/users/UnboundedTechnologies/events?per_page=10';
const REVALIDATE_SECONDS = 600; // 10 min

export async function fetchRecentEvents(): Promise<GitHubEvent[]> {
  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
    }
    const r = await fetch(ENDPOINT, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!r.ok) return [];
    const json = (await r.json()) as unknown;
    if (!Array.isArray(json)) return [];
    return json.slice(0, 5) as GitHubEvent[];
  } catch {
    return [];
  }
}
