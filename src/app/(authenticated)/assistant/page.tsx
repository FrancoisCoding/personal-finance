'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useDemoMode } from '@/hooks/use-demo-mode'
import {
  useAccounts,
  useSubscriptions,
  useTransactions,
} from '@/hooks/use-finance-data'
import {
  Bot,
  CreditCard,
  Send,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

const quickPrompts = [
  {
    title: 'Spending snapshot',
    prompt: 'Give me a quick summary of my spending in the last 30 days.',
  },
  {
    title: 'Top categories',
    prompt: 'What are my top three expense categories right now?',
  },
  {
    title: 'Cash position',
    prompt: 'How much cash do I have across checking and savings?',
  },
  {
    title: 'Recurring charges',
    prompt: 'Show me upcoming subscriptions and monthly totals.',
  },
  {
    title: 'Trend check',
    prompt: 'Are there any new spending spikes I should know about?',
  },
  {
    title: 'Next best step',
    prompt: 'Suggest one action to improve my cash flow this month.',
  },
] as const

const capabilityCards = [
  {
    title: 'Spending trends',
    description: 'Spot category shifts, spikes, and month-over-month changes.',
    icon: TrendingUp,
  },
  {
    title: 'Account health',
    description: 'Summaries across accounts, balances, and cash on hand.',
    icon: Wallet,
  },
  {
    title: 'Subscription review',
    description: 'Highlight recurring charges and upcoming renewals.',
    icon: CreditCard,
  },
  {
    title: 'Actionable insights',
    description: 'Clear next steps based on your real activity.',
    icon: Sparkles,
  },
] as const

const buildWelcomeMessage = (): Message => ({
  id: `welcome-${Date.now()}`,
  content: [
    "Hi, I'm your Financial Assistant.",
    'I can translate your data into clear, friendly guidance.',
    '',
    'Try a prompt to get started.',
  ].join('\n'),
  role: 'assistant',
  timestamp: new Date(),
})

const formatMessageTime = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

export default function FinancialAssistantPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { isDemoMode } = useDemoMode()
  const { data: transactions = [], isLoading: isTransactionsLoading } =
    useTransactions()
  const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts()
  const { data: subscriptions = [], isLoading: isSubscriptionsLoading } =
    useSubscriptions()

  const [messages, setMessages] = useState<Message[]>([buildWelcomeMessage()])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastQuestionRef = useRef<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (status === 'loading') return

    if (!session && !isDemoMode) {
      router.push('/auth/login')
      return
    }
  }, [session, status, router, isDemoMode])

  const handleSendMessage = useCallback(
    async (overrideMessage?: string) => {
      const trimmed = (overrideMessage ?? input).trim()
      if (!trimmed || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        content: trimmed,
        role: 'user',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      try {
        const now = new Date()
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        const accountLookup = new Map(
          accounts.map((account) => [account.id, account])
        )
        const recentTransactions = transactions.filter(
          (transaction) => new Date(transaction.date) >= ninetyDaysAgo
        )

        const context = {
          generatedAt: now.toISOString(),
          transactions: recentTransactions.map((transaction) => {
            const account = accountLookup.get(transaction.accountId)
            return {
              description: transaction.description,
              amount: transaction.amount,
              category:
                transaction.categoryRelation?.name ||
                transaction.category ||
                undefined,
              type: transaction.type,
              date: transaction.date,
              accountId: transaction.accountId,
              accountName: account?.name ?? transaction.account?.name,
              accountType: account?.type ?? transaction.account?.type,
            }
          }),
          accounts: accounts.map((account) => ({
            id: account.id,
            name: account.name,
            type: account.type,
            balance: account.balance,
            creditLimit: account.creditLimit,
          })),
          subscriptions: subscriptions.map((subscription) => ({
            name: subscription.name,
            amount: subscription.amount,
            billingCycle: subscription.billingCycle,
            nextBillingDate: subscription.nextBillingDate,
          })),
        }

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, context }),
        })

        const data = await response.json().catch(() => null)
        if (!response.ok) {
          const errorMessage =
            data?.error || 'Failed to get a response. Please try again.'
          throw new Error(errorMessage)
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data?.response || 'No response generated.',
          role: 'assistant',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error('Assistant error:', error)
        toast({
          title: 'Assistant error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to get a response. Please check your OpenRouter setup.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [accounts, input, isLoading, subscriptions, toast, transactions]
  )

  useEffect(() => {
    const questionParam = searchParams.get('question') ?? ''
    const trimmed = questionParam.trim()
    if (!trimmed || status !== 'authenticated' || isLoading) return
    if (lastQuestionRef.current === trimmed) return
    lastQuestionRef.current = trimmed
    handleSendMessage(trimmed)
  }, [searchParams, status, isLoading, handleSendMessage])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const handleNewThread = () => {
    setMessages([buildWelcomeMessage()])
    setInput('')
    inputRef.current?.focus()
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentTransactionCount = transactions.filter(
    (transaction) => new Date(transaction.date) >= thirtyDaysAgo
  ).length

  const isDataLoading =
    isTransactionsLoading || isAccountsLoading || isSubscriptionsLoading

  if (status === 'loading' || isDataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-border/60 bg-card/80 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="flex min-h-[360px] flex-col gap-4 pt-4">
              <div className="flex-1 rounded-2xl border border-border/60 bg-muted/15 p-4">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`assistant-skeleton-${index}`}
                      className="flex gap-3"
                    >
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <Skeleton className="h-16 w-full" />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardHeader>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={`assistant-prompt-${index}`}
                    className="h-10 w-full"
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton
                      key={`assistant-stat-${index}`}
                      className="h-16 w-full rounded-xl"
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={`assistant-tag-${index}`}
                        className="h-6 w-24 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div
        className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        data-demo-step="demo-assistant-header"
      >
        <div className="space-y-1">
          <div
            className={
              'inline-flex items-center gap-2 rounded-full border ' +
              'border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground'
            }
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            Financial Assistant
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Friendly financial guidance, on demand.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Ask about spending, cash flow, or subscriptions and get clear next
            steps based on your activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleNewThread}>
            New thread
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card
          className="border-border/60 bg-card/80 shadow-sm"
          data-demo-step="demo-assistant-chat"
        >
          <CardHeader className="border-b border-border/60 bg-muted/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Financial Assistant</CardTitle>
                  <CardDescription>
                    Friendly, clear answers from your real data.
                  </CardDescription>
                </div>
              </div>
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Ready to help
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-[360px] flex-col gap-4 pt-4">
            <div className="flex-1 rounded-2xl border border-border/60 bg-muted/15 p-4">
              <div
                className={
                  'flex min-h-[200px] max-h-[260px] flex-col gap-5 ' +
                  'overflow-y-auto pr-2 sm:max-h-[320px]'
                }
              >
                {messages.map((message) => {
                  const isUser = message.role === 'user'
                  return (
                    <div key={message.id} className="flex gap-3">
                      <div
                        className={
                          'mt-1 flex h-8 w-8 items-center justify-center rounded-full ' +
                          (isUser
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : 'bg-sky-500/10 text-sky-400')
                        }
                      >
                        {isUser ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={
                            'flex items-center justify-between text-xs ' +
                            'text-muted-foreground'
                          }
                        >
                          <span className="font-medium text-foreground">
                            {isUser ? 'You' : 'Assistant'}
                          </span>
                          <span>{formatMessageTime(message.timestamp)}</span>
                        </div>
                        <div
                          className={
                            'mt-2 rounded-2xl border px-4 py-3 text-sm shadow-sm ' +
                            (isUser
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-foreground'
                              : 'border-border/60 bg-background/80 text-foreground')
                          }
                        >
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {isLoading && (
                  <div className="flex gap-3">
                    <div
                      className={
                        'mt-1 flex h-8 w-8 items-center justify-center ' +
                        'rounded-full bg-sky-500/10 text-sky-400'
                      }
                    >
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div
                        className={
                          'flex items-center justify-between text-xs ' +
                          'text-muted-foreground'
                        }
                      >
                        <span className="font-medium text-foreground">
                          Assistant
                        </span>
                        <span>Thinking</span>
                      </div>
                      <div
                        className={
                          'mt-2 rounded-2xl border border-border/60 ' +
                          'bg-background/80 px-4 py-3'
                        }
                      >
                        <div className="flex items-center gap-2">
                          {[0, 1, 2].map((dot) => (
                            <span
                              key={dot}
                              className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                              style={{ animationDelay: `${dot * 0.15}s` }}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground">
                            Gathering insights...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div
              className="rounded-2xl border border-border/60 bg-background/80 p-4"
              data-demo-step="demo-assistant-composer"
            >
              <div className="flex flex-col gap-3">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about spending, cash flow, or subscriptions..."
                  className="min-h-[64px] resize-none border-border/60"
                  disabled={isLoading}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send, Shift + Enter for a new line.
                  </p>
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="gap-2"
                  >
                    Send
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card
            className="border-border/60 bg-card/80 shadow-sm"
            data-demo-step="demo-assistant-prompts"
          >
            <CardHeader>
              <CardTitle className="text-lg">Suggested prompts</CardTitle>
              <CardDescription>
                Pick a starting point and I will take it from there.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt.title}
                  variant="outline"
                  className="h-auto items-start px-3 py-2 text-left"
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                >
                  <span className="text-xs font-medium text-foreground">
                    {prompt.title}
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card
            className="border-border/60 bg-card/80 shadow-sm"
            data-demo-step="demo-assistant-context"
          >
            <CardHeader>
              <CardTitle className="text-lg">Context snapshot</CardTitle>
              <CardDescription>What I can see right now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">Accounts</p>
                  <p className="text-sm font-semibold text-foreground">
                    {accounts.length}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-sm font-semibold text-foreground">
                    {recentTransactionCount}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">Subscriptions</p>
                  <p className="text-sm font-semibold text-foreground">
                    {subscriptions.length}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  How I can help
                </p>
                <div className="flex flex-wrap gap-2">
                  {capabilityCards.map((capability) => {
                    const Icon = capability.icon
                    return (
                      <span
                        key={capability.title}
                        className={
                          'flex items-center gap-2 rounded-full border ' +
                          'border-border/60 bg-muted/20 px-3 py-1 text-xs ' +
                          'text-muted-foreground'
                        }
                      >
                        <Icon className="h-3.5 w-3.5 text-emerald-500" />
                        {capability.title}
                      </span>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
