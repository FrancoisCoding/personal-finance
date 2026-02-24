'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { FadeIn } from '@/components/motion/fade-in'
import { InteractiveHero } from '@/components/landing/interactive-hero'
import { useDemoMode } from '@/hooks/use-demo-mode'
import {
  Shield,
  Zap,
  Brain,
  BarChart3,
  Target,
  ArrowRight,
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

export default function LandingPage() {
  const router = useRouter()
  const { startDemoMode } = useDemoMode()

  const handleEnterDemo = () => {
    startDemoMode()
    router.push('/dashboard?demo=1')
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
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

      <main id="main-content" tabIndex={-1}>
        <section className="relative py-20 px-4">
          <Spotlight
            className="-top-48 left-0 hidden md:block"
            fill="hsl(var(--primary))"
          />
          <Spotlight
            className="-top-32 right-0 hidden lg:block"
            fill="hsl(var(--accent-foreground))"
          />
          <div className="container mx-auto flex flex-col items-center text-center gap-12">
            <div className="flex flex-col items-center gap-8 max-w-4xl">
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
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
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
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base sm:text-lg"
                    onClick={handleEnterDemo}
                  >
                    View live demo
                  </Button>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.4} className="w-full">
              <InteractiveHero />
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
                Every view is crafted to surface what matters now and what
                matters next. No clutter, just clarity.
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
      </main>

      <footer className="border-t border-border/60 bg-background pt-20 pb-12 px-4 mt-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Logo size="lg" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Precision financial management for modern families and builders.
                Experience calm, confident clarity with AI-powered insights.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 20.65zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
              </div>
            </div>

            <FooterColumn
              title="Platform"
              links={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Pricing', href: '/plans' },
                { label: 'Security', href: '/security' },
              ]}
            />
            <FooterColumn
              title="Support"
              links={[
                { label: 'Help Center', href: '/support' },
                { label: 'Contact Us', href: '/support' },
                { label: 'Status', href: '/status' },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' },
              ]}
            />
          </div>

          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
            <p>&copy; 2026 FinanceFlow Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className="hover:text-foreground transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground/80">
        {title}
      </h4>
      <ul className="flex flex-col gap-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group"
            >
              <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
