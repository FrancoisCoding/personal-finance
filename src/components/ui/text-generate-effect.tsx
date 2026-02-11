'use client'

import type { ElementType } from 'react'
import { useEffect } from 'react'
import { motion, stagger, useAnimate } from 'framer-motion'
import { cn } from '@/lib/utils'

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  as: Component = 'div',
}: {
  words: string
  className?: string
  filter?: boolean
  duration?: number
  as?: ElementType
}) => {
  const [scope, animate] = useAnimate()
  const wordsArray = words.split(' ')

  useEffect(() => {
    animate(
      'span',
      {
        opacity: 1,
        filter: filter ? 'blur(0px)' : 'none',
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      }
    )
  }, [animate, duration, filter, words])

  const renderWords = () => {
    return (
      <motion.span ref={scope} className="inline-block">
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="opacity-0"
              style={{
                filter: filter ? 'blur(10px)' : 'none',
              }}
            >
              {word}{' '}
            </motion.span>
          )
        })}
      </motion.span>
    )
  }

  return (
    <Component className={cn('font-bold', className)}>
      {renderWords()}
    </Component>
  )
}
