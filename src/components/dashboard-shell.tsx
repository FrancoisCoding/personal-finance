'use client'

// packages
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'
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
import { highlightText } from '@/lib/table'
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
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(sidebarOpenAtom)
  const [searchValue, setSearchValue] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1)
  const blurTimeoutRef = useRef<number | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchPanelId = useId()
  const searchListboxId = `${searchPanelId}-listbox`

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { name: 'Accounts', href: '/accounts', icon: Wallet },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
    { name: 'Financial Assistant', href: '/assistant', icon: Sparkles },
  ]

  const closeSidebar = () => setIsSidebarOpen(false)

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

  const quickQuestions = [
    'Give me a quick summary of my spending in the last 30 days.',
    'What are my top three expense categories right now?',
    'How much cash do I have across checking and savings?',
    'Show me upcoming subscriptions and monthly totals.',
  ]

  const suggestionPool = useMemo(() => {
    const combined = [
      ...searchHistory,
      ...navigation.map((item) => item.name),
      ...quickQuestions,
    ]
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
  }, [navigation, quickQuestions, searchHistory])

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

  const normalizedSearch = searchValue.trim().toLowerCase()
  const askOptionMeta = searchValue.trim()
    ? optionLookup.get(`ask:${searchValue.trim()}`)
    : undefined

  const storeSearchHistory = (value: string) => {
    const trimmedValue = value.trim()
    if (!trimmedValue) return

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
  }

  const handleNavigate = (href: string) => {
    searchInputRef.current?.blur()
    setIsSearchOpen(false)
    setActiveOptionIndex(-1)
    router.push(href)
  }

  const handleAskAssistant = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return
    searchInputRef.current?.blur()
    storeSearchHistory(trimmed)
    setIsSearchOpen(false)
    setActiveOptionIndex(-1)
    router.push(`/assistant?question=${encodeURIComponent(trimmed)}`)
  }

  const handleSearchSubmit = () => {
    const trimmedValue = searchValue.trim()
    if (!trimmedValue) return

    const lower = trimmedValue.toLowerCase()
    const navMatch =
      navigation.find((item) => item.name.toLowerCase() === lower) ??
      navigation.find((item) => item.name.toLowerCase().startsWith(lower)) ??
      navigation.find((item) => item.name.toLowerCase().includes(lower))

    if (navMatch) {
      handleNavigate(navMatch.href)
      return
    }

    handleAskAssistant(trimmedValue)
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

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isSearchOpen) {
        setIsSearchOpen(true)
      }
      setActiveOptionIndex((prev) => {
        if (optionList.length === 0) return -1
        return prev < 0 ? 0 : (prev + 1) % optionList.length
      })
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isSearchOpen) {
        setIsSearchOpen(true)
      }
      setActiveOptionIndex((prev) => {
        if (optionList.length === 0) return -1
        if (prev < 0) return optionList.length - 1
        return prev === 0 ? optionList.length - 1 : prev - 1
      })
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (isSearchOpen && activeOptionIndex >= 0) {
        const option = optionList[activeOptionIndex]
        if (option) {
          handleOptionSelect(option)
        }
        return
      }
      handleSearchSubmit()
      return
    }

    if (event.key === 'Escape') {
      if (isSearchOpen) {
        event.preventDefault()
        setIsSearchOpen(false)
        setActiveOptionIndex(-1)
      }
    }
  }

  const handleSearchFocus = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    setIsSearchOpen(true)
  }

  const handleSearchBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsSearchOpen(false)
      setActiveOptionIndex(-1)
    }, 150)
  }

  const handleSearchContainerBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return
    }
    setIsSearchOpen(false)
  }

  const filteredNavigation = useMemo(() => {
    return navigation
      .filter((item) => {
        if (!searchValue.trim()) return true
        return item.name
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      })
      .slice(0, 5)
  }, [navigation, searchValue])

  const filteredHistory = useMemo(() => {
    return searchHistory
      .filter((item) => {
        if (!searchValue.trim()) return true
        return item
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      })
      .slice(0, 4)
  }, [searchHistory, searchValue])

  const optionList = useMemo(() => {
    const options: Array<{
      id: string
      type: 'ask' | 'navigate' | 'recent' | 'question'
      label: string
      href?: string
    }> = []

    const trimmedValue = searchValue.trim()
    if (trimmedValue) {
      options.push({
        id: `${searchPanelId}-option-ask`,
        type: 'ask',
        label: trimmedValue,
      })
    }

    filteredNavigation.forEach((item, index) => {
      options.push({
        id: `${searchPanelId}-option-nav-${index}`,
        type: 'navigate',
        label: item.name,
        href: item.href,
      })
    })

    filteredHistory.forEach((item, index) => {
      options.push({
        id: `${searchPanelId}-option-recent-${index}`,
        type: 'recent',
        label: item,
      })
    })

    quickQuestions.forEach((question, index) => {
      options.push({
        id: `${searchPanelId}-option-question-${index}`,
        type: 'question',
        label: question,
      })
    })

    return options
  }, [
    filteredHistory,
    filteredNavigation,
    quickQuestions,
    searchPanelId,
    searchValue,
  ])

  const optionLookup = useMemo(() => {
    const map = new Map<string, { id: string; index: number }>()
    optionList.forEach((option, index) => {
      const key = `${option.type}:${option.href ?? option.label}`
      map.set(key, { id: option.id, index })
    })
    return map
  }, [optionList])

  const activeOptionId =
    activeOptionIndex >= 0 ? optionList[activeOptionIndex]?.id : undefined

  const handleOptionSelect = (option: {
    type: 'ask' | 'navigate' | 'recent' | 'question'
    label: string
    href?: string
  }) => {
    if (option.type === 'navigate' && option.href) {
      handleNavigate(option.href)
      return
    }
    handleAskAssistant(option.label)
  }

  useEffect(() => {
    if (!isSearchOpen) {
      setActiveOptionIndex(-1)
      return
    }

    if (optionList.length === 0) {
      setActiveOptionIndex(-1)
      return
    }

    if (activeOptionIndex >= optionList.length) {
      setActiveOptionIndex(0)
    }
  }, [activeOptionIndex, isSearchOpen, optionList.length])

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
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
                  aria-label="Close sidebar"
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
                      aria-current={isActive ? 'page' : undefined}
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
                    aria-label="Open sidebar"
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
                      type="search"
                      placeholder="Search here"
                      className="h-10 rounded-full border-border/60 bg-muted/30 pl-10 text-sm"
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      aria-label="Search the app"
                      aria-expanded={isSearchOpen}
                      aria-controls={searchListboxId}
                      aria-activedescendant={activeOptionId}
                      ref={searchInputRef}
                    />
                    <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                    {isSearchOpen && (
                      <div
                        id={searchPanelId}
                        role="region"
                        aria-label="Search suggestions"
                        className={
                          'absolute left-0 right-0 top-[calc(100%+0.5rem)] ' +
                          'z-50 rounded-2xl border border-border/60 bg-background ' +
                          'p-2 shadow-xl'
                        }
                        onMouseDown={(event) => event.preventDefault()}
                        onFocusCapture={handleSearchFocus}
                        onBlurCapture={handleSearchContainerBlur}
                      >
                        <div
                          id={searchListboxId}
                          role="listbox"
                          aria-label="Search suggestions"
                          className="space-y-2"
                        >
                          {searchValue.trim() && (
                            <button
                              type="button"
                              role="option"
                              aria-selected={
                                askOptionMeta?.index === activeOptionIndex
                              }
                              id={askOptionMeta?.id}
                              onClick={() => handleAskAssistant(searchValue)}
                              onMouseEnter={() => {
                                if (askOptionMeta) {
                                  setActiveOptionIndex(askOptionMeta.index)
                                }
                              }}
                              className={
                                'flex w-full items-center justify-between rounded-xl ' +
                                'px-3 py-2 text-left text-sm transition-colors ' +
                                (askOptionMeta?.index === activeOptionIndex
                                  ? 'bg-muted/50 ring-1 ring-emerald-500/20'
                                  : 'hover:bg-muted/40')
                              }
                            >
                              <span className="font-medium text-foreground">
                                Ask Financial Assistant
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {searchValue.trim()}
                              </span>
                            </button>
                          )}

                          <div
                            className="px-3 pt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            role="presentation"
                          >
                            Navigate
                          </div>
                          <div className="space-y-1">
                            {filteredNavigation.map((item) => {
                              const optionMeta = optionLookup.get(
                                `navigate:${item.href}`
                              )
                              const isActive =
                                optionMeta?.index === activeOptionIndex
                              const isHighlighted =
                                normalizedSearch &&
                                item.name
                                  .toLowerCase()
                                  .includes(normalizedSearch)
                              return (
                                <button
                                  key={item.href}
                                  type="button"
                                  role="option"
                                  aria-selected={isActive}
                                  id={optionMeta?.id}
                                  onClick={() => handleNavigate(item.href)}
                                  onMouseEnter={() => {
                                    if (optionMeta) {
                                      setActiveOptionIndex(optionMeta.index)
                                    }
                                  }}
                                  className={
                                    'flex w-full items-center justify-between rounded-xl ' +
                                    'px-3 py-2 text-left text-sm transition-colors ' +
                                    (isActive
                                      ? 'bg-muted/50 ring-1 ring-emerald-500/20'
                                      : isHighlighted
                                        ? 'bg-muted/40'
                                        : 'hover:bg-muted/40')
                                  }
                                >
                                  <span className="text-foreground">
                                    {highlightText(item.name, searchValue)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Go to page
                                  </span>
                                </button>
                              )
                            })}
                          </div>

                          {searchHistory.length > 0 && (
                            <>
                              <div
                                className="px-3 pt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"
                                role="presentation"
                              >
                                Recent
                              </div>
                              <div className="space-y-1">
                                {filteredHistory.map((item) => {
                                  const optionMeta = optionLookup.get(
                                    `recent:${item}`
                                  )
                                  const isActive =
                                    optionMeta?.index === activeOptionIndex
                                  const isHighlighted =
                                    normalizedSearch &&
                                    item
                                      .toLowerCase()
                                      .includes(normalizedSearch)
                                  return (
                                    <button
                                      key={item}
                                      type="button"
                                      role="option"
                                      aria-selected={isActive}
                                      id={optionMeta?.id}
                                      onClick={() => handleAskAssistant(item)}
                                      onMouseEnter={() => {
                                        if (optionMeta) {
                                          setActiveOptionIndex(optionMeta.index)
                                        }
                                      }}
                                      className={
                                        'flex w-full items-center justify-between rounded-xl ' +
                                        'px-3 py-2 text-left text-sm transition-colors ' +
                                        (isActive
                                          ? 'bg-muted/50 ring-1 ring-emerald-500/20'
                                          : isHighlighted
                                            ? 'bg-muted/40'
                                            : 'hover:bg-muted/40')
                                      }
                                    >
                                      <span className="text-foreground">
                                        {highlightText(item, searchValue)}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Ask again
                                      </span>
                                    </button>
                                  )
                                })}
                              </div>
                            </>
                          )}

                          <div
                            className="px-3 pt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            role="presentation"
                          >
                            Suggested questions
                          </div>
                          <div className="space-y-1">
                            {quickQuestions.map((question) => {
                              const optionMeta = optionLookup.get(
                                `question:${question}`
                              )
                              const isActive =
                                optionMeta?.index === activeOptionIndex
                              const isHighlighted =
                                normalizedSearch &&
                                question
                                  .toLowerCase()
                                  .includes(normalizedSearch)
                              return (
                                <button
                                  key={question}
                                  type="button"
                                  role="option"
                                  aria-selected={isActive}
                                  id={optionMeta?.id}
                                  onClick={() => handleAskAssistant(question)}
                                  onMouseEnter={() => {
                                    if (optionMeta) {
                                      setActiveOptionIndex(optionMeta.index)
                                    }
                                  }}
                                  className={
                                    'flex w-full items-start justify-between rounded-xl ' +
                                    'px-3 py-2 text-left text-sm transition-colors ' +
                                    (isActive
                                      ? 'bg-muted/50 ring-1 ring-emerald-500/20'
                                      : isHighlighted
                                        ? 'bg-muted/40'
                                        : 'hover:bg-muted/40')
                                  }
                                >
                                  <span className="text-foreground">
                                    {highlightText(question, searchValue)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Ask
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <NotificationBell />
                  <ThemeToggle />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full"
                        aria-label="Open user menu"
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

              <main id="main-content" tabIndex={-1} className="flex-1 p-4 lg:p-6">
                {children}
              </main>
            </div>
        </div>
      </div>
      <NotificationCenter />
    </div>
  )
}
