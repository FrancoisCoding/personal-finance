import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { LandingFooter } from '@/components/landing-footer'
import { LandingNavbar } from '@/components/landing-navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { featurePages, featurePagesBySlug } from '@/lib/feature-pages'

interface IFeaturePageRouteProps {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return featurePages.map((featurePage) => ({
    slug: featurePage.slug,
  }))
}

export async function generateMetadata({
  params,
}: IFeaturePageRouteProps): Promise<Metadata> {
  const { slug } = await params
  const featurePage = featurePagesBySlug.get(slug)

  if (!featurePage) {
    return {}
  }

  return {
    title: featurePage.metaTitle,
    description: featurePage.metaDescription,
    alternates: {
      canonical: `/features/${featurePage.slug}`,
    },
    openGraph: {
      title: `${featurePage.title} | FinanceFlow Features`,
      description: featurePage.metaDescription,
      url: `/features/${featurePage.slug}`,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${featurePage.title} in FinanceFlow`,
        },
      ],
    },
    twitter: {
      title: `${featurePage.title} | FinanceFlow Features`,
      description: featurePage.metaDescription,
      images: ['/twitter-image'],
    },
  }
}

export default async function FeatureDetailPage({
  params,
}: IFeaturePageRouteProps) {
  const { slug } = await params
  const featurePage = featurePagesBySlug.get(slug)

  if (!featurePage) {
    notFound()
  }

  const featureStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: featurePage.title,
    url: `https://www.financeflow.dev/features/${featurePage.slug}`,
    description: featurePage.metaDescription,
    isPartOf: {
      '@type': 'WebSite',
      name: 'FinanceFlow',
      url: 'https://www.financeflow.dev',
    },
    about: {
      '@type': 'SoftwareApplication',
      name: 'FinanceFlow',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
    },
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: featurePage.faqItems.map((faqItem) => ({
      '@type': 'Question',
      name: faqItem.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faqItem.answer,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-background">
      <Script
        id={`feature-page-jsonld-${featurePage.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([featureStructuredData, faqStructuredData]),
        }}
      />
      <LandingNavbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto px-4 py-20 space-y-12"
      >
        <section className="mx-auto max-w-4xl space-y-5">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all features
          </Link>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {featurePage.categoryLabel}
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {featurePage.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {featurePage.summary}
            </p>
            <p className="text-base leading-7 text-muted-foreground">
              {featurePage.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {featurePage.longTailKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <h2 className="sr-only">Feature details, use cases, and FAQs</h2>
          <Card className="border-border/60 bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">
                What this feature helps you do
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {featurePage.keyBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="text-sm leading-6 text-muted-foreground">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                <h2 className="text-lg font-semibold tracking-tight">
                  Common use cases
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {featurePage.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/60 bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">
                  Frequently asked questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featurePage.faqItems.map((faqItem) => (
                  <div
                    key={faqItem.question}
                    className="rounded-xl border border-border/50 bg-background/40 p-4"
                  >
                    <h2 className="text-sm font-semibold text-foreground">
                      {faqItem.question}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {faqItem.answer}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-emerald-500/25 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-xl">Try it in FinanceFlow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Explore this feature in the live product, then compare Basic
                  and Pro plans to see which level of access fits your workflow.
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/plans">
                    <Button className="w-full">
                      Compare plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline" className="w-full">
                      Start free
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-4xl rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Explore related FinanceFlow features
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue exploring how FinanceFlow helps with budgeting, insights,
            subscriptions, and reporting.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {featurePages
              .filter(
                (relatedFeaturePage) =>
                  relatedFeaturePage.slug !== featurePage.slug
              )
              .map((relatedFeaturePage) => (
                <Link
                  key={relatedFeaturePage.slug}
                  href={`/features/${relatedFeaturePage.slug}`}
                  className="rounded-xl border border-border/50 bg-background/40 p-4 transition hover:border-primary/40 hover:bg-background/70"
                >
                  <p className="text-sm font-semibold">
                    {relatedFeaturePage.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {relatedFeaturePage.summary}
                  </p>
                </Link>
              ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
