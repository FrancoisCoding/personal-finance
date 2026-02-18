'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, LogOut, RefreshCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface IAdminSummary {
  usersCount: number
  contactsCount: number
  activeSessionsCount: number
  activeSubscriptions: number
  trialingSubscriptions: number
}

interface IAdminSubscription {
  id: string
  plan: string
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface IAdminSession {
  id: string
  sessionKey: string
  name: string
  location: string
  isTrusted: boolean
  lastActiveAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface IAdminContact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

interface IAdminAnalyticsResponse {
  summary: IAdminSummary
  subscriptions?: IAdminSubscription[]
  sessions?: IAdminSession[]
}

interface IAdminContactsResponse {
  total: number
  page: number
  pageSize: number
  contacts: IAdminContact[]
}

interface IAdminSubscriptionsResponse {
  total: number
  page: number
  pageSize: number
  subscriptions: IAdminSubscription[]
}

interface IAdminSessionsResponse {
  total: number
  page: number
  pageSize: number
  sessions: IAdminSession[]
}

const formatTimestamp = (value: string | null) => {
  if (!value) return '--'
  return new Date(value).toLocaleString()
}

export default function AdminPortalPage() {
  const pageSize = 25
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [summary, setSummary] = useState<IAdminSummary | null>(null)
  const [subscriptions, setSubscriptions] = useState<IAdminSubscription[]>([])
  const [sessions, setSessions] = useState<IAdminSession[]>([])
  const [contacts, setContacts] = useState<IAdminContact[]>([])
  const [contactsTotal, setContactsTotal] = useState(0)
  const [subscriptionsTotal, setSubscriptionsTotal] = useState(0)
  const [sessionsTotal, setSessionsTotal] = useState(0)
  const [contactsPage, setContactsPage] = useState(1)
  const [subscriptionsPage, setSubscriptionsPage] = useState(1)
  const [sessionsPage, setSessionsPage] = useState(1)
  const [contactsQuery, setContactsQuery] = useState('')
  const [subscriptionsQuery, setSubscriptionsQuery] = useState('')
  const [sessionsQuery, setSessionsQuery] = useState('')
  const [contactsInputValue, setContactsInputValue] = useState('')
  const [subscriptionsInputValue, setSubscriptionsInputValue] = useState('')
  const [sessionsInputValue, setSessionsInputValue] = useState('')
  const [isContactsLoading, setIsContactsLoading] = useState(false)
  const [isSubscriptionsLoading, setIsSubscriptionsLoading] = useState(false)
  const [isSessionsLoading, setIsSessionsLoading] = useState(false)
  const [deletingContactId, setDeletingContactId] = useState<string | null>(
    null
  )

  const loadSummary = useCallback(async () => {
    setErrorMessage('')
    const analyticsResponse = await fetch('/api/admin/analytics')
    const analyticsPayload = await analyticsResponse.json().catch(() => ({}))
    if (!analyticsResponse.ok) {
      throw new Error(analyticsPayload?.error || 'Failed to load analytics.')
    }

    const analyticsData = analyticsPayload as IAdminAnalyticsResponse
    setSummary(analyticsData.summary)
  }, [])

  const loadContacts = useCallback(
    async (options?: { page?: number; query?: string }) => {
      setIsContactsLoading(true)
      setErrorMessage('')
      try {
        const targetPage = options?.page ?? contactsPage
        const targetQuery = options?.query ?? contactsQuery
        const response = await fetch(
          `/api/admin/contacts?page=${targetPage}&pageSize=${pageSize}&q=${encodeURIComponent(
            targetQuery
          )}`
        )
        const payload = (await response.json().catch(() => ({}))) as
          | IAdminContactsResponse
          | { error?: string }
        if (!response.ok) {
          throw new Error(
            (payload as { error?: string })?.error || 'Failed to load contacts.'
          )
        }
        const data = payload as IAdminContactsResponse
        setContacts(data.contacts)
        setContactsTotal(data.total)
        setContactsPage(data.page)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load contacts.'
        )
      } finally {
        setIsContactsLoading(false)
      }
    },
    [contactsPage, contactsQuery]
  )

  const loadSubscriptions = useCallback(
    async (options?: { page?: number; query?: string }) => {
      setIsSubscriptionsLoading(true)
      setErrorMessage('')
      try {
        const targetPage = options?.page ?? subscriptionsPage
        const targetQuery = options?.query ?? subscriptionsQuery
        const response = await fetch(
          `/api/admin/subscriptions?page=${targetPage}&pageSize=${pageSize}&q=${encodeURIComponent(
            targetQuery
          )}`
        )
        const payload = (await response.json().catch(() => ({}))) as
          | IAdminSubscriptionsResponse
          | { error?: string }
        if (!response.ok) {
          throw new Error(
            (payload as { error?: string })?.error ||
              'Failed to load subscriptions.'
          )
        }
        const data = payload as IAdminSubscriptionsResponse
        setSubscriptions(data.subscriptions)
        setSubscriptionsTotal(data.total)
        setSubscriptionsPage(data.page)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to load subscriptions.'
        )
      } finally {
        setIsSubscriptionsLoading(false)
      }
    },
    [subscriptionsPage, subscriptionsQuery]
  )

