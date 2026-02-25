import type { Metadata } from 'next'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Cookie Policy and Preferences',
  description:
    'Read the FinanceFlow Cookie Policy to learn how cookies are used for authentication, security, preferences, analytics, and platform functionality.',
  alternates: {
    canonical: '/cookies',
  },
  openGraph: {
    title: 'FinanceFlow Cookie Policy',
    description:
      'Learn how FinanceFlow uses cookies for authentication, security, preferences, analytics, and platform features.',
    url: '/cookies',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FinanceFlow cookie policy',
      },
    ],
  },
  twitter: {
    title: 'FinanceFlow Cookie Policy',
    description:
      'Learn how FinanceFlow uses cookies for authentication, security, preferences, analytics, and platform features.',
    images: ['/twitter-image'],
  },
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto px-4 py-20 space-y-10"
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            This policy describes how FinanceFlow uses cookies and similar
            technologies to provide, customize, evaluate, and improve our
            services.
          </p>
          <p className="text-sm leading-6 text-muted-foreground max-w-3xl">
            Cookies help the platform remember authentication state, keep your
            account secure, preserve interface preferences, and understand
            aggregate product usage. This page explains the categories of
            cookies we use, why they matter for functionality and security, and
            what choices are available to users in their browser settings.
          </p>
        </div>

        <section
          aria-labelledby="cookie-policy-sections-heading"
          className="space-y-4"
        >
          <h2
            id="cookie-policy-sections-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Cookie policy details
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            The sections below outline how cookies support authentication,
            security, preferences, and analytics. Some cookies are required for
            core features to work properly, while others help us understand
            platform usage patterns so the product can be improved over time.
          </p>
          <div className="grid gap-6">
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>What are cookies?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Cookies are small text files sent to your computer or mobile
                  device that allow FinanceFlow features and functionality to
                  work. They are unique to your account or your browser.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>How we use cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We use cookies for several reasons, including security,
                  authentication, and remembering your preferences.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Authentication:</strong> To recognize you when you
                    visit our services.
                  </li>
                  <li>
                    <strong>Security:</strong> To protect your data and our
                    services from unauthorized access.
                  </li>
                  <li>
                    <strong>Preferences:</strong> To remember your settings and
                    UI choices.
                  </li>
                  <li>
                    <strong>Analytics:</strong> To understand how users interact
                    with our platform.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Controlling cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Most browsers allow you to control cookies through their
                  settings preferences. However, if you limit the ability of
                  websites to set cookies, you may worsen your overall user
                  experience.
                </p>
                <p>
                  Blocking authentication or security-related cookies may
                  prevent sign-in, session continuity, or preference storage
                  from working correctly. If you choose to restrict cookies,
                  review your browser settings and test key account actions
                  after making changes.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
