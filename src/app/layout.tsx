import type { Metadata, Viewport } from 'next'
import { Manrope, Sora } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { QueryProvider } from '@/components/query-provider'
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

export const metadata: Metadata = {
  title: 'Finance App - AI-Powered Personal Finance Management',
  description:
    'Modern personal finance app with AI-powered insights, smart categorization, budgeting, and progress tracking.',
  keywords: [
    'finance',
    'budgeting',
    'AI',
    'personal finance',
    'money management',
  ],
  authors: [{ name: 'Finance App Team' }],
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
              <NotificationProvider>
                {children}
                <AdConsentBanner />
                <ToastContainer />
                <Toaster />
              </NotificationProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
