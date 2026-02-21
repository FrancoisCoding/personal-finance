'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface IGlobalErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalErrorPage({
  error,
  reset,
}: IGlobalErrorPageProps) {
  useEffect(() => {
    console.error('Unhandled global app error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Critical error
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold">
              We could not load FinanceFlow
            </h1>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Please retry. If this keeps happening, refresh the page or check
              back in a few minutes.
            </p>
            <div className="mt-8">
              <Button onClick={reset}>Reload app</Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
