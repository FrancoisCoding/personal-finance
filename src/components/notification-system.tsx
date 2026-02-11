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
  clearRead: () => void
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

  const clearRead = () => {
    setNotifications((prev) => prev.filter((notification) => !notification.read))
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
        clearRead,
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
  } = useNotifications()

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  )
  const readNotifications = notifications.filter((notification) => notification.read)
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
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-semibold text-foreground">
                    Notifications
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
                    ? 'Stay on top of your finances with timely alerts.'
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
            <div className="mt-3 flex flex-wrap items-center gap-2">
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
          </div>

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
                        : category.charAt(0).toUpperCase() + category.slice(1)}
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
                        <span className="uppercase tracking-[0.2em]">New</span>
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
