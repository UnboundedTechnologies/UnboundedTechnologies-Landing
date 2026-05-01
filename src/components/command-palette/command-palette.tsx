'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Spotlight } from '@/components/primitives/spotlight';
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

// Cmd/Ctrl-K command palette - macOS Tahoe-inspired Spotlight redesign.
//
// Visual structure:
//   - Heavier glass: backdrop-blur-3xl + bg-elevated/70 + faint white
//     border + a multi-layer shadow (deep drop + brand-blue ambient
//     glow + inset highlight) for the bevel.
//   - Wider container, rounded-3xl.
//   - Mount-driven scale-fade animation hooked into Radix's data-state
//     attribute via keyframes in globals.css.
//
// Layout:
//   - Header: search input with leading magnifying glass + trailing Esc kbd.
//   - Sections: each group is a self-contained block with a colored icon,
//     a label flanked by hairlines, and rows that have icon + label + meta.
//   - Footer: keyboard hints + result count.
//
// State:
//   - Recent only tracks Navigation + Case-study picks (theme/motion
//     picks don't pollute it). Persisted to localStorage.
//   - Theme/motion picks keep the palette open so the ✓ moves visibly.

const RECENT_KEY = 'ut-cmdk-recent';
const RECENT_MAX = 5;
const TRACK_RECENT_PREFIXES = ['nav-', 'case-'];

type GroupKey = 'recent' | 'navigation' | 'caseStudies' | 'theme' | 'motion';
type GroupColor = 'muted' | 'blue' | 'purple' | 'cyan';

const GROUP_META: Record<GroupKey, { color: GroupColor; icon: React.ReactNode }> = {
  recent: { color: 'muted', icon: <ClockIcon /> },
  navigation: { color: 'blue', icon: <NavIcon /> },
  caseStudies: { color: 'purple', icon: <LayersIcon /> },
  theme: { color: 'cyan', icon: <SunMoonIcon /> },
  motion: { color: 'purple', icon: <SparklesIcon /> },
};

