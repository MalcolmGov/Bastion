import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { DraftPreviewBanner } from '@/components/brand/DraftPreviewBanner';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.goldfields.com'),
  title: 'Gold Fields — Creating Enduring Value Beyond Mining',
  description:
    'Gold Fields is a globally diversified gold producer with operations across Australia, Canada, Chile, Ghana, Peru, and South Africa. Discover our operational performance, H1 2026 results, and 2030 ESG targets.',
  keywords: [
    'Gold Fields',
    'Gold Mining',
    'South Deep',
    'Tarkwa',
    'Salares Norte',
    'ESG Mining',
    'H1 2026 Results',
    'GFI',
  ],
  authors: [{ name: 'Gold Fields Corporate Communications' }],
  robots: 'noindex, nofollow', // As specified: concept prototype default
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/gold-fields-logo.svg" />
      </head>
      <body className="antialiased font-sans">
        <DraftPreviewBanner />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
