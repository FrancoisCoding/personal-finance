'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2', className)}
      classNames={{
        months:
          'relative flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'relative space-y-4',
        month_caption:
          'pointer-events-none relative z-20 flex items-center justify-center px-10 pt-1',
        caption_label: 'text-sm font-medium',
        nav: 'absolute inset-x-0 top-0 z-30 flex items-center justify-between px-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'pointer-events-auto h-8 w-8 border-border/70 bg-background/85 p-0 text-foreground ' +
            'opacity-100 hover:bg-muted/55 hover:text-foreground focus-visible:ring-primary/90 ' +
            'dark:border-primary/70 dark:bg-primary/35 dark:text-primary-foreground dark:hover:bg-primary/50 ' +
            'dark:focus-visible:ring-primary/90'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'pointer-events-auto h-8 w-8 border-border/70 bg-background/85 p-0 text-foreground ' +
            'opacity-100 hover:bg-muted/55 hover:text-foreground focus-visible:ring-primary/90 ' +
            'dark:border-primary/70 dark:bg-primary/35 dark:text-primary-foreground dark:hover:bg-primary/50 ' +
            'dark:focus-visible:ring-primary/90'
        ),
        month_grid: 'relative z-10 mx-auto w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'w-9 rounded-md text-center text-[0.8rem] font-normal text-muted-foreground',
        week: 'mt-2 flex w-full',
        day: 'h-9 w-9 p-0 text-center text-sm',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        chevron: 'h-4 w-4 stroke-[2.4] text-current',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
