'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

// Notification interface
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  showToast?: boolean
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
  removeNotification: (id: string) => void
  clearAll: () => void
  showNotificationCenter: boolean
  setShowNotificationCenter: (show: boolean) => void
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      showToast: notification.showToast ?? true,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        showNotificationCenter,
        setShowNotificationCenter,
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
        'rounded-xl border border-border/60 bg-muted/20 transition-colors ' +
          'hover:bg-muted/30 cursor-pointer',
        !notification.read && 'border-sky-500/30 bg-sky-500/10'
      )}
      onClick={() => markAsRead(notification.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {notification.title}
                  </h4>
                  {notification.category && (
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getCategoryColor())}
                    >
                      {getCategoryName(notification.category) || 'Unknown'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
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
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
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
    clearAll,
    showNotificationCenter,
    setShowNotificationCenter,
  } = useNotifications()

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

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
  )

  if (!showNotificationCenter) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={() => setShowNotificationCenter(false)}
      />
      <div className="absolute right-4 top-4 bottom-4 w-full max-w-md">
        <div
          className={
            'flex h-full flex-col rounded-2xl border border-border/60 ' +
            'bg-card/95 shadow-2xl'
          }
        >
          <div
            className={
              'flex items-start justify-between gap-4 px-5 py-4 border-b ' +
              'border-border/60'
            }
          >
            <div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <p
                  className={
                    'text-xs font-semibold uppercase tracking-[0.2em] ' +
                    'text-muted-foreground'
                  }
                >
                  Alerts
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : 'You are all caught up.'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="h-8 w-8 p-0"
                aria-label="Mark all as read"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-8 w-8 p-0"
                aria-label="Clear all notifications"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotificationCenter(false)}
                className="h-8 w-8 p-0"
                aria-label="Close alerts panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="px-5 py-3 border-b border-border/60">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-muted/40 p-1">
                {['all', 'unread', 'read'].map((filterOption) => {
                  const isActive = filter === filterOption
                  return (
                    <Button
                      key={filterOption}
                      variant="ghost"
                      size="sm"
                      className={
                        'h-7 px-3 text-xs rounded-full ' +
                        (isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground')
                      }
                      onClick={() => setFilter(filterOption as any)}
                    >
                      {filterOption.charAt(0).toUpperCase() +
                        filterOption.slice(1)}
                    </Button>
                  )
                })}
              </div>
              {categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Category
                  </span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={
                      'h-7 rounded-full border border-border/60 ' +
                      'bg-background px-3 text-xs text-foreground'
                    }
                  >
                    <option value="all">All</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category
                          ? category.charAt(0).toUpperCase() +
                            category.slice(1)
                          : 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
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
                    You're all caught up.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

// Notification bell component
export function NotificationBell() {
  const { unreadCount, setShowNotificationCenter } = useNotifications()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative p-2"
      onClick={() => setShowNotificationCenter(true)}
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
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastNotifications.map((notification) => (
        <ToastNotification key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
