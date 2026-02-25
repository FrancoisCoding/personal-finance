import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FinanceFlow Status',
  description:
    'Check real-time FinanceFlow service status, uptime metrics, maintenance notices, and platform availability updates for core product systems.',
  alternates: {
    canonical: '/status',
  },
  openGraph: {
    title: 'FinanceFlow System Status',
    description:
      'Monitor FinanceFlow uptime, maintenance notices, and real-time service availability updates.',
    url: '/status',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FinanceFlow system status',
      },
    ],
  },
  twitter: {
    title: 'FinanceFlow System Status',
    description:
      'Monitor FinanceFlow uptime, maintenance notices, and real-time service availability updates.',
    images: ['/twitter-image'],
  },
}

const services = [
  { name: 'Core Dashboard', status: 'operational', uptime: '100%' },
  { name: 'Direct Bank Sync', status: 'operational', uptime: '99.98%' },
  { name: 'AI Insights Engine', status: 'operational', uptime: '99.95%' },
  { name: 'Mobile App API', status: 'operational', uptime: '100%' },
  {
    name: 'Report Generation',
    status: 'maintenance',
    uptime: '99.90%',
    note: 'Scheduled maintenance in progress',
  },
]

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto px-4 py-20 max-w-4xl space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 font-medium text-sm">
            <CheckCircle className="w-4 h-4" />
            All systems operational
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight">
            Service Status
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time status and uptime monitoring for FinanceFlow services.
          </p>
          <p className="mx-auto max-w-3xl text-sm leading-6 text-muted-foreground">
            Use this page to check current platform availability, planned
            maintenance notices, and service uptime summaries. If you are
            troubleshooting an issue, compare your experience against the
            service status listed below before contacting support.
          </p>
        </div>

        <section
          aria-labelledby="status-services-heading"
          className="space-y-4"
        >
          <h2
            id="status-services-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Service components and current availability
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Each component includes a current status label, uptime summary, and
            maintenance notes when applicable. This helps users understand
            whether an issue is isolated to their account or tied to a broader
            platform event.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            During maintenance windows or incidents, statuses may change as the
            team investigates. Check this page first if a feature appears slow
            or unavailable before retrying actions multiple times.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Status updates are intended to provide a quick operational summary,
            while support channels are used for account-specific troubleshooting
            or error reports that require investigation.
          </p>
          <div className="space-y-4">
            {services.map((service) => (
              <Card
                key={service.name}
                className="overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        service.status === 'operational'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : service.status === 'maintenance'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {service.status === 'operational' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : service.status === 'maintenance' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      {service.note && (
                        <p className="text-xs text-muted-foreground">
                          {service.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <div className="flex flex-col items-end">
                      <span className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                        Status
                      </span>
                      <span className="capitalize font-medium">
                        {service.status}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                        Uptime
                      </span>
                      <span className="font-medium">{service.uptime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="status-updates-heading"
          className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-6"
        >
          <h2
            id="status-updates-heading"
            className="text-xl font-semibold tracking-tight"
          >
            How status updates are published
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            FinanceFlow posts updates here when maintenance windows begin, when
            incidents are under investigation, and when services return to
            normal operation. The goal is to give users a clear timeline so they
            can decide whether to retry a workflow, wait for a fix, or contact
            support with account-specific details.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            For the fastest support response, include the impacted feature,
            approximate time, and any visible error message. Reports with
            specific details help distinguish product outages from connection
            issues, account permissions, or temporary browser problems.
          </p>
        </section>

        <div className="text-center pt-8">
          <div className="bg-muted/40 rounded-3xl p-8 space-y-4 max-w-2xl mx-auto">
            <p className="text-muted-foreground">
              Experiencing an issue not listed here? Our support team is
              available 24/7 to help resolve any technical difficulties.
            </p>
            <p className="text-sm text-muted-foreground">
              Include the affected service, time of occurrence, and any error
              messages or screenshots when contacting the team. This reduces
              back-and-forth and speeds up investigation.
            </p>
            <p className="text-sm text-muted-foreground">
              If the issue appears after a maintenance notice, mention that in
              your request so support can connect your report to current service
              activity.
            </p>
            <p className="text-sm text-muted-foreground">
              You can also review recent updates on this page before reopening a
              ticket to see whether a known incident or maintenance event has
              already been resolved.
            </p>
            <Link href="/support">
              <Button
                variant="link"
                className="text-primary font-semibold text-lg h-auto"
              >
                Contact our support team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
