import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export function getMonthRange(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  return { startDate, endDate }
}

export function getWeekRange(date: Date) {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return { startDate: startOfWeek, endDate: endOfWeek }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getCategoryColor(category: string): string {
  const colors = {
    'Food & Dining': '#10B981',
    Transportation: '#3B82F6',
    Shopping: '#8B5CF6',
    Entertainment: '#F59E0B',
    Healthcare: '#EF4444',
    Utilities: '#06B6D4',
    Housing: '#84CC16',
    Education: '#EC4899',
    Travel: '#F97316',
    Insurance: '#6366F1',
    Investment: '#22C55E',
    Salary: '#10B981',
    Freelance: '#3B82F6',
    Gifts: '#8B5CF6',
    Subscriptions: '#F59E0B',
    Other: '#9CA3AF',
  }
  return colors[category as keyof typeof colors] || '#9CA3AF'
}

export function getCategoryIcon(category: string): string {
  const icons = {
    'Food & Dining': '🍽️',
    Transportation: '🚗',
    Shopping: '🛍️',
    Entertainment: '🎬',
    Healthcare: '🏥',
    Utilities: '💡',
    Housing: '🏠',
    Education: '📚',
    Travel: '✈️',
    Insurance: '🛡️',
    Investment: '📈',
    Salary: '💰',
    Freelance: '💼',
    Gifts: '🎁',
    Subscriptions: '🔄',
    Other: '📋',
  }
  return icons[category as keyof typeof icons] || '📋'
}
