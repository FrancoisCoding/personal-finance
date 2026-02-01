'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
// Simplified types that match what generateEnhancedInsights expects
interface SimpleTransaction {
  id: string
  description: string
  amount: number
  category?: string
  date: string | Date
  type: string
}

interface SimpleBudget {
  id: string
  name: string
  amount: number
  category?: string
}

interface SimpleGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string | Date
  createdAt?: string | Date
}

interface FinancialInsight {
  id: string
  type:
    | 'spending_pattern'
    | 'budget_alert'
    | 'savings_opportunity'
    | 'goal_progress'
    | 'anomaly_detection'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  actionable: boolean
  action?: string
  value?: number
  percentage?: number
  category?: string
  confidence: number
  recommendations: string[]
}

interface AIFinancialInsightsProps {
  transactions: SimpleTransaction[]
  budgets: SimpleBudget[]
  goals: SimpleGoal[]
  className?: string
}

export function AIFinancialInsights({
  transactions,
  budgets,
  goals,
  className = '',
}: AIFinancialInsightsProps) {
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null)

  // Generate AI insights
  const generateInsights = async () => {
    setIsAnalyzing(true)

    try {
      // Simulate AI analysis delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newInsights: FinancialInsight[] = []

      // Analyze spending patterns
      const categorySpending = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc: Record<string, number>, t) => {
          const category = t.category || 'Other'
          acc[category] = (acc[category] || 0) + Math.abs(t.amount)
          return acc
        }, {})

      const totalSpending = Object.values(categorySpending).reduce(
        (sum: number, amount: number) => sum + amount,
        0
      )

      // Find highest spending category
      const topCategory = Object.entries(categorySpending).reduce(
        (max: { category: string; amount: number }, [category, amount]) =>
          (amount as number) > max.amount
            ? { category, amount: amount as number }
            : max,
        { category: '', amount: 0 }
      )

      if (topCategory.amount > totalSpending * 0.4) {
        newInsights.push({
          id: 'high-category-spending',
          type: 'spending_pattern',
          title: `High Spending in ${topCategory.category}`,
          description: `${topCategory.category} accounts for ${(((topCategory.amount as number) / totalSpending) * 100).toFixed(1)}% of your total spending.`,
          severity: 'medium',
          actionable: true,
          action: 'Review Budget',
          value: topCategory.amount as number,
          percentage: ((topCategory.amount as number) / totalSpending) * 100,
          category: topCategory.category,
          confidence: 0.85,
          recommendations: [
            'Consider setting a specific budget for this category',
            'Look for ways to reduce spending in this area',
            'Review if this spending aligns with your financial goals',
          ],
        })
      }

      // Analyze savings rate
      const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

      if (savingsRate < 20) {
        newInsights.push({
          id: 'low-savings-rate',
          type: 'savings_opportunity',
          title: 'Low Savings Rate',
          description: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
          severity: 'high',
          actionable: true,
          action: 'Increase Savings',
          value: income - expenses,
          percentage: savingsRate,
          confidence: 0.92,
          recommendations: [
            'Set up automatic transfers to savings account',
            'Review and reduce non-essential expenses',
            'Consider the 50/30/20 budgeting rule',
          ],
        })
      }

      // Analyze budget performance
      budgets.forEach((budget) => {
        const spent = transactions
          .filter((t) => t.type === 'EXPENSE' && t.category === budget.category)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const percentage = (spent / budget.amount) * 100

        if (percentage > 100) {
          newInsights.push({
            id: `budget-over-${budget.id}`,
            type: 'budget_alert',
            title: `Over Budget: ${budget.category}`,
            description: `You've exceeded your ${budget.category} budget by ${formatCurrency(spent - budget.amount)}.`,
            severity: 'high',
            actionable: true,
            action: 'Adjust Budget',
            value: spent - budget.amount,
            percentage: percentage,
            category: budget.category,
            confidence: 0.95,
            recommendations: [
              'Review recent transactions in this category',
              'Consider increasing your budget for next month',
              'Look for ways to reduce spending in this area',
            ],
          })
        } else if (percentage > 80) {
          newInsights.push({
            id: `budget-warning-${budget.id}`,
            type: 'budget_alert',
            title: `Budget Warning: ${budget.category}`,
            description: `You're at ${percentage.toFixed(1)}% of your ${budget.category} budget.`,
            severity: 'medium',
            actionable: true,
            action: 'Monitor Spending',
            value: spent,
            percentage: percentage,
            category: budget.category,
            confidence: 0.88,
            recommendations: [
              'Monitor your spending closely for the rest of the month',
              'Consider reducing non-essential purchases',
              'Review your budget allocation',
            ],
          })
        }
      })

      // Analyze goal progress
      goals.forEach((goal) => {
        const saved = income - expenses
        const percentage = Math.min((saved / goal.targetAmount) * 100, 100)

        if (percentage < 25) {
          newInsights.push({
            id: `goal-behind-${goal.id}`,
            type: 'goal_progress',
            title: `Behind on Goal: ${goal.name}`,
            description: `You're at ${percentage.toFixed(1)}% of your ${goal.name} goal.`,
            severity: 'medium',
            actionable: true,
            action: 'Increase Savings',
            value: saved,
            percentage: percentage,
            confidence: 0.87,
            recommendations: [
              'Increase your monthly savings contribution',
              'Look for additional income opportunities',
              'Review your goal timeline',
            ],
          })
        } else if (percentage >= 100) {
          newInsights.push({
            id: `goal-completed-${goal.id}`,
            type: 'goal_progress',
            title: `Goal Achieved: ${goal.name}`,
            description: `Congratulations! You've reached your ${goal.name} goal.`,
            severity: 'low',
            actionable: false,
            value: saved,
            percentage: percentage,
            confidence: 1.0,
            recommendations: [
              'Consider setting a new financial goal',
              'Celebrate your achievement!',
              'Review your next financial priorities',
            ],
          })
        }
      })

      // Detect spending anomalies
      const recentTransactions = transactions
        .filter((t) => t.type === 'EXPENSE')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

      const avgTransactionAmount =
        recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) /
        recentTransactions.length

      const largeTransactions = recentTransactions.filter(
        (t) => Math.abs(t.amount) > avgTransactionAmount * 3
      )

      if (largeTransactions.length > 0) {
        newInsights.push({
          id: 'large-transactions',
          type: 'anomaly_detection',
          title: 'Unusual Spending Detected',
          description: `Found ${largeTransactions.length} transaction(s) significantly larger than your average.`,
          severity: 'medium',
          actionable: true,
          action: 'Review Transactions',
          value: largeTransactions.reduce(
            (sum, t) => sum + Math.abs(t.amount),
            0
          ),
          confidence: 0.78,
          recommendations: [
            "Review these transactions to ensure they're legitimate",
            'Consider if these are one-time expenses or recurring',
            'Update your budget if these are expected expenses',
          ],
        })
      }

      setInsights(newInsights.slice(0, 5)) // Show top 5 insights
      setLastAnalysis(new Date())
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (transactions.length > 0 && budgets.length > 0 && goals.length > 0) {
      generateInsights()
    }
  }, [transactions, budgets, goals])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50/50 border-red-200/60'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50/50 border-yellow-200/60'
      case 'low':
        return 'text-green-600 bg-green-50/50 border-green-200/60'
      default:
        return 'text-muted-foreground bg-muted/30 border-border/60'
    }
  }

  return (
    <Card
      className={`bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-700">
            AI Financial Insights
          </CardTitle>
          <Badge
            variant="outline"
            className="text-purple-600 bg-purple-50/50 border-purple-200/60"
          >
            AI Powered
          </Badge>
        </div>
        {lastAnalysis && (
          <p className="text-xs text-gray-500 mt-1">
            Last analyzed: {lastAnalysis.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Analyzing your finances...</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => {
              return (
                <div
                  key={insight.id}
                  className="p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {insight.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getSeverityColor(insight.severity)}`}
                    >
                      {insight.severity.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-600 mb-3">
                    {insight.description}
                  </p>

                  {insight.percentage !== undefined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{insight.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={insight.percentage} className="h-2" />
                    </div>
                  )}

                  {insight.recommendations &&
                    insight.recommendations.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">
                          Recommendations:
                        </h5>
                        <ul className="space-y-1">
                          {insight.recommendations
                            .slice(0, 2)
                            .map((rec, index) => (
                              <li
                                key={index}
                                className="text-xs text-gray-600 flex items-start space-x-2"
                              >
                                <div className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span>{rec}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                    {insight.actionable && (
                      <Button variant="outline" size="sm" className="text-xs">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No insights available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add more transactions to get personalized insights.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isAnalyzing}
            className="w-full text-xs"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>Refresh Insights</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
