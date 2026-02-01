'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  CreditCard,
  Calendar,
  Bell,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Settings,
  Trash2,
  Edit,
  Eye,
  Clock,
  Zap,
  Loader2,
} from 'lucide-react'
import {
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCategoryIcon,
} from '@/lib/utils'
import {
  useSubscriptions,
  useCreateSubscription,
  useCategories,
} from '@/hooks/use-finance-data'
import { CreateSubscriptionModal } from '@/components/subscriptions/create-subscription-modal'
import type { Subscription } from '@/hooks/use-finance-data'

export default function SubscriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { data: subscriptions = [], isLoading } = useSubscriptions()
  const { data: categories = [] } = useCategories()
  const createSubscriptionMutation = useCreateSubscription()

  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Calculate subscription statistics
  const activeSubscriptions = subscriptions.filter((s) => s.isActive)
  const totalMonthlyCost = activeSubscriptions.reduce((sum, sub) => {
    const multiplier =
      sub.billingCycle === 'YEARLY'
        ? 1 / 12
        : sub.billingCycle === 'WEEKLY'
          ? 4.33
          : 1
    return sum + sub.amount * multiplier
  }, 0)

  const totalYearlyCost = activeSubscriptions.reduce((sum, sub) => {
    const multiplier =
      sub.billingCycle === 'MONTHLY'
        ? 12
        : sub.billingCycle === 'WEEKLY'
          ? 52
          : 1
    return sum + sub.amount * multiplier
  }, 0)

  // Get upcoming renewals (next 30 days)
  const upcomingRenewals = activeSubscriptions.filter((sub) => {
    const nextBilling = new Date(sub.nextBillingDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return nextBilling <= thirtyDaysFromNow
  })

  // Get subscription status
  const getSubscriptionStatus = (subscription: Subscription) => {
    const nextBilling = new Date(subscription.nextBillingDate)
    const today = new Date()
    const daysUntilRenewal = Math.ceil(
      (nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilRenewal <= 3) {
      return {
        status: 'urgent',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-200/40',
      }
    } else if (daysUntilRenewal <= 7) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-200/40',
      }
    } else {
      return {
        status: 'good',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-200/40',
      }
    }
  }

  // Handle subscription creation
  const handleCreateSubscription = (subscriptionData: {
    name: string
    amount: number
    billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    nextBillingDate: Date
    categoryId?: string
    notes?: string
  }) => {
    createSubscriptionMutation.mutate(subscriptionData, {
      onSuccess: () => {
        setShowCreateModal(false)
      },
    })
  }

  // Handle subscription deletion
  const handleDeleteSubscription = (subscriptionId: string) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId)
    if (subscription) {
      // TODO: Implement delete subscription mutation
      toast({
        title: 'Subscription removed',
        description: `"${subscription.name}" has been removed from your subscriptions.`,
      })
    }
  }

  // Handle subscription toggle
  const handleToggleSubscription = (subscriptionId: string) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId)
    if (subscription) {
      // TODO: Implement update subscription mutation
      toast({
        title: subscription.isActive
          ? 'Subscription paused'
          : 'Subscription activated',
        description: `"${subscription.name}" has been ${subscription.isActive ? 'paused' : 'activated'}.`,
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Track your recurring charges and manage subscription renewals
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeSubscriptions.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMonthlyCost)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalYearlyCost)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Renewals
            </CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {upcomingRenewals.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals Alert */}
      {upcomingRenewals.length > 0 && (
        <Card className="border-orange-200/60 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="w-5 h-5" />
              Upcoming Renewals
            </CardTitle>
            <CardDescription className="text-orange-700">
              You have {upcomingRenewals.length} subscription(s) renewing soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingRenewals.slice(0, 3).map((subscription) => {
                const nextBilling = new Date(subscription.nextBillingDate)
                const daysUntilRenewal = Math.ceil(
                  (nextBilling.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )

                return (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                  >
                    <div>
                      <p className="font-medium">{subscription.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(subscription.amount)} •{' '}
                        {subscription.billingCycle.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {daysUntilRenewal === 0
                          ? 'Today'
                          : daysUntilRenewal === 1
                            ? 'Tomorrow'
                            : `${daysUntilRenewal} days`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(subscription.nextBillingDate)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions List */}
      <div className="space-y-6">
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No subscriptions yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
                  Add your first subscription to track recurring charges.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((subscription) => {
            const category = categories.find(
              (c) => c.id === subscription.categoryId
            )
            const {
              status,
              icon: StatusIcon,
              color,
              bgColor,
            } = getSubscriptionStatus(subscription)
            const categoryIcon = category
              ? getCategoryIcon(category.name)
              : null
            const categoryColor = category
              ? getCategoryColor(category.name)
              : '#9CA3AF'
            const nextBilling = new Date(subscription.nextBillingDate)
            const daysUntilRenewal = Math.ceil(
              (nextBilling.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )

            return (
              <Card
                key={subscription.id}
                className={`relative overflow-hidden ${!subscription.isActive ? 'opacity-60' : ''}`}
              >
                <div
                  className={`absolute top-0 right-0 w-2 h-full ${bgColor}`}
                ></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="p-3 rounded-full border flex items-center justify-center"
                        style={{
                          color: categoryColor,
                          backgroundColor: `${categoryColor}1A`,
                          borderColor: `${categoryColor}33`,
                        }}
                      >
                        {categoryIcon ? (
                          <span className="text-2xl">{categoryIcon}</span>
                        ) : (
                          <CreditCard className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {subscription.name}
                          {!subscription.isActive && (
                            <span className="text-xs rounded-full border border-border/60 bg-muted/30 px-2 py-1 text-muted-foreground">
                              Paused
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {category?.name && `${category.name} • `}
                          {subscription.billingCycle.toLowerCase()} billing
                          {subscription.description &&
                            ` • ${subscription.description}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-5 h-5 ${color}`} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleSubscription(subscription.id)
                        }
                      >
                        {subscription.isActive ? 'Pause' : 'Activate'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeleteSubscription(subscription.id)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cost and Renewal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg border border-border/60 bg-muted/20">
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(subscription.amount)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-border/60 bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        Next Renewal
                      </p>
                      <p className="text-lg font-semibold">
                        {formatDate(subscription.nextBillingDate)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-border/60 bg-muted/20">
                      <p className="text-sm text-muted-foreground">Days Left</p>
                      <p
                        className={`text-lg font-semibold ${daysUntilRenewal <= 7 ? 'text-orange-600' : ''}`}
                      >
                        {daysUntilRenewal}
                      </p>
                    </div>
                  </div>

                  {/* Status Message */}
                  {status === 'urgent' && (
                    <div className="rounded-lg border border-red-200/60 bg-red-50/50 p-3">
                      <p className="text-sm font-medium text-red-700">
                        Renewal due{' '}
                        {daysUntilRenewal === 0
                          ? 'today'
                          : `in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? '' : 's'}`}
                      </p>
                    </div>
                  )}
                  {status === 'warning' && (
                    <div className="rounded-lg border border-yellow-200/60 bg-yellow-50/50 p-3">
                      <p className="text-sm font-medium text-yellow-700">
                        Renewal coming up in {daysUntilRenewal} days.
                      </p>
                    </div>
                  )}
                  {status === 'good' && (
                    <div className="rounded-lg border border-green-200/60 bg-green-50/50 p-3">
                      <p className="text-sm font-medium text-green-700">
                        Next renewal in {daysUntilRenewal} days.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Subscription Modal */}
      <CreateSubscriptionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateSubscription}
        isLoading={createSubscriptionMutation.isPending}
        categories={categories}
      />
    </div>
  )
}
