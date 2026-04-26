import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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
      <body className="bg-bg text-text font-sans antialiased">{children}</body>
    </html>
  );
}
