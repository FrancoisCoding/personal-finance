import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { LandingFooter } from '@/components/landing-footer'
import { LandingNavbar } from '@/components/landing-navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { featurePages } from '@/lib/feature-pages'

export const metadata: Metadata = {
  title: 'Features | Budgeting, Subscriptions, AI Insights, and Reporting',
  description:
    'Explore FinanceFlow features for budgeting, cash flow forecasting, subscription tracking, AI financial insights, and financial reporting exports.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'FinanceFlow Features | Budgeting, AI Insights, and Reporting',
    description:
      'Explore FinanceFlow features for budgeting, subscription tracking, AI financial insights, and financial reporting exports.',
    url: '/features',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FinanceFlow features and dashboard preview',
      },
    ],
  },
  twitter: {
    title: 'FinanceFlow Features | Budgeting, AI Insights, and Reporting',
    description:
      'Explore FinanceFlow features for budgeting, subscription tracking, AI financial insights, and financial reporting exports.',
    images: ['/twitter-image'],
  },
}

const featuresStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'FinanceFlow Features',
  url: 'https://www.financeflow.dev/features',
  description:
    'Feature pages for FinanceFlow budgeting, subscriptions, AI insights, and reporting tools.',
  hasPart: featurePages.map((featurePage) => ({
    '@type': 'WebPage',
    name: featurePage.title,
    url: `https://www.financeflow.dev/features/${featurePage.slug}`,
    description: featurePage.summary,
  })),
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Script
        id="financeflow-features-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(featuresStructuredData),
        }}
      />
      <LandingNavbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto px-4 py-20 space-y-14"
      >
        <section className="mx-auto max-w-4xl space-y-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Feature library
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Explore FinanceFlow features built for better financial decisions
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse feature guides for budgeting, subscription tracking, AI
            insights, and exports. Each page explains what the feature does,
            when to use it, and how it helps in real workflows.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/plans">
              <Button>
                Compare plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">Start free</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {featurePages.map((featurePage) => (
            <Card
              key={featurePage.slug}
              className="border-border/60 bg-card/70 backdrop-blur-sm"
            >
              <CardHeader className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {featurePage.categoryLabel}
                </p>
                <CardTitle className="text-2xl leading-tight">
                  {featurePage.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {featurePage.summary}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {featurePage.keyBenefits.slice(0, 3).map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/features/${featurePage.slug}`}>
                  <Button variant="outline" className="min-h-11">
                    Read feature guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
