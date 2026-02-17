'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useId,
} from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useDemoMode } from '@/hooks/use-demo-mode'

// Utility function to safely extract category name
function getCategoryName(category: unknown): string | null {
  if (typeof category === 'string') {
    return category
  }
  if (category && typeof category === 'object' && 'name' in category) {
    return (category as { name: string }).name
  }
  return null
}

const getSeverityBadgeClasses = (severity: NotificationType) => {
  switch (severity) {
    case 'success':
      return 'border-emerald-500/30 text-emerald-500'
    case 'error':
      return 'border-rose-500/30 text-rose-500'
    case 'warning':
      return 'border-amber-500/30 text-amber-500'
    case 'info':
      return 'border-sky-500/30 text-sky-500'
    default:
      return 'border-border/60 text-muted-foreground'
  }
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export const notificationThresholds = {
  lowBalance: 500,
  utilizationWarning: 70,
  budgetWarningRatio: 0.85,
  budgetOverRatio: 1,
  spendingSpikeRatio: 0.25,
  spendingSpikeMinimum: 200,
  largeTransactionMinimum: 500,
  largeTransactionMultiplier: 3,
  subscriptionLookaheadDays: 7,
  goalDeadlineDays: 14,
  goalProgressWarning: 0.8,
  incomeDropRatio: 0.8,
} as const

const budgetWarningPercent = Math.round(
  notificationThresholds.budgetWarningRatio * 100
)
const spendingSpikePercent = Math.round(
  notificationThresholds.spendingSpikeRatio * 100
)
const incomeDropPercent = Math.round(
  (1 - notificationThresholds.incomeDropRatio) * 100
)

export interface IAlertRuleDefinition {
  id: string
  title: string
  description: string
  category: string
  severity: NotificationType
  detail: string
  defaultEnabled: boolean
}

export const alertRules: IAlertRuleDefinition[] = [
  {
    id: 'low-balance',
    title: 'Low cash balance',
    description: 'Warn when combined checking and savings dip too low.',
    category: 'system',
    severity: 'warning',
    detail: `Cash below ${formatCurrency(notificationThresholds.lowBalance)}.`,
    defaultEnabled: true,
  },
  {
    id: 'credit-utilization',
    title: 'Credit utilization elevated',
    description: 'Alert when credit card utilization stays high.',
    category: 'budget',
    severity: 'warning',
    detail: `Utilization above ${notificationThresholds.utilizationWarning}%.`,
    defaultEnabled: true,
  },
  {
    id: 'budget-warning',
    title: 'Budget nearing limit',
    description: 'Heads-up when a budget is close to its cap.',
    category: 'budget',
    severity: 'warning',
    detail: `Usage above ${budgetWarningPercent}%.`,
    defaultEnabled: true,
  },
  {
    id: 'budget-over',
    title: 'Budget exceeded',
    description: 'Critical alert when a budget is overspent.',
    category: 'budget',
    severity: 'error',
    detail: 'Usage over 100%.',
    defaultEnabled: true,
  },
  {
    id: 'spending-spike',
    title: 'Spending spike detected',
    description: 'Detect unusual week-over-week spending increases.',
    category: 'transaction',
    severity: 'warning',
    detail: `Weekly spend up ${spendingSpikePercent}% and ${formatCurrency(
      notificationThresholds.spendingSpikeMinimum
    )}+.`,
    defaultEnabled: true,
  },
  {
    id: 'large-transaction',
    title: 'Large transaction',
    description: 'Flag unusually large expenses that need review.',
    category: 'transaction',
    severity: 'info',
    detail: `Expense above ${formatCurrency(
      notificationThresholds.largeTransactionMinimum
    )} or 3x average.`,
    defaultEnabled: true,
  },
  {
    id: 'subscription-due',
    title: 'Subscription due soon',
    description: 'Remind you before a subscription renews.',
    category: 'system',
    severity: 'info',
    detail: `Renews within ${notificationThresholds.subscriptionLookaheadDays} days.`,
    defaultEnabled: true,
  },
  {
    id: 'subscription-new',
    title: 'New subscription added',
    description: 'Alert when a new recurring charge is detected.',
    category: 'system',
    severity: 'success',
    detail: 'New recurring charge added.',
    defaultEnabled: true,
  },
  {
    id: 'goal-deadline',
    title: 'Goal deadline approaching',
    description: 'Prompt when goals are behind schedule.',
    category: 'goal',
    severity: 'warning',
    detail: `Deadline within ${notificationThresholds.goalDeadlineDays} days and <80% funded.`,
    defaultEnabled: true,
  },
  {
    id: 'goal-complete',
    title: 'Goal achieved',
    description: 'Celebrate when you reach a financial goal.',
    category: 'goal',
    severity: 'success',
    detail: 'Goal hits 100% funding.',
    defaultEnabled: true,
  },
  {
    id: 'goal-new',
    title: 'New goal added',
    description: 'Confirm new goals are set up correctly.',
    category: 'goal',
    severity: 'success',
    detail: 'New goal created.',
    defaultEnabled: true,
  },
  {
    id: 'income-drop',
    title: 'Income trending down',
    description: 'Warn when income dips compared to last month.',
    category: 'system',
    severity: 'warning',
    detail: `Income down ${incomeDropPercent}% vs last month.`,
    defaultEnabled: true,
  },
]

const alertRuleGroups = alertRules.reduce<
  Record<string, IAlertRuleDefinition[]>
>((groups, rule) => {
  const category =
    rule.category.charAt(0).toUpperCase() + rule.category.slice(1)
  if (!groups[category]) {
    groups[category] = []
  }
  groups[category].push(rule)
  return groups
}, {})

const orderedAlertRuleGroups = Object.entries(alertRuleGroups).sort(
  ([a], [b]) => a.localeCompare(b)
)

const defaultAlertRuleState = alertRules.reduce<Record<string, boolean>>(
  (acc, rule) => {
    acc[rule.id] = rule.defaultEnabled
    return acc
  },
  {}
)

const alertRulesStorageKeyBase = 'financeflow.alert-rules'
const notificationHistoryStorageKeyBase = 'financeflow.notification-history'
const notificationHistoryLimit = 160

// Notification interface
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  showToast?: boolean
  dedupeKey?: string
  throttleMinutes?: number
  ruleId?: string
  action?: {
    label: string
    onClick: () => void
  }
  category?: 'transaction' | 'budget' | 'goal' | 'system' | 'reminder' | string
}

