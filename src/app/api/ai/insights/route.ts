import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateEnhancedInsights } from '@/lib/enhanced-ai'
import type { Transaction, Budget, Goal } from '@prisma/client'
import { buildDemoData } from '@/lib/demo-data'
import { isDemoModeRequest } from '@/lib/demo-mode'

export async function GET(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      const demoData = buildDemoData()
      const insights = await generateEnhancedInsights(
        demoData.transactions.map((transaction) => ({
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category || undefined,
          date: transaction.date,
          type: transaction.type,
        })),
        demoData.budgets.map((budget) => ({
          id: budget.id,
          name: budget.name,
          amount: budget.amount,
          category: budget.categoryId || undefined,
        })),
        demoData.goals.map((goal) => ({
          id: goal.id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          targetDate: goal.targetDate || undefined,
          createdAt: goal.createdAt,
        }))
      )

      return NextResponse.json({
        insights,
        summary: {
          totalTransactions: demoData.transactions.length,
          totalBudgets: demoData.budgets.length,
          totalGoals: demoData.goals.length,
          insightsCount: insights.length,
        },
      })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's financial data
    const [transactions, budgets, goals] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
        take: 1000, // Last 1000 transactions
      }),
      prisma.budget.findMany({
        where: { userId: session.user.id },
      }),
      prisma.goal.findMany({
        where: { userId: session.user.id },
      }),
    ])

    // Transform transactions to match expected type
    const transformedTransactions = transactions.map((t) => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      category: t.category || undefined,
      date: t.date,
      type: t.type,
    }))

    // Transform budgets to match expected type
    const transformedBudgets = budgets.map((b) => ({
      id: b.id,
      name: b.name,
      amount: b.amount,
      category: b.categoryId || undefined,
    }))

    // Transform goals to match expected type
    const transformedGoals = goals.map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate || undefined,
      createdAt: g.createdAt,
    }))

    // Generate insights
    const insights = await generateEnhancedInsights(
      transformedTransactions,
      transformedBudgets,
      transformedGoals
    )

    return NextResponse.json({
      insights,
      summary: {
        totalTransactions: transactions.length,
        totalBudgets: budgets.length,
        totalGoals: goals.length,
        insightsCount: insights.length,
      },
    })
  } catch (error) {
    console.error('Insights generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      const { type, data } = await request.json()

      switch (type) {
        case 'spending_analysis':
          return NextResponse.json({
            insights: await analyzeSpendingPatterns(data.transactions),
          })
        case 'budget_review':
          return NextResponse.json({
            insights: await analyzeBudgetProgress(
              data.budgets,
              data.transactions
            ),
          })
        case 'goal_progress':
          return NextResponse.json({
            insights: await analyzeGoalProgress(data.goals, data.transactions),
          })
        default:
          return NextResponse.json(
            { error: 'Invalid insight type' },
            { status: 400 }
          )
      }
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, data } = await request.json()

    // Handle different types of insight requests
    switch (type) {
      case 'spending_analysis':
        // Analyze spending patterns
        const spendingInsights = await analyzeSpendingPatterns(
          data.transactions
        )
        return NextResponse.json({ insights: spendingInsights })

      case 'budget_review':
        // Review budget performance
        const budgetInsights = await analyzeBudgetProgress(
          data.budgets,
          data.transactions
        )
        return NextResponse.json({ insights: budgetInsights })

      case 'goal_progress':
        // Check goal progress
        const goalInsights = await analyzeGoalProgress(
          data.goals,
          data.transactions
        )
        return NextResponse.json({ insights: goalInsights })

      default:
        return NextResponse.json(
          { error: 'Invalid insight type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Custom insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate custom insights' },
      { status: 500 }
    )
  }
}

// Helper functions (you can move these to enhanced-ai.ts)
async function analyzeSpendingPatterns(transactions: Transaction[]) {
  // Implementation for spending pattern analysis
  if (transactions.length === 0) {
    return []
  }
  return []
}

async function analyzeBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[]
) {
  // Implementation for budget progress analysis
  if (budgets.length === 0 || transactions.length === 0) {
    return []
  }
  return []
}

async function analyzeGoalProgress(goals: Goal[], transactions: Transaction[]) {
  // Implementation for goal progress analysis
  if (goals.length === 0 || transactions.length === 0) {
    return []
  }
  return []
}
