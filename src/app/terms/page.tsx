import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Terms of Service | FinanceFlow Account, Billing, and Usage Terms',
  description:
    'Read the FinanceFlow Terms of Service covering account responsibilities, acceptable use, subscriptions, billing, service availability, and support.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'FinanceFlow Terms of Service',
    description:
      'Review the terms governing account use, subscriptions, billing, and service availability for FinanceFlow.',
    url: '/terms',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FinanceFlow terms of service',
      },
    ],
  },
  twitter: {
    title: 'FinanceFlow Terms of Service',
    description:
      'Review the terms governing account use, subscriptions, billing, and service availability for FinanceFlow.',
    images: ['/twitter-image'],
  },
}

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            By using FinanceFlow, you agree to the terms below. Last updated:
            January 28, 2026.
          </p>
          <p className="text-sm leading-6 text-muted-foreground max-w-3xl">
            These terms describe how the service may be used, account
            responsibilities, subscription and billing expectations, and the
            limits of liability. They are intended to provide a clear summary of
            the operational rules that apply when you use FinanceFlow.
          </p>
        </div>

        <section aria-labelledby="terms-sections-heading" className="space-y-4">
          <h2
            id="terms-sections-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Terms sections
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Review the sections below for responsibilities, acceptable use,
            subscription terms, and service availability expectations.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            This page is a practical overview of core service terms and should
            be read together with the pricing, privacy, and support pages when
            evaluating how the product may be used in real workflows.
          </p>
          <div className="grid gap-6">
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Account responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  You are responsible for keeping your login credentials secure
                  and ensuring activity on your account complies with these
                  terms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Acceptable use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  You agree not to misuse the service, attempt unauthorized
                  access, or interfere with platform operations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Subscriptions and billing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Paid plans renew automatically unless canceled. You may update
                  or cancel subscriptions from your account settings.
                </p>
                <p>
                  Pricing, billing cadence, and available features may vary by
                  plan tier. Please review the billing page and pricing page for
                  current plan details before upgrading or making plan changes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Service availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We aim to keep FinanceFlow available, but outages and
                  maintenance windows may occur.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Limitation of liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  FinanceFlow is provided as-is. We are not liable for indirect
                  or consequential damages to the extent permitted by law.
                </p>
                <p>
                  Nothing in these terms limits rights that cannot be limited by
                  applicable law, and specific protections may vary by
                  jurisdiction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>For questions about these terms, reach out to our team.</p>
                <p>
                  Include the relevant page, feature, or billing context in your
                  message so the team can route your request to the right
                  person.
                </p>
                <Link href="/support">
                  <Button
                    variant="link"
                    className="px-0 h-auto text-primary font-medium"
                  >
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
