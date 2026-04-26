import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Unbounded Technologies Inc.',
  description: 'Senior cloud and CPaaS engineering for enterprises that can\'t afford to fail.',
  authors: [{ name: 'Saïd Aïssani' }],
  creator: 'Unbounded Technologies Inc.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
