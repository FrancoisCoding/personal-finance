import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto px-4 py-12 space-y-10"
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">
            Terms of Service
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            By using FinanceFlow, you agree to the terms below. Last updated:
            January 28, 2026.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                You are responsible for keeping your login credentials secure
                and ensuring activity on your account complies with these
                terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acceptable use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                You agree not to misuse the service, attempt unauthorized
                access, or interfere with platform operations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscriptions and billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Paid plans renew automatically unless canceled. You may update or
                cancel subscriptions from your account settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We aim to keep FinanceFlow available, but outages and
                maintenance windows may occur.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                FinanceFlow is provided as-is. We are not liable for indirect or
                consequential damages to the extent permitted by law.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                For questions about these terms, reach out to our team.
              </p>
              <Link
                href="/support"
                className="text-sm font-medium text-primary hover:underline"
              >
                Contact Support
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
