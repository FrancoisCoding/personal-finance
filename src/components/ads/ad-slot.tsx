'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useBillingStatus } from '@/hooks/use-billing-status'
import {
  adConsentChangedEventName,
  readAdConsentValue,
  resolveAdConsentValue,
  TAdConsentValue,
} from '@/lib/ad-consent'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

interface IAdSlotProps {
  slotId?: string
  className?: string
  minHeightClassName?: string
  title?: string
}

const adsenseScriptId = 'financeflow-adsense-script'
const adEligiblePathPatterns = [/^\/$/, /^\/support(?:\/|$)/]
const blockedAdPathPatterns = [
  /^\/auth(?:\/|$)/,
  /^\/admin(?:\/|$)/,
  /^\/api(?:\/|$)/,
  /^\/dashboard(?:\/|$)/,
]
const lowValueMainContentPatterns = [
  /\bsomething went wrong\b/i,
  /\bnot found\b/i,
  /\bunder construction\b/i,
  /\bloading\b/i,
  /\bplease wait\b/i,
  /\btemporarily unavailable\b/i,
]
const minimumMainContentCharacterCount = 900

const ensureAdsenseScript = (adClientId: string) => {
  if (typeof window === 'undefined') {
    return
  }

  if (window.document.getElementById(adsenseScriptId)) {
    return
  }

  const scriptElement = window.document.createElement('script')
  scriptElement.id = adsenseScriptId
  scriptElement.async = true
  scriptElement.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`
  scriptElement.crossOrigin = 'anonymous'
  window.document.head.appendChild(scriptElement)
}

const getMainContentSnapshot = () => {
  if (typeof window === 'undefined') {
    return {
      characterCount: 0,
      text: '',
    }
  }

  const mainElement = window.document.querySelector('main')
  if (!mainElement) {
    return {
      characterCount: 0,
      text: '',
    }
  }

  const normalizedText = (mainElement.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
  return {
    characterCount: normalizedText.length,
    text: normalizedText,
  }
}

const hasLowValueMainContent = (mainContentText: string) => {
  return lowValueMainContentPatterns.some((pattern) =>
    pattern.test(mainContentText)
  )
}

export function AdSlot({
  slotId,
  className,
  minHeightClassName = 'min-h-[120px]',
  title = 'Sponsored',
}: IAdSlotProps) {
  const { data: session } = useSession()
  const { data: billingData, isLoading: isBillingLoading } = useBillingStatus()
  const pathname = usePathname()
  const [consentValue, setConsentValue] = useState<TAdConsentValue | null>(null)
  const [isReadyForAdsense, setIsReadyForAdsense] = useState(false)
  const [isPageContentReady, setIsPageContentReady] = useState(false)
  const [hasSufficientMainContent, setHasSufficientMainContent] =
    useState(false)
  const [isLowValueMainContent, setIsLowValueMainContent] = useState(false)
  const [hasAdError, setHasAdError] = useState(false)
  const adElementReference = useRef<HTMLElement | null>(null)

  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const effectiveConsentValue = resolveAdConsentValue(consentValue)
  const isEligiblePath = useMemo(() => {
    if (blockedAdPathPatterns.some((pattern) => pattern.test(pathname))) {
      return false
    }
    return adEligiblePathPatterns.some((pattern) => pattern.test(pathname))
  }, [pathname])

  const canRenderAd = useMemo(() => {
    if (
      !isEligiblePath ||
      !isPageContentReady ||
      !hasSufficientMainContent ||
      isLowValueMainContent
    ) {
      return false
    }
    if (session?.user?.id && isBillingLoading) {
      return false
    }
    if (billingData?.currentPlan === 'PRO') {
      return false
    }
    return Boolean(
      slotId &&
        adClientId &&
        effectiveConsentValue === 'accepted' &&
        !hasAdError &&
        isReadyForAdsense
    )
  }, [
    adClientId,
    billingData?.currentPlan,
    effectiveConsentValue,
    hasAdError,
    hasSufficientMainContent,
    isEligiblePath,
    isBillingLoading,
    isLowValueMainContent,
    isPageContentReady,
    isReadyForAdsense,
    session?.user?.id,
    slotId,
  ])

  useEffect(() => {
    setConsentValue(readAdConsentValue())

    const handleConsentChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ value?: TAdConsentValue }>
      if (
        customEvent.detail?.value === 'accepted' ||
        customEvent.detail?.value === 'declined'
      ) {
        setConsentValue(customEvent.detail.value)
      } else {
        setConsentValue(readAdConsentValue())
      }
    }

    window.addEventListener(adConsentChangedEventName, handleConsentChanged)
    return () => {
      window.removeEventListener(
        adConsentChangedEventName,
        handleConsentChanged
      )
    }
  }, [])

  useEffect(() => {
    const handleLoad = () => {
      setIsPageContentReady(true)
    }

    if (window.document.readyState === 'complete') {
      setIsPageContentReady(true)
      return
    }

    window.addEventListener('load', handleLoad)
    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  useEffect(() => {
    if (!isEligiblePath || !isPageContentReady) {
      setHasSufficientMainContent(false)
      setIsLowValueMainContent(false)
      return
    }

    const { characterCount, text } = getMainContentSnapshot()
    setHasSufficientMainContent(
      characterCount >= minimumMainContentCharacterCount
    )
    setIsLowValueMainContent(hasLowValueMainContent(text))
  }, [isEligiblePath, isPageContentReady, pathname])

  useEffect(() => {
    if (
      !isEligiblePath ||
      !isPageContentReady ||
      !hasSufficientMainContent ||
      isLowValueMainContent ||
      !adClientId ||
      effectiveConsentValue !== 'accepted'
    ) {
      setIsReadyForAdsense(false)
      return
    }

    ensureAdsenseScript(adClientId)
    setIsReadyForAdsense(true)
  }, [
    adClientId,
    effectiveConsentValue,
    hasSufficientMainContent,
    isLowValueMainContent,
    isEligiblePath,
    isPageContentReady,
  ])

  useEffect(() => {
    if (!canRenderAd || !adElementReference.current) {
      return
    }

    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (error) {
      console.error('Failed to render ad slot:', error)
      setHasAdError(true)
    }
  }, [canRenderAd])

  if (
    !isEligiblePath ||
    !isPageContentReady ||
    !hasSufficientMainContent ||
    isLowValueMainContent
  ) {
    return null
  }

  if (consentValue === 'declined') {
    return null
  }

  if (
    session?.user?.id &&
    (isBillingLoading || billingData?.currentPlan === 'PRO')
  ) {
    return null
  }

  return (
    <aside
      className={cn(
        'rounded-2xl border border-border/60 bg-card/75 p-3',
        'shadow-sm backdrop-blur',
        className
      )}
      aria-label={title}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div
        className={cn(
          'mt-2 overflow-hidden rounded-xl border border-border/50 bg-background/40 p-2',
          minHeightClassName
        )}
      >
        {canRenderAd ? (
          <ins
            ref={(element) => {
              adElementReference.current = element
            }}
            className="adsbygoogle block w-full"
            style={{ display: 'block', minHeight: '104px' }}
            data-ad-client={adClientId}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex h-full min-h-[104px] items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/15 px-4 text-center text-xs text-muted-foreground">
            Ad space is ready and will render when network settings are active.
          </div>
        )}
      </div>
    </aside>
  )
}
