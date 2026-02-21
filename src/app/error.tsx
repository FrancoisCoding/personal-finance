'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface IErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: IErrorPageProps) {
  useEffect(() => {
    console.error('Unhandled app route error:', error)
  }, [error])

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Error
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          We hit an unexpected issue while loading this page.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="w-full sm:w-auto">
            Try again
          </Button>
          <Link href="/support">
            <Button variant="outline" className="w-full sm:w-auto">
              Contact support
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
