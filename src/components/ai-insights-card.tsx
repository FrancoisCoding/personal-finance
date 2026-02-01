import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Insight {
  id: string
  type:
    | 'spending_pattern'
    | 'budget_alert'
    | 'savings_opportunity'
    | 'subscription_review'
    | 'goal_progress'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  actionable: boolean
  action?: string
  value?: number
  percentage?: number
}

interface AIInsightsCardProps {
  insights: Insight[]
  onActionClick?: (insight: Insight) => void
  className?: string
}

export function AIInsightsCard({
  insights,
  onActionClick,
  className = '',
}: AIInsightsCardProps) {
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'spending_pattern':
        return <TrendingUp className="h-4 w-4" />
      case 'budget_alert':
        return <AlertTriangle className="h-4 w-4" />
      case 'savings_opportunity':
        return <Target className="h-4 w-4" />
      case 'subscription_review':
        return <Zap className="h-4 w-4" />
      case 'goal_progress':
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: Insight['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50/60 text-red-700 border-red-200/60'
      case 'medium':
        return 'bg-yellow-50/60 text-yellow-700 border-yellow-200/60'
      case 'low':
        return 'bg-green-50/60 text-green-700 border-green-200/60'
      default:
        return 'bg-muted/30 text-muted-foreground border-border/60'
    }
  }

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'spending_pattern':
        return 'text-blue-600 bg-blue-50/60'
      case 'budget_alert':
        return 'text-red-600 bg-red-50/60'
      case 'savings_opportunity':
        return 'text-green-600 bg-green-50/60'
      case 'subscription_review':
        return 'text-purple-600 bg-purple-50/60'
      case 'goal_progress':
        return 'text-orange-600 bg-orange-50/60'
      default:
        return 'text-muted-foreground bg-muted/30'
    }
  }

  return (
    <Card
      className={`bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-700">
              AI Insights
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {insights.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length > 0 ? (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}
                  >
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {insight.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getSeverityColor(insight.severity)}`}
                      >
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {insight.description}
                    </p>
                    {insight.value && (
                      <div className="text-xs text-gray-500">
                        {insight.percentage &&
                          `${insight.percentage.toFixed(1)}% `}
                        {formatCurrency(insight.value)}
                      </div>
                    )}
                  </div>
                </div>
                {insight.actionable && insight.action && onActionClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onActionClick(insight)}
                    className="ml-4 text-xs"
                  >
                    {insight.action}
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No insights yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add more transactions to get personalized insights.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Analyze Spending
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Review Goals
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
