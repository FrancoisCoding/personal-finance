import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
          Page not found
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          The page you requested does not exist or may have moved.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button className="w-full sm:w-auto">Back to home</Button>
          </Link>
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
