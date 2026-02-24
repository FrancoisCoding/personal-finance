import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Lock, Eye, Zap } from 'lucide-react'

export default function SecurityPage() {
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
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Security First
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">
            Your data security is our top priority.
          </h1>
          <p className="text-muted-foreground text-lg">
            We employ bank-grade encryption and proactive monitoring to ensure
            your financial story stays private and protected.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <CardTitle>Bank-Grade Encryption</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All data is encrypted in transit and at rest using AES-256
              standards. We use TLS 1.2+ for all communications between your
              device and our servers.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Eye className="w-6 h-6" />
              </div>
              <CardTitle>Continuous Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Our systems are monitored 24/7 for suspicious activity. We use
              automated anomaly detection to identify and block potential
              threats in real-time.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle>Verified Compliance</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We regularly undergo third-party security audits and penetration
              testing to ensure our infrastructure meets the highest industry
              standards.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <CardTitle>Proactive Alerts</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Enable security notifications to get instant alerts about new
              logins, password changes, or unusual transaction patterns on your
              connected accounts.
            </CardContent>
          </Card>
        </div>

        <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Report a vulnerability
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            We believe in coordinated disclosure. If you&apos;ve found a
            security issue, please reach out to our security team directly.
          </p>
          <Link href="/support">
            <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-medium hover:bg-slate-100 transition-colors">
              Contact Security Team
            </button>
          </Link>
        </div>
      </main>
    </div>
  )
}
