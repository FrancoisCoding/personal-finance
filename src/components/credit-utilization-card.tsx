import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { AddCreditCardModal } from '@/components/add-credit-card-modal'

interface CreditCard {
  id: string
  name: string
  balance: number
  limit: number
  apr: number
  dueDate?: string
  lastStatement?: string
}

interface CreditUtilizationCardProps {
  creditCards: CreditCard[]
  className?: string
}

export function CreditUtilizationCard({
  creditCards,
  className = '',
}: CreditUtilizationCardProps) {
  // Calculate total utilization
  const totalBalance = creditCards.reduce((sum, card) => sum + card.balance, 0)
  const totalLimit = creditCards.reduce((sum, card) => sum + card.limit, 0)
  const totalUtilization =
    totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0

  // Calculate average APR
  const averageAPR =
    creditCards.length > 0
      ? creditCards.reduce((sum, card) => sum + card.apr, 0) /
        creditCards.length
      : 0

  // Calculate monthly interest cost
  const monthlyInterestCost = (totalBalance * (averageAPR / 100)) / 12

  // Get utilization status
  const getUtilizationStatus = (utilization: number) => {
    if (utilization < 10)
      return {
        status: 'excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-50/50',
      }
    if (utilization < 30)
      return {
        status: 'good',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50/50',
      }
    if (utilization < 50)
      return {
        status: 'fair',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50/50',
      }
    if (utilization < 70)
      return {
        status: 'poor',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50/50',
      }
    return {
      status: 'very_poor',
      color: 'text-red-600',
      bgColor: 'bg-red-50/50',
    }
  }

  const utilizationStatus = getUtilizationStatus(totalUtilization)

  // Get recommendations based on utilization
  const getRecommendations = () => {
    if (totalUtilization < 10) {
      return {
        title: 'Excellent Credit Utilization',
        description:
          'Your credit utilization is in the excellent range. Keep it up!',
        actions: [
          'Consider requesting credit limit increases',
          'Continue paying balances in full',
        ],
      }
    } else if (totalUtilization < 30) {
      return {
        title: 'Good Credit Utilization',
        description: 'Your credit utilization is in a healthy range.',
        actions: [
          'Aim to keep utilization below 30%',
          'Pay balances before statement closing',
        ],
      }
    } else if (totalUtilization < 50) {
      return {
        title: 'Fair Credit Utilization',
        description:
          'Your credit utilization is getting high. Consider reducing balances.',
        actions: [
          'Pay down balances to improve credit score',
          'Avoid new credit applications',
        ],
      }
    } else {
      return {
        title: 'High Credit Utilization',
        description:
          'Your credit utilization is very high and may hurt your credit score.',
        actions: [
          'Prioritize paying down high balances',
          'Consider debt consolidation',
          'Avoid new purchases',
        ],
      }
    }
  }

  const recommendations = getRecommendations()

  return (
    <Card
      className={`bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Credit Utilization
          </CardTitle>
          <Badge
            variant="outline"
            className={`${utilizationStatus.color} ${utilizationStatus.bgColor} border-current`}
          >
            {utilizationStatus.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Utilization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Overall Utilization
            </span>
            <span className={`text-lg font-bold ${utilizationStatus.color}`}>
              {totalUtilization.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={Math.min(totalUtilization, 100)}
            className="h-3"
            style={
              {
                '--progress-background': utilizationStatus.color.replace(
                  'text-',
                  ''
                ),
              } as React.CSSProperties
            }
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>30%</span>
            <span>50%</span>
            <span>70%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Balance</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(totalBalance)}
            </div>
            <div className="text-xs text-gray-500">
              Across {creditCards.length} cards
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Available Credit</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(totalLimit - totalBalance)}
            </div>
            <div className="text-xs text-gray-500">
              of {formatCurrency(totalLimit)}
            </div>
          </div>
        </div>

        {/* Monthly Interest Cost */}
        <div className="rounded-lg border border-red-200/60 bg-red-50/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-700">
                Monthly Interest Cost
              </div>
              <div className="text-xs text-red-600">
                Based on {averageAPR.toFixed(1)}% average APR
              </div>
            </div>
            <div className="text-lg font-bold text-red-700">
              {formatCurrency(monthlyInterestCost)}
            </div>
          </div>
        </div>

        {/* Individual Cards */}
        {creditCards.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-600">
              Individual Cards
            </h4>
            {creditCards.map((card) => {
              const cardUtilization = (card.balance / card.limit) * 100
              const cardStatus = getUtilizationStatus(cardUtilization)

              return (
                <div
                  key={card.id}
                  className="p-3 bg-white rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {card.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${cardStatus.color} ${cardStatus.bgColor} border-current`}
                    >
                      {cardUtilization.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {formatCurrency(card.balance)} /{' '}
                      {formatCurrency(card.limit)}
                    </span>
                    <span>{card.apr.toFixed(1)}% APR</span>
                  </div>
                  <Progress
                    value={Math.min(cardUtilization, 100)}
                    className="h-2 mt-2"
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No credit cards added
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add your credit cards to track utilization.
            </p>
            <AddCreditCardModal />
          </div>
        )}

        {/* Recommendations */}
        <div className="rounded-lg border border-blue-200/60 bg-blue-50/50 p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-blue-900">
              {recommendations.title}
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              {recommendations.description}
            </p>
          </div>
          <div className="space-y-2">
            {recommendations.actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-xs text-blue-800"
              >
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <AddCreditCardModal />
          <Button variant="outline" size="sm" className="text-xs">
            Pay Down Balances
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
