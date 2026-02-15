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
import { useQueryClient } from '@tanstack/react-query'
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
import { useDemoMode } from '@/hooks/use-demo-mode'

export interface IDashboardShellProps {
  children: React.ReactNode
  session?: Session | null
}

/** Dashboard shell with modern sidebar and top navigation. */
export function DashboardShell({ children, session }: IDashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isDemoMode, stopDemoMode } = useDemoMode()
  const queryClient = useQueryClient()
  const [isMounted, setIsMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(sidebarOpenAtom)
  const [searchValue, setSearchValue] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1)
  const blurTimeoutRef = useRef<number | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchPanelId = useId()
  const searchListboxId = `${searchPanelId}-listbox`
  const isDemoReady = isMounted && isDemoMode
  const displayName = isMounted ? session?.user?.name || 'User' : 'User'
  const displayEmail = isMounted ? session?.user?.email || '' : ''
  const displayInitial = displayName.charAt(0) || 'U'

  const navigation = useMemo(
    () => [
      {
        name: 'Overview',
        href: '/dashboard',
        icon: LayoutGrid,
        description: 'Dashboard summary and financial highlights.',
        keywords: ['dashboard', 'home', 'summary', 'insights', 'overview'],
      },
      {
        name: 'Accounts',
        href: '/accounts',
        icon: Wallet,
        description: 'Bank accounts, balances, and cash positions.',
        keywords: ['balances', 'banks', 'cash', 'checking', 'savings'],
      },
      {
        name: 'Transactions',
        href: '/transactions',
        icon: Receipt,
        description: 'Recent activity, categories, and transaction history.',
        keywords: ['activity', 'expenses', 'history', 'spending', 'transfers'],
      },
      {
        name: 'Subscriptions',
        href: '/subscriptions',
        icon: CreditCard,
        description: 'Recurring charges, renewals, and subscriptions.',
        keywords: ['recurring', 'renewals', 'subscriptions', 'upcoming'],
      },
      {
        name: 'Financial Assistant',
        href: '/assistant',
        icon: Sparkles,
        description: 'Ask questions and get personalized guidance.',
        keywords: [
          'advice',
          'assistant',
          'chat',
          'guidance',
          'help',
          'insights',
        ],
      },
    ],
    []
  )

  const closeSidebar = () => setIsSidebarOpen(false)

  const handleExitDemo = () => {
    stopDemoMode()
    queryClient.clear()
    try {
      localStorage.removeItem('finance-demo-walkthrough')
      localStorage.removeItem('finance-demo-loading')
    } catch (error) {
      console.warn('Failed to clear demo data', error)
    }
    router.push('/auth/login')
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  const quickQuestions = useMemo(
    () => [
      {
        text: 'Give me a quick summary of my spending in the last 30 days.',
        keywords: [
          'summary',
          'spending',
          'last 30 days',
          'snapshot',
          'monthly',
        ],
      },
      {
        text: 'What are my top three expense categories right now?',
        keywords: ['categories', 'top', 'spend', 'expenses', 'biggest'],
      },
      {
        text: 'How much cash do I have across checking and savings?',
        keywords: ['cash', 'checking', 'savings', 'balances', 'available'],
      },
      {
        text: 'Show me upcoming subscriptions and monthly totals.',
        keywords: ['subscriptions', 'recurring', 'monthly', 'renewals'],
      },
      {
        text: 'How much did I spend on donations this month?',
        keywords: ['donations', 'charity', 'church', 'giving'],
      },
      {
        text: 'What is my credit card spend this month?',
        keywords: ['credit', 'credit card', 'cards', 'monthly'],
      },
      {
        text: 'Show me my largest transactions over $500.',
        keywords: ['large', 'largest', 'big', 'over', 'transactions'],
      },
      {
        text: 'How is my net worth trending this month?',
        keywords: ['net worth', 'trend', 'growth', 'assets', 'liabilities'],
      },
    ],
    []
  )

  const normalizedSearch = searchValue.trim().toLowerCase()
  const searchTokens = useMemo(() => {
    if (!normalizedSearch) return []
    return normalizedSearch.split(/\s+/).filter(Boolean)
  }, [normalizedSearch])

  const navigationSearchItems = useMemo(() => {
    return navigation.map((item) => ({
      ...item,
      searchText: [item.name, item.description, ...item.keywords]
        .join(' ')
        .toLowerCase(),
    }))
  }, [navigation])

  const questionSuggestions = useMemo(() => {
    const baseQuestions = quickQuestions.map((question) => ({
      ...question,
      searchText: [question.text, ...question.keywords].join(' ').toLowerCase(),
    }))

    if (searchTokens.length === 0) {
      return baseQuestions.slice(0, 5)
    }

    const matches = baseQuestions.filter((question) =>
      searchTokens.some((token) => question.searchText.includes(token))
    )

    return (matches.length > 0 ? matches : baseQuestions).slice(0, 5)
  }, [quickQuestions, searchTokens])

  const suggestionPool = useMemo(() => {
    const combined = [
      ...searchHistory,
      ...navigationSearchItems.map((item) => item.name),
      ...navigationSearchItems.flatMap((item) => item.keywords),
      ...questionSuggestions.map((question) => question.text),
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
  }, [navigationSearchItems, questionSuggestions, searchHistory])

  const suggestion = useMemo(() => {
    const trimmed = searchValue.trim()
    if (!trimmed) return ''
    const lower = trimmed.toLowerCase()
    const match = suggestionPool.find(
      (item) =>
        item.toLowerCase().startsWith(lower) && item.toLowerCase() !== lower
    )
    return match ?? ''
  }, [searchValue, suggestionPool])

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
        localStorage.setItem('finance-search-history', JSON.stringify(next))
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
    const isQuestionLike =
      trimmedValue.includes('?') ||
      /^(how|what|why|when|where|who|can|should|do|is|are|am)\b/i.test(
        trimmedValue
      )
    const navigationMatch =
      navigationSearchItems.find((item) => item.name.toLowerCase() === lower) ??
      navigationSearchItems.find((item) =>
        item.keywords.some((keyword) => keyword.toLowerCase() === lower)
      ) ??
      navigationSearchItems.find((item) =>
        item.name.toLowerCase().startsWith(lower)
      ) ??
      navigationSearchItems.find((item) =>
        item.keywords.some((keyword) => keyword.toLowerCase().startsWith(lower))
      ) ??
      navigationSearchItems.find((item) =>
        item.name.toLowerCase().includes(lower)
      ) ??
      navigationSearchItems.find((item) =>
        item.keywords.some((keyword) => keyword.toLowerCase().includes(lower))
      ) ??
      (searchTokens.length
        ? navigationSearchItems.find((item) =>
            searchTokens.every((token) => item.searchText.includes(token))
          )
        : undefined)

    if (navigationMatch && !isQuestionLike) {
      handleNavigate(navigationMatch.href)
      return
    }

    handleAskAssistant(trimmedValue)
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowRight' && suggestion) {
      const input = searchInputRef.current
      const selectionStart = input?.selectionStart ?? 0
      const selectionEnd = input?.selectionEnd ?? 0
      if (
        selectionStart === selectionEnd &&
        selectionEnd === searchValue.length
      ) {
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
    if (searchTokens.length === 0) {
      return navigationSearchItems.slice(0, 5)
    }
    return navigationSearchItems
      .filter((item) =>
        searchTokens.every((token) => item.searchText.includes(token))
      )
      .slice(0, 5)
  }, [navigationSearchItems, searchTokens])

  const filteredHistory = useMemo(() => {
    if (!normalizedSearch) {
      return searchHistory.slice(0, 4)
    }
    return searchHistory
      .filter((item) => item.toLowerCase().includes(normalizedSearch))
      .slice(0, 4)
  }, [normalizedSearch, searchHistory])

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

    questionSuggestions.forEach((question, index) => {
      options.push({
        id: `${searchPanelId}-option-question-${index}`,
        type: 'question',
        label: question.text,
      })
    })

    return options
  }, [
    filteredHistory,
    filteredNavigation,
    questionSuggestions,
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

  const askOptionMeta = searchValue.trim()
    ? optionLookup.get(`ask:${searchValue.trim()}`)
    : undefined

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
                {displayName.split(' ')[0] || 'User'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your financial overview is ready.
              </p>
            </div>

            <nav className="mt-6 space-y-1.5" data-demo-step="demo-navigation">
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
              {isDemoReady ? (
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl"
                  onClick={handleExitDemo}
                >
                  Exit demo
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              )}
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
                  {isDemoReady ? (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                      Demo
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-1 items-center justify-end gap-3">
                <div
                  className="relative hidden max-w-xs flex-1 items-center md:flex"
                  data-demo-step="demo-search"
                >
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
                    placeholder="Ask a question or jump to a page"
                    className="h-10 rounded-full border-border/60 bg-muted/30 pl-10 text-sm"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    aria-label="Search the app or ask a question"
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

                        {filteredNavigation.length > 0 && (
                          <>
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
                                  item.searchText.includes(normalizedSearch)
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
                                    <div className="flex flex-col">
                                      <span className="text-foreground">
                                        {highlightText(item.name, searchValue)}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {highlightText(
                                          item.description,
                                          searchValue
                                        )}
                                      </span>
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                      Navigate
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          </>
                        )}

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
                                  item.toLowerCase().includes(normalizedSearch)
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

                        {questionSuggestions.length > 0 && (
                          <>
                            <div
                              className="px-3 pt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"
                              role="presentation"
                            >
                              Suggested questions
                            </div>
                            <div className="space-y-1">
                              {questionSuggestions.map((question) => {
                                const optionMeta = optionLookup.get(
                                  `question:${question.text}`
                                )
                                const isActive =
                                  optionMeta?.index === activeOptionIndex
                                const isHighlighted =
                                  normalizedSearch &&
                                  question.searchText.includes(normalizedSearch)
                                return (
                                  <button
                                    key={question.text}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    id={optionMeta?.id}
                                    onClick={() =>
                                      handleAskAssistant(question.text)
                                    }
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
                                      {highlightText(
                                        question.text,
                                        searchValue
                                      )}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Ask
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div data-demo-step="demo-notifications">
                  <NotificationBell />
                </div>
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
                          alt={displayName}
                        />
                        <AvatarFallback>{displayInitial}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {displayName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {displayEmail}
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
                      onClick={isDemoReady ? handleExitDemo : () => signOut()}
                    >
                      {isDemoReady ? 'Exit demo' : 'Sign out'}
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
