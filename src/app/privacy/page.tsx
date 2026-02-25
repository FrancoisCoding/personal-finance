import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Privacy Policy and Data Practices',
  description:
    'Read the FinanceFlow Privacy Policy to understand how we collect, use, protect, and retain account, transaction, and usage data.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'FinanceFlow Privacy Policy',
    description:
      'Review how FinanceFlow collects, uses, protects, and retains personal and financial information.',
    url: '/privacy',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FinanceFlow privacy policy',
      },
    ],
  },
  twitter: {
    title: 'FinanceFlow Privacy Policy',
    description:
      'Review how FinanceFlow collects, uses, protects, and retains personal and financial information.',
    images: ['/twitter-image'],
  },
}

export default function PrivacyPage() {
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
            Privacy
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            This policy explains how FinanceFlow collects, uses, and protects
            your information. Last updated: January 28, 2026.
          </p>
          <p className="text-sm leading-6 text-muted-foreground max-w-3xl">
            Our goal is to be clear about what data is collected, how it is used
            to provide the product, and what controls are available to users.
            This page summarizes the main categories of information, security
            practices, retention principles, and support options for
            data-related requests.
          </p>
        </div>

        <section
          aria-labelledby="privacy-policy-sections-heading"
          className="space-y-4"
        >
          <h2
            id="privacy-policy-sections-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Privacy policy sections
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Review the sections below for the types of data FinanceFlow
            processes, how the platform uses information to deliver features,
            and how to request help with privacy questions or account data.
          </p>
          <div className="grid gap-6">
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Information we collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We collect information you provide directly, including account
                  details, profile information, and financial data you choose to
                  connect.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Contact information and authentication details.</li>
                  <li>Connected account and transaction data.</li>
                  <li>Usage data such as features used and device metadata.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>How we use information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We use your information to provide, improve, and secure the
                  FinanceFlow experience.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Deliver personalized insights and dashboards.</li>
                  <li>Maintain security, prevent fraud, and debug issues.</li>
                  <li>Send service updates and account notices.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Sharing and disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We do not sell your personal data. We share information only
                  with trusted service providers needed to operate the platform
                  or when required by law.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Security and retention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We use industry-standard safeguards to protect data in transit
                  and at rest. We retain data as long as your account is active
                  or as required to provide the service.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Your choices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  You can update your profile, disconnect accounts, or request
                  data deletion by contacting support.
                </p>
                <p>
                  If you contact support for a privacy request, include the
                  email address tied to your account and a clear description of
                  the request so it can be reviewed and processed efficiently.
                </p>
                <Link
                  href="/support"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Visit Support
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
