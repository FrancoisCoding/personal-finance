import type { Metadata } from 'next'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Cookie Policy',
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
  },
  twitter: {
    title: 'FinanceFlow Cookie Policy',
    description:
      'Learn how FinanceFlow uses cookies for authentication, security, preferences, analytics, and platform features.',
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
        </div>

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
                  <strong>Preferences:</strong> To remember your settings and UI
                  choices.
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
            </CardContent>
          </Card>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
