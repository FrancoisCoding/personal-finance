import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { FadeIn } from '@/components/motion/fade-in'
import { NetWorthSummaryCard } from '@/components/net-worth-summary-card'
import {
  Shield,
  Zap,
  Brain,
  BarChart3,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Globe,
} from 'lucide-react'

const features = [
  {
    title: 'AI cashflow co-pilot',
    description:
      'Spot trends early with adaptive insights that learn your habits and flag risks before they grow.',
    icon: Brain,
    tone: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    iconClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  },
  {
    title: 'Automated categorization',
    description:
      'Transactions are sorted instantly with confidence scores, so your budgets stay accurate.',
    icon: Zap,
    tone: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    iconClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
  },
  {
    title: 'Goal momentum tracking',
    description:
      'Build a plan that adapts to income changes and recommends next steps to stay on pace.',
    icon: Target,
    tone: 'from-amber-500/20 via-amber-500/5 to-transparent',
    iconClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  },
  {
    title: 'Portfolio guardrails',
    description:
      'See risk, allocation, and cash reserves at a glance with clear, executive-ready visuals.',
    icon: BarChart3,
    tone: 'from-sky-500/20 via-sky-500/5 to-transparent',
    iconClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
  },
  {
    title: 'Security first',
    description:
      'Bank-grade encryption, anomaly detection, and proactive alerts keep every account protected.',
    icon: Shield,
    tone: 'from-slate-500/20 via-slate-500/5 to-transparent',
    iconClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
  },
  {
    title: 'Global access',
    description:
      'Switch devices, share reports, and manage money anywhere with a fast, responsive workspace.',
    icon: Globe,
    tone: 'from-teal-500/20 via-teal-500/5 to-transparent',
    iconClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-300',
  },
]

const netWorthSummaryItems = [
  { label: 'Monthly income', value: 14200 },
  { label: 'Essentials', value: 6040 },
  { label: 'Investments', value: 2910 },
  { label: 'Cash reserve', value: 9880 },
]

const netWorthForecastHeights = [40, 62, 52, 74, 58, 82, 64]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    quote:
      'FinanceFlow finally gives me a clear picture. The weekly AI nudges have cut my overspending in half.',
    accent: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  },
  {
    name: 'Mike Chen',
    role: 'Financial Advisor',
    quote:
      'The insights are fast, relevant, and easy to share. It is the quickest way to prep a client review.',
    accent: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Entrepreneur',
    quote:
      'I can see runway, burn, and runway alerts in minutes. It is like having a CFO on call.',
    accent: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/20" />
        <div className="absolute top-32 -left-24 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/15" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-400/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_50%)] dark:bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.12),_transparent_50%)]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="lg" />
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative py-20 px-4">
        <Spotlight
          className="-top-48 left-0 hidden md:block"
          fill="hsl(var(--primary))"
        />
        <Spotlight
          className="-top-32 right-0 hidden lg:block"
          fill="hsl(var(--accent-foreground))"
        />
        <div className="container mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="flex flex-col gap-8">
            <FadeIn delay={0.05}>
              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
                <span className="text-primary">AI</span>
                Cashflow autopilot
              </div>
            </FadeIn>
            <div className="space-y-6">
              <FadeIn delay={0.12}>
                <TextGenerateEffect
                  as="h1"
                  words="Manage money with calm, confident clarity."
                  className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight"
                />
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                  FinanceFlow blends real-time data, smart categorization, and
                  tailored guidance so you always know what to do next.
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="text-base sm:text-lg">
                    Start free trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base sm:text-lg"
                  >
                    View live demo
                  </Button>
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.38}>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Cancel anytime
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Syncs in minutes
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.22} className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-r from-emerald-400/25 via-cyan-400/25 to-amber-300/25 blur-3xl" />
            <NetWorthSummaryCard
              netWorth={128420}
              changePercent={12.4}
              summaryItems={netWorthSummaryItems}
              forecastHeights={netWorthForecastHeights}
            />
          </FadeIn>
        </div>
      </section>

      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              A modern finance workspace that feels effortless.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Every view is crafted to surface what matters now and what matters
              next. No clutter, just clarity.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <FadeIn
                  key={feature.title}
                  delay={0.08 * index}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.tone} opacity-0 transition duration-300 group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconClass}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <FadeIn className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-10 text-white shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-semibold mb-2">10,000+</div>
                <div className="text-white/80">Active users</div>
              </div>
              <div>
                <div className="text-4xl font-semibold mb-2">$50M+</div>
                <div className="text-white/80">Tracked assets</div>
              </div>
              <div>
                <div className="text-4xl font-semibold mb-2">99.9%</div>
                <div className="text-white/80">Verified uptime</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              Loved by builders, advisors, and founders.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A modern experience that feels premium on day one and keeps
              getting smarter.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <FadeIn
                key={testimonial.name}
                delay={0.08 * index}
                className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={`star-${testimonial.name}-${i}`}
                      className="h-5 w-5 text-amber-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div
                    className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${testimonial.accent}`}
                  >
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <FadeIn className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 p-12 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_60%)]" />
            <div className="relative text-center">
              <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
                Ready for a clearer financial story?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of teams using FinanceFlow to plan with
                confidence and move faster every month.
              </p>
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="text-base sm:text-lg !bg-[hsl(0_0%_100%)] !text-slate-900 hover:!bg-[hsl(0_0%_96%)]"
                >
                  Get started free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-background py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="md" />
            <div className="flex items-center space-x-6 mt-4 md:mt-0 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="/support" className="hover:text-foreground">
                Support
              </Link>
            </div>
          </div>
          <div className="border-t border-border/60 mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              (c) 2026 FinanceFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
