'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { FadeIn } from '@/components/motion/fade-in'
import { InteractiveHero } from '@/components/landing/interactive-hero'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
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

      <LandingNavbar />

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

        <LandingClosingCta onEnterDemo={handleEnterDemo} />
      </main>

      <LandingFooter />
    </div>
  )
}

function LandingClosingCta({ onEnterDemo }: { onEnterDemo: () => void }) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const sceneY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [26, -18]
  )
  const sceneRotate = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [1.4, -1.2]
  )
  const cardOneY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [20, -22]
  )
  const cardTwoY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [30, -30]
  )
  const signalScale = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.96, 1, 1.02]
  )

  return (
    <section ref={sectionRef} className="relative px-4 py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-12 h-48 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.12),transparent_70%)]" />
        <div className="absolute left-1/2 top-24 h-80 w-[min(72rem,92vw)] -translate-x-1/2 rounded-[40px] border border-emerald-300/10 bg-[linear-gradient(180deg,rgba(6,10,18,0.85),rgba(4,8,14,0.6))] shadow-[0_50px_140px_-70px_rgba(6,182,212,0.45)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container relative mx-auto">
        <FadeIn className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 p-5 shadow-[0_35px_90px_-55px_rgba(8,145,178,0.35)] backdrop-blur-xl sm:p-7 lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.10),transparent_40%),radial-gradient(circle_at_90%_22%,rgba(6,182,212,0.10),transparent_45%),radial-gradient(circle_at_55%_115%,rgba(99,102,241,0.10),transparent_52%)]"
          />

          <div className="relative grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                FinanceFlow command center
              </div>

              <div className="space-y-4">
                <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  Replace cluttered spreadsheets with a living financial
                  workspace.
                </h2>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Built for people who want calm visibility, faster decisions,
                  and a product that feels premium every time they open it.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                    <Brain className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    AI guidance with context
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask better questions and get actionable next steps, not
                    generic advice.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
                    <Zap className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Fast to navigate
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Clear modules, consistent actions, and quick exports when
                    you need them.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="min-h-11 text-base sm:text-lg">
                    Start free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-11 text-base sm:text-lg"
                  onClick={onEnterDemo}
                >
                  Explore live demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  Bank-grade security controls
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                  Excel & PDF exports
                </div>
              </div>
            </div>

            <motion.div
              style={{ y: sceneY, rotate: sceneRotate }}
              className="relative mx-auto w-full max-w-2xl"
            >
              <div className="relative overflow-hidden rounded-[1.6rem] border border-border/60 bg-[#071019]/90 p-4 shadow-[0_35px_100px_-60px_rgba(16,185,129,0.45)] sm:p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(6,182,212,0.12),transparent_36%),radial-gradient(circle_at_80%_18%,rgba(16,185,129,0.10),transparent_42%),radial-gradient(circle_at_45%_100%,rgba(99,102,241,0.10),transparent_52%)]" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/80">
                        Live financial signal
                      </p>
                      <p className="text-sm font-medium text-white">
                        Monthly burn risk dropped after budget adjustment
                      </p>
                    </div>
                    <div className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                      Stable
                    </div>
                  </div>

                  <motion.div
                    style={{ scale: signalScale }}
                    className="rounded-2xl border border-white/10 bg-[#050b13]/80 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300/80">
                          Cashflow runway
                        </p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                          4.2 months
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300/80">
                          Net
                        </p>
                        <p className="mt-1 text-base font-semibold text-emerald-200">
                          +$1,552
                        </p>
                      </div>
                    </div>

                    <div className="relative h-36 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 p-3">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                      <svg
                        className="relative h-full w-full"
                        viewBox="0 0 320 110"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient
                            id="ctaLineA"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor="rgba(34,211,238,0.65)"
                            />
                            <stop
                              offset="100%"
                              stopColor="rgba(16,185,129,0.9)"
                            />
                          </linearGradient>
                          <linearGradient
                            id="ctaFillA"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="rgba(16,185,129,0.18)"
                            />
                            <stop
                              offset="100%"
                              stopColor="rgba(16,185,129,0)"
                            />
                          </linearGradient>
                        </defs>
                        <motion.path
                          d="M0 85 C35 82, 54 58, 84 60 C118 62, 140 89, 176 72 C208 57, 232 38, 264 46 C289 52, 301 36, 320 28"
                          fill="none"
                          stroke="url(#ctaLineA)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 1.2, ease: 'easeInOut' }}
                        />
                        <motion.path
                          d="M0 95 C36 92, 54 69, 84 70 C117 72, 140 97, 176 81 C208 67, 232 49, 264 55 C289 60, 301 44, 320 36 L320 110 L0 110 Z"
                          fill="url(#ctaFillA)"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 0.9, delay: 0.15 }}
                        />
                        {[84, 176, 264, 320].map((x, index) => (
                          <motion.circle
                            key={x}
                            cx={x}
                            cy={[60, 72, 46, 28][index]}
                            r="3.5"
                            fill={index > 1 ? '#34d399' : '#22d3ee'}
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{
                              delay: 0.35 + index * 0.08,
                              duration: 0.25,
                            }}
                          />
                        ))}
                      </svg>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300/80">
                          Savings rate
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          26.4%
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300/80">
                          Top risk
                        </p>
                        <p className="mt-1 text-sm font-semibold text-amber-200">
                          Housing spend
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300/80">
                          Next action
                        </p>
                        <p className="mt-1 text-sm font-semibold text-cyan-100">
                          Trim recurring bills
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    style={{ y: cardOneY }}
                    className="pointer-events-none absolute -right-2 top-10 hidden w-52 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 shadow-lg shadow-cyan-900/20 backdrop-blur md:block"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/80">
                      Assistant
                    </p>
                    <p className="mt-2 text-sm font-medium text-cyan-50">
                      {
                        'Show where I can cut $300 this month without touching investments.'
                      }
                    </p>
                  </motion.div>

                  <motion.div
                    style={{ y: cardTwoY }}
                    className="pointer-events-none absolute -left-4 bottom-7 hidden w-48 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 shadow-lg shadow-emerald-900/20 backdrop-blur md:block"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/80">
                      Smart alert
                    </p>
                    <p className="mt-2 text-sm font-medium text-emerald-50">
                      Subscription renewal in 2 days • optimizer found a cheaper
                      annual plan.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
