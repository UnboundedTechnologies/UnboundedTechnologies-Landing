'use client';

import { useEffect, useState } from 'react';

// Magnifying-glass button in the top nav. Click dispatches the global
// 'palette:open' event that the CommandPalette listens for; keyboard
// shortcut (⌘K / Ctrl+K) is shown in the tooltip on hover. The shortcut
// label is platform-aware so Mac users see ⌘ and everyone else sees Ctrl.

export function NavSearchButton() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
    }
  }, []);

  const shortcut = isMac ? '⌘K' : 'Ctrl+K';

  const open = () => {
    window.dispatchEvent(new Event('palette:open'));
  };

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Search (${shortcut})`}
      className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <title>Search</title>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path
          d="M20 20 L16 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {/* Tooltip - simple positioned div, fades + lifts in on hover/focus.
          Skips a tooltip primitive to keep the bundle tiny. */}
      <span
        role="tooltip"
        className={[
          'pointer-events-none absolute top-full right-0 mt-2 z-50 flex items-center gap-2 whitespace-nowrap',
          'rounded-md border border-border bg-bg-elevated/95 backdrop-blur-md px-3 py-1.5',
          'text-xs text-text-muted',
          'opacity-0 translate-y-1 transition-[opacity,transform] duration-200',
          'group-hover:opacity-100 group-hover:translate-y-0',
          'group-focus-visible:opacity-100 group-focus-visible:translate-y-0',
          'shadow-lg shadow-black/40',
        ].join(' ')}
      >
        <span>Search</span>
        <kbd className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text">
          {shortcut}
        </kbd>
      </span>
    </button>
  );
}
