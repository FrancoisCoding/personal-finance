'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, LogOut, RefreshCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  subscriptions: IAdminSubscription[]
  sessions: IAdminSession[]
}

const formatTimestamp = (value: string | null) => {
  if (!value) return '--'
  return new Date(value).toLocaleString()
}

export default function AdminPortalPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [summary, setSummary] = useState<IAdminSummary | null>(null)
  const [subscriptions, setSubscriptions] = useState<IAdminSubscription[]>([])
  const [sessions, setSessions] = useState<IAdminSession[]>([])
  const [contacts, setContacts] = useState<IAdminContact[]>([])
  const [deletingContactId, setDeletingContactId] = useState<string | null>(
    null
  )

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [analyticsResponse, contactsResponse] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/contacts'),
      ])

      const analyticsPayload = await analyticsResponse.json().catch(() => ({}))
      if (!analyticsResponse.ok) {
        throw new Error(analyticsPayload?.error || 'Failed to load analytics.')
      }

      const contactsPayload = await contactsResponse.json().catch(() => ({}))
      if (!contactsResponse.ok) {
        throw new Error(contactsPayload?.error || 'Failed to load contacts.')
      }

      const analyticsData = analyticsPayload as IAdminAnalyticsResponse
      setSummary(analyticsData.summary)
      setSubscriptions(analyticsData.subscriptions)
      setSessions(analyticsData.sessions)
      setContacts((contactsPayload?.contacts as IAdminContact[]) ?? [])
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load admin data.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
      setContacts((previous) =>
        previous.filter((contact) => contact.id !== contactId)
      )
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
            <CardHeader>
              <CardTitle>Contact submissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.length === 0 ? (
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
              <CardHeader>
                <CardTitle>Paid users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {subscriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No subscriptions found.
                  </p>
                ) : (
                  subscriptions.slice(0, 20).map((subscription) => (
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
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/90">
              <CardHeader>
                <CardTitle>Recent login locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No login sessions found.
                  </p>
                ) : (
                  sessions.slice(0, 20).map((session) => (
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
