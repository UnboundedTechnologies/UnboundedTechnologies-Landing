import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ParticleField } from '@/components/atmosphere/particle-field';
import { PersistentInfinityLogo } from '@/components/hero/persistent-infinity-logo';
import { THEME_BOOT_SCRIPT } from '@/components/theme/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unboundedtechnologies.com'),
  title: { default: 'Unbounded Technologies Inc.', template: '%s · Unbounded Technologies' },
  description: "Senior cloud and CPaaS engineering for enterprises that can't afford to fail.",
  authors: [{ name: 'Saïd Aïssani' }],
  creator: 'Unbounded Technologies Inc.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning on body tolerates attributes injected by browser
          extensions (e.g. ColorZilla's `cz-shortcut-listen`, Grammarly's `data-gramm`,
          translation extensions, etc.) which would otherwise produce hydration mismatch
          warnings in DevTools. The attributes are not in our control. */}
      <head>
        {/* Apply theme + motion preferences synchronously before React
            hydrates so there is no flash of the wrong palette. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted constant from our own module */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="bg-bg text-text font-sans antialiased" suppressHydrationWarning>
        {/* These two own heavy WebGL/canvas resources. Mounted at the
            root layout (instead of [locale]/layout) so they survive
            locale switches: navigating /en -> /fr changes the [locale]
            param and re-runs that layout, but the root layout sees no
            change and these stay alive. */}
        <ParticleField />
        <PersistentInfinityLogo />
        {children}
      </body>
    </html>
  );
}
