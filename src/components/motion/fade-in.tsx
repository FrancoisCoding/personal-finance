"use client"

import type { ComponentPropsWithoutRef } from 'react'
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

  return (
    <motion.div
      className={cn('will-change-transform', className)}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: yOffset }}
      whileInView={
        shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
      }
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
