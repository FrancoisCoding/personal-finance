import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingFooter } from '@/components/landing-footer'
import { LandingNavbar } from '@/components/landing-navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'About FinanceFlow',
  description:
    'Learn why FinanceFlow was built and how it helps people manage budgets, subscriptions, and financial decisions with clearer data and AI insights.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About FinanceFlow | Personal Finance Software',
    description:
      'Learn why FinanceFlow was built and how it helps people manage budgets, subscriptions, and financial decisions with clearer data and AI insights.',
    url: '/about',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'About FinanceFlow',
      },
    ],
  },
  twitter: {
    title: 'About FinanceFlow | Personal Finance Software',
    description:
      'Learn why FinanceFlow was built and how it helps people manage budgets, subscriptions, and financial decisions with clearer data and AI insights.',
    images: ['/twitter-image'],
  },
}

export default function AboutPage() {
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
            About
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            FinanceFlow was built to make personal finance feel clear, calm, and
            actionable
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            FinanceFlow is a personal finance web application designed to help
            people track spending, manage budgets, monitor subscriptions, and
            use AI-guided insights without relying on cluttered spreadsheets or
            disconnected apps. The goal is simple: turn financial data into a
            workspace that makes better decisions easier.
          </p>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            The product is focused on clarity over clutter, with guided
            workflows for common tasks like reviewing transactions, comparing
            plan options, checking subscription renewals, and exporting reports
            for monthly financial reviews.
          </p>
        </section>

        <section
          aria-labelledby="about-sections-heading"
          className="grid gap-6 md:grid-cols-2"
        >
          <h2 id="about-sections-heading" className="sr-only">
            About FinanceFlow details
          </h2>
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle className="text-xl">Why it exists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Many personal finance tools either oversimplify the data or
                require too much manual work to stay useful. FinanceFlow was
                built to provide the middle ground: strong visibility, practical
                organization, and a modern interface that people actually want
                to use regularly.
              </p>
              <p>
                Instead of only showing charts, the platform focuses on what
                changed, why it matters, and what the user can do next.
              </p>
              <p>
                That approach is reflected across the dashboard, feature pages,
                and plan comparisons, which are designed to be readable for
                everyday users while still useful for more advanced workflows.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle className="text-xl">
                What FinanceFlow helps with
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                FinanceFlow supports budgeting, account tracking, transaction
                review, subscription monitoring, financial reporting exports,
                and AI-assisted guidance. Different plan levels are designed for
                light users, everyday tracking, and power users who want deeper
                insights and premium tools.
              </p>
              <p>
                The app also includes demo mode so users can evaluate the
                product experience before connecting real data or selecting a
                paid plan.
              </p>
              <p>
                FinanceFlow also includes public documentation pages, security
                information, and support resources so users can evaluate the
                product and understand how it works before signing up.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/50 p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Learn more</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore the feature guides, compare plans, or contact support if you
            have questions about billing, account access, or product usage.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/features"
              className="text-sm font-medium text-primary hover:underline"
            >
              Browse features
            </Link>
            <Link
              href="/plans"
              className="text-sm font-medium text-primary hover:underline"
            >
              Compare plans
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-primary hover:underline"
            >
              Contact FinanceFlow
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
