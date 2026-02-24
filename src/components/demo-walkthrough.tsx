'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type WalkthroughStep = {
  id: string
  target: string
  title: string
  description: string
  route?: string
  placement?: 'below' | 'above' | 'top' | 'right' | 'left'
  scroll?: 'center' | 'start'
  offsetY?: number
  scrollOffsetY?: number
}

type WalkthroughTour = {
  id: string
  label: string
  shortLabel: string
  description: string
  estimatedMinutes: number
  steps: WalkthroughStep[]
  group: 'core' | 'module' | 'advanced'
  isRecommended?: boolean
}

const fullWalkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    target: 'demo-welcome',
    title: 'Welcome to the live demo',
    description:
      'Explore realistic financial data without connecting a bank account.',
    route: '/dashboard',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'navigation',
    target: 'demo-navigation',
    title: 'Explore the modules',
    description:
      'Jump between accounts, transactions, subscriptions, and the assistant.',
    route: '/dashboard',
    placement: 'right',
    scroll: 'center',
  },
  {
    id: 'search',
    target: 'demo-search',
    title: 'Global search',
    description: 'Ask questions or jump to any module from one spot.',
    route: '/dashboard',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'notifications',
    target: 'demo-notifications',
    title: 'Smart notifications',
    description: 'Stay on top of alerts, reminders, and budget updates.',
    route: '/dashboard',
    placement: 'left',
    scroll: 'center',
  },
  {
    id: 'overview',
    target: 'demo-overview-cards',
    title: 'Monthly overview',
    description: 'Snapshot balances, income, and expenses at a glance.',
    route: '/dashboard',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'net-worth',
    target: 'demo-net-worth',
    title: 'Net worth forecast',
    description: 'Track totals and trend projections over time.',
    route: '/dashboard',
    placement: 'right',
    scroll: 'center',
  },
  {
    id: 'spending',
    target: 'demo-spending',
    title: 'Spending trends',
    description: 'See category breakdowns and monthly trends to spot patterns.',
    route: '/dashboard',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'reminders',
    target: 'demo-reminders',
    title: 'Reminders',
    description: 'Keep bills, budgets, and goals on schedule.',
    route: '/dashboard',
    placement: 'left',
    scroll: 'center',
  },
  {
    id: 'cash-flow',
    target: 'demo-cashflow',
    title: 'Cash flow',
    description: 'Understand inflows vs. outflows across recent months.',
    route: '/dashboard',
    placement: 'right',
    scroll: 'start',
    scrollOffsetY: -180,
  },
  {
    id: 'credit-utilization',
    target: 'demo-credit-utilization',
    title: 'Credit utilization',
    description: 'Monitor usage across credit cards to protect your score.',
    route: '/dashboard',
    placement: 'left',
    scroll: 'start',
    scrollOffsetY: -180,
  },
  {
    id: 'analytics',
    target: 'demo-analytics',
    title: 'Analytics dashboard',
    description: 'Dive into detailed performance and trends.',
    route: '/dashboard',
    placement: 'left',
    scroll: 'start',
    scrollOffsetY: -180,
  },
  {
    id: 'budget-progress',
    target: 'demo-budget-progress',
    title: 'Budget progress',
    description: 'Track monthly spend against your limits.',
    route: '/dashboard',
    placement: 'left',
    scroll: 'center',
  },
  {
    id: 'goals-progress',
    target: 'demo-goals-progress',
    title: 'Goal tracking',
    description: 'Visualize progress toward savings goals.',
    route: '/dashboard',
    placement: 'left',
    scroll: 'center',
  },
  {
    id: 'donations',
    target: 'demo-donations',
    title: 'Donations overview',
    description: 'Monitor giving across churches and charities.',
    route: '/dashboard',
    placement: 'left',
    scroll: 'center',
  },
  {
    id: 'recent-transactions',
    target: 'demo-recent-transactions',
    title: 'Recent activity',
    description: 'See the latest transactions and categories.',
    route: '/dashboard',
    placement: 'right',
    scroll: 'start',
    scrollOffsetY: -180,
  },
  {
    id: 'accounts',
    target: 'demo-accounts',
    title: 'Accounts at a glance',
    description: 'Review balances across checking, savings, and credit.',
    route: '/accounts',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'transaction-filters',
    target: 'demo-transaction-filters',
    title: 'Filter transactions',
    description: 'Slice by category, type, or keyword in seconds.',
    route: '/transactions',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'transactions',
    target: 'demo-transactions',
    title: 'Transaction history',
    description: 'Review activity, categories, and cash flow at a glance.',
    route: '/transactions',
    placement: 'right',
    scroll: 'start',
    scrollOffsetY: -120,
  },
  {
    id: 'subscriptions-summary',
    target: 'demo-subscriptions-summary',
    title: 'Subscription costs',
    description: 'See monthly and annual subscription totals instantly.',
    route: '/subscriptions',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'subscriptions-detected',
    target: 'demo-subscriptions-detected',
    title: 'Detected subscriptions',
    description: 'Add recurring charges suggested by the system.',
    route: '/subscriptions',
    placement: 'right',
    scroll: 'center',
  },
  {
    id: 'subscriptions-active',
    target: 'demo-subscriptions-active',
    title: 'Active subscriptions',
    description: 'Manage renewals, pauses, and edits in one place.',
    route: '/subscriptions',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'subscriptions-optimizer',
    target: 'demo-subscriptions-intelligence',
    title: 'Subscription optimizer',
    description:
      'Review consolidation opportunities, annual projections, and savings levers.',
    route: '/subscriptions',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'card-perks-header',
    target: 'demo-card-perks-header',
    title: 'Card perk insights',
    description:
      'Track monthly card credits and see which perks still have unused value.',
    route: '/card-perks',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'card-perks-list',
    target: 'demo-card-perks-list',
    title: 'Expiry reminders',
    description:
      'Review merchant-level usage and identify benefits that are expiring soon.',
    route: '/card-perks',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'credit-score-header',
    target: 'demo-credit-score-header',
    title: 'Credit Score Lab',
    description:
      'Open a Pro-grade score simulation with utilization and payment impact.',
    route: '/credit-score',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'credit-score-factors',
    target: 'demo-credit-score-factors',
    title: 'Score factor breakdown',
    description:
      'See the weighted components driving your score trend and risk profile.',
    route: '/credit-score',
    placement: 'right',
    scroll: 'center',
  },
  {
    id: 'credit-score-accounts',
    target: 'demo-credit-score-accounts',
    title: 'Account-level paydown plan',
    description:
      'Prioritize cards with the biggest score upside based on utilization.',
    route: '/credit-score',
    placement: 'above',
    scroll: 'center',
  },
  {
    id: 'assistant-header',
    target: 'demo-assistant-header',
    title: 'Financial Assistant',
    description: 'Ask questions and get personalized guidance.',
    route: '/assistant',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'assistant-chat',
    target: 'demo-assistant-chat',
    title: 'Conversation view',
    description: 'Review responses, tips, and next steps.',
    route: '/assistant',
    placement: 'right',
    scroll: 'center',
  },
  {
    id: 'assistant-prompts',
    target: 'demo-assistant-prompts',
    title: 'Suggested prompts',
    description: 'Kick off common questions with one click.',
    route: '/assistant',
    placement: 'left',
    scroll: 'center',
  },
  {
    id: 'assistant-composer',
    target: 'demo-assistant-composer',
    title: 'Ask anything',
    description: 'Type a question and get data-backed answers.',
    route: '/assistant',
    placement: 'above',
    scroll: 'center',
  },
]

