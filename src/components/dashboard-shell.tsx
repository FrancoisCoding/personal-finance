'use client'

// packages
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useAtom } from 'jotai'
import {
  CreditCard,
  LayoutGrid,
  Menu,
  Search,
  Receipt,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react'

// components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogoCompact } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  NotificationBell,
  NotificationCenter,
} from '@/components/notification-system'

// utils
import { cn } from '@/lib/utils'
import { sidebarOpenAtom } from '@/store/ui-atoms'

export interface IDashboardShellProps {
  children: React.ReactNode
  session?: Session | null
}

/** Dashboard shell with modern sidebar and top navigation. */
export function DashboardShell({ children, session }: IDashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(sidebarOpenAtom)
  const [searchValue, setSearchValue] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { name: 'Accounts', href: '/accounts', icon: Wallet },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
    { name: 'Financial Assistant', href: '/assistant', icon: Sparkles },
  ]

  const closeSidebar = () => setIsSidebarOpen(false)

  useEffect(() => {
    const paramValue = searchParams.get('search') ?? ''
    if (pathname === '/transactions' && paramValue !== searchValue) {
      setSearchValue(paramValue)
    }
  }, [pathname, searchParams, searchValue])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('finance-search-history')
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setSearchHistory(parsed.filter((item) => typeof item === 'string'))
      }
    } catch (error) {
      console.warn('Failed to load search history', error)
    }
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('finance-search-suggestions')
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setSearchSuggestions(parsed.filter((item) => typeof item === 'string'))
      }
    } catch (error) {
      console.warn('Failed to load search suggestions', error)
    }
  }, [])

  const suggestionPool = useMemo(() => {
    const combined = [...searchHistory, ...searchSuggestions]
    const deduped = new Map<string, string>()
    combined.forEach((item) => {
      const trimmed = item.trim()
      if (!trimmed) return
      const key = trimmed.toLowerCase()
      if (!deduped.has(key)) {
        deduped.set(key, trimmed)
      }
    })
    return Array.from(deduped.values())
  }, [searchHistory, searchSuggestions])

  const suggestion = useMemo(() => {
    const trimmed = searchValue.trim()
    if (!trimmed) return ''
    const lower = trimmed.toLowerCase()
    const match = suggestionPool.find(
      (item) =>
        item.toLowerCase().startsWith(lower) &&
        item.toLowerCase() !== lower
    )
    return match ?? ''
  }, [searchValue, suggestionPool])

  const handleSearchSubmit = () => {
    const trimmedValue = searchValue.trim()
    if (!trimmedValue) {
      if (pathname === '/transactions') {
        router.push('/transactions')
      }
      return
    }

    setSearchHistory((prev) => {
      const next = [
        trimmedValue,
        ...prev.filter(
          (item) => item.toLowerCase() !== trimmedValue.toLowerCase()
        ),
      ].slice(0, 8)
      try {
        localStorage.setItem(
          'finance-search-history',
          JSON.stringify(next)
        )
      } catch (error) {
        console.warn('Failed to save search history', error)
      }
      return next
    })

    router.push(`/transactions?search=${encodeURIComponent(trimmedValue)}`)
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowRight' && suggestion) {
      const input = searchInputRef.current
      const selectionStart = input?.selectionStart ?? 0
      const selectionEnd = input?.selectionEnd ?? 0
      if (selectionStart === selectionEnd && selectionEnd === searchValue.length) {
        event.preventDefault()
        setSearchValue(suggestion)
        requestAnimationFrame(() => {
          searchInputRef.current?.setSelectionRange(
            suggestion.length,
            suggestion.length
          )
        })
      }
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearchSubmit()
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="relative min-h-screen px-4 py-6 lg:px-8 lg:py-8">
        <div className="grid min-h-[calc(100vh-3rem)] grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            {isSidebarOpen && (
              <button
                aria-label="Close sidebar"
                className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                onClick={closeSidebar}
              />
            )}
            <aside
              className={cn(
                'fixed inset-y-6 left-4 z-50 w-[260px] translate-x-[-120%] rounded-[24px] border border-border/60 bg-white/90 p-5 shadow-lg transition-transform duration-200 dark:bg-slate-950/95 lg:static lg:translate-x-0 lg:self-start lg:h-fit lg:shadow-sm',
                isSidebarOpen && 'translate-x-0'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <LogoCompact size="sm" className="flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      FinanceFlow
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      Smart finance
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden flex-shrink-0"
                  onClick={closeSidebar}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Welcome back
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {session?.user?.name?.split(' ')[0] || 'User'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your financial overview is ready.
                </p>
              </div>

              <nav className="mt-6 space-y-1.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeSidebar}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </div>
            </aside>

            <div className="flex min-h-full flex-col">
              <div className="flex flex-wrap items-center justify-between gap-4 px-1 pb-4 pt-2 lg:px-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <LayoutGrid className="h-4 w-4 text-emerald-500" />
                    Overview
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-end gap-3">
                  <div className="relative hidden max-w-xs flex-1 items-center md:flex">
                    {suggestion && searchValue.trim() && (
                      <div
                        className={
                          'pointer-events-none absolute inset-y-0 left-10 right-4 ' +
                          'flex items-center text-sm text-muted-foreground/50'
                        }
                      >
                        <span className="text-transparent">{searchValue}</span>
                        <span>{suggestion.slice(searchValue.length)}</span>
                      </div>
                    )}
                    <Input
                      placeholder="Search here"
                      className="h-10 rounded-full border-border/60 bg-muted/30 pl-10 text-sm"
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      ref={searchInputRef}
                    />
                    <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  <NotificationBell />
                  <ThemeToggle />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={session?.user?.image || ''}
                            alt={session?.user?.name || ''}
                          />
                          <AvatarFallback>
                            {session?.user?.name?.charAt(0) ||
                              session?.user?.email?.charAt(0) ||
                              'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session?.user?.name || 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session?.user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => signOut()}
                      >
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex-1 p-4 lg:p-6">
                {children}
              </div>
            </div>
        </div>
      </div>
      <NotificationCenter />
    </div>
  )
}
