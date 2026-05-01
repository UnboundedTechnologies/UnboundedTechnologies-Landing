'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme/theme-provider';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

// Custom event surface so the nav search button can trigger the palette
// without prop-drilling. Augments the WindowEventMap so addEventListener
// is type-safe.
declare global {
  interface WindowEventMap {
    'palette:open': Event;
  }
}

// Cmd/Ctrl-K command palette built on `cmdk`. Categories:
//   Navigation: jump to /, /work, /services, /about, /contact
//   Case studies: jump to each /work/[slug]
//   Theme: switch between Dark / Cinematic / Auto (current is checkmarked)
//   Motion: toggle reduce-motion override (current is checkmarked)
//
// Recent commands persist to localStorage so the palette opens with a
// recency-sorted list of the user's last 5 actions. Selecting a command
// closes the palette automatically.

const RECENT_KEY = 'ut-cmdk-recent';
const RECENT_MAX = 5;

type Action = {
  id: string;
  label: string;
  group: string;
  keywords?: string[];
  perform: () => void;
};

type Props = {
  caseStudies: ReadonlyArray<{ slug: string; title: string }>;
};

export function CommandPalette({ caseStudies }: Props) {
  const t = useTranslations('palette');
  const router = useRouter();
  const { theme, setTheme, motion, setMotion } = useTheme();
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  // Bind ⌘K + Ctrl-K globally, plus the 'palette:open' custom event so
  // the nav search button (and any other UI in the future) can open the
  // palette without prop-drilling a setOpen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('palette:open', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('palette:open', onOpenEvent);
    };
  }, []);

  // Warm Next.js's route cache for every destination the palette can
  // jump to. Without this, picking an item triggers the route fetch on
  // click, so the palette closes and the user stares at a blank delay
  // before the new page paints. Prefetching lets us jump to an already-
  // cached route the instant they pick. Idempotent inside the router
  // so re-running on locale change is fine.
  useEffect(() => {
    const routes = ['/', '/services', '/work', '/about', '/contact'];
    for (const r of routes) {
      router.prefetch(r as Parameters<typeof router.prefetch>[0]);
    }
    for (const cs of caseStudies) {
      router.prefetch(`/work/${cs.slug}` as Parameters<typeof router.prefetch>[0]);
    }
  }, [router, caseStudies]);

  // Hydrate recent commands.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
          setRecent(parsed.filter((x): x is string => typeof x === 'string'));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const recordRecent = (id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, RECENT_MAX);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const navigate = (href: string) => {
    // Kick off navigation BEFORE closing the palette so the prefetched
    // route starts hydrating immediately. The dialog close animation
    // then runs in parallel and the user sees the new page paint
    // without a visible gap.
    router.push(href as Parameters<typeof router.push>[0]);
    setOpen(false);
  };

  const actions: Action[] = [
    // Navigation
    {
      id: 'nav-home',
      group: t('groupNavigation'),
      label: t('home'),
      keywords: ['home', 'accueil', 'index'],
      perform: () => navigate('/'),
    },
    {
      id: 'nav-services',
      group: t('groupNavigation'),
      label: t('services'),
      perform: () => navigate('/services'),
    },
    {
      id: 'nav-work',
      group: t('groupNavigation'),
      label: t('work'),
      keywords: ['cases', 'projects', 'travaux'],
      perform: () => navigate('/work'),
    },
    {
      id: 'nav-about',
      group: t('groupNavigation'),
      label: t('about'),
      keywords: ['profil', 'company', 'who'],
      perform: () => navigate('/about'),
    },
    {
      id: 'nav-contact',
      group: t('groupNavigation'),
      label: t('contact'),
      keywords: ['hire', 'email', 'reach'],
      perform: () => navigate('/contact'),
    },

    // Case studies
    ...caseStudies.map((cs) => ({
      id: `case-${cs.slug}`,
      group: t('groupCaseStudies'),
      label: cs.title,
      keywords: ['case study', cs.slug],
      perform: () => navigate(`/work/${cs.slug}`),
    })),

    // Theme - palette stays open after picking so the ✓ checkmark
    // moves visibly to the new selection. User presses Esc to dismiss.
    {
      id: 'theme-dark',
      group: t('groupTheme'),
      label: t('themeDark'),
      keywords: ['dark', 'sombre'],
      perform: () => setTheme('dark'),
    },
    {
      id: 'theme-cinematic',
      group: t('groupTheme'),
      label: t('themeCinematic'),
      keywords: ['cinematic', 'cinéma', 'oled'],
      perform: () => setTheme('cinematic'),
    },
    {
      id: 'theme-auto',
      group: t('groupTheme'),
      label: t('themeAuto'),
      keywords: ['auto', 'system', 'time'],
      perform: () => setTheme('auto'),
    },

    // Motion - same: palette stays open so the toggled ✓ is visible.
    {
      id: 'motion-system',
      group: t('groupMotion'),
      label: t('motionSystem'),
      keywords: ['motion', 'system'],
      perform: () => setMotion('system'),
    },
    {
      id: 'motion-reduce',
      group: t('groupMotion'),
      label: t('motionReduce'),
      keywords: ['reduce', 'less', 'animation'],
      perform: () => setMotion('reduce'),
    },
    {
      id: 'motion-full',
      group: t('groupMotion'),
      label: t('motionFull'),
      keywords: ['full', 'all'],
      perform: () => setMotion('full'),
    },
  ];

  // Render order: recent first (if any), then everything by group.
  const recentActions = recent
    .map((id) => actions.find((a) => a.id === id))
    .filter((a): a is Action => !!a);

  const seenInRecent = new Set(recentActions.map((a) => a.id));
  const groupedActions = new Map<string, Action[]>();
  for (const a of actions) {
    if (seenInRecent.has(a.id)) continue;
    const arr = groupedActions.get(a.group) ?? [];
    arr.push(a);
    groupedActions.set(a.group, arr);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label={t('label')}
      overlayClassName="fixed inset-0 z-[199] bg-bg/70 backdrop-blur-md"
      contentClassName={cn(
        'fixed top-[15vh] left-1/2 -translate-x-1/2 z-[200]',
        'w-[min(640px,calc(100vw-2rem))]',
        'rounded-2xl border border-border bg-bg-elevated/95 backdrop-blur-xl',
        'shadow-2xl shadow-black/40 overflow-hidden',
      )}
    >
      {/* Radix Dialog requires a Title for screen readers. Visually
          hidden via Tailwind's sr-only so the palette UI isn't disturbed
          but assistive tech still announces the dialog purpose. */}
      <Dialog.Title className="sr-only">{t('label')}</Dialog.Title>
      <Dialog.Description className="sr-only">{t('placeholder')}</Dialog.Description>
      <div className="border-b border-border">
        <Command.Input
          placeholder={t('placeholder')}
          className={cn(
            'w-full bg-transparent px-5 py-4 text-base text-text placeholder:text-text-faint',
            'focus:outline-none',
          )}
        />
      </div>

      <Command.List className="max-h-[50vh] overflow-y-auto p-2">
        <Command.Empty className="px-5 py-8 text-center text-sm text-text-muted">
          {t('empty')}
        </Command.Empty>

        {recentActions.length > 0 && (
          <Command.Group
            heading={t('groupRecent')}
            className="text-text-faint [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em]"
          >
            {recentActions.map((a) => (
              <PaletteItem
                key={`r-${a.id}`}
                action={a}
                onPick={() => {
                  recordRecent(a.id);
                  a.perform();
                }}
                rightTag={a.group}
                checked={isCheckedFor(a.id, theme, motion)}
              />
            ))}
          </Command.Group>
        )}

        {Array.from(groupedActions.entries()).map(([group, items]) => (
          <Command.Group
            key={group}
            heading={group}
            className="text-text-faint [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em]"
          >
            {items.map((a) => (
              <PaletteItem
                key={a.id}
                action={a}
                onPick={() => {
                  recordRecent(a.id);
                  a.perform();
                }}
                checked={isCheckedFor(a.id, theme, motion)}
              />
            ))}
          </Command.Group>
        ))}
      </Command.List>

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-text-faint font-mono">
        <span>{t('hint')}</span>
        <span className="flex items-center gap-1">
          <Kbd>esc</Kbd>
          <span>{t('toClose')}</span>
        </span>
      </div>
    </Command.Dialog>
  );
}

function PaletteItem({
  action,
  onPick,
  rightTag,
  checked,
}: {
  action: Action;
  onPick: () => void;
  rightTag?: string;
  checked?: boolean;
}) {
  return (
    <Command.Item
      value={`${action.label} ${(action.keywords ?? []).join(' ')}`}
      onSelect={onPick}
      className={cn(
        'flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm text-text cursor-pointer',
        'data-[selected=true]:bg-surface-hover data-[selected=true]:text-text',
        'transition-colors duration-100',
      )}
    >
      <span className="flex items-center gap-2.5">
        {checked && (
          <span aria-hidden className="text-brand-blue">
            ✓
          </span>
        )}
        <span>{action.label}</span>
      </span>
      {rightTag && (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          {rightTag}
        </span>
      )}
    </Command.Item>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
      {children}
    </kbd>
  );
}

function isCheckedFor(id: string, theme: string, motion: string): boolean {
  if (id === `theme-${theme}`) return true;
  if (id === `motion-${motion}`) return true;
  return false;
}
