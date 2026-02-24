'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type FadeInProps = ComponentPropsWithoutRef<typeof motion.div> & {
  delay?: number
  duration?: number
  yOffset?: number
}

export function FadeIn({
  className,
  delay = 0,
  duration = 0.5,
  yOffset = 12,
  ...props
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion()
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [isVisibleOnMount, setIsVisibleOnMount] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisibleOnMount(true)
      return
    }

    const node = elementRef.current
    if (!node) return

    const checkVisibility = () => {
      const rect = node.getBoundingClientRect()
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight
      const viewportWidth =
        window.innerWidth || document.documentElement.clientWidth
      const isIntersectingViewport =
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < viewportHeight &&
        rect.left < viewportWidth

      if (isIntersectingViewport) {
        setIsVisibleOnMount(true)
      }
    }

    checkVisibility()
    const animationFrameId = window.requestAnimationFrame(checkVisibility)
    const timeoutId = window.setTimeout(checkVisibility, 250)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.clearTimeout(timeoutId)
    }
  }, [shouldReduceMotion])

  return (
    <motion.div
      ref={elementRef}
      className={cn('will-change-transform', className)}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: yOffset }}
      animate={
        shouldReduceMotion || isVisibleOnMount
          ? { opacity: 1, y: 0 }
          : undefined
      }
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true, margin: '-80px' }}
      {...props}
    />
  )
}
