import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Shield, LifeBuoy } from 'lucide-react'
import { LandingFooter } from '@/components/landing-footer'
import { LandingNavbar } from '@/components/landing-navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Contact Support and Billing',
  description:
    'Contact FinanceFlow for support, billing, account, and security questions. Find the best way to reach the team and what details to include for faster help.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact FinanceFlow | Support and Billing Help',
    description:
      'Contact FinanceFlow for support, billing, account, and security questions with guidance on the fastest way to get help.',
    url: '/contact',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Contact FinanceFlow',
      },
    ],
  },
  twitter: {
    title: 'Contact FinanceFlow | Support and Billing Help',
    description:
      'Contact FinanceFlow for support, billing, account, and security questions with guidance on the fastest way to get help.',
    images: ['/twitter-image'],
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto max-w-5xl space-y-10 px-4 py-20"
      >
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Contact
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Contact FinanceFlow support, billing, or security
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Use the right channel for the fastest help. FinanceFlow support can
            assist with billing, account access, feature usage questions, and
            product issues. For security concerns, include as much detail as
            possible so the team can review and respond quickly.
          </p>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Choosing the right contact path helps the team respond faster and
            reduces delays caused by missing billing details, unclear issue
            descriptions, or incomplete reproduction steps.
          </p>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            This page is intended to help users and evaluators quickly find the
            correct path for support, billing, and security communication
            without guessing where a request should go.
          </p>
        </section>

        <section
          aria-labelledby="contact-options-heading"
          className="grid gap-6 md:grid-cols-3"
        >
          <h2 id="contact-options-heading" className="sr-only">
            Contact options
          </h2>
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">General support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Use the support center for common questions and troubleshooting
                guidance before contacting the team directly.
              </p>
              <p>
                The support center includes billing, account, export, and
                product FAQs so you can often resolve issues immediately.
              </p>
              <Link
                href="/support"
                className="font-medium text-primary hover:underline"
              >
                Visit Support Center
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">
                Billing and account help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                For billing issues, subscription questions, or account access
                requests, email the support team and include your account email
                plus the page or feature you were using.
              </p>
              <a
                href="mailto:support@financeflow.dev"
                className="font-medium text-primary hover:underline"
              >
                support@financeflow.dev
              </a>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Security contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                If you need to report a security concern, include steps to
                reproduce, screenshots if available, and the affected page so
                the issue can be reviewed responsibly.
              </p>
              <p>
                Responsible disclosure details and security practices are
                summarized on the security page for reference before reaching
                out.
              </p>
              <Link
                href="/security"
                className="font-medium text-primary hover:underline"
              >
                Review Security Page
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/50 p-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            What to include for faster replies
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Your account email address (if you have an account)</li>
            <li>The page or feature where the issue occurred</li>
            <li>What you expected to happen and what actually happened</li>
            <li>
              Relevant screenshots, timestamps, or billing details when
              applicable
            </li>
            <li>
              Your device or browser if the issue is specific to one setup
            </li>
          </ul>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
