import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { DraftPreviewBanner } from '@/components/brand/DraftPreviewBanner';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  themeColor: '#082B49',
  width: 'device-width',
  initialScale: 1,
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Gold Fields — Creating Enduring Value Beyond Mining',
    template: '%s | Gold Fields',
  },
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
  authors: [{ name: 'Bastion Studio' }],
  robots: 'noindex, nofollow', // As specified: concept prototype default
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: 'Gold Fields',
    title: 'Gold Fields — Creating Enduring Value Beyond Mining',
    description:
      'Gold Fields is a globally diversified gold producer with operations across Australia, Canada, Chile, Ghana, Peru, and South Africa. Discover our operational performance, H1 2026 results, and 2030 ESG targets.',
    images: [
      {
        url: '/assets/goldfields-og-share.png',
        width: 1200,
        height: 630,
        alt: 'Gold Fields Corporate Flagship — Global Gold Producer',
        type: 'image/png',
      },
      {
        url: '/assets/goldfields-og-square.png',
        width: 600,
        height: 600,
        alt: 'Gold Fields Lion Emblem',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gold Fields — Creating Enduring Value Beyond Mining',
    description:
      'Gold Fields is a globally diversified gold producer with operations across Australia, Canada, Chile, Ghana, Peru, and South Africa.',
    site: '@GoldFields_LTD',
    creator: '@GoldFields_LTD',
    images: ['/assets/goldfields-og-share.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="alternate icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans">
        <DraftPreviewBanner />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
