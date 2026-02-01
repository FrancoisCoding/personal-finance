import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 space-y-10">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Privacy
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            This policy explains how FinanceFlow collects, uses, and protects
            your information. Last updated: January 28, 2026.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Information we collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
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

          <Card>
            <CardHeader>
              <CardTitle>How we use information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
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

          <Card>
            <CardHeader>
              <CardTitle>Sharing and disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We do not sell your personal data. We share information only
                with trusted service providers needed to operate the platform or
                when required by law.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security and retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We use industry-standard safeguards to protect data in transit
                and at rest. We retain data as long as your account is active or
                as required to provide the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                You can update your profile, disconnect accounts, or request
                data deletion by contacting support.
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
      </div>
    </div>
  )
}
