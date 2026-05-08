'use client';

// Magnifying-glass button in the top nav. Click dispatches the global
// 'palette:open' event that the CommandPalette listens for; tooltip on
// hover always shows BOTH ⌘K (Mac) and Ctrl+K (Win/Linux) so a Mac user
// reading on a Windows machine (or vice versa) sees their own shortcut
// regardless of what we'd guess from navigator.platform.

export function NavSearchButton() {
  const open = () => {
    window.dispatchEvent(new Event('palette:open'));
  };

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search (⌘K or Ctrl+K)"
      className="group relative inline-flex size-10 items-center justify-center rounded-full cursor-pointer text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
        <title>Search</title>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20 L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {/* Tooltip - desktop affordance only (hover never fires on touch).
          Hidden below md: so we don't render dead nodes on mobile. */}
      <span
        role="tooltip"
        className={[
          'pointer-events-none absolute top-full right-0 mt-2 z-50 hidden md:flex items-center gap-2 whitespace-nowrap',
          'rounded-md border border-border bg-bg-elevated/95 backdrop-blur-md px-3 py-1.5',
          'text-xs text-text-muted',
          'opacity-0 translate-y-1 transition-[opacity,transform] duration-200',
          'group-hover:opacity-100 group-hover:translate-y-0',
          'group-focus-visible:opacity-100 group-focus-visible:translate-y-0',
          'shadow-lg shadow-black/40',
        ].join(' ')}
      >
        <span>Search</span>
        <span className="flex items-center gap-1.5">
          <kbd className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text">
            ⌘K
          </kbd>
          <span className="text-text-faint">/</span>
          <kbd className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text">
            Ctrl+K
          </kbd>
        </span>
      </span>
    </button>
  );
}
