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
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30'
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30'
      case 'low':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
      default:
        return 'bg-muted/30 text-muted-foreground border-border/60'
    }
  }

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'spending_pattern':
        return 'text-sky-600 dark:text-sky-300 bg-sky-500/10'
      case 'budget_alert':
        return 'text-rose-600 dark:text-rose-300 bg-rose-500/10'
      case 'savings_opportunity':
        return 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10'
      case 'subscription_review':
        return 'text-violet-600 dark:text-violet-300 bg-violet-500/10'
      case 'goal_progress':
        return 'text-amber-600 dark:text-amber-300 bg-amber-500/10'
      default:
        return 'text-muted-foreground bg-muted/30'
    }
  }

  return (
    <Card className={`bg-card/80 border border-border/60 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-muted/40">
              <Brain className="h-5 w-5 text-violet-600 dark:text-violet-300" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">
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
              className="p-4 rounded-lg border border-border/60 bg-muted/30 hover:shadow-sm transition-shadow"
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
                      <h4 className="text-sm font-medium text-foreground">
                        {insight.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getSeverityColor(insight.severity)}`}
                      >
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    {insight.value && (
                      <div className="text-xs text-muted-foreground">
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
        <div className="pt-4 border-t border-border/60">
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
