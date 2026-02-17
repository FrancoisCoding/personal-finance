'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Fingerprint,
  History,
  KeyRound,
  Lock,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useDemoMode } from '@/hooks/use-demo-mode'
import {
  useAccounts,
  useSubscriptions,
  useTransactions,
} from '@/hooks/use-finance-data'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { getCurrentAccessSessionKey } from '@/lib/access-session-client'

type TAuditCategory = 'access' | 'activity' | 'data' | 'alert'
type TAuditSeverity = 'info' | 'success' | 'warning'

interface IAuditEvent {
  id: string
  title: string
  description: string
  category: TAuditCategory
  severity: TAuditSeverity
  timestamp: string
  source: 'system' | 'user'
}

interface IAccessSession {
  id: string
  name: string
  location: string
  lastActiveAt: string
  isCurrent: boolean
  isTrusted: boolean
}

interface ISecurityPreferences {
  isTwoFactorEnabled: boolean
  isBiometricUnlockEnabled: boolean
  isNewDeviceAlertEnabled: boolean
  sessionTimeoutMinutes: 15 | 30 | 60
  shouldShareInsightsExternally: boolean
  shouldIncludeMerchantNamesInExports: boolean
  shouldAutoDeleteExports: boolean
  shouldEncryptExports: boolean
}

type TBooleanPreferenceKey = Exclude<
  keyof ISecurityPreferences,
  'sessionTimeoutMinutes'
>

const securityPreferencesStorageKey = 'financeflow.security-preferences'
const securityAuditStorageKey = 'financeflow.security-audit'
const securityNavigationStorageKey = 'financeflow.show-security-nav'
const securityNavigationEventName = 'financeflow:security-nav-visibility'

const defaultSecurityPreferences: ISecurityPreferences = {
  isTwoFactorEnabled: true,
  isBiometricUnlockEnabled: true,
  isNewDeviceAlertEnabled: true,
  sessionTimeoutMinutes: 30,
  shouldShareInsightsExternally: false,
  shouldIncludeMerchantNamesInExports: true,
  shouldAutoDeleteExports: true,
  shouldEncryptExports: true,
}

const auditFilters: Array<{ label: string; value: 'all' | TAuditCategory }> = [
  { label: 'All', value: 'all' },
  { label: 'Access', value: 'access' },
  { label: 'Activity', value: 'activity' },
  { label: 'Data', value: 'data' },
  { label: 'Alerts', value: 'alert' },
]

const categoryLabels: Record<TAuditCategory, string> = {
  access: 'Access',
  activity: 'Activity',
  data: 'Data',
  alert: 'Alert',
}

const formatAuditTimestamp = (timestamp: string) =>
  new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const getSeverityStyles = (severity: TAuditSeverity) => {
  if (severity === 'success') {
    return {
      label: 'Good',
      iconClass: 'text-emerald-500',
      badgeClass:
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
      Icon: CheckCircle2,
    }
  }
  if (severity === 'warning') {
    return {
      label: 'Review',
      iconClass: 'text-amber-500',
      badgeClass:
        'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
      Icon: ShieldAlert,
    }
  }
  return {
    label: 'Info',
    iconClass: 'text-sky-500',
    badgeClass:
      'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
    Icon: ShieldCheck,
  }
}

const buildDefaultSessions = (): IAccessSession[] => {
  const now = Date.now()
  return [
    {
      id: 'current-browser',
      name: 'Current browser',
      location: 'United States',
      lastActiveAt: new Date(now).toISOString(),
      isCurrent: true,
      isTrusted: true,
    },
    {
      id: 'mobile-app',
      name: 'iPhone app',
      location: 'United States',
      lastActiveAt: new Date(now - 45 * 60 * 1000).toISOString(),
      isCurrent: false,
      isTrusted: true,
    },
    {
      id: 'new-desktop',
      name: 'Unknown desktop',
      location: 'New location',
      lastActiveAt: new Date(now - 9 * 60 * 60 * 1000).toISOString(),
      isCurrent: false,
      isTrusted: false,
    },
  ]
}

