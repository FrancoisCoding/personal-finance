'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function LandingNavbar() {
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <Logo size="lg" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-1">
              <Link href="/features">
                <Button variant="ghost" size="sm">
                  Features
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="ghost" size="sm">
                  Pricing
                </Button>
              </Link>
            </div>
            <ThemeToggle />
            {session ? (
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
