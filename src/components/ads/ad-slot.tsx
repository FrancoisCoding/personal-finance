'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
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

export function AdSlot({
  slotId,
  className,
  minHeightClassName = 'min-h-[120px]',
  title = 'Sponsored',
}: IAdSlotProps) {
  const [consentValue, setConsentValue] = useState<TAdConsentValue | null>(null)
  const [isReadyForAdsense, setIsReadyForAdsense] = useState(false)
  const [hasAdError, setHasAdError] = useState(false)
  const adElementReference = useRef<HTMLElement | null>(null)

  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const effectiveConsentValue = resolveAdConsentValue(consentValue)
  const canRenderAd = useMemo(() => {
    return Boolean(
      slotId &&
        adClientId &&
        effectiveConsentValue === 'accepted' &&
        !hasAdError &&
        isReadyForAdsense
    )
  }, [adClientId, effectiveConsentValue, hasAdError, isReadyForAdsense, slotId])

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
    if (!adClientId || effectiveConsentValue !== 'accepted') {
      setIsReadyForAdsense(false)
      return
    }

    ensureAdsenseScript(adClientId)
    setIsReadyForAdsense(true)
  }, [adClientId, effectiveConsentValue])

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

  if (consentValue === 'declined') {
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
