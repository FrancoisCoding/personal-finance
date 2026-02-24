'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  BadgeCheck,
  Clock3,
  CreditCard,
  DollarSign,
  Gem,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  RefreshCcw,
  Shield,
  Target,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { feature } from 'topojson-client'
import worldAtlasCountries from 'world-atlas/countries-110m.json'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const ADMIN_DEMOGRAPHICS_MAP_VIEWBOX = {
  width: 960,
  height: 420,
} as const

type TProjectedMapPosition = {
  left: string
  top: string
}

type TWorldAtlasTopology = {
  type: 'Topology'
  arcs: unknown[]
  objects: {
    countries: Parameters<typeof feature>[1]
  }
  bbox?: [number, number, number, number]
  transform?: unknown
}

const adminDemographicsWorldMap = (() => {
  const topology = worldAtlasCountries as unknown as TWorldAtlasTopology
  const countriesFeatureCollection = feature(
    topology as Parameters<typeof feature>[0],
    topology.objects.countries
  )
  const projection = geoNaturalEarth1().fitExtent(
    [
      [16, 18],
      [
        ADMIN_DEMOGRAPHICS_MAP_VIEWBOX.width - 16,
        ADMIN_DEMOGRAPHICS_MAP_VIEWBOX.height - 18,
      ],
    ],
    countriesFeatureCollection
  )
  const pathGenerator = geoPath(projection)
  const features =
    countriesFeatureCollection.type === 'FeatureCollection'
      ? countriesFeatureCollection.features
      : [countriesFeatureCollection]

  const countryPaths = features
    .map((worldFeature, index) => ({
      id: String(worldFeature.id ?? index),
      d: pathGenerator(worldFeature),
    }))
    .filter(
      (worldFeature): worldFeature is { id: string; d: string } =>
        typeof worldFeature.d === 'string' && worldFeature.d.length > 0
    )

  const projectToPercent = (
    longitude: number,
    latitude: number
  ): TProjectedMapPosition | null => {
    const point = projection([longitude, latitude])
    if (!point) {
      return null
    }

    const [x, y] = point
    return {
      left: `${(x / ADMIN_DEMOGRAPHICS_MAP_VIEWBOX.width) * 100}%`,
      top: `${(y / ADMIN_DEMOGRAPHICS_MAP_VIEWBOX.height) * 100}%`,
    }
  }

  return {
    countryPaths,
    projectToPercent,
  }
})()

interface IAdminSummary {
  usersCount: number
  contactsCount: number
  activeSessionsCount: number
  activeSubscriptions: number
  trialingSubscriptions: number
}

interface IUserMetrics {
  totalUsers: number
  superUsers: number
  newUsersLast7Days: number
  newUsersLast30Days: number
  verifiedUsers: number
  connectedBankUsers: number
}

interface ISubscriptionMetrics {
  payingUsers: number
  activeSubscriptions: number
  trialingSubscriptions: number
  basicSubscribers: number
  proSubscribers: number
  projectedMonthlyRevenueInCents: number
  statusBreakdown: {
    active: number
    trialing: number
    pastDue: number
    canceled: number
    incomplete: number
  }
}

interface IEngagementMetrics {
  sessionsLast24Hours: number
  sessionsLast7Days: number
  activeUsersLast7Days: number
  averageSessionsPerActiveUserLast7Days: number
  topLoginLocations: Array<{ location: string; count: number }>
}

interface IOperationsMetrics {
  contactsLast7Days: number
  contactsLast30Days: number
  totalFinancialAccounts: number
  totalTransactions: number
  totalGoals: number
  totalReminders: number
}

interface IAdminAnalyticsResponse {
  summary: IAdminSummary
  userMetrics: IUserMetrics
  subscriptionMetrics: ISubscriptionMetrics
  engagementMetrics: IEngagementMetrics
  operationsMetrics: IOperationsMetrics
}

interface IAdminSubscription {
  id: string
  plan: string
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  user: { id: string; name: string | null; email: string }
}

interface IAdminSession {
  id: string
  name: string
  location: string
  isTrusted: boolean
  lastActiveAt: string
  user: { id: string; name: string | null; email: string }
}

interface IAdminContact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

interface IAdminContactsResponse {
  total: number
  page: number
  contacts: IAdminContact[]
}

interface IAdminSubscriptionsResponse {
  total: number
  page: number
  subscriptions: IAdminSubscription[]
}

interface IAdminSessionsResponse {
  total: number
  page: number
  sessions: IAdminSession[]
}

interface IAdminUser {
  id: string
  name: string | null
  email: string
  isSuperUser: boolean
  createdAt: string
  emailVerified: string | null
  currentPlan: 'BASIC' | 'PRO' | null
}

interface IAdminUsersResponse {
  total: number
  page: number
  users: IAdminUser[]
}

type TAdminSection =
  | 'overview'
  | 'contacts'
  | 'subscriptions'
  | 'sessions'
  | 'users'

const pageSize = 25

const formatTimestamp = (value: string | null) =>
  value ? new Date(value).toLocaleString() : '--'

const formatUsdFromCents = (valueInCents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(valueInCents / 100)

const queryParam = (value: string) => encodeURIComponent(value)

export default function AdminPortalPage() {
  const [activeSection, setActiveSection] = useState<TAdminSection>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [analytics, setAnalytics] = useState<IAdminAnalyticsResponse | null>(
    null
  )

  const [contacts, setContacts] = useState<IAdminContact[]>([])
  const [contactsTotal, setContactsTotal] = useState(0)
  const [contactsPage, setContactsPage] = useState(1)
  const [contactsQuery, setContactsQuery] = useState('')
  const [contactsInputValue, setContactsInputValue] = useState('')
  const [isContactsLoading, setIsContactsLoading] = useState(false)
  const [deletingContactId, setDeletingContactId] = useState<string | null>(
    null
  )

  const [subscriptions, setSubscriptions] = useState<IAdminSubscription[]>([])
  const [subscriptionsTotal, setSubscriptionsTotal] = useState(0)
  const [subscriptionsPage, setSubscriptionsPage] = useState(1)
  const [subscriptionsQuery, setSubscriptionsQuery] = useState('')
  const [subscriptionsInputValue, setSubscriptionsInputValue] = useState('')
  const [isSubscriptionsLoading, setIsSubscriptionsLoading] = useState(false)

  const [sessions, setSessions] = useState<IAdminSession[]>([])
  const [sessionsTotal, setSessionsTotal] = useState(0)
  const [sessionsPage, setSessionsPage] = useState(1)
  const [sessionsQuery, setSessionsQuery] = useState('')
  const [sessionsInputValue, setSessionsInputValue] = useState('')
  const [isSessionsLoading, setIsSessionsLoading] = useState(false)

  const [users, setUsers] = useState<IAdminUser[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersQuery, setUsersQuery] = useState('')
  const [usersInputValue, setUsersInputValue] = useState('')
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const loadSummary = useCallback(async () => {
    const response = await fetch('/api/admin/analytics')
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload?.error || 'Failed to load analytics.')
    }
    setAnalytics(payload as IAdminAnalyticsResponse)
  }, [])

  const loadContacts = useCallback(async (page: number, query: string) => {
    setIsContactsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/contacts?page=${page}&pageSize=${pageSize}&q=${queryParam(query)}`
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
  }, [])

  const loadSubscriptions = useCallback(async (page: number, query: string) => {
    setIsSubscriptionsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/subscriptions?page=${page}&pageSize=${pageSize}&q=${queryParam(query)}`
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
        error instanceof Error ? error.message : 'Failed to load subscriptions.'
      )
    } finally {
      setIsSubscriptionsLoading(false)
    }
  }, [])

  const loadSessions = useCallback(async (page: number, query: string) => {
    setIsSessionsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/sessions?page=${page}&pageSize=${pageSize}&q=${queryParam(query)}`
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
  }, [])

  const loadUsers = useCallback(async (page: number, query: string) => {
    setIsUsersLoading(true)
    try {
      const response = await fetch(
        `/api/admin/users?page=${page}&pageSize=${pageSize}&q=${queryParam(query)}`
      )
      const payload = (await response.json().catch(() => ({}))) as
        | IAdminUsersResponse
        | { error?: string }
      if (!response.ok) {
        throw new Error(
          (payload as { error?: string })?.error || 'Failed to load users.'
        )
      }
      const data = payload as IAdminUsersResponse
      setUsers(data.users)
      setUsersTotal(data.total)
      setUsersPage(data.page)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load users.'
      )
    } finally {
      setIsUsersLoading(false)
    }
  }, [])

  const loadAllData = useCallback(async () => {
    setErrorMessage('')
    await Promise.all([
      loadSummary(),
      loadContacts(contactsPage, contactsQuery),
      loadSubscriptions(subscriptionsPage, subscriptionsQuery),
      loadSessions(sessionsPage, sessionsQuery),
      loadUsers(usersPage, usersQuery),
    ])
  }, [
    contactsPage,
    contactsQuery,
    loadContacts,
    loadSessions,
    loadSubscriptions,
    loadUsers,
    loadSummary,
    sessionsPage,
    sessionsQuery,
    subscriptionsPage,
    subscriptionsQuery,
    usersPage,
    usersQuery,
  ])

  const contactsTotalPages = Math.max(1, Math.ceil(contactsTotal / pageSize))
  const subscriptionsTotalPages = Math.max(
    1,
    Math.ceil(subscriptionsTotal / pageSize)
  )
  const sessionsTotalPages = Math.max(1, Math.ceil(sessionsTotal / pageSize))
  const usersTotalPages = Math.max(1, Math.ceil(usersTotal / pageSize))

  const contactsExportUrl = `/api/admin/export?type=contacts&q=${queryParam(
    contactsQuery
  )}`
  const subscriptionsExportUrl = `/api/admin/export?type=subscriptions&q=${queryParam(subscriptionsQuery)}`
  const sessionsExportUrl = `/api/admin/export?type=sessions&q=${queryParam(
    sessionsQuery
  )}`

  const summaryCards = useMemo(
    () =>
      analytics
        ? [
            {
              label: 'Platform users',
              value: analytics.summary.usersCount.toLocaleString(),
              helper: `${analytics.userMetrics.newUsersLast7Days.toLocaleString()} new in 7d`,
              icon: Users,
              iconClassName: 'text-cyan-300',
              iconChipClassName:
                'border-cyan-400/30 bg-cyan-500/10 text-cyan-300',
            },
            {
              label: 'Paying users',
              value: analytics.subscriptionMetrics.payingUsers.toLocaleString(),
              helper: `${analytics.summary.activeSubscriptions.toLocaleString()} active subscriptions`,
              icon: CreditCard,
              iconClassName: 'text-violet-300',
              iconChipClassName:
                'border-violet-400/30 bg-violet-500/10 text-violet-300',
            },
            {
              label: 'Projected MRR',
              value: formatUsdFromCents(
                analytics.subscriptionMetrics.projectedMonthlyRevenueInCents
              ),
              helper: `${analytics.subscriptionMetrics.proSubscribers.toLocaleString()} Pro subscribers`,
              icon: DollarSign,
              iconClassName: 'text-emerald-300',
              iconChipClassName:
                'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
            },
            {
              label: 'Sessions (7d)',
              value:
                analytics.engagementMetrics.sessionsLast7Days.toLocaleString(),
              helper: `${analytics.engagementMetrics.sessionsLast24Hours.toLocaleString()} in last 24h`,
              icon: Clock3,
              iconClassName: 'text-amber-300',
              iconChipClassName:
                'border-amber-400/30 bg-amber-500/10 text-amber-300',
            },
          ]
        : [],
    [analytics]
  )
  const freePlanUsersCount = Math.max(
    0,
    (analytics?.userMetrics.totalUsers ?? 0) -
      (analytics?.subscriptionMetrics.basicSubscribers ?? 0) -
      (analytics?.subscriptionMetrics.proSubscribers ?? 0)
  )
  const demographics = useMemo(() => {
    const demographicsFallbackMarkerPositions = [
      { left: '16%', top: '42%' },
      { left: '23%', top: '56%' },
      { left: '46%', top: '44%' },
      { left: '58%', top: '36%' },
      { left: '70%', top: '46%' },
      { left: '84%', top: '58%' },
    ] as const
    const demographicsCountryCoordinates: Record<string, [number, number]> = {
      US: [-98.5795, 39.8283],
      USA: [-98.5795, 39.8283],
      'UNITED STATES': [-98.5795, 39.8283],
      CA: [-106.3468, 56.1304],
      CANADA: [-106.3468, 56.1304],
      MX: [-102.5528, 23.6345],
      MEXICO: [-102.5528, 23.6345],
      BR: [-51.9253, -14.235],
      BRAZIL: [-51.9253, -14.235],
      GB: [-3.436, 55.3781],
      UK: [-3.436, 55.3781],
      'UNITED KINGDOM': [-3.436, 55.3781],
      DE: [10.4515, 51.1657],
      GERMANY: [10.4515, 51.1657],
      FR: [2.2137, 46.2276],
      FRANCE: [2.2137, 46.2276],
      ES: [-3.7492, 40.4637],
      SPAIN: [-3.7492, 40.4637],
      IT: [12.5674, 41.8719],
      ITALY: [12.5674, 41.8719],
      IN: [78.9629, 20.5937],
      INDIA: [78.9629, 20.5937],
      CN: [104.1954, 35.8617],
      CHINA: [104.1954, 35.8617],
      JP: [138.2529, 36.2048],
      JAPAN: [138.2529, 36.2048],
      KR: [127.7669, 35.9078],
      'SOUTH KOREA': [127.7669, 35.9078],
      SG: [103.8198, 1.3521],
      SINGAPORE: [103.8198, 1.3521],
      AU: [133.7751, -25.2744],
      AUSTRALIA: [133.7751, -25.2744],
      ZA: [22.9375, -30.5595],
      'SOUTH AFRICA': [22.9375, -30.5595],
      NG: [8.6753, 9.082],
      NIGERIA: [8.6753, 9.082],
      AE: [53.8478, 23.4241],
      UAE: [53.8478, 23.4241],
      'UNITED ARAB EMIRATES': [53.8478, 23.4241],
    }
    const topLoginLocations =
      analytics?.engagementMetrics.topLoginLocations ?? []
    const totalVisibleSessions = topLoginLocations.reduce(
      (sum, location) => sum + location.count,
      0
    )
    const accentStyles = [
      {
        dotClassName: 'bg-cyan-300',
        badgeClassName: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200',
        glowClassName: 'bg-cyan-400/40',
      },
      {
        dotClassName: 'bg-violet-300',
        badgeClassName: 'border-violet-400/30 bg-violet-500/10 text-violet-200',
        glowClassName: 'bg-violet-400/40',
      },
      {
        dotClassName: 'bg-emerald-300',
        badgeClassName:
          'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
        glowClassName: 'bg-emerald-400/40',
      },
      {
        dotClassName: 'bg-amber-300',
        badgeClassName: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
        glowClassName: 'bg-amber-400/40',
      },
      {
        dotClassName: 'bg-rose-300',
        badgeClassName: 'border-rose-400/30 bg-rose-500/10 text-rose-200',
        glowClassName: 'bg-rose-400/40',
      },
      {
        dotClassName: 'bg-slate-300',
        badgeClassName: 'border-slate-400/30 bg-slate-500/10 text-slate-200',
        glowClassName: 'bg-slate-300/40',
      },
    ] as const

    const rows = topLoginLocations.slice(0, 6).map((location, index) => {
      const locationLabel = location.location.trim() || 'Unknown'
      const locationSegments = locationLabel
        .split(',')
        .map((segment) => segment.trim())
        .filter(Boolean)
      const countryLabel =
        locationSegments[locationSegments.length - 1] ?? locationLabel
      const normalizedCountryKey = countryLabel.trim().toUpperCase()
      const percentage =
        totalVisibleSessions > 0
          ? (location.count / totalVisibleSessions) * 100
          : 0
      const accentStyle = accentStyles[index % accentStyles.length]
      const projectedMapPosition = demographicsCountryCoordinates[
        normalizedCountryKey
      ]
        ? adminDemographicsWorldMap.projectToPercent(
            demographicsCountryCoordinates[normalizedCountryKey][0],
            demographicsCountryCoordinates[normalizedCountryKey][1]
          )
        : null
      const mapPosition =
        projectedMapPosition ??
        demographicsFallbackMarkerPositions[
          index % demographicsFallbackMarkerPositions.length
        ]

      return {
        id: `${locationLabel}-${location.count}`,
        index,
        locationLabel,
        countryLabel,
        count: location.count,
        percentage,
        mapPosition,
        pingDelayMs: index * 280,
        pingDurationMs: 1800 + index * 180,
        ...accentStyle,
      }
    })

    return {
      rows,
      totalVisibleSessions,
    }
  }, [analytics])

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      try {
        await loadAllData()
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load admin data.'
        )
      } finally {
        setIsLoading(false)
      }
    }
    void initialize()
  }, [loadAllData])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setContactsPage(1)
      setContactsQuery(contactsInputValue.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [contactsInputValue])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSubscriptionsPage(1)
      setSubscriptionsQuery(subscriptionsInputValue.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [subscriptionsInputValue])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSessionsPage(1)
      setSessionsQuery(sessionsInputValue.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [sessionsInputValue])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUsersPage(1)
      setUsersQuery(usersInputValue.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [usersInputValue])

  useEffect(() => {
    if (isLoading) return
    void loadContacts(contactsPage, contactsQuery)
  }, [contactsPage, contactsQuery, isLoading, loadContacts])

  useEffect(() => {
    if (isLoading) return
    void loadSubscriptions(subscriptionsPage, subscriptionsQuery)
  }, [isLoading, loadSubscriptions, subscriptionsPage, subscriptionsQuery])

  useEffect(() => {
    if (isLoading) return
    void loadSessions(sessionsPage, sessionsQuery)
  }, [isLoading, loadSessions, sessionsPage, sessionsQuery])

  useEffect(() => {
    if (isLoading) return
    void loadUsers(usersPage, usersQuery)
  }, [isLoading, loadUsers, usersPage, usersQuery])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadAllData()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to refresh admin data.'
      )
    } finally {
      setIsRefreshing(false)
    }
  }

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
      await Promise.all([
        loadSummary(),
        loadContacts(contactsPage, contactsQuery),
      ])
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete contact.'
      )
    } finally {
      setDeletingContactId(null)
    }
  }

  const handleToggleSuperUser = async (user: IAdminUser) => {
    setUpdatingUserId(user.id)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isSuperUser: !user.isSuperUser,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update superuser access.')
      }
      await Promise.all([loadSummary(), loadUsers(usersPage, usersQuery)])
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to update superuser access.'
      )
    } finally {
      setUpdatingUserId(null)
    }
  }

  const sectionItems = [
    { key: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { key: 'contacts' as const, label: 'Contacts', icon: Mail },
    { key: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard },
    { key: 'sessions' as const, label: 'Sessions', icon: Shield },
    { key: 'users' as const, label: 'Users', icon: Users },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-border/60 bg-card/90 p-4 lg:sticky lg:top-6">
          <div>
            <h1 className="text-xl font-semibold">Admin portal</h1>
            <p className="text-xs text-muted-foreground">
              FinanceFlow control center
            </p>
          </div>

          <div className="mt-5 grid gap-2">
            {sectionItems.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.key
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={
                    'w-full rounded-xl border p-3 text-left transition ' +
                    (isActive
                      ? 'border-primary/60 bg-primary/10'
                      : 'border-border/60 bg-background/60 hover:border-primary/40')
                  }
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-5 grid gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Refresh data
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="space-y-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
              {errorMessage}
            </div>
          ) : null}
          {activeSection === 'overview' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <Card
                    key={card.label}
                    className="border-border/70 bg-card/90"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {card.label}
                          </CardTitle>
                          <p className="text-2xl font-semibold tracking-tight text-foreground">
                            {card.value}
                          </p>
                        </div>
                        <div
                          className={`rounded-xl border p-2 ${card.iconChipClassName}`}
                        >
                          <card.icon
                            className={`h-4 w-4 ${card.iconClassName}`}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
                        {card.helper}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <Card className="border-border/70 bg-card/90 xl:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-1.5">
                        <Users className="h-4 w-4 text-cyan-300" />
                      </div>
                      User analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserPlus className="h-4 w-4 text-cyan-300" />
                        <span>New users (7d / 30d)</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">
                        {analytics?.userMetrics.newUsersLast7Days ?? 0} /{' '}
                        {analytics?.userMetrics.newUsersLast30Days ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserCheck className="h-4 w-4 text-emerald-300" />
                        <span>Account quality & access</span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Verified
                          </span>
                          <span className="font-semibold">
                            {analytics?.userMetrics.verifiedUsers ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Bank-connected
                          </span>
                          <span className="font-semibold">
                            {analytics?.userMetrics.connectedBankUsers ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Superusers
                          </span>
                          <span className="font-semibold">
                            {analytics?.userMetrics.superUsers ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-4 w-4 text-violet-300" />
                        <span>Contacts (7d / 30d)</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">
                        {analytics?.operationsMetrics.contactsLast7Days ?? 0} /{' '}
                        {analytics?.operationsMetrics.contactsLast30Days ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="h-4 w-4 text-amber-300" />
                        <span>Planning objects</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/70 px-2.5 py-1 text-xs">
                          <Target className="h-3.5 w-3.5 text-amber-300" />
                          <span className="text-muted-foreground">Goals</span>
                          <span className="font-semibold">
                            {analytics?.operationsMetrics.totalGoals ?? 0}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/70 px-2.5 py-1 text-xs">
                          <BellRing className="h-3.5 w-3.5 text-cyan-300" />
                          <span className="text-muted-foreground">
                            Reminders
                          </span>
                          <span className="font-semibold">
                            {analytics?.operationsMetrics.totalReminders ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-1.5">
                        <CreditCard className="h-4 w-4 text-emerald-300" />
                      </div>
                      Plan health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          Active
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {analytics?.subscriptionMetrics.statusBreakdown
                            .active ?? 0}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          Trialing
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {analytics?.subscriptionMetrics.statusBreakdown
                            .trialing ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md border border-slate-400/30 bg-slate-500/10 p-1">
                          <LayoutDashboard className="h-3.5 w-3.5 text-slate-300" />
                        </div>
                        <span className="text-muted-foreground">Free</span>
                      </div>
                      <span className="font-semibold">
                        {freePlanUsersCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md border border-cyan-400/30 bg-cyan-500/10 p-1">
                          <BadgeCheck className="h-3.5 w-3.5 text-cyan-300" />
                        </div>
                        <span className="text-muted-foreground">Basic</span>
                      </div>
                      <span className="font-semibold">
                        {analytics?.subscriptionMetrics.basicSubscribers ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md border border-violet-400/30 bg-violet-500/10 p-1">
                          <Gem className="h-3.5 w-3.5 text-violet-300" />
                        </div>
                        <span className="text-muted-foreground">Pro</span>
                      </div>
                      <span className="font-semibold">
                        {analytics?.subscriptionMetrics.proSubscribers ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md border border-amber-400/30 bg-amber-500/10 p-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                        </div>
                        <span className="text-muted-foreground">Past due</span>
                      </div>
                      <span className="font-semibold">
                        {analytics?.subscriptionMetrics.statusBreakdown
                          .pastDue ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md border border-rose-400/30 bg-rose-500/10 p-1">
                          <XCircle className="h-3.5 w-3.5 text-rose-300" />
                        </div>
                        <span className="text-muted-foreground">Canceled</span>
                      </div>
                      <span className="font-semibold">
                        {analytics?.subscriptionMetrics.statusBreakdown
                          .canceled ?? 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/70 bg-card/90">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-1.5">
                        <MapPin className="h-4 w-4 text-cyan-300" />
                      </div>
                      Demographics
                    </CardTitle>
                    <Badge variant="outline" className="w-fit border-border/60">
                      Last 7 days
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {demographics.rows.length ? (
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                      <div className="rounded-xl border border-border/60 bg-background/50">
                        <div className="grid grid-cols-[minmax(0,1fr)_80px_60px] gap-2 border-b border-border/60 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          <span>Country</span>
                          <span className="text-right">Sessions</span>
                          <span className="text-right">%</span>
                        </div>
                        <div className="divide-y divide-border/50">
                          {demographics.rows.map((location) => (
                            <div
                              key={location.id}
                              className="grid grid-cols-[minmax(0,1fr)_80px_60px] items-center gap-2 px-3 py-2.5 text-sm"
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                <div className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-card/80 text-[11px] font-semibold text-muted-foreground">
                                  {location.index + 1}
                                </div>
                                <span
                                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${location.dotClassName}`}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-foreground">
                                    {location.countryLabel}
                                  </p>
                                  <p className="truncate text-[11px] text-muted-foreground">
                                    {location.locationLabel}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right font-medium text-foreground">
                                {location.count.toLocaleString()}
                              </div>
                              <div className="text-right text-muted-foreground">
                                {location.percentage.toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/40 p-3">
                        <div className="pointer-events-none absolute inset-0 opacity-80">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.08),transparent_45%),radial-gradient(circle_at_65%_35%,rgba(99,102,241,0.10),transparent_45%),radial-gradient(circle_at_78%_66%,rgba(20,184,166,0.08),transparent_50%)]" />
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:22px_22px]" />
                        </div>
                        <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="relative inline-flex h-2.5 w-2.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
                            </span>
                            <span className="text-xs font-medium text-foreground">
                              Live pings active
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            Session activity hotspots
                          </span>
                        </div>
                        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border border-border/40 bg-card/50 p-2">
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
                          <svg
                            viewBox={`0 0 ${ADMIN_DEMOGRAPHICS_MAP_VIEWBOX.width} ${ADMIN_DEMOGRAPHICS_MAP_VIEWBOX.height}`}
                            className="relative h-full w-full rounded-md"
                            aria-hidden="true"
                            preserveAspectRatio="xMidYMid meet"
                          >
                            <defs>
                              <linearGradient
                                id="demographicsMapFill"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="rgba(15,23,42,0.95)"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="rgba(2,6,23,0.88)"
                                />
                              </linearGradient>
                              <linearGradient
                                id="demographicsMapStroke"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="rgba(34,211,238,0.14)"
                                />
                                <stop
                                  offset="50%"
                                  stopColor="rgba(148,163,184,0.18)"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="rgba(16,185,129,0.14)"
                                />
                              </linearGradient>
                            </defs>
                            <rect
                              x="0"
                              y="0"
                              width="960"
                              height="420"
                              rx="14"
                              fill="url(#demographicsMapFill)"
                            />
                            {[70, 140, 210, 280, 350].map((y) => (
                              <line
                                key={`lat-${y}`}
                                x1="20"
                                x2="940"
                                y1={y}
                                y2={y}
                                stroke="rgba(148,163,184,0.07)"
                                strokeWidth="1"
                              />
                            ))}
                            {[120, 240, 360, 480, 600, 720, 840].map((x) => (
                              <line
                                key={`lon-${x}`}
                                x1={x}
                                x2={x}
                                y1="18"
                                y2="402"
                                stroke="rgba(148,163,184,0.06)"
                                strokeWidth="1"
                              />
                            ))}
                            <g
                              fill="rgba(15,23,42,0.88)"
                              stroke="url(#demographicsMapStroke)"
                              strokeWidth="1.5"
                            >
                              {adminDemographicsWorldMap.countryPaths.map(
                                (countryPath) => (
                                  <path
                                    key={countryPath.id}
                                    d={countryPath.d}
                                    vectorEffect="non-scaling-stroke"
                                  />
                                )
                              )}
                            </g>
                            <g fill="rgba(148,163,184,0.15)">
                              {[
                                [116, 120],
                                [172, 151],
                                [260, 132],
                                [420, 122],
                                [496, 154],
                                [568, 136],
                                [642, 154],
                                [728, 144],
                                [812, 174],
                                [568, 238],
                                [324, 308],
                                [624, 326],
                                [844, 304],
                              ].map(([cx, cy], index) => (
                                <circle
                                  key={`mesh-${index}`}
                                  cx={cx}
                                  cy={cy}
                                  r="2"
                                />
                              ))}
                            </g>
                          </svg>
                          {demographics.rows.map((location) => {
                            const position = location.mapPosition
                            return (
                              <div
                                key={`${location.id}-marker`}
                                className="absolute"
                                style={{
                                  left: position.left,
                                  top: position.top,
                                }}
                              >
                                <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                                  <span
                                    className={`absolute h-5 w-5 rounded-full opacity-70 animate-ping ${location.dotClassName}`}
                                    style={{
                                      animationDelay: `${location.pingDelayMs}ms`,
                                      animationDuration: `${location.pingDurationMs}ms`,
                                    }}
                                  />
                                  <span
                                    className={`absolute h-8 w-8 rounded-full opacity-25 animate-ping ${location.glowClassName}`}
                                    style={{
                                      animationDelay: `${location.pingDelayMs + 220}ms`,
                                      animationDuration: `${location.pingDurationMs + 520}ms`,
                                    }}
                                  />
                                  <span
                                    className={`absolute h-6 w-6 rounded-full blur-md ${location.glowClassName}`}
                                  />
                                  <span
                                    className={`relative h-3.5 w-3.5 rounded-full border border-background ${location.dotClassName}`}
                                  />
                                </div>
                              </div>
                            )
                          })}
                          {demographics.rows.map((location) => {
                            const position = location.mapPosition
                            const ambientOffsets = [
                              { x: -14, y: -10 },
                              { x: 12, y: -14 },
                              { x: 18, y: 10 },
                            ]
                            const ambientCount = Math.min(
                              ambientOffsets.length,
                              Math.max(1, Math.round(location.percentage / 15))
                            )
                            return ambientOffsets
                              .slice(0, ambientCount)
                              .map((offset, offsetIndex) => (
                                <div
                                  key={`${location.id}-ambient-${offsetIndex}`}
                                  className="absolute"
                                  style={{
                                    left: `calc(${position.left} + ${offset.x}px)`,
                                    top: `calc(${position.top} + ${offset.y}px)`,
                                  }}
                                >
                                  <span
                                    className={`absolute -inset-1.5 rounded-full opacity-40 animate-ping ${location.glowClassName}`}
                                    style={{
                                      animationDelay: `${location.pingDelayMs + offsetIndex * 180}ms`,
                                      animationDuration: `${1100 + offsetIndex * 120}ms`,
                                    }}
                                  />
                                  <span
                                    className={`relative block h-1.5 w-1.5 rounded-full ${location.dotClassName}`}
                                  />
                                </div>
                              ))
                          })}
                        </div>
                        <div className="mt-3 rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-medium uppercase tracking-[0.14em]">
                              Visible session mix
                            </span>
                            <span>•</span>
                            <span>
                              {demographics.totalVisibleSessions.toLocaleString()}{' '}
                              tracked sessions
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {demographics.rows.slice(0, 4).map((location) => (
                              <div
                                key={`${location.id}-legend`}
                                className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs ${location.badgeClassName}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${location.dotClassName}`}
                                />
                                <span>{location.countryLabel}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No session location data available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}

          {activeSection === 'contacts' ? (
            <Card className="border-border/70 bg-card/90">
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Contact submissions
                  </CardTitle>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={contactsInputValue}
                      onChange={(event) =>
                        setContactsInputValue(event.target.value)
                      }
                      placeholder="Search by name, email, subject..."
                      className="h-10 w-full sm:w-72"
                    />
                    <Button asChild variant="outline" className="h-10">
                      <a href={contactsExportUrl}>Export CSV</a>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Showing{' '}
                    {contactsTotal === 0
                      ? 0
                      : (contactsPage - 1) * pageSize + 1}
                    -{Math.min(contactsPage * pageSize, contactsTotal)} of{' '}
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
          ) : null}
          {activeSection === 'subscriptions' ? (
            <Card className="border-border/70 bg-card/90">
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Subscription customers
                  </CardTitle>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={subscriptionsInputValue}
                      onChange={(event) =>
                        setSubscriptionsInputValue(event.target.value)
                      }
                      placeholder="Search by user email or name..."
                      className="h-10 w-full sm:w-72"
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
                      className="rounded-lg border border-border/60 bg-background/70 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {subscription.user.name || subscription.user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {subscription.user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{subscription.plan}</Badge>
                          <Badge variant="outline">{subscription.status}</Badge>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Trial ends: {formatTimestamp(subscription.trialEndsAt)}{' '}
                        • Current period ends:{' '}
                        {formatTimestamp(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {activeSection === 'sessions' ? (
            <Card className="border-border/70 bg-card/90">
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Login sessions
                  </CardTitle>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={sessionsInputValue}
                      onChange={(event) =>
                        setSessionsInputValue(event.target.value)
                      }
                      placeholder="Search by location or user..."
                      className="h-10 w-full sm:w-72"
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
                      className="rounded-lg border border-border/60 bg-background/70 p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {session.user.name || session.user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{session.location}</Badge>
                          {session.isTrusted ? (
                            <Badge variant="secondary">Trusted</Badge>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {session.name} • Last active{' '}
                        {formatTimestamp(session.lastActiveAt)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {activeSection === 'users' ? (
            <Card className="border-border/70 bg-card/90">
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Platform users
                  </CardTitle>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={usersInputValue}
                      onChange={(event) =>
                        setUsersInputValue(event.target.value)
                      }
                      placeholder="Search by user email or name..."
                      className="h-10 w-full sm:w-72"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Showing{' '}
                    {usersTotal === 0 ? 0 : (usersPage - 1) * pageSize + 1}-
                    {Math.min(usersPage * pageSize, usersTotal)} of {usersTotal}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPage <= 1 || isUsersLoading}
                      onClick={() =>
                        setUsersPage((value) => Math.max(1, value - 1))
                      }
                    >
                      Prev
                    </Button>
                    <span>
                      Page {usersPage} / {usersTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPage >= usersTotalPages || isUsersLoading}
                      onClick={() =>
                        setUsersPage((value) =>
                          Math.min(usersTotalPages, value + 1)
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isUsersLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No users found.
                  </p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-lg border border-border/60 bg-background/70 p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {user.name || user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {user.currentPlan ? user.currentPlan : 'No plan'}
                          </Badge>
                          {user.isSuperUser ? (
                            <Badge variant="secondary">Superuser</Badge>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingUserId === user.id}
                            onClick={() => handleToggleSuperUser(user)}
                          >
                            {updatingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.isSuperUser ? (
                              'Remove superuser'
                            ) : (
                              'Grant superuser'
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Joined {formatTimestamp(user.createdAt)} • Email
                        verified: {user.emailVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 p-3 text-xs text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Analytics reflect live database records for users, subscriptions,
            sessions, and contact activity.
          </div>
        </main>
      </div>
    </div>
  )
}
