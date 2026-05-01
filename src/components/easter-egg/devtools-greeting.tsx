'use client';

import { useEffect } from 'react';

// DevTools easter egg. On first paint, log a styled "Unbounded Technologies"
// greeting in the console with a hint that we're hiring (and a link to
// /work). Fires once per session via sessionStorage so reloads don't spam
// the console. Kept lightweight: no extra deps, just two console.log
// calls with CSS strings.

const SESSION_FLAG = 'ut-greeted';

export function DevToolsGreeting() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem(SESSION_FLAG)) return;
      sessionStorage.setItem(SESSION_FLAG, '1');
    } catch {
      /* ignore */
    }

    const banner = `

   ██╗   ██╗███╗   ██╗██████╗  ██████╗ ██╗   ██╗███╗   ██╗██████╗ ███████╗██████╗
   ██║   ██║████╗  ██║██╔══██╗██╔═══██╗██║   ██║████╗  ██║██╔══██╗██╔════╝██╔══██╗
   ██║   ██║██╔██╗ ██║██████╔╝██║   ██║██║   ██║██╔██╗ ██║██║  ██║█████╗  ██║  ██║
   ██║   ██║██║╚██╗██║██╔══██╗██║   ██║██║   ██║██║╚██╗██║██║  ██║██╔══╝  ██║  ██║
   ╚██████╔╝██║ ╚████║██████╔╝╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝███████╗██████╔╝
    ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═════╝

`;
    // Two console messages: a gradient-styled headline, then a quieter
    // hint line. Using %c lets us colorize the text via CSS.
    console.log(
      `%c${banner}`,
      [
        'color: transparent',
        'background: linear-gradient(135deg, #5d6fff 0%, #a35dff 50%, #5dc7ff 100%)',
        '-webkit-background-clip: text',
        'background-clip: text',
        'font-family: ui-monospace, SFMono-Regular, Menlo, monospace',
        'font-size: 11px',
        'line-height: 1.2',
      ].join(';'),
    );
    console.log(
      '%cUnbounded Technologies %c·%c Senior cloud architecture, built to last.\n%cIf you read code in your free time, talk to us: contact@unboundedtechnologies.com',
      'color: #f4f5fa; font-weight: 600; font-size: 13px',
      'color: #666b80; padding: 0 6px',
      'color: #bcbed0; font-size: 13px',
      'color: #5dc7ff; font-family: ui-monospace, monospace; font-size: 12px; padding-top: 6px',
    );
  }, []);

  return null;
}