export default function SecurityAndPrivacyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDemoMode } = useDemoMode()
  const { toast } = useToast()
  const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts()
  const { data: transactions = [], isLoading: isTransactionsLoading } =
    useTransactions()
  const { data: subscriptions = [], isLoading: isSubscriptionsLoading } =
    useSubscriptions()

  const [securityPreferences, setSecurityPreferences] = useState(
    defaultSecurityPreferences
  )
  const [manualAuditEvents, setManualAuditEvents] = useState<IAuditEvent[]>([])
  const [accessSessions, setAccessSessions] = useState<IAccessSession[]>([])
  const [shouldShowSecurityNavigation, setShouldShowSecurityNavigation] =
    useState(false)
  const [activeAuditFilter, setActiveAuditFilter] = useState<
    'all' | TAuditCategory
  >('all')
  const [isLocalStateReady, setIsLocalStateReady] = useState(false)
  const [isAccessSessionsLoading, setIsAccessSessionsLoading] = useState(true)

  const isDataLoading =
    status === 'loading' ||
    isAccountsLoading ||
    isTransactionsLoading ||
    isSubscriptionsLoading ||
    isAccessSessionsLoading

  useEffect(() => {
    if (status === 'unauthenticated' && !isDemoMode) {
      router.push('/auth/login')
    }
  }, [isDemoMode, router, status])

  useEffect(() => {
    try {
      const storedPreferences = localStorage.getItem(
        securityPreferencesStorageKey
      )
      if (storedPreferences) {
        setSecurityPreferences({
          ...defaultSecurityPreferences,
          ...JSON.parse(storedPreferences),
        })
      }

      const storedAuditEvents = localStorage.getItem(securityAuditStorageKey)
      if (storedAuditEvents) {
        const parsed = JSON.parse(storedAuditEvents)
        if (Array.isArray(parsed)) {
          setManualAuditEvents(parsed)
        }
      }

      const storedSecurityNavigationPreference = localStorage.getItem(
        securityNavigationStorageKey
      )
      setShouldShowSecurityNavigation(
        storedSecurityNavigationPreference === '1'
      )
    } catch {
      setAccessSessions([])
    } finally {
      setIsLocalStateReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isLocalStateReady) return
    localStorage.setItem(
      securityPreferencesStorageKey,
      JSON.stringify(securityPreferences)
    )
  }, [isLocalStateReady, securityPreferences])

  useEffect(() => {
    if (!isLocalStateReady) return
    localStorage.setItem(
      securityAuditStorageKey,
      JSON.stringify(manualAuditEvents)
    )
  }, [isLocalStateReady, manualAuditEvents])

  useEffect(() => {
    if (!isLocalStateReady) return
    localStorage.setItem(
      securityNavigationStorageKey,
      shouldShowSecurityNavigation ? '1' : '0'
    )
    window.dispatchEvent(
      new CustomEvent(securityNavigationEventName, {
        detail: { isVisible: shouldShowSecurityNavigation },
      })
    )
  }, [isLocalStateReady, shouldShowSecurityNavigation])

  const loadAccessSessions = useCallback(async () => {
    if (!isDemoMode && !session?.user?.id) {
      setIsAccessSessionsLoading(false)
      return
    }

    const sessionKey = getCurrentAccessSessionKey()
    try {
      setIsAccessSessionsLoading(true)
      const response = await fetch('/api/security/sessions', {
        headers: sessionKey
          ? {
              'x-access-session-key': sessionKey,
            }
          : undefined,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        setAccessSessions(data)
      } else {
        setAccessSessions([])
      }
    } catch {
      setAccessSessions(buildDefaultSessions())
    } finally {
      setIsAccessSessionsLoading(false)
    }
  }, [isDemoMode, session?.user?.id])

  useEffect(() => {
    if (!isLocalStateReady) return
    loadAccessSessions()
  }, [isLocalStateReady, loadAccessSessions])

  const generatedAuditEvents = useMemo<IAuditEvent[]>(() => {
    const now = Date.now()

    const transactionEvents = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
      .map((transaction) => ({
        id: `txn-${transaction.id}`,
        title:
          transaction.type === 'EXPENSE'
            ? 'Expense synchronized'
            : transaction.type === 'INCOME'
              ? 'Income synchronized'
              : 'Transfer synchronized',
        description:
          `${transaction.description} · ` +
          `${formatCurrency(Math.abs(transaction.amount))}`,
        category: 'activity' as const,
        severity:
          transaction.type === 'EXPENSE' && Math.abs(transaction.amount) >= 600
            ? ('warning' as const)
            : ('info' as const),
        timestamp: new Date(transaction.date).toISOString(),
        source: 'system' as const,
      }))

    const renewalEvents = subscriptions
      .map((subscription) => {
        const daysUntilRenewal = Math.ceil(
          (new Date(subscription.nextBillingDate).getTime() - now) /
            (1000 * 60 * 60 * 24)
        )
        return { subscription, daysUntilRenewal }
      })
      .filter(
        (item) => item.daysUntilRenewal >= 0 && item.daysUntilRenewal <= 14
      )
      .slice(0, 4)
      .map((item) => ({
        id: `renewal-${item.subscription.id}`,
        title: 'Upcoming recurring charge',
        description:
          `${item.subscription.name} renews in ${item.daysUntilRenewal} days ` +
          `for ${formatCurrency(item.subscription.amount)}.`,
        category: 'alert' as const,
        severity:
          item.daysUntilRenewal <= 3 ? ('warning' as const) : ('info' as const),
        timestamp: new Date(item.subscription.nextBillingDate).toISOString(),
        source: 'system' as const,
      }))

    const cardAlerts = accounts
      .filter(
        (account) =>
          account.type === 'CREDIT_CARD' &&
          account.creditLimit !== undefined &&
          account.creditLimit > 0
      )
      .map((account) => {
        const utilization = Math.round(
          (Math.abs(account.balance) / (account.creditLimit ?? 1)) * 100
        )
        return { account, utilization }
      })
      .filter((item) => item.utilization >= 75)
      .map((item) => ({
        id: `card-${item.account.id}-${item.utilization}`,
        title: 'Credit utilization review',
        description:
          `${item.account.name} at ${item.utilization}% utilization ` +
          `(${formatCurrency(Math.abs(item.account.balance))} used).`,
        category: 'alert' as const,
        severity:
          item.utilization >= 90 ? ('warning' as const) : ('info' as const),
        timestamp: new Date().toISOString(),
        source: 'system' as const,
      }))

    const sessionEvents = accessSessions.slice(0, 3).map((currentSession) => ({
      id: `session-${currentSession.id}`,
      title: currentSession.isCurrent
        ? 'Current session validated'
        : 'Active sign-in session',
      description: `${currentSession.name} · ${currentSession.location}`,
      category: 'access' as const,
      severity: currentSession.isTrusted
        ? ('success' as const)
        : ('warning' as const),
      timestamp: currentSession.lastActiveAt,
      source: 'system' as const,
    }))

    return [
      ...sessionEvents,
      ...cardAlerts,
      ...renewalEvents,
      ...transactionEvents,
    ]
  }, [accessSessions, accounts, subscriptions, transactions])

  const auditEvents = useMemo(() => {
    return [...manualAuditEvents, ...generatedAuditEvents]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 60)
  }, [generatedAuditEvents, manualAuditEvents])

  const filteredAuditEvents = useMemo(() => {
    if (activeAuditFilter === 'all') return auditEvents
    return auditEvents.filter((event) => event.category === activeAuditFilter)
  }, [activeAuditFilter, auditEvents])

  const auditCounts = useMemo(() => {
    const counts: Record<'all' | TAuditCategory, number> = {
      all: auditEvents.length,
      access: 0,
      activity: 0,
      data: 0,
      alert: 0,
    }
    auditEvents.forEach((event) => {
      counts[event.category] += 1
    })
    return counts
  }, [auditEvents])

  const sessionsAtRisk = accessSessions.filter(
    (currentSession) => !currentSession.isCurrent && !currentSession.isTrusted
  ).length
  const highPriorityAlerts = auditEvents.filter(
    (event) => event.severity === 'warning'
  ).length
  const privacyToggleCount = [
    securityPreferences.shouldAutoDeleteExports,
    securityPreferences.shouldEncryptExports,
    !securityPreferences.shouldShareInsightsExternally,
    securityPreferences.shouldIncludeMerchantNamesInExports,
  ].filter(Boolean).length

  const privacyCoverage = Math.round((privacyToggleCount / 4) * 100)

  let securityScore = 55
  if (securityPreferences.isTwoFactorEnabled) securityScore += 12
  if (securityPreferences.isBiometricUnlockEnabled) securityScore += 8
  if (securityPreferences.isNewDeviceAlertEnabled) securityScore += 7
  if (securityPreferences.shouldEncryptExports) securityScore += 5
  if (securityPreferences.shouldAutoDeleteExports) securityScore += 5
  if (!securityPreferences.shouldShareInsightsExternally) securityScore += 4
  securityScore -= Math.min(14, sessionsAtRisk * 7)
  securityScore -= Math.min(12, highPriorityAlerts * 2)
  securityScore = Math.max(0, Math.min(100, securityScore))

  const securityScoreStatus =
    securityScore >= 80
      ? 'Strong'
      : securityScore >= 65
        ? 'Good'
        : 'Needs attention'

  const addManualAuditEvent = (
    event: Omit<IAuditEvent, 'id' | 'timestamp' | 'source'>
  ) => {
    setManualAuditEvents((prev) =>
      [
        {
          ...event,
          id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
          source: 'user' as const,
        },
        ...prev,
      ].slice(0, 120)
    )
  }

  const toggleBooleanPreference = (
    key: TBooleanPreferenceKey,
    title: string,
    category: TAuditCategory
  ) => {
    const nextValue = !securityPreferences[key]
    setSecurityPreferences((prev) => ({
      ...prev,
      [key]: nextValue,
    }))
    addManualAuditEvent({
      title,
      description: `${title} turned ${nextValue ? 'on' : 'off'}.`,
      category,
      severity: nextValue ? 'success' : 'warning',
    })
    toast({
      title,
      description: nextValue
        ? 'Enabled successfully.'
        : 'Disabled successfully.',
    })
  }

  const handleSessionTimeoutChange = (minutes: 15 | 30 | 60) => {
    if (securityPreferences.sessionTimeoutMinutes === minutes) return
    setSecurityPreferences((prev) => ({
      ...prev,
      sessionTimeoutMinutes: minutes,
    }))
    addManualAuditEvent({
      title: 'Session timeout updated',
      description: `Session timeout changed to ${minutes} minutes.`,
      category: 'access',
      severity: 'info',
    })
    toast({
      title: 'Session timeout updated',
      description: `Inactive sessions now lock after ${minutes} minutes.`,
    })
  }

  const handleSecurityNavigationPreferenceToggle = () => {
    const nextValue = !shouldShowSecurityNavigation
    setShouldShowSecurityNavigation(nextValue)
    addManualAuditEvent({
      title: 'Sidebar security shortcut updated',
      description: nextValue
        ? 'Security center was pinned to sidebar navigation.'
        : 'Security center was hidden from sidebar navigation.',
      category: 'access',
      severity: 'info',
    })
    toast({
      title: 'Navigation preference saved',
      description: nextValue
        ? 'Security center is now visible in the sidebar.'
        : 'Security center is now hidden from the sidebar.',
    })
  }

  const handleTrustSession = async (sessionId: string) => {
    const targetSession = accessSessions.find(
      (currentSession) => currentSession.id === sessionId
    )
    if (!targetSession || targetSession.isTrusted) return
    try {
      const response = await fetch(`/api/security/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrusted: true }),
      })
      if (!response.ok) {
        throw new Error('Failed to trust session')
      }
      await loadAccessSessions()
    } catch (error) {
      toast({
        title: 'Unable to trust session',
        description: 'Please try again.',
        variant: 'destructive',
      })
      return
    }
    addManualAuditEvent({
      title: 'Session trusted',
      description: `${targetSession.name} marked as trusted.`,
      category: 'access',
      severity: 'success',
    })
  }

  const handleRevokeSession = async (sessionId: string) => {
    const targetSession = accessSessions.find(
      (currentSession) => currentSession.id === sessionId
    )
    if (!targetSession || targetSession.isCurrent) return
    try {
      const response = await fetch(`/api/security/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to revoke session')
      }
      await loadAccessSessions()
    } catch (error) {
      toast({
        title: 'Unable to revoke session',
        description: 'Please try again.',
        variant: 'destructive',
      })
      return
    }
    addManualAuditEvent({
      title: 'Session revoked',
      description: `${targetSession.name} from ${targetSession.location} was removed.`,
      category: 'access',
      severity: 'warning',
    })
    toast({
      title: 'Session revoked',
      description: `${targetSession.name} has been signed out.`,
    })
  }

  const handleRequestSnapshot = () => {
    addManualAuditEvent({
      title: 'Data snapshot requested',
      description: 'A full account snapshot request was submitted.',
      category: 'data',
      severity: 'info',
    })
    toast({
      title: 'Snapshot request received',
      description: 'Your export package is being prepared.',
    })
  }

  const handleClearSearchHistory = () => {
    localStorage.removeItem('finance-search-history')
    addManualAuditEvent({
      title: 'Search history cleared',
      description:
        'Saved global search prompts were removed from this browser.',
      category: 'data',
      severity: 'warning',
    })
    toast({
      title: 'Search history cleared',
      description: 'Stored search suggestions were removed.',
    })
  }

  const handleResetDataControls = () => {
    setSecurityPreferences((prev) => ({
      ...prev,
      shouldShareInsightsExternally: false,
      shouldIncludeMerchantNamesInExports: true,
      shouldAutoDeleteExports: true,
      shouldEncryptExports: true,
    }))
    addManualAuditEvent({
      title: 'Privacy controls reset',
      description: 'Data control settings were reset to secure defaults.',
      category: 'data',
      severity: 'success',
    })
    toast({
      title: 'Privacy controls reset',
      description: 'Secure defaults are now active.',
    })
  }

  const handleExportAuditLog = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      userId: session?.user?.id ?? 'demo-user',
      auditEvents,
      securityPreferences,
    }
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `security-audit-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    addManualAuditEvent({
      title: 'Audit log exported',
      description: 'Security activity log exported as JSON.',
      category: 'data',
      severity: 'info',
    })
    toast({
      title: 'Audit log exported',
      description: 'Download has started.',
    })
  }

  const authenticationControls: Array<{
    key: TBooleanPreferenceKey
    title: string
    description: string
    category: TAuditCategory
    Icon: typeof KeyRound
  }> = [
    {
      key: 'isTwoFactorEnabled',
      title: 'Two-factor sign-in',
      description: 'Require a one-time verification code for new sign-ins.',
      category: 'access',
      Icon: KeyRound,
    },
    {
      key: 'isBiometricUnlockEnabled',
      title: 'Biometric unlock',
      description: 'Require biometric confirmation before sensitive actions.',
      category: 'access',
      Icon: Fingerprint,
    },
    {
      key: 'isNewDeviceAlertEnabled',
      title: 'New device alerts',
      description: 'Notify you when a sign-in happens on an unknown device.',
      category: 'alert',
      Icon: ShieldAlert,
    },
  ]

  const dataControls: Array<{
    key: TBooleanPreferenceKey
    title: string
    description: string
    Icon: typeof Database
  }> = [
    {
      key: 'shouldEncryptExports',
      title: 'Encrypt exported files',
      description: 'Include encryption when generating exported reports.',
      Icon: Lock,
    },
    {
      key: 'shouldAutoDeleteExports',
      title: 'Auto-delete old exports',
      description: 'Remove generated exports after 30 days.',
      Icon: Clock3,
    },
    {
      key: 'shouldIncludeMerchantNamesInExports',
      title: 'Include merchant details',
      description: 'Keep merchant-level details in downloadable exports.',
      Icon: Database,
    },
    {
      key: 'shouldShareInsightsExternally',
      title: 'Share anonymized insights',
      description: 'Allow anonymized analytics sharing to improve suggestions.',
      Icon: ShieldCheck,
    },
  ]

  if (isDataLoading || !isLocalStateReady) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
        <div className="space-y-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`security-summary-${index}`}
              className="border-border/60 bg-card/80 shadow-sm"
            >
              <CardContent className="space-y-4 p-5">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="border-b border-border/60">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={`security-event-${index}`}
                className="h-20 w-full"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session && !isDemoMode) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div
            className={
              'inline-flex items-center gap-2 rounded-full border border-border/60 ' +
              'bg-muted/30 px-3 py-1 text-xs text-muted-foreground'
            }
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Security center
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Security &amp; Privacy
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Review security activity, control access sessions, and manage data
            handling preferences.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRequestSnapshot}>
            <Database className="mr-2 h-4 w-4" />
            Request data snapshot
          </Button>
          <Button onClick={handleExportAuditLog}>
            <Download className="mr-2 h-4 w-4" />
            Export audit log
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Security score
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {securityScore}
              </p>
              <p className="text-xs text-muted-foreground">
                {securityScoreStatus}
              </p>
            </div>
            <Progress value={securityScore} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Active sessions
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {accessSessions.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {sessionsAtRisk === 0
                ? 'No sessions require review'
                : `${sessionsAtRisk} session(s) require attention`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Priority alerts
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {highPriorityAlerts}
            </p>
            <p className="text-xs text-muted-foreground">
              {highPriorityAlerts > 0
                ? 'Review warning items in the audit log'
                : 'No urgent security alerts right now'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Privacy coverage
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {privacyCoverage}%
            </p>
            <p className="text-xs text-muted-foreground">
              {privacyToggleCount}/4 core privacy controls enabled
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="border-b border-border/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Audit log</CardTitle>
                <CardDescription>
                  Security, access, and data events from your account activity.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {auditFilters.map((filterOption) => (
                  <Button
                    key={filterOption.value}
                    size="sm"
                    variant={
                      activeAuditFilter === filterOption.value
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => setActiveAuditFilter(filterOption.value)}
                    aria-pressed={activeAuditFilter === filterOption.value}
                    className="h-8 px-2.5 text-xs"
                  >
                    {filterOption.label} ({auditCounts[filterOption.value]})
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {filteredAuditEvents.length === 0 ? (
              <div
                className={
                  'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
                  'px-4 py-6 text-center'
                }
              >
                <p className="text-sm font-medium text-foreground">
                  No events in this view
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try another filter to view more security activity.
                </p>
              </div>
            ) : (
              filteredAuditEvents.map((event) => {
                const severityStyles = getSeverityStyles(event.severity)
                return (
                  <div
                    key={event.id}
                    className={
                      'rounded-xl border border-border/60 bg-muted/20 px-4 py-3'
                    }
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={
                            'mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ' +
                            'border border-border/60 bg-background'
                          }
                        >
                          <severityStyles.Icon
                            className={`h-4 w-4 ${severityStyles.iconClass}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {event.description}
                          </p>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {categoryLabels[event.category]} ·{' '}
                            {event.source === 'user' ? 'User action' : 'System'}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <span
                          className={
                            'inline-flex items-center rounded-full border px-2 py-0.5 ' +
                            `text-[11px] font-semibold ${severityStyles.badgeClass}`
                          }
                        >
                          {severityStyles.label}
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatAuditTimestamp(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 auto-rows-fr">
          <Card className="border-border/60 bg-card/80 shadow-sm">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Access controls</CardTitle>
              <CardDescription>
                Manage sign-in sessions and authentication requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Sessions
                </p>
                {accessSessions.map((currentSession) => (
                  <div
                    key={currentSession.id}
                    className={
                      'rounded-xl border border-border/60 bg-muted/20 px-3 py-3'
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={
                            'mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ' +
                            'border border-border/60 bg-background'
                          }
                        >
                          {currentSession.name
                            .toLowerCase()
                            .includes('iphone') ? (
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {currentSession.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {currentSession.location} ·{' '}
                            {formatAuditTimestamp(currentSession.lastActiveAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <span
                          className={
                            'inline-flex items-center rounded-full border px-2 py-0.5 ' +
                            'text-[11px] font-semibold ' +
                            (currentSession.isTrusted
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                              : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300')
                          }
                        >
                          {currentSession.isTrusted ? 'Trusted' : 'Review'}
                        </span>
                        {currentSession.isCurrent ? (
                          <span
                            className={
                              'inline-flex items-center rounded-full border border-border/60 ' +
                              'bg-muted/30 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground'
                            }
                          >
                            Current
                          </span>
                        ) : (
                          <>
                            {!currentSession.isTrusted ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  handleTrustSession(currentSession.id)
                                }
                              >
                                Trust
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                handleRevokeSession(currentSession.id)
                              }
                            >
                              Revoke
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Authentication
                </p>
                {authenticationControls.map((control) => (
                  <div
                    key={control.key}
                    className={
                      'flex items-start justify-between gap-3 rounded-xl border ' +
                      'border-border/60 bg-muted/20 px-3 py-3'
                    }
                  >
                    <div className="flex items-start gap-2.5">
                      <control.Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {control.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {control.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={
                        securityPreferences[control.key] ? 'default' : 'outline'
                      }
                      aria-pressed={securityPreferences[control.key]}
                      onClick={() =>
                        toggleBooleanPreference(
                          control.key,
                          control.title,
                          control.category
                        )
                      }
                    >
                      {securityPreferences[control.key] ? 'On' : 'Off'}
                    </Button>
                  </div>
                ))}

                <div
                  className={
                    'flex items-start justify-between gap-3 rounded-xl border ' +
                    'border-border/60 bg-muted/20 px-3 py-3'
                  }
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Show Security Center in navigation
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pin Security &amp; Privacy in the sidebar for quick
                        access.
                      </p>
                      {isDemoMode ? (
                        <p className="text-xs text-emerald-600 dark:text-emerald-300">
                          Always visible in demo mode.
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={
                      isDemoMode || shouldShowSecurityNavigation
                        ? 'default'
                        : 'outline'
                    }
                    onClick={handleSecurityNavigationPreferenceToggle}
                    disabled={isDemoMode}
                    aria-pressed={isDemoMode || shouldShowSecurityNavigation}
                  >
                    {isDemoMode
                      ? 'On (Demo)'
                      : shouldShowSecurityNavigation
                        ? 'On'
                        : 'Off'}
                  </Button>
                </div>

                <div
                  className={
                    'rounded-xl border border-border/60 bg-muted/20 px-3 py-3 ' +
                    'space-y-2'
                  }
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                    Session timeout
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[15, 30, 60].map((minutes) => (
                      <Button
                        key={minutes}
                        size="sm"
                        variant={
                          securityPreferences.sessionTimeoutMinutes === minutes
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() =>
                          handleSessionTimeoutChange(minutes as 15 | 30 | 60)
                        }
                      >
                        {minutes} min
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 shadow-sm">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Data controls</CardTitle>
              <CardDescription>
                Manage export behavior and data retention preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {dataControls.map((control) => (
                <div
                  key={control.key}
                  className={
                    'flex items-start justify-between gap-3 rounded-xl border ' +
                    'border-border/60 bg-muted/20 px-3 py-3'
                  }
                >
                  <div className="flex items-start gap-2.5">
                    <control.Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {control.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {control.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={
                      securityPreferences[control.key] ? 'default' : 'outline'
                    }
                    aria-pressed={securityPreferences[control.key]}
                    onClick={() =>
                      toggleBooleanPreference(
                        control.key,
                        control.title,
                        'data'
                      )
                    }
                  >
                    {securityPreferences[control.key] ? 'On' : 'Off'}
                  </Button>
                </div>
              ))}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={handleClearSearchHistory}>
                  <History className="mr-2 h-4 w-4" />
                  Clear search history
                </Button>
                <Button variant="destructive" onClick={handleResetDataControls}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset privacy defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
