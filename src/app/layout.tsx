import type { Metadata, Viewport } from 'next'
import { Manrope, Sora } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { QueryProvider } from '@/components/query-provider'
import { DisplayPreferencesProvider } from '@/components/display-preferences-provider'
import { Toaster } from '@/components/ui/toaster'
import {
  NotificationProvider,
  ToastContainer,
} from '@/components/notification-system'
import { AdConsentBanner } from '@/components/ads/ad-consent-banner'

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
})

const displayFont = Sora({
  subsets: ['latin'],
  variable: '--font-display',
})

const adsensePublisherId =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-2720502399458958'
const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
const metadataBase = (() => {
  if (configuredAppUrl) {
    try {
      return new URL(configuredAppUrl)
    } catch {
      console.warn(
        'NEXT_PUBLIC_APP_URL is invalid. Using fallback metadata URL.'
      )
    }
  }
  return new URL('https://www.financeflow.dev')
})()

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'FinanceFlow | AI-Powered Personal Finance Management',
    template: '%s | FinanceFlow',
  },
  description:
    'Modern personal finance app with AI-powered insights, smart categorization, budgeting, and progress tracking.',
  keywords: [
    'finance',
    'budgeting',
    'AI',
    'personal finance',
    'money management',
  ],
  authors: [{ name: 'FinanceFlow Team' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FinanceFlow | AI-Powered Personal Finance Management',
    description:
      'Track spending, optimize budgets, and act on AI insights with a modern personal finance workspace.',
    url: '/',
    siteName: 'FinanceFlow',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FinanceFlow personal finance dashboard preview',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinanceFlow | AI-Powered Personal Finance Management',
    description:
      'Track spending, optimize budgets, and act on AI insights with a modern personal finance workspace.',
    images: ['/twitter-image'],
  },
  other: {
    'google-adsense-account': adsensePublisherId,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <DisplayPreferencesProvider>
                <NotificationProvider>
                  {children}
                  <AdConsentBanner />
                  <ToastContainer />
                  <Toaster />
                </NotificationProvider>
              </DisplayPreferencesProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
