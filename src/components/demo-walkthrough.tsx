'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

const walkthroughSteps: WalkthroughStep[] = [
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
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'credit-utilization',
    target: 'demo-credit-utilization',
    title: 'Credit utilization',
    description: 'Monitor usage across credit cards to protect your score.',
    route: '/dashboard',
    placement: 'right',
    scroll: 'center',
  },
  {
    id: 'analytics',
    target: 'demo-analytics',
    title: 'Analytics dashboard',
    description: 'Dive into detailed performance and trends.',
    route: '/dashboard',
    placement: 'right',
    scroll: 'center',
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
    placement: 'below',
    scroll: 'center',
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
  const [activeIndex, setActiveIndex] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const pendingRouteRef = useRef<string | null>(null)

  const activeStep = walkthroughSteps[activeIndex]

  useEffect(() => {
    if (!isOpen) return
    setActiveIndex(0)
  }, [isOpen])

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
    const maxFrames = 24

    const updateHighlight = () => {
      const target = document.querySelector(
        `[data-demo-step="${activeStep.target}"]`
      ) as HTMLElement | null
      if (!target) {
        setHighlightRect(null)
        return
      }
      setHighlightRect(target.getBoundingClientRect())
    }

    const target = document.querySelector(
      `[data-demo-step="${activeStep.target}"]`
    ) as HTMLElement | null

    if (target) {
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

    const mutationObserver = new MutationObserver(updateHighlight)
    if (target) {
      mutationObserver.observe(target, {
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
    if (!highlightRect) {
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
  }, [activeStep.offsetY, activeStep.placement, highlightRect])

  if (!isOpen || !activeStep) {
    return null
  }

  const isLastStep = activeIndex === walkthroughSteps.length - 1

  if (typeof document === 'undefined') {
    return null
  }

  const overlay = (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60" />

      {highlightRect ? (
        <div
          className="absolute rounded-2xl ring-2 ring-white/70"
          style={{
            top: Math.max(highlightRect.top - 8, 8),
            left: Math.max(highlightRect.left - 8, 8),
            width: Math.max(highlightRect.width + 16, 24),
            height: Math.max(highlightRect.height + 16, 24),
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
        />
      ) : null}

      <div
        className={cn(
          'absolute z-[90] w-[320px] rounded-2xl border border-border/60',
          'bg-card/95 p-4 shadow-xl backdrop-blur'
        )}
        style={tooltipStyle}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Step {activeIndex + 1} of {walkthroughSteps.length}
        </p>
        <h3 className="mt-2 text-base font-semibold text-foreground">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
              disabled={activeIndex === 0}
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (isLastStep) {
                  onComplete()
                  return
                }
                setActiveIndex((prev) =>
                  Math.min(prev + 1, walkthroughSteps.length - 1)
                )
              }}
            >
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}

export default DemoWalkthrough
