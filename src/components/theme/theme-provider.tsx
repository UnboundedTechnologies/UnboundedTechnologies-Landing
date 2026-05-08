'use client';

import { createContext, use, useCallback, useEffect, useState } from 'react';

// Theme + motion preferences for the bonus-features layer (Phase 10).
//
// Three themes: 'dark' (default palette), 'cinematic' (deeper bg, used in
// the [data-theme="cinematic"] CSS in globals.css), and 'auto' which
// switches between Dark and Cinematic based on local time (6pm-6am ->
// Cinematic). 'auto' is the default - the site quietly grows moodier in
// the evening.
//
// Motion: 'system' respects prefers-reduced-motion (default), 'reduce'
// forces reduced-motion behavior site-wide, 'full' forces full motion
// even if the OS asks to reduce. Stored as the [data-motion] attribute
// on <html>; CSS in globals.css interprets it.
//
// Persistence: both values live in localStorage so they survive
// navigation. An inline script in app/layout.tsx applies them before
// React hydrates so there's no flash of wrong theme.

export type ThemeMode = 'dark' | 'cinematic' | 'auto';
export type MotionMode = 'system' | 'reduce' | 'full';

const THEME_STORAGE_KEY = 'ut-theme';
const MOTION_STORAGE_KEY = 'ut-motion';

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (next: ThemeMode) => void;
  motion: MotionMode;
  setMotion: (next: MotionMode) => void;
  /** Resolved theme after evaluating 'auto'. Useful for UI that wants to
   * show what's actually being applied. */
  resolvedTheme: 'dark' | 'cinematic';
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isCinematicHour(d: Date): boolean {
  const h = d.getHours();
  // Evening + night: 6pm to 6am.
  return h >= 18 || h < 6;
}

function resolveTheme(theme: ThemeMode): 'dark' | 'cinematic' {
  if (theme === 'auto') return isCinematicHour(new Date()) ? 'cinematic' : 'dark';
  return theme;
}

function applyTheme(theme: ThemeMode) {
  const resolved = resolveTheme(theme);
  if (resolved === 'cinematic') {
    document.documentElement.setAttribute('data-theme', 'cinematic');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function applyMotion(motion: MotionMode) {
  if (motion === 'system') {
    document.documentElement.removeAttribute('data-motion');
  } else {
    document.documentElement.setAttribute('data-motion', motion);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [motion, setMotionState] = useState<MotionMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'cinematic'>('dark');

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (stored === 'dark' || stored === 'cinematic' || stored === 'auto') {
      setThemeState(stored);
      setResolvedTheme(resolveTheme(stored));
    } else {
      setResolvedTheme(resolveTheme('auto'));
    }

    const motionStored = localStorage.getItem(MOTION_STORAGE_KEY) as MotionMode | null;
    if (motionStored === 'reduce' || motionStored === 'full' || motionStored === 'system') {
      setMotionState(motionStored);
    }
  }, []);

  // Re-evaluate Auto theme every 5 minutes so the cinematic-at-night switch
  // happens without a manual reload.
  useEffect(() => {
    if (theme !== 'auto') return;
    const id = setInterval(
      () => {
        const next = resolveTheme('auto');
        setResolvedTheme((prev) => {
          if (prev !== next) applyTheme('auto');
          return next;
        });
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    setResolvedTheme(resolveTheme(next));
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  const setMotion = useCallback((next: MotionMode) => {
    setMotionState(next);
    if (next === 'system') {
      localStorage.removeItem(MOTION_STORAGE_KEY);
    } else {
      localStorage.setItem(MOTION_STORAGE_KEY, next);
    }
    applyMotion(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, motion, setMotion, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const v = use(ThemeContext);
  if (!v) throw new Error('useTheme must be used within ThemeProvider');
  return v;
}

// Inline script body that runs before React hydrates. Reads localStorage
// and applies the theme + motion attributes synchronously to avoid a
// flash of unstyled content. Exported so the root layout can drop it
// into a dangerouslySetInnerHTML script tag.
export const THEME_BOOT_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}') || 'auto';
    var resolved = t;
    if (t === 'auto') {
      var h = new Date().getHours();
      resolved = (h >= 18 || h < 6) ? 'cinematic' : 'dark';
    }
    if (resolved === 'cinematic') document.documentElement.setAttribute('data-theme', 'cinematic');
    var m = localStorage.getItem('${MOTION_STORAGE_KEY}');
    if (m === 'reduce' || m === 'full') document.documentElement.setAttribute('data-motion', m);
  } catch (e) {}
})();
`.trim();
