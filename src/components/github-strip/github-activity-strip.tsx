import { getTranslations } from 'next-intl/server';
import { fetchRecentEvents, type GitHubEvent } from '@/lib/github';
import { RelativeTime } from './relative-time';

// Footer-area band that shows the 5 most recent public GitHub events for
// the org. Server component, ISR-cached for 10 minutes via the underlying
// fetch. If the API is unavailable or rate-limited, returns null so the
// strip simply doesn't render (no empty box, no error message).
//
// Time strings render via the RelativeTime client component because Cache
// Components disallows Date.now() in prerendered server components.

function summarize(e: GitHubEvent): string {
  const repo = e.repo.name.replace(/^UnboundedTechnologies\//, '');
  switch (e.type) {
    case 'PushEvent': {
      const msg = e.payload.commits?.[0]?.message?.split('\n')[0];
      return msg ? `pushed to ${repo}: ${msg}` : `pushed to ${repo}`;
    }
    case 'CreateEvent':
      return `created ${e.payload.ref ?? 'a branch'} in ${repo}`;
    case 'PullRequestEvent':
      return `${e.payload.action ?? 'updated'} a PR in ${repo}`;
    case 'IssuesEvent':
      return `${e.payload.action ?? 'updated'} an issue in ${repo}`;
    case 'ReleaseEvent':
      return `released ${repo}`;
    default:
      return `${e.type.replace(/Event$/, '').toLowerCase()} on ${repo}`;
  }
}

export async function GitHubActivityStrip() {
  const events = await fetchRecentEvents();
  if (events.length === 0) return null;

  const t = await getTranslations('githubStrip');

  return (
    <section
      aria-labelledby="gh-activity-heading"
      className="border-t border-border bg-bg-elevated/40"
    >
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <h2
          id="gh-activity-heading"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint"
        >
          {t('eyebrow')}
        </h2>
        <ul className="mt-4 space-y-2.5">
          {events.map((e) => (
            <li key={e.id} className="flex items-baseline gap-3 text-sm">
              <RelativeTime
                iso={e.created_at}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint w-16 flex-shrink-0"
              />
              <span className="text-text-muted">{summarize(e)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