// Notification context
interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  showNotificationCenter: boolean
  setShowNotificationCenter: (show: boolean) => void
  alertRuleState: Record<string, boolean>
  toggleAlertRule: (id: string) => void
  resetAlertRules: () => void
  isAlertRuleEnabled: (id: string) => boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

// Notification provider
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const { isDemoMode } = useDemoMode()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [alertRuleState, setAlertRuleState] = useState<Record<string, boolean>>(
    () => ({ ...defaultAlertRuleState })
  )
  const dedupeCacheRef = useRef<Map<string, number>>(new Map())
  const userId = session?.user?.id ?? null
  const isServerPersistenceEnabled = Boolean(userId) && !isDemoMode
  const alertRulesStorageKey = userId
    ? `${alertRulesStorageKeyBase}.${userId}`
    : alertRulesStorageKeyBase
  const notificationHistoryStorageKey = userId
    ? `${notificationHistoryStorageKeyBase}.${userId}`
    : notificationHistoryStorageKeyBase

  const unreadCount = notifications.filter((n) => !n.read).length

  const parseNotifications = useCallback((data: unknown) => {
    if (!Array.isArray(data)) return []
    return data
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const rawNotification = item as Record<string, unknown>
        const timestampValue =
          typeof rawNotification.timestamp === 'string'
            ? rawNotification.timestamp
            : ''
        const timestamp = new Date(timestampValue)
        return {
          ...(rawNotification as Omit<Notification, 'timestamp' | 'read'>),
          timestamp,
          read: Boolean(rawNotification.read),
          showToast:
            typeof rawNotification.showToast === 'boolean'
              ? rawNotification.showToast
              : true,
        } as Notification
      })
      .filter((item) => !Number.isNaN(item.timestamp.getTime()))
      .slice(0, notificationHistoryLimit)
  }, [])

  const hydrateFromLocalStorage = useCallback(() => {
    setAlertRuleState({ ...defaultAlertRuleState })
    try {
      const stored = window.localStorage.getItem(alertRulesStorageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object') {
          setAlertRuleState({ ...defaultAlertRuleState, ...parsed })
        }
      }
    } catch (error) {
      console.warn('Failed to load alert rules', error)
    }

    try {
      const stored = window.localStorage.getItem(notificationHistoryStorageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        const hydrated = parseNotifications(parsed)
        setNotifications(hydrated)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.warn('Failed to load notification history', error)
    }
  }, [alertRulesStorageKey, notificationHistoryStorageKey, parseNotifications])

  const hydrateFromServer = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts')
      if (!response.ok) {
        throw new Error('Failed to fetch alert persistence state')
      }
      const payload = await response.json()
      const persistedNotifications = parseNotifications(payload?.notifications)
      setNotifications(persistedNotifications)
      if (payload?.ruleState && typeof payload.ruleState === 'object') {
        setAlertRuleState({ ...defaultAlertRuleState, ...payload.ruleState })
      } else {
        setAlertRuleState({ ...defaultAlertRuleState })
      }
    } catch (error) {
      console.warn('Failed to hydrate alerts from server', error)
      hydrateFromLocalStorage()
    }
  }, [hydrateFromLocalStorage, parseNotifications])

  useEffect(() => {
    if (isServerPersistenceEnabled) {
      void hydrateFromServer()
      return
    }
    hydrateFromLocalStorage()
  }, [
    hydrateFromLocalStorage,
    hydrateFromServer,
    isServerPersistenceEnabled,
    userId,
  ])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        alertRulesStorageKey,
        JSON.stringify(alertRuleState)
      )
    } catch (error) {
      console.warn('Failed to persist alert rules', error)
    }
  }, [alertRuleState, alertRulesStorageKey])

  useEffect(() => {
    try {
      const payload = notifications
        .slice(0, notificationHistoryLimit)
        .map((notification) => {
          const { timestamp, ...rest } = notification
          return {
            ...rest,
            action: undefined,
            timestamp: timestamp.toISOString(),
          }
        })
      window.localStorage.setItem(
        notificationHistoryStorageKey,
        JSON.stringify(payload)
      )
    } catch (error) {
      console.warn('Failed to persist notification history', error)
    }
  }, [notificationHistoryStorageKey, notifications])

  const persistAlertMutation = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!isServerPersistenceEnabled) return
      try {
        await fetch('/api/alerts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (error) {
        console.warn('Failed to persist alert mutation', error)
      }
    },
    [isServerPersistenceEnabled]
  )

  const persistCreatedNotification = useCallback(
    async (notification: Notification) => {
      if (!isServerPersistenceEnabled) return
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: notification.type,
            title: notification.title,
            message: notification.message,
            timestamp: notification.timestamp.toISOString(),
            read: notification.read,
            showToast: notification.showToast ?? true,
            dedupeKey: notification.dedupeKey,
            throttleMinutes: notification.throttleMinutes,
            ruleId: notification.ruleId,
            category: notification.category,
          }),
        })
        if (!response.ok) return
        const persisted = await response.json()
        if (typeof persisted?.id !== 'string') return
        const timestamp = new Date(persisted.timestamp)
        if (Number.isNaN(timestamp.getTime())) return

        setNotifications((prev) => {
          const withoutOptimistic = prev.filter(
            (item) => item.id !== notification.id
          )
          const persistedNotification: Notification = {
            ...notification,
            id: persisted.id,
            timestamp,
            read: Boolean(persisted.read),
            showToast: persisted.showToast ?? notification.showToast,
          }
          const deduped = withoutOptimistic.filter(
            (item) => item.id !== persistedNotification.id
          )
          return [persistedNotification, ...deduped].slice(
            0,
            notificationHistoryLimit
          )
        })
      } catch (error) {
        console.warn('Failed to persist new notification', error)
      }
    },
    [isServerPersistenceEnabled]
  )

  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const now = Date.now()
    const dedupeKey = notification.dedupeKey
    const throttleMinutes = notification.throttleMinutes ?? 240
    const throttleMs = throttleMinutes * 60 * 1000

    if (dedupeKey) {
      const cachedTimestamp = dedupeCacheRef.current.get(dedupeKey)
      if (cachedTimestamp && now - cachedTimestamp < throttleMs) {
        return
      }

      if (typeof window !== 'undefined') {
        try {
          const storageKey = userId
            ? `financeflow.notification.${userId}.${dedupeKey}`
            : `financeflow.notification.${dedupeKey}`
          const storedTimestamp = window.localStorage.getItem(storageKey)
          if (storedTimestamp && now - Number(storedTimestamp) < throttleMs) {
            dedupeCacheRef.current.set(dedupeKey, Number(storedTimestamp))
            return
          }
          window.localStorage.setItem(storageKey, String(now))
        } catch (error) {
          console.warn('Failed to access notification storage', error)
        }
      }

      dedupeCacheRef.current.set(dedupeKey, now)
    }

    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      showToast: notification.showToast ?? true,
    }
    setNotifications((prev) =>
      [newNotification, ...prev].slice(0, notificationHistoryLimit)
    )
    void persistCreatedNotification(newNotification)
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    void persistAlertMutation({ action: 'mark-read', id })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    void persistAlertMutation({ action: 'mark-all-read' })
  }

  const clearRead = () => {
    setNotifications((prev) =>
      prev.filter((notification) => !notification.read)
    )
    void persistAlertMutation({ action: 'clear-read' })
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    void persistAlertMutation({ action: 'remove', id })
  }

  const clearAll = () => {
    setNotifications([])
    void persistAlertMutation({ action: 'clear-all' })
  }

  const toggleAlertRule = (id: string) => {
    const nextValue = !(alertRuleState[id] ?? true)
    setAlertRuleState((prev) => ({ ...prev, [id]: nextValue }))
    void persistAlertMutation({
      action: 'set-rule',
      ruleId: id,
      enabled: nextValue,
    })
  }

  const resetAlertRules = () => {
    setAlertRuleState({ ...defaultAlertRuleState })
    void persistAlertMutation({ action: 'reset-rules' })
  }

  const isAlertRuleEnabled = (id: string) => alertRuleState[id] ?? true

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearRead,
        removeNotification,
        clearAll,
        showNotificationCenter,
        setShowNotificationCenter,
        alertRuleState,
        toggleAlertRule,
        resetAlertRules,
        isAlertRuleEnabled,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }
  return context
}

