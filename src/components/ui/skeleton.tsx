import * as React from 'react'

import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes to style the skeleton container. */
  className?: string
}

/** Generic loading placeholder for cards, tables, and inline content. */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse rounded-md bg-muted/50', className)}
      {...props}
    />
  )
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }
