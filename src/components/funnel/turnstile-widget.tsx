'use client';

import { useEffect, useId, useRef } from 'react';

// Cloudflare Turnstile widget. Loads the script once globally, renders a
// managed widget into a per-instance div, and surfaces the resulting token
// via onToken. We let Cloudflare's `theme: 'dark'` style the inner challenge
// so it matches the surrounding form. If the site key isn't configured
// (env-less local dev), we fall back to emitting a sentinel token so form
// submission still works against the also-noop server-side verifier.
//
// We re-render on locale change (key prop on the parent) but otherwise the
// widget manages its own lifecycle.

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement | string,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          appearance?: 'always' | 'execute' | 'interaction-only';
        },
      ) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

let scriptInjected = false;
const pendingRenders: Array<() => void> = [];

function ensureScript() {
  if (scriptInjected || typeof document === 'undefined') return;
  scriptInjected = true;

  window.onloadTurnstileCallback = () => {
    while (pendingRenders.length > 0) {
      const fn = pendingRenders.shift();
      fn?.();
    }
  };

  const s = document.createElement('script');
  s.src = `${SCRIPT_SRC}?onload=onloadTurnstileCallback`;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

type Props = {
  siteKey: string | undefined;
  onToken: (token: string) => void;
};

export function TurnstileWidget({ siteKey, onToken }: Props) {
  const containerId = useId();
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) {
      // No site key - emit a sentinel token so the (noop) server verifier
      // accepts the request in env-less local dev. The real server-side
      // verifier returns false when the secret key is missing too, so this
      // matches the symmetric "skip in dev" behavior.
      onToken('dev-no-turnstile');
      return;
    }

    const render = () => {
      if (!window.turnstile) return;
      const el = document.getElementById(containerId);
      if (!el || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(el, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
        theme: 'dark',
        size: 'flexible',
        // Invisible-by-default: only renders interactive UI if Cloudflare's
        // risk engine flags the request. Otherwise the widget element stays
        // 0x0 and there's no visual gap in the form.
        appearance: 'interaction-only',
      });
    };

    if (window.turnstile) {
      render();
    } else {
      pendingRenders.push(render);
      ensureScript();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onToken, containerId]);

  if (!siteKey) return null;
  // No min-height - with appearance: 'interaction-only' the widget element
  // stays empty (0x0) for normal traffic, so reserving vertical space leaves
  // a hole in the form layout. The challenge expands it on-demand if needed.
  return <div id={containerId} />;
}