const stepLookup = new Map(fullWalkthroughSteps.map((step) => [step.id, step]))

const getTourSteps = (stepIds: string[]) =>
  stepIds
    .map((stepId) => stepLookup.get(stepId))
    .filter((step): step is WalkthroughStep => Boolean(step))

const walkthroughTours: WalkthroughTour[] = [
  {
    id: 'quick-tour',
    label: 'Quick tour',
    shortLabel: 'Quick tour',
    description:
      'Best first-time overview of the product. Covers the main workflow and value in a short path.',
    estimatedMinutes: 2,
    group: 'core',
    isRecommended: true,
    steps: getTourSteps([
      'welcome',
      'navigation',
      'search',
      'overview',
      'spending',
      'recent-transactions',
      'subscriptions-summary',
      'assistant-header',
    ]),
  },
  {
    id: 'dashboard-tour',
    label: 'Dashboard deep dive',
    shortLabel: 'Dashboard tour',
    description:
      'Walk through the most useful dashboard widgets, trends, and planning signals.',
    estimatedMinutes: 2,
    group: 'module',
    steps: getTourSteps([
      'overview',
      'net-worth',
      'spending',
      'budget-progress',
      'goals-progress',
      'recent-transactions',
    ]),
  },
  {
    id: 'transactions-tour',
    label: 'Transactions tour',
    shortLabel: 'Transactions',
    description:
      'Learn filtering, review flow, and how to scan transaction history quickly.',
    estimatedMinutes: 1,
    group: 'module',
    steps: getTourSteps([
      'transaction-filters',
      'transactions',
      'recent-transactions',
    ]),
  },
  {
    id: 'subscriptions-tour',
    label: 'Subscriptions tour',
    shortLabel: 'Subscriptions',
    description:
      'See recurring charges, renewals, and optimization opportunities in one flow.',
    estimatedMinutes: 1,
    group: 'module',
    steps: getTourSteps([
      'subscriptions-summary',
      'subscriptions-active',
      'subscriptions-optimizer',
    ]),
  },
  {
    id: 'assistant-tour',
    label: 'Assistant tour',
    shortLabel: 'Assistant',
    description:
      'Understand prompts, conversation flow, and how to ask better questions.',
    estimatedMinutes: 1,
    group: 'module',
    steps: getTourSteps([
      'assistant-header',
      'assistant-prompts',
      'assistant-composer',
    ]),
  },
  {
    id: 'pro-features-tour',
    label: 'Pro features tour',
    shortLabel: 'Pro features',
    description:
      'Preview premium tools like card perks tracking and the Credit Score Lab.',
    estimatedMinutes: 2,
    group: 'module',
    steps: getTourSteps([
      'card-perks-header',
      'card-perks-list',
      'credit-score-header',
      'credit-score-factors',
    ]),
  },
  {
    id: 'full-tour',
    label: 'Complete product tour',
    shortLabel: 'Full tour',
    description:
      'Full walkthrough of every major surface. Best for evaluators and power users.',
    estimatedMinutes: 7,
    group: 'advanced',
    steps: fullWalkthroughSteps,
  },
]

