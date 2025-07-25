
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Trust.io - Vertrouw op slimme financiële administratie',
  description: 'Het meest betrouwbare platform voor ZZP-ers in Nederland. Beheer klanten, facturen en compliance met Trust.io.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Trust.io',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  keywords: ['ZZP', 'freelancer', 'facturen', 'administratie', 'Trust.io', 'Nederland'],
  authors: [{ name: 'Trust.io' }],
  creator: 'Trust.io',
  publisher: 'Trust.io',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://trust.io',
    siteName: 'Trust.io',
    title: 'Trust.io - Vertrouw op slimme financiële administratie',
    description: 'Het meest betrouwbare platform voor ZZP-ers in Nederland. Beheer klanten, facturen en compliance met Trust.io.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trust.io - Vertrouw op slimme financiële administratie',
    description: 'Het meest betrouwbare platform voor ZZP-ers in Nederland.',
    creator: '@trust_io',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Trust.io" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