type Action = {
  id: string;
  label: string;
  description?: string;
  group: GroupKey;
  groupLabel: string;
  keywords?: string[];
  icon: React.ReactNode;
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

  // ⌘K + Ctrl-K + 'palette:open' custom event.
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

  // Hydrate recent commands. Filter out anything that isn't a tracked
  // prefix (nav- or case-) so stale theme/motion entries saved by an
  // earlier build are dropped on first load and rewritten without them.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter((x): x is string => typeof x === 'string')
            .filter((id) => TRACK_RECENT_PREFIXES.some((p) => id.startsWith(p)));
          setRecent(cleaned);
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(RECENT_KEY, JSON.stringify(cleaned));
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Prefetch every navigable route so picking is instant.
  useEffect(() => {
    const routes = ['/', '/services', '/work', '/about', '/contact'];
    for (const r of routes) {
      router.prefetch(r as Parameters<typeof router.prefetch>[0]);
    }
    for (const cs of caseStudies) {
      router.prefetch(`/work/${cs.slug}` as Parameters<typeof router.prefetch>[0]);
    }
  }, [router, caseStudies]);

  // Recent only tracks navigation + case studies. Theme/motion are
  // preferences, not destinations - tracking them as "recent" is noise.
  const recordRecent = useCallback((id: string) => {
    if (!TRACK_RECENT_PREFIXES.some((p) => id.startsWith(p))) return;
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, RECENT_MAX);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const navigate = useCallback(
    (href: string) => {
      router.push(href as Parameters<typeof router.push>[0]);
      setOpen(false);
    },
    [router],
  );

  const navGroupLabel = t('groupNavigation');
  const csGroupLabel = t('groupCaseStudies');
  const themeGroupLabel = t('groupTheme');
  const motionGroupLabel = t('groupMotion');

  const actions: Action[] = [
    // Navigation
    {
      id: 'nav-home',
      group: 'navigation',
      groupLabel: navGroupLabel,
      label: t('home'),
      keywords: ['home', 'accueil', 'index'],
      icon: <HomeIcon />,
      perform: () => navigate('/'),
    },
    {
      id: 'nav-services',
      group: 'navigation',
      groupLabel: navGroupLabel,
      label: t('services'),
      icon: <BriefcaseIcon />,
      perform: () => navigate('/services'),
    },
    {
      id: 'nav-work',
      group: 'navigation',
      groupLabel: navGroupLabel,
      label: t('work'),
      keywords: ['cases', 'projects', 'travaux'],
      icon: <FolderIcon />,
      perform: () => navigate('/work'),
    },
    {
      id: 'nav-about',
      group: 'navigation',
      groupLabel: navGroupLabel,
      label: t('about'),
      keywords: ['profil', 'company', 'who'],
      icon: <PersonIcon />,
      perform: () => navigate('/about'),
    },
    {
      id: 'nav-contact',
      group: 'navigation',
      groupLabel: navGroupLabel,
      label: t('contact'),
      keywords: ['hire', 'email', 'reach'],
      icon: <MailIcon />,
      perform: () => navigate('/contact'),
    },
    // Case studies
    ...caseStudies.map(
      (cs): Action => ({
        id: `case-${cs.slug}`,
        group: 'caseStudies',
        groupLabel: csGroupLabel,
        label: cs.title,
        keywords: ['case study', cs.slug],
        icon: <DocumentIcon />,
        perform: () => navigate(`/work/${cs.slug}`),
      }),
    ),
    // Theme
    {
      id: 'theme-dark',
      group: 'theme',
      groupLabel: themeGroupLabel,
      label: t('themeDark'),
      description: t('themeDarkDesc'),
      keywords: ['dark', 'sombre'],
      icon: <MoonIcon />,
      perform: () => setTheme('dark'),
    },
    {
      id: 'theme-cinematic',
      group: 'theme',
      groupLabel: themeGroupLabel,
      label: t('themeCinematic'),
      description: t('themeCinematicDesc'),
      keywords: ['cinematic', 'cinéma', 'oled'],
      icon: <FilmIcon />,
      perform: () => setTheme('cinematic'),
    },
    {
      id: 'theme-auto',
      group: 'theme',
      groupLabel: themeGroupLabel,
      label: t('themeAuto'),
      description: t('themeAutoDesc'),
      keywords: ['auto', 'system', 'time'],
      icon: <SunsetIcon />,
      perform: () => setTheme('auto'),
    },
    // Motion: order chosen so the user-actionable extremes appear first
    // (Reduce -> Full) and the "let the OS decide" passive option is last.
    {
      id: 'motion-reduce',
      group: 'motion',
      groupLabel: motionGroupLabel,
      label: t('motionReduce'),
      description: t('motionReduceDesc'),
      keywords: ['reduce', 'less', 'animation'],
      icon: <PauseIcon />,
      perform: () => setMotion('reduce'),
    },
    {
      id: 'motion-full',
      group: 'motion',
      groupLabel: motionGroupLabel,
      label: t('motionFull'),
      description: t('motionFullDesc'),
      keywords: ['full', 'all'],
      icon: <PlayIcon />,
      perform: () => setMotion('full'),
    },
    {
      id: 'motion-system',
      group: 'motion',
      groupLabel: motionGroupLabel,
      label: t('motionSystem'),
      description: t('motionSystemDesc'),
      keywords: ['motion', 'system'],
      icon: <GearIcon />,
      perform: () => setMotion('system'),
    },
  ];

  // Recent slice + section rendering order.
  const recentActions = recent
    .map((id) => actions.find((a) => a.id === id))
    .filter((a): a is Action => !!a);

  const seenInRecent = new Set(recentActions.map((a) => a.id));
  const groupOrder: GroupKey[] = ['navigation', 'caseStudies', 'theme', 'motion'];
  const grouped = new Map<GroupKey, Action[]>();
  for (const a of actions) {
    if (seenInRecent.has(a.id)) continue;
    const arr = grouped.get(a.group) ?? [];
    arr.push(a);
    grouped.set(a.group, arr);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label={t('label')}
      overlayClassName="fixed inset-0 z-[199] bg-bg/60 backdrop-blur-md"
      contentClassName={cn(
        // Center via static layout (inset-x-0 + mx-auto), NOT via
        // transform - so the mount keyframe is free to animate
        // translateY/scale without ever clobbering horizontal position.
        // This is what fixes the brief "left side then centers" jump.
        'fixed top-[14vh] inset-x-0 mx-auto z-[200]',
        'w-[min(720px,calc(100vw-2rem))]',
        'group rounded-3xl overflow-hidden',
        'border border-white/[0.08]',
        // Heavy backdrop-blur is expensive on mobile GPUs (iPhone 8
        // class). Fall back to a lighter blur + slightly more opaque
        // surface on mobile so the palette doesn't drop frames during
        // the open animation.
        'bg-bg-elevated/85 backdrop-blur-md md:bg-bg-elevated/70 md:backdrop-blur-3xl',
        // Multi-layer shadow: depth + brand glow + inset bevel.
        '[box-shadow:0_32px_80px_-20px_rgba(0,0,0,0.6),0_0_60px_rgba(93,111,255,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]',
      )}
    >
      {/* Cursor halo inside for that "alive" feel. */}
      <Spotlight color="rgba(93, 111, 255, 0.18)" size={420} />

      {/* a11y title + description, visually hidden. */}
      <Dialog.Title className="sr-only">{t('label')}</Dialog.Title>
      <Dialog.Description className="sr-only">{t('placeholder')}</Dialog.Description>

      {/* Header: leading icon + input + trailing Esc kbd (desktop) /
          close button (mobile). Touch users have no Esc key, and tapping
          the backdrop isn't discoverable, so we ship an explicit × on
          small screens. */}
      <div className="relative flex items-center gap-3 border-b border-white/[0.06] px-5">
        <SearchIcon className="h-4 w-4 flex-shrink-0 text-text-faint group-focus-within:text-brand-blue transition-colors" />
        <Command.Input
          placeholder={t('placeholder')}
          className={cn(
            'flex-1 bg-transparent py-5 text-base text-text placeholder:text-text-faint',
            'focus:outline-none',
          )}
        />
        <Kbd className="flex-shrink-0 hidden sm:inline-flex">esc</Kbd>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="sm:hidden flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-surface-hover active:scale-95 transition-colors duration-150"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <title>Close</title>
            <path
              d="M6 6 L18 18 M18 6 L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <Command.List className="max-h-[55vh] overflow-y-auto p-2.5 space-y-1">
        <Command.Empty className="px-5 py-10 text-center text-sm text-text-muted">
          {t('empty')}
        </Command.Empty>

        {recentActions.length > 0 && (
          <Section
            label={t('groupRecent')}
            color={GROUP_META.recent.color}
            icon={GROUP_META.recent.icon}
          >
            {recentActions.map((a) => (
              <PaletteRow
                key={`r-${a.id}`}
                action={a}
                onPick={() => {
                  recordRecent(a.id);
                  a.perform();
                }}
                rightTag={a.groupLabel}
                checked={isCheckedFor(a.id, theme, motion)}
              />
            ))}
          </Section>
        )}

        {groupOrder.map((g) => {
          const items = grouped.get(g) ?? [];
          if (items.length === 0) return null;
          const meta = GROUP_META[g];
          return (
            <Section key={g} label={items[0].groupLabel} color={meta.color} icon={meta.icon}>
              {items.map((a) => (
                <PaletteRow
                  key={a.id}
                  action={a}
                  onPick={() => {
                    recordRecent(a.id);
                    a.perform();
                  }}
                  checked={isCheckedFor(a.id, theme, motion)}
                />
              ))}
            </Section>
          );
        })}
      </Command.List>

      {/* Footer: keyboard hints - desktop only, hidden on mobile where
          they don't apply (no keyboard, and the close button replaces
          the Esc affordance). */}
      <div className="hidden sm:flex items-center justify-between border-t border-white/[0.06] px-5 py-3 text-[11px] font-mono text-text-faint">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>{t('hintNavigate')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            <span>{t('hintSelect')}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Kbd>esc</Kbd>
          <span>{t('toClose')}</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

function Section({
  label,
  color,
  icon,
  children,
}: {
  label: string;
  color: GroupColor;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const colorClass = {
    muted: 'text-text-faint',
    blue: 'text-brand-blue',
    purple: 'text-brand-purple',
    cyan: 'text-brand-cyan',
  }[color];
  return (
    <Command.Group
      heading={label}
      className={cn(
        '[&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:gap-2',
        '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5',
        '[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em]',
        `[&_[cmdk-group-heading]]:${colorClass}`,
        colorClass,
      )}
    >
      {/* Visually decorate the heading by placing the icon BEFORE it via a
          sibling absolute span. cmdk renders the heading as a string, so we
          mirror it with our own decorated header for visual richness. */}
      <div className={cn('flex items-center gap-2 px-3 pt-3 pb-1.5', colorClass)}>
        <span className="opacity-80">{icon}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
        <span className="ml-2 h-px flex-1 bg-current opacity-15" />
      </div>
      {/* Hide cmdk's auto-rendered heading since we render our own above. */}
      <style>{`[cmdk-group-heading]{display:none !important;}`}</style>
      {children}
    </Command.Group>
  );
}

function PaletteRow({
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
  const colorClass = {
    recent: 'text-text-muted bg-white/[0.04]',
    navigation: 'text-brand-blue bg-brand-blue/[0.12]',
    caseStudies: 'text-brand-purple bg-brand-purple/[0.12]',
    theme: 'text-brand-cyan bg-brand-cyan/[0.12]',
    motion: 'text-brand-purple bg-brand-purple/[0.12]',
  }[action.group];
  return (
    <Command.Item
      value={`${action.label} ${(action.keywords ?? []).join(' ')}`}
      onSelect={onPick}
      className={cn(
        'group/item relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm cursor-pointer',
        'transition-[background-color,transform] duration-150 ease-out',
        'data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-brand-blue/[0.10] data-[selected=true]:to-transparent',
        'data-[selected=true]:scale-[1.005]',
        'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
        'before:h-7 before:w-[2px] before:rounded-r-full before:bg-brand-blue',
        'before:opacity-0 data-[selected=true]:before:opacity-100',
        'before:transition-opacity before:duration-150',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
          colorClass,
        )}
      >
        {action.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-text">
          <span className="truncate">{action.label}</span>
          {checked && (
            <span aria-hidden className="text-brand-blue text-xs">
              ✓
            </span>
          )}
        </div>
        {action.description && (
          <div className="text-[11px] text-text-faint truncate mt-0.5">{action.description}</div>
        )}
      </div>
      {rightTag && (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint flex-shrink-0">
          {rightTag}
        </span>
      )}
    </Command.Item>
  );
}

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center rounded border border-white/[0.08] bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

function isCheckedFor(id: string, theme: string, motion: string): boolean {
  if (id === `theme-${theme}`) return true;
  if (id === `motion-${motion}`) return true;
  return false;
}

/* ---------- Inline icons (kept here so the file stays self-contained). ---------- */

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <title>Search</title>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20 L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <title>Recent</title>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4 L8 8 L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function NavIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <title>Navigation</title>
      <path
        d="M5 11 L11 5 M11 5 H6.5 M11 5 V9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function LayersIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <title>Case studies</title>
      <path
        d="M8 2 L14 5 L8 8 L2 5 L8 2 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M2 8 L8 11 L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 11 L8 14 L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function SunMoonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <title>Appearance</title>
      <path
        d="M12 8 A4 4 0 1 1 8 4 A3 3 0 0 0 12 8 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SparklesIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <title>Motion</title>
      <path
        d="M8 2 L9 6 L13 7 L9 8 L8 12 L7 8 L3 7 L7 6 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Home</title>
      <path
        d="M3 7 L8 3 L13 7 V13 H10 V9 H6 V13 H3 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Services</title>
      <rect x="2" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 5 V3 H10 V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Work</title>
      <path
        d="M2 5 V12 A1 1 0 0 0 3 13 H13 A1 1 0 0 0 14 12 V6 A1 1 0 0 0 13 5 H8 L7 3.5 H3 A1 1 0 0 0 2 5 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>About</title>
      <circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 13 C3 10.5 5.2 9 8 9 C10.8 9 13 10.5 13 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Contact</title>
      <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.5 5.5 L8 9 L13.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Case study</title>
      <path
        d="M4 2 H10 L13 5 V13 A1 1 0 0 1 12 14 H4 A1 1 0 0 1 3 13 V3 A1 1 0 0 1 4 2 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 2 V5 H13" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Dark</title>
      <path
        d="M12 9 A4.5 4.5 0 1 1 7 4 A3.5 3.5 0 0 0 12 9 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function FilmIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Cinematic</title>
      <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2 6 H4 M12 6 H14 M2 10 H4 M12 10 H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function SunsetIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Auto</title>
      <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2 13 H14 M8 4 V2 M3.5 6 L2.5 5 M12.5 6 L13.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Follow system</title>
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1.5 V4 M8 12 V14.5 M1.5 8 H4 M12 8 H14.5 M3 3 L4.7 4.7 M11.3 11.3 L13 13 M3 13 L4.7 11.3 M11.3 4.7 L13 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Reduce motion</title>
      <rect x="5" y="3" width="2" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="3" width="2" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <title>Full motion</title>
      <path d="M5 3 L13 8 L5 13 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
