import Link from 'next/link'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Lock, Eye, Zap, ArrowRight } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto px-4 py-20 space-y-20"
      >
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Security First
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Your data security is our top priority.
          </h1>
          <p className="text-muted-foreground text-lg text-balance">
            We employ bank-grade encryption and proactive monitoring to ensure
            your financial story stays private and protected.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <CardTitle>Bank-Grade Encryption</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              All data is encrypted in transit and at rest using AES-256
              standards. We use TLS 1.2+ for all communications between your
              device and our servers.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Eye className="w-6 h-6" />
              </div>
              <CardTitle>Continuous Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Our systems are monitored 24/7 for suspicious activity. We use
              automated anomaly detection to identify and block potential
              threats in real-time.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle>Verified Compliance</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              We regularly undergo third-party security audits and penetration
              testing to ensure our infrastructure meets the highest industry
              standards.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <CardTitle>Proactive Alerts</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Enable security notifications to get instant alerts about new
              logins, password changes, or unusual transaction patterns on your
              connected accounts.
            </CardContent>
          </Card>
        </div>

        <div className="relative overflow-hidden rounded-[32px] bg-slate-900 text-white p-8 md:p-16 text-center space-y-8 shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_70%)]" />
          <div className="relative space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Report a vulnerability
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
              We believe in coordinated disclosure. If you&apos;ve found a
              security issue, please reach out to our security team directly.
            </p>
          </div>
          <div className="relative inline-block">
            <Link href="/support">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg h-auto shadow-xl"
              >
                Contact Security Team
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
