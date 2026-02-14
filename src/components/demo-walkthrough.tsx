'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type WalkthroughStep = {
  id: string
  target: string
  title: string
  description: string
  placement?: 'below' | 'above' | 'top'
  scroll?: 'center' | 'start'
  offsetY?: number
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    target: 'demo-welcome',
    title: 'Welcome to the live demo',
    description:
      'Explore realistic financial data without connecting a bank account.',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'actions',
    target: 'demo-actions',
    title: 'Add or explore activity',
    description:
      'Create transactions or review demo activity. The data refreshes instantly.',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'spending',
    target: 'demo-spending',
    title: 'Spending trends',
    description:
      'See category breakdowns and monthly trends to spot spending patterns.',
    placement: 'below',
    scroll: 'center',
  },
  {
    id: 'insights',
    target: 'demo-insights',
    title: 'AI insights',
    description:
      'Ask the assistant about your spending and subscriptions using demo data.',
    placement: 'above',
    scroll: 'center',
    offsetY: -8,
  },
  {
    id: 'transactions',
    target: 'demo-transactions',
    title: 'Transaction history',
    description: 'Review activity, categories, and cash flow at a glance.',
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
  const [activeIndex, setActiveIndex] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)

  const activeStep = walkthroughSteps[activeIndex]

  useEffect(() => {
    if (!isOpen) return
    setActiveIndex(0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !activeStep) return

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
  }, [activeStep, isOpen])

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
    const left = Math.min(
      Math.max(highlightRect.left, padding),
      window.innerWidth - tooltipWidth - padding
    )

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