interface DemoWalkthroughProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const DemoWalkthrough = ({
  isOpen,
  onClose,
  onComplete,
}: DemoWalkthroughProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTourId, setActiveTourId] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showAdvancedTours, setShowAdvancedTours] = useState(false)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const pendingRouteRef = useRef<string | null>(null)
  const activeTour = useMemo(
    () => walkthroughTours.find((tour) => tour.id === activeTourId) ?? null,
    [activeTourId]
  )
  const activeSteps = activeTour?.steps ?? []
  const routesToPrefetch = useMemo(() => {
    return Array.from(
      new Set(
        walkthroughTours
          .flatMap((tour) => tour.steps)
          .map((step) => step.route)
          .filter((route): route is string => Boolean(route))
      )
    )
  }, [])
  const activeStep = activeSteps[activeIndex] ?? null
  const coreTours = walkthroughTours.filter((tour) => tour.group === 'core')
  const moduleTours = walkthroughTours.filter((tour) => tour.group === 'module')
  const advancedTours = walkthroughTours.filter(
    (tour) => tour.group === 'advanced'
  )

  useEffect(() => {
    if (!isOpen) return
    setActiveTourId(null)
    setActiveIndex(0)
    setShowAdvancedTours(false)
    setHighlightRect(null)
    pendingRouteRef.current = null
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    routesToPrefetch.forEach((route) => {
      router.prefetch(route)
    })
  }, [isOpen, router, routesToPrefetch])

  const handleStartTour = useCallback((tourId: string) => {
    setActiveTourId(tourId)
    setActiveIndex(0)
    setHighlightRect(null)
  }, [])

  const handleReturnToTourMenu = useCallback(() => {
    setActiveTourId(null)
    setActiveIndex(0)
    setHighlightRect(null)
  }, [])

  const handleNext = useCallback(() => {
    if (!activeTour) return
    const isLastStep = activeIndex === activeSteps.length - 1
    if (isLastStep) {
      onComplete()
      return
    }
    setActiveIndex((prev) => Math.min(prev + 1, activeSteps.length - 1))
  }, [activeIndex, activeSteps.length, activeTour, onComplete])

  const handleBack = useCallback(() => {
    setActiveIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const isTextInputTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false
      const tagName = target.tagName.toLowerCase()
      return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        target.isContentEditable
      )
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTextInputTarget(event.target)) {
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (!activeStep) {
        return
      }
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault()
        handleNext()
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handleBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeStep, handleBack, handleNext, isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !activeStep) return
    if (activeStep.route && pathname !== activeStep.route) {
      if (pendingRouteRef.current !== activeStep.route) {
        pendingRouteRef.current = activeStep.route
        router.push(activeStep.route)
      }
      setHighlightRect(null)
      return
    }
    pendingRouteRef.current = null

    let rafId = 0
    let rafFrames = 0
    const maxFrames = 180
    let hasAppliedInitialScroll = false

    const applyTargetScroll = (target: HTMLElement) => {
      if (hasAppliedInitialScroll) {
        return
      }
      hasAppliedInitialScroll = true
      target.scrollIntoView({
        behavior: 'auto',
        block: activeStep.scroll ?? 'center',
      })
      if (activeStep.scrollOffsetY) {
        window.requestAnimationFrame(() => {
          window.scrollBy({ top: activeStep.scrollOffsetY ?? 0, left: 0 })
        })
      }
    }

    const updateHighlight = () => {
      const target = document.querySelector(
        `[data-demo-step="${activeStep.target}"]`
      ) as HTMLElement | null
      if (!target) {
        setHighlightRect(null)
        return
      }
      applyTargetScroll(target)
      setHighlightRect(target.getBoundingClientRect())
    }

    const target = document.querySelector(
      `[data-demo-step="${activeStep.target}"]`
    ) as HTMLElement | null

    if (target) {
      applyTargetScroll(target)
    }

    const loopUpdate = () => {
      updateHighlight()
      if (rafFrames < maxFrames) {
        rafFrames += 1
        rafId = window.requestAnimationFrame(loopUpdate)
      }
    }

    updateHighlight()
    rafId = window.requestAnimationFrame(loopUpdate)

    const resizeObserver = new ResizeObserver(updateHighlight)
    if (target) {
      resizeObserver.observe(target)
    }

    const mutationObserver = new MutationObserver(() => {
      const refreshedTarget = document.querySelector(
        `[data-demo-step="${activeStep.target}"]`
      ) as HTMLElement | null
      if (refreshedTarget) {
        try {
          resizeObserver.observe(refreshedTarget)
        } catch (error) {
          void error
        }
      }
      updateHighlight()
    })
    if (document.body) {
      mutationObserver.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    }

    window.addEventListener('resize', updateHighlight)
    window.addEventListener('scroll', updateHighlight, true)

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('resize', updateHighlight)
      window.removeEventListener('scroll', updateHighlight, true)
    }
  }, [activeStep, isOpen, pathname, router])

  const tooltipStyle = useMemo(() => {
    if (!activeStep || !highlightRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const padding = 16
    const tooltipWidth = 320
    const tooltipHeight = 180
    const preferredTop =
      activeStep.placement === 'top'
        ? highlightRect.top + padding
        : highlightRect.bottom + padding
    const fallbackTop = highlightRect.top - tooltipHeight - padding
    const offsetY = activeStep.offsetY ?? 0
    const top =
      activeStep.placement === 'above'
        ? Math.max(
            padding,
            highlightRect.top - tooltipHeight - padding + offsetY
          )
        : preferredTop + tooltipHeight > window.innerHeight &&
            fallbackTop > padding
          ? fallbackTop
          : Math.min(
              preferredTop + offsetY,
              window.innerHeight - tooltipHeight - padding
            )

    const left = (() => {
      if (activeStep.placement === 'right') {
        const preferredLeft = highlightRect.right + padding
        if (preferredLeft + tooltipWidth <= window.innerWidth - padding) {
          return preferredLeft
        }
        const fallbackLeft = highlightRect.left - tooltipWidth - padding
        return Math.max(padding, fallbackLeft)
      }
      if (activeStep.placement === 'left') {
        const preferredLeft = highlightRect.left - tooltipWidth - padding
        if (preferredLeft >= padding) {
          return preferredLeft
        }
        const fallbackLeft = highlightRect.right + padding
        return Math.min(
          fallbackLeft,
          window.innerWidth - tooltipWidth - padding
        )
      }
      return Math.min(
        Math.max(highlightRect.left, padding),
        window.innerWidth - tooltipWidth - padding
      )
    })()

    return {
      top,
      left,
    }
  }, [activeStep, highlightRect])

  if (!isOpen) {
    return null
  }

  const isLastStep = activeStep ? activeIndex === activeSteps.length - 1 : false

  if (typeof document === 'undefined') {
    return null
  }

  const quickTour =
    coreTours.find((tour) => tour.isRecommended) ?? coreTours[0] ?? null

  const overlay =
    activeTour && activeStep ? (
      <div className="fixed inset-0 z-[80]">
        <div className="absolute inset-0 bg-black/60" />

        {highlightRect ? (
          <div
            className="absolute rounded-2xl ring-2 ring-white/70 transition-all duration-200 ease-out"
            style={{
              top: Math.max(highlightRect.top - 8, 8),
              left: Math.max(highlightRect.left - 8, 8),
              width: Math.max(highlightRect.width + 16, 24),
              height: Math.max(highlightRect.height + 16, 24),
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              transition:
                'top 200ms ease-out, left 200ms ease-out, width 200ms ease-out, height 200ms ease-out',
            }}
          />
        ) : null}

        <div
          className={cn(
            'absolute z-[90] w-[320px] rounded-2xl border border-border/60',
            'bg-card/95 p-4 shadow-xl backdrop-blur transition-all duration-200 ease-out'
          )}
          style={tooltipStyle}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {activeTour.shortLabel} • ~{activeTour.estimatedMinutes} min
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Step {activeIndex + 1} of {activeSteps.length}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/50">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-200"
              style={{
                width: `${((activeIndex + 1) / Math.max(activeSteps.length, 1)) * 100}%`,
              }}
            />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">
            {activeStep.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeStep.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Skip
            </Button>
            <div className="flex items-center gap-2">
              {isLastStep ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReturnToTourMenu}
                  >
                    More tours
                  </Button>
                  <Button size="sm" onClick={onComplete}>
                    Finish
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    disabled={activeIndex === 0}
                  >
                    Back
                  </Button>
                  <Button size="sm" onClick={handleNext}>
                    Next
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="fixed inset-0 z-[80]">
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className={cn(
              'w-full max-w-3xl rounded-3xl border border-border/60',
              'bg-card/95 p-5 shadow-2xl backdrop-blur sm:p-6'
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Demo Tours
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  Pick a short walkthrough
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Start with the quick tour to learn the core workflow. You can
                  also jump straight to a specific area.
                </p>
              </div>
              {quickTour ? (
                <Button
                  onClick={() => handleStartTour(quickTour.id)}
                  className="min-h-11 shrink-0"
                >
                  Start quick tour (Recommended)
                </Button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3">
              {coreTours.map((tour) => (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => handleStartTour(tour.id)}
                  className={cn(
                    'w-full rounded-2xl border px-4 py-4 text-left transition-colors',
                    'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {tour.label}
                    </p>
                    {tour.isRecommended ? (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-500">
                        Recommended
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      {tour.steps.length} steps • ~{tour.estimatedMinutes} min
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tour.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Skip to an area
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {moduleTours.map((tour) => (
                  <button
                    key={tour.id}
                    type="button"
                    onClick={() => handleStartTour(tour.id)}
                    className={cn(
                      'rounded-2xl border border-border/60 bg-muted/10 px-4 py-4 text-left',
                      'transition-colors hover:bg-muted/20',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {tour.label}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {tour.steps.length} • ~{tour.estimatedMinutes}m
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {tour.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {advancedTours.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Advanced tours
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Longer walkthroughs for evaluators and power users.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowAdvancedTours((previous) => !previous)
                    }
                    className="min-h-10"
                  >
                    {showAdvancedTours
                      ? 'Hide advanced tours'
                      : 'Show advanced tours'}
                  </Button>
                </div>

                {showAdvancedTours ? (
                  <div className="mt-4 grid gap-3">
                    {advancedTours.map((tour) => (
                      <button
                        key={tour.id}
                        type="button"
                        onClick={() => handleStartTour(tour.id)}
                        className={cn(
                          'rounded-2xl border border-border/60 bg-background/60 px-4 py-4 text-left',
                          'transition-colors hover:bg-background'
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {tour.label}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {tour.steps.length} steps • ~{tour.estimatedMinutes}{' '}
                            min
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {tour.description}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Tip: You can press{' '}
                <kbd className="rounded border px-1.5 py-0.5">Esc</kbd> to skip
                at any time.
              </p>
              <Button variant="ghost" onClick={onClose}>
                Skip demo tours
              </Button>
            </div>
          </div>
        </div>
      </div>
    )

  return createPortal(overlay, document.body)
}

export default DemoWalkthrough