// Individual notification item
function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead, removeNotification } = useNotifications()
  const isUnread = !notification.read

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'error':
        return <AlertTriangle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getIconTone = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-emerald-500/15 text-emerald-500'
      case 'error':
        return 'bg-rose-500/15 text-rose-500'
      case 'warning':
        return 'bg-amber-500/15 text-amber-500'
      case 'info':
        return 'bg-sky-500/15 text-sky-500'
      default:
        return 'bg-muted/40 text-muted-foreground'
    }
  }

  const getCategoryColor = () => {
    const categoryName = getCategoryName(notification.category)

    switch (categoryName) {
      case 'transaction':
        return (
          'bg-blue-50/50 text-blue-700 border-blue-200/60 ' +
          'dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/30'
        )
      case 'budget':
        return (
          'bg-green-50/50 text-green-700 border-green-200/60 ' +
          'dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30'
        )
      case 'goal':
        return (
          'bg-purple-50/50 text-purple-700 border-purple-200/60 ' +
          'dark:bg-violet-500/10 dark:text-violet-200 dark:border-violet-500/30'
        )
      case 'reminder':
        return (
          'bg-orange-50/50 text-orange-700 border-orange-200/60 ' +
          'dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-500/30'
        )
      default:
        return 'bg-muted/30 text-muted-foreground border-border/60'
    }
  }

  return (
    <Card
      className={cn(
        'cursor-pointer rounded-2xl border transition-all ' +
          'bg-background/60 hover:bg-muted/30',
        isUnread
          ? 'border-emerald-500/30 bg-emerald-500/5 shadow-sm'
          : 'border-border/60'
      )}
      onClick={() => markAsRead(notification.id)}
      role="button"
      tabIndex={0}
      aria-label={`${notification.title}. ${notification.message}`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          markAsRead(notification.id)
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'mt-0.5 flex h-9 w-9 items-center justify-center rounded-full',
              getIconTone()
            )}
          >
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {notification.title}
                  </h4>
                  {isUnread && (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
                      New
                    </span>
                  )}
                  {notification.category && (
                    <Badge
                      variant="outline"
                      className={cn('text-[10px]', getCategoryColor())}
                    >
                      {getCategoryName(notification.category) || 'Unknown'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  removeNotification(notification.id)
                }}
                aria-label="Dismiss notification"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.timestamp, {
                  addSuffix: true,
                })}
              </span>
              {notification.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    notification.action?.onClick()
                  }}
                >
                  {notification.action.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Notification center
export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearRead,
    clearAll,
    showNotificationCenter,
    setShowNotificationCenter,
    alertRuleState,
    toggleAlertRule,
    resetAlertRules,
  } = useNotifications()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<'history' | 'rules'>('history')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  )
  const readNotifications = notifications.filter(
    (notification) => notification.read
  )
  const readCount = readNotifications.length

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread' && notification.read) return false
    if (filter === 'read' && !notification.read) return false
    if (categoryFilter !== 'all') {
      // Get the category name, handling both string and object cases
      const categoryName = getCategoryName(notification.category)

      if (categoryName !== categoryFilter) return false
    }
    return true
  })

  const categories = Array.from(
    new Set(
      notifications
        .map((n) => getCategoryName(n.category))
        .filter((category): category is string => category !== null)
    )
  ).sort((a, b) => a.localeCompare(b))

  const categoryCounts = categories.reduce<Record<string, number>>(
    (counts, category) => {
      counts[category] = notifications.filter(
        (notification) => getCategoryName(notification.category) === category
      ).length
      return counts
    },
    {}
  )

  const historyStats = useMemo(() => {
    if (notifications.length === 0) {
      return { last7: 0, last30: 0 }
    }
    const now = Date.now()
    const weekMs = 7 * 24 * 60 * 60 * 1000
    const monthMs = 30 * 24 * 60 * 60 * 1000
    let last7 = 0
    let last30 = 0
    notifications.forEach((notification) => {
      const diff = now - notification.timestamp.getTime()
      if (diff <= weekMs) last7 += 1
      if (diff <= monthMs) last30 += 1
    })
    return { last7, last30 }
  }, [notifications])

  const ruleActivity = useMemo(() => {
    const map = new Map<string, { count: number; lastTriggered?: Date }>()
    notifications.forEach((notification) => {
      if (!notification.ruleId) return
      const existing = map.get(notification.ruleId)
      const nextCount = (existing?.count ?? 0) + 1
      const lastTriggered =
        !existing?.lastTriggered ||
        notification.timestamp > existing.lastTriggered
          ? notification.timestamp
          : existing.lastTriggered
      map.set(notification.ruleId, {
        count: nextCount,
        lastTriggered,
      })
    })
    return map
  }, [notifications])

  const filterOptions = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadNotifications.length },
    { id: 'read', label: 'Read', count: readCount },
  ] as const

  const filteredUnread = filteredNotifications.filter(
    (notification) => !notification.read
  )
  const filteredRead = filteredNotifications.filter(
    (notification) => notification.read
  )

  useEffect(() => {
    if (!showNotificationCenter) return
    panelRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotificationCenter(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showNotificationCenter, setShowNotificationCenter])

  if (!showNotificationCenter) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={() => setShowNotificationCenter(false)}
        aria-hidden="true"
      />
      <div
        className="absolute right-4 top-4 bottom-4 w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={panelRef}
      >
        <div
          className={
            'flex h-full flex-col rounded-2xl border border-border/60 ' +
            'bg-card/95 shadow-2xl'
          }
        >
          <div className="border-b border-border/60 px-5 py-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <p
                    className="text-lg font-semibold text-foreground"
                    id={titleId}
                  >
                    Alerts center
                  </p>
                  {unreadCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-emerald-500 border-emerald-500/30"
                    >
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notifications.length > 0
                    ? 'Track alerts, rules, and financial signals.'
                    : 'You are all caught up.'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotificationCenter(false)}
                className="h-8 w-8 p-0"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-full bg-muted/30 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    'h-7 px-3 text-xs rounded-full',
                    activeTab === 'history'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  History
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('rules')}
                  className={cn(
                    'h-7 px-3 text-xs rounded-full',
                    activeTab === 'rules'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Rules
                </Button>
              </div>
              {activeTab === 'rules' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAlertRules}
                  className="h-8 px-3 text-xs"
                >
                  Reset defaults
                </Button>
              )}
            </div>
            {activeTab === 'history' && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="h-8 px-3 text-xs"
                >
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRead}
                  disabled={readCount === 0}
                  className="h-8 px-3 text-xs"
                >
                  Clear read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="h-8 px-3 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {activeTab === 'history' ? (
            <>
              <div className="px-5 py-3 border-b border-border/60 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {filterOptions.map((option) => {
                    const isActive = filter === option.id
                    return (
                      <Button
                        key={option.id}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-7 px-3 text-xs rounded-full',
                          isActive
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        onClick={() => setFilter(option.id)}
                      >
                        {option.label}
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          {option.count}
                        </span>
                      </Button>
                    )
                  })}
                </div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Categories
                    </span>
                    {['all', ...categories].map((category) => {
                      const isActive = categoryFilter === category
                      return (
                        <Button
                          key={category}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'h-7 px-3 text-xs rounded-full',
                            isActive
                              ? 'bg-muted text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                          onClick={() => setCategoryFilter(category)}
                        >
                          {category === 'all'
                            ? 'All'
                            : category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          {category !== 'all' && (
                            <span className="ml-2 text-[10px] text-muted-foreground">
                              {categoryCounts[category] ?? 0}
                            </span>
                          )}
                        </Button>
                      )
                    })}
                  </div>
                )}
                {notifications.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">
                        Last 7 days
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {historyStats.last7}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">
                        Last 30 days
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {historyStats.last30}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <div
                      className={
                        'rounded-xl border border-dashed border-border/70 ' +
                        'bg-muted/20 px-4 py-6 text-center'
                      }
                    >
                      <p className="text-sm font-medium text-foreground">
                        No notifications
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Everything is up to date.
                      </p>
                    </div>
                  ) : filter === 'all' ? (
                    <div className="space-y-4">
                      {filteredUnread.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="uppercase tracking-[0.2em]">
                              New
                            </span>
                            <span>{filteredUnread.length}</span>
                          </div>
                          {filteredUnread.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                            />
                          ))}
                        </div>
                      )}
                      {filteredRead.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="uppercase tracking-[0.2em]">
                              Earlier
                            </span>
                            <span>{filteredRead.length}</span>
                          </div>
                          {filteredRead.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-6">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Alert rules
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Toggle what signals should create alerts and toast updates.
                  </p>
                </div>
                {orderedAlertRuleGroups.map(([category, rules]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="uppercase tracking-[0.2em]">
                        {category}
                      </span>
                      <span>{rules.length}</span>
                    </div>
                    {rules.map((rule) => {
                      const isEnabled = alertRuleState[rule.id] ?? true
                      const ruleMeta = ruleActivity.get(rule.id)
                      return (
                        <div
                          key={rule.id}
                          className={cn(
                            'rounded-2xl border border-border/60 bg-muted/10 p-4',
                            !isEnabled && 'opacity-70'
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">
                                  {rule.title}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-[10px]',
                                    getSeverityBadgeClasses(rule.severity)
                                  )}
                                >
                                  {rule.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {rule.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {rule.detail}
                              </p>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isEnabled}
                              aria-label={`Toggle ${rule.title}`}
                              onClick={() => toggleAlertRule(rule.id)}
                              className={cn(
                                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                isEnabled ? 'bg-emerald-500/80' : 'bg-muted/60'
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                                  isEnabled ? 'translate-x-5' : 'translate-x-1'
                                )}
                              />
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>
                              {ruleMeta?.count
                                ? `${ruleMeta.count} alert${
                                    ruleMeta.count === 1 ? '' : 's'
                                  }`
                                : 'No alerts yet'}
                            </span>
                            <span>
                              {ruleMeta?.lastTriggered
                                ? formatDistanceToNow(ruleMeta.lastTriggered, {
                                    addSuffix: true,
                                  })
                                : 'Not triggered yet'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}

// Notification bell component
export function NotificationBell() {
  const { unreadCount, showNotificationCenter, setShowNotificationCenter } =
    useNotifications()
  const hasUnread = unreadCount > 0
  const label = hasUnread
    ? `Notifications (${unreadCount} unread)`
    : 'Notifications'

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative p-2"
      onClick={() => setShowNotificationCenter(true)}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={showNotificationCenter}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className={
            'absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex ' +
            'items-center justify-center text-xs'
          }
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )
}

// Toast notification component
export function ToastNotification({
  notification,
}: {
  notification: Notification
}) {
  const { removeNotification } = useNotifications()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => removeNotification(notification.id), 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [notification.id, removeNotification])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50/50 border-green-200/60'
      case 'error':
        return 'bg-red-50/50 border-red-200/60'
      case 'warning':
        return 'bg-yellow-50/50 border-yellow-200/60'
      case 'info':
        return 'bg-blue-50/50 border-blue-200/60'
      default:
        return 'bg-muted/30 border-border/60'
    }
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-80 transform transition-all duration-300',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Card className={cn('shadow-lg border', getBackgroundColor())}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => removeNotification(notification.id)}
              aria-label="Dismiss notification"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Toast container
export function ToastContainer() {
  const { notifications } = useNotifications()
  const toastNotifications = notifications
    .filter((notification) => notification.showToast !== false)
    .slice(0, 3)

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {toastNotifications.map((notification) => (
        <ToastNotification key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
