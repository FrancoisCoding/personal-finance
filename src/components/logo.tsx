'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'white' | 'gradient'
}

export function Logo({ className, size = 'md', variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const variantClasses = {
    default: 'text-foreground',
    white: 'text-white',
    gradient:
      'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent',
  }

  return (
    <div className={cn('flex items-center gap-2 font-bold', className)}>
      {/* Modern icon */}
      <div className={cn(
        'relative flex items-center justify-center rounded-xl',
        size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'
      )}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 rounded-xl" />
        
        {/* Icon content */}
        <div className="relative z-10 flex items-center justify-center">
          <svg
            className={cn(
              'text-white',
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
            )}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-teal-400/30 to-sky-400/30 rounded-xl blur-sm" />
      </div>

      {/* Text */}
      <span className={cn(
        'font-extrabold tracking-tight font-display',
        sizeClasses[size],
        variantClasses[variant]
      )}>
        FinanceFlow
      </span>
    </div>
  )
}

// Compact version for smaller spaces
export function LogoCompact({ className, size = 'md', variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const variantClasses = {
    default: 'text-foreground',
    white: 'text-white',
    gradient:
      'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent',
  }

  return (
    <div className={cn('relative flex items-center justify-center rounded-xl', sizeClasses[size], className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 rounded-xl" />
      
      {/* Icon content */}
      <div className="relative z-10 flex items-center justify-center">
        <svg
          className={cn(
            'text-white',
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
          )}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-teal-400/30 to-sky-400/30 rounded-xl blur-sm" />
    </div>
  )
}