  const loadSessions = useCallback(
    async (options?: { page?: number; query?: string }) => {
      setIsSessionsLoading(true)
      setErrorMessage('')
      try {
        const targetPage = options?.page ?? sessionsPage
        const targetQuery = options?.query ?? sessionsQuery
        const response = await fetch(
          `/api/admin/sessions?page=${targetPage}&pageSize=${pageSize}&q=${encodeURIComponent(
            targetQuery
          )}`
        )
        const payload = (await response.json().catch(() => ({}))) as
          | IAdminSessionsResponse
          | { error?: string }
        if (!response.ok) {
          throw new Error(
            (payload as { error?: string })?.error || 'Failed to load sessions.'
          )
        }
        const data = payload as IAdminSessionsResponse
        setSessions(data.sessions)
        setSessionsTotal(data.total)
        setSessionsPage(data.page)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load sessions.'
        )
      } finally {
        setIsSessionsLoading(false)
      }
    },
    [sessionsPage, sessionsQuery]
  )

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      await Promise.all([
        loadSummary(),
        loadContacts({ page: contactsPage, query: contactsQuery }),
        loadSubscriptions({
          page: subscriptionsPage,
          query: subscriptionsQuery,
        }),
        loadSessions({ page: sessionsPage, query: sessionsQuery }),
      ])
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load admin data.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [
    contactsPage,
    contactsQuery,
    loadContacts,
    loadSessions,
    loadSubscriptions,
    loadSummary,
    sessionsPage,
    sessionsQuery,
    subscriptionsPage,
    subscriptionsQuery,
  ])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    const timer = setTimeout(() => {
      setContactsPage(1)
      setContactsQuery(contactsInputValue.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [contactsInputValue])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubscriptionsPage(1)
      setSubscriptionsQuery(subscriptionsInputValue.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [subscriptionsInputValue])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSessionsPage(1)
      setSessionsQuery(sessionsInputValue.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [sessionsInputValue])

  useEffect(() => {
    if (isLoading) return
    void loadContacts()
  }, [contactsPage, contactsQuery, isLoading, loadContacts])

  useEffect(() => {
    if (isLoading) return
    void loadSubscriptions()
  }, [isLoading, loadSubscriptions, subscriptionsPage, subscriptionsQuery])

  useEffect(() => {
    if (isLoading) return
    void loadSessions()
  }, [isLoading, loadSessions, sessionsPage, sessionsQuery])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  const handleDeleteContact = async (contactId: string) => {
    setDeletingContactId(contactId)
    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contactId }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete contact.')
      }
      await Promise.all([loadSummary(), loadContacts()])
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete contact.'
      )
    } finally {
      setDeletingContactId(null)
    }
  }

  const summaryCards = useMemo(
    () =>
      summary
        ? [
            { label: 'Platform users', value: summary.usersCount.toString() },
            { label: 'Messages', value: summary.contactsCount.toString() },
            {
              label: 'Active subscriptions',
              value: summary.activeSubscriptions.toString(),
            },
            {
              label: 'Trialing subscriptions',
              value: summary.trialingSubscriptions.toString(),
            },
            {
              label: 'Recent active sessions',
              value: summary.activeSessionsCount.toString(),
            },
          ]
        : [],
    [summary]
  )

  const contactsTotalPages = Math.max(1, Math.ceil(contactsTotal / pageSize))
  const subscriptionsTotalPages = Math.max(
    1,
    Math.ceil(subscriptionsTotal / pageSize)
  )
  const sessionsTotalPages = Math.max(1, Math.ceil(sessionsTotal / pageSize))

  const contactsExportUrl = useMemo(
    () =>
      `/api/admin/export?type=contacts&q=${encodeURIComponent(contactsQuery)}`,
    [contactsQuery]
  )
  const subscriptionsExportUrl = useMemo(
    () =>
      `/api/admin/export?type=subscriptions&q=${encodeURIComponent(
        subscriptionsQuery
      )}`,
    [subscriptionsQuery]
  )
  const sessionsExportUrl = useMemo(
    () =>
      `/api/admin/export?type=sessions&q=${encodeURIComponent(sessionsQuery)}`,
    [sessionsQuery]
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Admin portal</h1>
            <p className="text-sm text-muted-foreground">
              Monitor contacts, subscriptions, users, and session activity.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map((card) => (
            <Card key={card.label} className="border-border/70 bg-card/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {card.value}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Contact submissions</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    value={contactsInputValue}
                    onChange={(event) =>
                      setContactsInputValue(event.target.value)
                    }
                    placeholder="Search contacts..."
                    className="h-10 w-full sm:w-56"
                  />
                  <Button asChild variant="outline" className="h-10">
                    <a href={contactsExportUrl}>Export CSV</a>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  Showing{' '}
                  {contactsTotal === 0 ? 0 : (contactsPage - 1) * pageSize + 1}-
                  {Math.min(contactsPage * pageSize, contactsTotal)} of{' '}
                  {contactsTotal}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={contactsPage <= 1 || isContactsLoading}
                    onClick={() =>
                      setContactsPage((value) => Math.max(1, value - 1))
                    }
                  >
                    Prev
                  </Button>
                  <span>
                    Page {contactsPage} / {contactsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      contactsPage >= contactsTotalPages || isContactsLoading
                    }
                    onClick={() =>
                      setContactsPage((value) =>
                        Math.min(contactsTotalPages, value + 1)
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isContactsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading contacts...
                </div>
              ) : contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No support messages yet.
                </p>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-xl border border-border/60 bg-background/70 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{contact.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact.name} ({contact.email}) •{' '}
                          {formatTimestamp(contact.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.id)}
                        disabled={deletingContactId === contact.id}
                      >
                        {deletingContactId === contact.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {contact.message}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 bg-card/90">
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Paid users</CardTitle>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={subscriptionsInputValue}
                      onChange={(event) =>
                        setSubscriptionsInputValue(event.target.value)
                      }
                      placeholder="Search subscriptions..."
                      className="h-10 w-full sm:w-56"
                    />
                    <Button asChild variant="outline" className="h-10">
                      <a href={subscriptionsExportUrl}>Export CSV</a>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Showing{' '}
                    {subscriptionsTotal === 0
                      ? 0
                      : (subscriptionsPage - 1) * pageSize + 1}
                    -
                    {Math.min(subscriptionsPage * pageSize, subscriptionsTotal)}{' '}
                    of {subscriptionsTotal}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        subscriptionsPage <= 1 || isSubscriptionsLoading
                      }
                      onClick={() =>
                        setSubscriptionsPage((value) => Math.max(1, value - 1))
                      }
                    >
                      Prev
                    </Button>
                    <span>
                      Page {subscriptionsPage} / {subscriptionsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        subscriptionsPage >= subscriptionsTotalPages ||
                        isSubscriptionsLoading
                      }
                      onClick={() =>
                        setSubscriptionsPage((value) =>
                          Math.min(subscriptionsTotalPages, value + 1)
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isSubscriptionsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading subscriptions...
                  </div>
                ) : subscriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No subscriptions found.
                  </p>
                ) : (
                  subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="rounded-lg border border-border/60 bg-background/70 p-2 text-sm"
                    >
                      <p className="font-medium">
                        {subscription.user.name || subscription.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subscription.user.email}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {subscription.plan} • {subscription.status}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Trial ends: {formatTimestamp(subscription.trialEndsAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Period ends:{' '}
                        {formatTimestamp(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/90">
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Recent login locations</CardTitle>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={sessionsInputValue}
                      onChange={(event) =>
                        setSessionsInputValue(event.target.value)
                      }
                      placeholder="Search sessions..."
                      className="h-10 w-full sm:w-56"
                    />
                    <Button asChild variant="outline" className="h-10">
                      <a href={sessionsExportUrl}>Export CSV</a>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Showing{' '}
                    {sessionsTotal === 0
                      ? 0
                      : (sessionsPage - 1) * pageSize + 1}
                    -{Math.min(sessionsPage * pageSize, sessionsTotal)} of{' '}
                    {sessionsTotal}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={sessionsPage <= 1 || isSessionsLoading}
                      onClick={() =>
                        setSessionsPage((value) => Math.max(1, value - 1))
                      }
                    >
                      Prev
                    </Button>
                    <span>
                      Page {sessionsPage} / {sessionsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        sessionsPage >= sessionsTotalPages || isSessionsLoading
                      }
                      onClick={() =>
                        setSessionsPage((value) =>
                          Math.min(sessionsTotalPages, value + 1)
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isSessionsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading sessions...
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No login sessions found.
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-lg border border-border/60 bg-background/70 p-2 text-xs"
                    >
                      <p className="font-medium text-sm">
                        {session.user.name || session.user.email}
                      </p>
                      <p className="text-muted-foreground">
                        {session.location}
                      </p>
                      <p className="text-muted-foreground">
                        {formatTimestamp(session.lastActiveAt)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
