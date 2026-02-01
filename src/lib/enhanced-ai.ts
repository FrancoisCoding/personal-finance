import { categorizeTransaction, generateFinancialInsights } from './ai'

export interface EnhancedInsight {
  id: string
  type:
    | 'spending_pattern'
    | 'budget_alert'
    | 'savings_opportunity'
    | 'subscription_review'
    | 'goal_progress'
    | 'budget_progress'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  actionable: boolean
  action?: string
  value?: number
  percentage?: number
  category?: string
}

export interface BudgetAnalysis {
  budgetId: string
  budgetName: string
  spent: number
  limit: number
  percentage: number
  status: 'on_track' | 'warning' | 'over_budget'
  daysLeft: number
  dailyAverage: number
  projectedSpend: number
}

export interface GoalAnalysis {
  goalId: string
  goalName: string
  currentAmount: number
  targetAmount: number
  percentage: number
  status: 'on_track' | 'behind' | 'ahead'
  monthsLeft: number
  monthlyRequired: number
  projectedCompletion: string
}

export interface SpendingPattern {
  category: string
  totalSpent: number
  averagePerTransaction: number
  transactionCount: number
  percentageOfTotal: number
  trend: 'increasing' | 'decreasing' | 'stable'
  lastMonthAmount: number
  changePercent: number
}

export interface AutoCategorizationResult {
  transactionId: string
  suggestedCategory: string
  confidence: number
  reason: string
}

/**
 * Automatically categorize transactions based on description patterns
 */
export async function autoCategorizeTransactions(
  transactions: Array<{
    id: string
    description: string
    amount: number
    category?: string | null
  }>
): Promise<AutoCategorizationResult[]> {
  const results: AutoCategorizationResult[] = []

  for (const transaction of transactions) {
    if (!transaction.category || transaction.category === 'Other') {
      try {
        const result = await categorizeTransaction(
          transaction.description,
          transaction.amount
        )
        results.push({
          transactionId: transaction.id,
          suggestedCategory: result.category,
          confidence: result.confidence,
          reason: `AI analysis based on description: "${transaction.description}"`,
        })
      } catch (error) {
        // Fallback to rule-based categorization
        const fallbackCategory = getFallbackCategory(
          transaction.description,
          transaction.amount
        )
        results.push({
          transactionId: transaction.id,
          suggestedCategory: fallbackCategory,
          confidence: 0.5,
          reason: 'Rule-based categorization',
        })
      }
    }
  }

  return results
}

/**
 * Analyze budget progress and provide insights
 */
export function analyzeBudgetProgress(
  budgets: Array<{
    id: string
    name: string
    amount: number
    category?: string
  }>,
  transactions: Array<{
    category?: string
    date: string | Date
    amount: number
  }>
): BudgetAnalysis[] {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysElapsed = currentDate.getDate()
  const daysLeft = daysInMonth - daysElapsed

  return budgets.map((budget) => {
    const budgetTransactions = transactions.filter(
      (t) =>
        t.category === budget.category &&
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
    )

    const spent = budgetTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    )
    const percentage = (spent / budget.amount) * 100
    const dailyAverage = spent / daysElapsed
    const projectedSpend = dailyAverage * daysInMonth

    let status: 'on_track' | 'warning' | 'over_budget' = 'on_track'
    if (percentage > 100) {
      status = 'over_budget'
    } else if (percentage > 80) {
      status = 'warning'
    }

    return {
      budgetId: budget.id,
      budgetName: budget.name,
      spent,
      limit: budget.amount,
      percentage,
      status,
      daysLeft,
      dailyAverage,
      projectedSpend,
    }
  })
}

/**
 * Analyze goal progress and provide insights
 */
export function analyzeGoalProgress(
  goals: Array<{
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    targetDate?: string | Date
    createdAt?: string | Date
  }>,
  transactions: Array<{ type: string; amount: number; category?: string }>
): GoalAnalysis[] {
  const currentDate = new Date()

  return goals.map((goal) => {
    const goalTransactions = transactions.filter(
      (t) => t.type === 'INCOME' // Assuming goals are funded by income
    )

    const currentAmount = goalTransactions.reduce((sum, t) => sum + t.amount, 0)
    const percentage = (currentAmount / goal.targetAmount) * 100

    const monthsElapsed = goal.createdAt
      ? (currentDate.getFullYear() - new Date(goal.createdAt).getFullYear()) * 12 +
        (currentDate.getMonth() - new Date(goal.createdAt).getMonth())
      : 0
    const monthsLeft = Math.max(
      0,
      goal.targetDate
        ? (new Date(goal.targetDate).getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24 * 30)
        : 12 - monthsElapsed
    )

    const monthlyRequired =
      monthsLeft > 0 ? (goal.targetAmount - currentAmount) / monthsLeft : 0

    let status: 'on_track' | 'behind' | 'ahead' = 'on_track'
    if (percentage < (monthsElapsed / 12) * 100) {
      status = 'behind'
    } else if (percentage > (monthsElapsed / 12) * 100 + 10) {
      status = 'ahead'
    }

    const projectedCompletion =
      monthsLeft > 0
        ? new Date(
            currentDate.getTime() + monthsLeft * 30 * 24 * 60 * 60 * 1000
          ).toLocaleDateString()
        : 'Target date passed'

    return {
      goalId: goal.id,
      goalName: goal.name,
      currentAmount,
      targetAmount: goal.targetAmount,
      percentage,
      status,
      monthsLeft: Math.round(monthsLeft),
      monthlyRequired,
      projectedCompletion,
    }
  })
}

/**
 * Analyze spending patterns and trends
 */
export function analyzeSpendingPatterns(
  transactions: Array<{ date: string | Date; type: string; amount: number; category?: string }>
): SpendingPattern[] {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const currentMonthTransactions = transactions.filter(
    (t) =>
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear &&
      t.type === 'EXPENSE'
  )

  const lastMonthTransactions = transactions.filter(
    (t) =>
      new Date(t.date).getMonth() === lastMonth &&
      new Date(t.date).getFullYear() === lastMonthYear &&
      t.type === 'EXPENSE'
  )

  const categoryGroups = currentMonthTransactions.reduce(
    (acc, t) => {
      const category = t.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(t)
      return acc
    },
    {} as Record<string, any[]>
  )

  const totalSpent = currentMonthTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  )

  return Object.entries(categoryGroups)
    .map(([category, transactions]) => {
      const totalSpent = (transactions as any[]).reduce(
        (sum: number, t: any) => sum + Math.abs(t.amount),
        0
      )
      const averagePerTransaction = totalSpent / (transactions as any[]).length
      const percentageOfTotal = (totalSpent / totalSpent) * 100

      const lastMonthAmount = (lastMonthTransactions as any[])
        .filter((t: any) => (t.category || 'Other') === category)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)

      const changePercent =
        lastMonthAmount > 0
          ? ((totalSpent - lastMonthAmount) / lastMonthAmount) * 100
          : 0

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (changePercent > 10) trend = 'increasing'
      else if (changePercent < -10) trend = 'decreasing'

      return {
        category,
        totalSpent,
        averagePerTransaction,
        transactionCount: (transactions as any[]).length,
        percentageOfTotal,
        trend,
        lastMonthAmount,
        changePercent,
      }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
}

/**
 * Generate comprehensive financial insights
 */
export async function generateEnhancedInsights(
  transactions: Array<{ id: string; description: string; amount: number; category?: string; date: string | Date; type: string }>,
  budgets: Array<{ id: string; name: string; amount: number; category?: string }>,
  goals: Array<{ id: string; name: string; targetAmount: number; currentAmount: number; targetDate?: string | Date; createdAt?: string | Date }>
): Promise<EnhancedInsight[]> {
  const insights: EnhancedInsight[] = []

  // Budget insights
  const budgetAnalysis = analyzeBudgetProgress(budgets, transactions)
  budgetAnalysis.forEach((budget) => {
    if (budget.status === 'over_budget') {
      insights.push({
        id: `budget-${budget.budgetId}`,
        type: 'budget_alert',
        title: `Over Budget: ${budget.budgetName}`,
        description: `You've spent ${budget.percentage.toFixed(1)}% of your ${budget.budgetName} budget. Consider reducing spending in this category.`,
        severity: 'high',
        actionable: true,
        action: 'Review Budget',
        value: budget.spent,
        percentage: budget.percentage,
        category: budget.budgetName,
      })
    } else if (budget.status === 'warning') {
      insights.push({
        id: `budget-warning-${budget.budgetId}`,
        type: 'budget_alert',
        title: `Budget Warning: ${budget.budgetName}`,
        description: `You've used ${budget.percentage.toFixed(1)}% of your ${budget.budgetName} budget with ${budget.daysLeft} days left in the month.`,
        severity: 'medium',
        actionable: true,
        action: 'Adjust Spending',
        value: budget.spent,
        percentage: budget.percentage,
        category: budget.budgetName,
      })
    }
  })

  // Goal insights
  const goalAnalysis = analyzeGoalProgress(goals, transactions)
  goalAnalysis.forEach((goal) => {
    if (goal.status === 'behind') {
      insights.push({
        id: `goal-${goal.goalId}`,
        type: 'goal_progress',
        title: `Behind on Goal: ${goal.goalName}`,
        description: `You're ${goal.percentage.toFixed(1)}% toward your ${goal.goalName} goal. You need to save ${goal.monthlyRequired.toFixed(0)} per month to reach your target.`,
        severity: 'medium',
        actionable: true,
        action: 'Review Goal',
        value: goal.currentAmount,
        percentage: goal.percentage,
        category: goal.goalName,
      })
    } else if (goal.status === 'ahead') {
      insights.push({
        id: `goal-ahead-${goal.goalId}`,
        type: 'goal_progress',
        title: `Ahead on Goal: ${goal.goalName}`,
        description: `Great progress! You're ${goal.percentage.toFixed(1)}% toward your ${goal.goalName} goal and ahead of schedule.`,
        severity: 'low',
        actionable: false,
        value: goal.currentAmount,
        percentage: goal.percentage,
        category: goal.goalName,
      })
    }
  })

  // Spending pattern insights
  const spendingPatterns = analyzeSpendingPatterns(transactions)
  const topSpendingCategory = spendingPatterns[0]
  if (topSpendingCategory && topSpendingCategory.percentageOfTotal > 30) {
    insights.push({
      id: 'spending-pattern',
      type: 'spending_pattern',
      title: `High Spending in ${topSpendingCategory.category}`,
      description: `${topSpendingCategory.category} accounts for ${topSpendingCategory.percentageOfTotal.toFixed(1)}% of your spending this month. Consider if this aligns with your priorities.`,
      severity: 'medium',
      actionable: true,
      action: 'Review Spending',
      value: topSpendingCategory.totalSpent,
      percentage: topSpendingCategory.percentageOfTotal,
      category: topSpendingCategory.category,
    })
  }

  // Savings opportunity insights
  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  if (savingsRate < 20) {
    insights.push({
      id: 'savings-opportunity',
      type: 'savings_opportunity',
      title: 'Low Savings Rate',
      description: `Your savings rate is ${savingsRate.toFixed(1)}%. Consider increasing your savings to 20% or more for better financial security.`,
      severity: 'medium',
      actionable: true,
      action: 'Create Budget',
      value: totalIncome - totalExpenses,
      percentage: savingsRate,
    })
  }

  return insights.slice(0, 5) // Return top 5 insights
}

/**
 * Fallback categorization when AI fails
 */
function getFallbackCategory(description: string, amount: number): string {
  const lowerDesc = description.toLowerCase()

  if (
    lowerDesc.includes('restaurant') ||
    lowerDesc.includes('cafe') ||
    lowerDesc.includes('food') ||
    lowerDesc.includes('grocery') ||
    lowerDesc.includes('mcdonalds') ||
    lowerDesc.includes('burger') ||
    lowerDesc.includes('taco') ||
    lowerDesc.includes('sushi') ||
    lowerDesc.includes('starbucks') ||
    lowerDesc.includes('subway') ||
    lowerDesc.includes('kfc') ||
    lowerDesc.includes('wendys') ||
    lowerDesc.includes('chipotle') ||
    lowerDesc.includes('dominos') ||
    lowerDesc.includes('papa johns')
  ) {
    return 'Food & Dining'
  }
  if (
    lowerDesc.includes('uber') ||
    lowerDesc.includes('lyft') ||
    lowerDesc.includes('gas') ||
    lowerDesc.includes('fuel') ||
    lowerDesc.includes('parking') ||
    lowerDesc.includes('taxi') ||
    lowerDesc.includes('transit') ||
    lowerDesc.includes('bus') ||
    lowerDesc.includes('train') ||
    lowerDesc.includes('metro') ||
    lowerDesc.includes('subway') ||
    lowerDesc.includes('bicycle') ||
    lowerDesc.includes('bike') ||
    lowerDesc.includes('madison bicycle') ||
    lowerDesc.includes('bicycle shop') ||
    lowerDesc.includes('car wash') ||
    lowerDesc.includes('auto') ||
    lowerDesc.includes('repair')
  ) {
    return 'Transportation'
  }
  if (
    lowerDesc.includes('amazon') ||
    lowerDesc.includes('store') ||
    lowerDesc.includes('shop') ||
    lowerDesc.includes('retail') ||
    lowerDesc.includes('mall') ||
    lowerDesc.includes('buy') ||
    lowerDesc.includes('walmart') ||
    lowerDesc.includes('target') ||
    lowerDesc.includes('costco') ||
    lowerDesc.includes('best buy') ||
    lowerDesc.includes('home depot') ||
    lowerDesc.includes('lowes') ||
    lowerDesc.includes('ikea') ||
    lowerDesc.includes('clothing') ||
    lowerDesc.includes('apparel')
  ) {
    return 'Shopping'
  }
  if (
    lowerDesc.includes('netflix') ||
    lowerDesc.includes('spotify') ||
    lowerDesc.includes('movie') ||
    lowerDesc.includes('concert') ||
    lowerDesc.includes('theater') ||
    lowerDesc.includes('show') ||
    lowerDesc.includes('hobby') ||
    lowerDesc.includes('craft') ||
    lowerDesc.includes('art') ||
    lowerDesc.includes('music') ||
    lowerDesc.includes('streaming') ||
    lowerDesc.includes('youtube') ||
    lowerDesc.includes('game') ||
    lowerDesc.includes('disney') ||
    lowerDesc.includes('hulu') ||
    lowerDesc.includes('hbo') ||
    lowerDesc.includes('paramount') ||
    lowerDesc.includes('peacock') ||
    lowerDesc.includes('apple tv') ||
    lowerDesc.includes('prime video') ||
    lowerDesc.includes('amazon prime') ||
    lowerDesc.includes('twitch') ||
    lowerDesc.includes('tiktok') ||
    lowerDesc.includes('instagram') ||
    lowerDesc.includes('facebook') ||
    lowerDesc.includes('twitter') ||
    lowerDesc.includes('reddit') ||
    lowerDesc.includes('discord') ||
    lowerDesc.includes('steam') ||
    lowerDesc.includes('playstation') ||
    lowerDesc.includes('xbox') ||
    lowerDesc.includes('nintendo') ||
    lowerDesc.includes('esports') ||
    lowerDesc.includes('gaming')
  ) {
    return 'Entertainment'
  }
  if (
    lowerDesc.includes('sparkfun') ||
    lowerDesc.includes('electronics') ||
    lowerDesc.includes('computer') ||
    lowerDesc.includes('laptop') ||
    lowerDesc.includes('desktop') ||
    lowerDesc.includes('tablet') ||
    lowerDesc.includes('smartphone') ||
    lowerDesc.includes('software') ||
    lowerDesc.includes('app') ||
    lowerDesc.includes('subscription') ||
    lowerDesc.includes('saas') ||
    lowerDesc.includes('cloud') ||
    lowerDesc.includes('server') ||
    lowerDesc.includes('hosting') ||
    lowerDesc.includes('domain') ||
    lowerDesc.includes('website') ||
    lowerDesc.includes('web hosting') ||
    lowerDesc.includes('github') ||
    lowerDesc.includes('gitlab') ||
    lowerDesc.includes('bitbucket') ||
    lowerDesc.includes('aws') ||
    lowerDesc.includes('amazon web services') ||
    lowerDesc.includes('google cloud') ||
    lowerDesc.includes('azure') ||
    lowerDesc.includes('microsoft azure') ||
    lowerDesc.includes('digitalocean') ||
    lowerDesc.includes('heroku') ||
    lowerDesc.includes('vercel') ||
    lowerDesc.includes('netlify') ||
    lowerDesc.includes('shopify') ||
    lowerDesc.includes('wordpress') ||
    lowerDesc.includes('squarespace') ||
    lowerDesc.includes('wix') ||
    lowerDesc.includes('weebly') ||
    lowerDesc.includes('figma') ||
    lowerDesc.includes('adobe') ||
    lowerDesc.includes('creative cloud') ||
    lowerDesc.includes('office 365') ||
    lowerDesc.includes('microsoft office') ||
    lowerDesc.includes('google workspace') ||
    lowerDesc.includes('g suite') ||
    lowerDesc.includes('slack') ||
    lowerDesc.includes('zoom') ||
    lowerDesc.includes('teams') ||
    lowerDesc.includes('notion') ||
    lowerDesc.includes('asana') ||
    lowerDesc.includes('trello') ||
    lowerDesc.includes('jira') ||
    lowerDesc.includes('confluence') ||
    lowerDesc.includes('dropbox') ||
    lowerDesc.includes('google drive') ||
    lowerDesc.includes('onedrive') ||
    lowerDesc.includes('icloud') ||
    lowerDesc.includes('backblaze') ||
    lowerDesc.includes('carbonite') ||
    lowerDesc.includes('lastpass') ||
    lowerDesc.includes('1password') ||
    lowerDesc.includes('bitwarden') ||
    lowerDesc.includes('dashlane') ||
    lowerDesc.includes('nordvpn') ||
    lowerDesc.includes('expressvpn') ||
    lowerDesc.includes('surfshark') ||
    lowerDesc.includes('protonvpn')
  ) {
    return 'Technology'
  }
  if (
    lowerDesc.includes('electric') ||
    lowerDesc.includes('water') ||
    lowerDesc.includes('phone') ||
    lowerDesc.includes('internet') ||
    lowerDesc.includes('cable') ||
    lowerDesc.includes('wifi') ||
    lowerDesc.includes('power') ||
    lowerDesc.includes('gas company') ||
    lowerDesc.includes('utility') ||
    lowerDesc.includes('energy')
  ) {
    return 'Utilities'
  }
  if (
    lowerDesc.includes('doctor') ||
    lowerDesc.includes('pharmacy') ||
    lowerDesc.includes('medical') ||
    lowerDesc.includes('health') ||
    lowerDesc.includes('dentist') ||
    lowerDesc.includes('hospital') ||
    lowerDesc.includes('clinic') ||
    lowerDesc.includes('cvs') ||
    lowerDesc.includes('walgreens') ||
    lowerDesc.includes('rite aid') ||
    lowerDesc.includes('prescription') ||
    lowerDesc.includes('medicine')
  ) {
    return 'Healthcare'
  }
  if (
    lowerDesc.includes('tectra') ||
    lowerDesc.includes('tectra inc') ||
    lowerDesc.includes('consulting') ||
    lowerDesc.includes('professional') ||
    lowerDesc.includes('expert') ||
    lowerDesc.includes('service') ||
    lowerDesc.includes('repair') ||
    lowerDesc.includes('maintenance') ||
    lowerDesc.includes('cleaning') ||
    lowerDesc.includes('laundry') ||
    lowerDesc.includes('dry cleaning') ||
    lowerDesc.includes('landscaping') ||
    lowerDesc.includes('gardening') ||
    lowerDesc.includes('pool service') ||
    lowerDesc.includes('housekeeping') ||
    lowerDesc.includes('maid service') ||
    lowerDesc.includes('janitorial') ||
    lowerDesc.includes('security') ||
    lowerDesc.includes('alarm') ||
    lowerDesc.includes('monitoring') ||
    lowerDesc.includes('installation') ||
    lowerDesc.includes('setup') ||
    lowerDesc.includes('assembly') ||
    lowerDesc.includes('delivery') ||
    lowerDesc.includes('shipping') ||
    lowerDesc.includes('freight') ||
    lowerDesc.includes('logistics') ||
    lowerDesc.includes('storage') ||
    lowerDesc.includes('warehouse') ||
    lowerDesc.includes('moving') ||
    lowerDesc.includes('relocation') ||
    lowerDesc.includes('packing') ||
    lowerDesc.includes('unpacking') ||
    lowerDesc.includes('organizing') ||
    lowerDesc.includes('decluttering') ||
    lowerDesc.includes('interior design') ||
    lowerDesc.includes('decorating') ||
    lowerDesc.includes('renovation') ||
    lowerDesc.includes('remodeling') ||
    lowerDesc.includes('construction') ||
    lowerDesc.includes('contractor') ||
    lowerDesc.includes('plumber') ||
    lowerDesc.includes('electrician') ||
    lowerDesc.includes('hvac') ||
    lowerDesc.includes('heating') ||
    lowerDesc.includes('cooling') ||
    lowerDesc.includes('ac repair') ||
    lowerDesc.includes('heater repair') ||
    lowerDesc.includes('furnace repair') ||
    lowerDesc.includes('appliance repair') ||
    lowerDesc.includes('computer repair') ||
    lowerDesc.includes('phone repair') ||
    lowerDesc.includes('screen repair') ||
    lowerDesc.includes('battery replacement') ||
    lowerDesc.includes('key replacement') ||
    lowerDesc.includes('lock repair') ||
    lowerDesc.includes('garage door') ||
    lowerDesc.includes('gate repair') ||
    lowerDesc.includes('fence repair') ||
    lowerDesc.includes('roof repair') ||
    lowerDesc.includes('gutter cleaning') ||
    lowerDesc.includes('window cleaning') ||
    lowerDesc.includes('pressure washing') ||
    lowerDesc.includes('pest control') ||
    lowerDesc.includes('exterminator') ||
    lowerDesc.includes('termite') ||
    lowerDesc.includes('rodent') ||
    lowerDesc.includes('insect') ||
    lowerDesc.includes('weed control') ||
    lowerDesc.includes('fertilizer') ||
    lowerDesc.includes('irrigation') ||
    lowerDesc.includes('sprinkler') ||
    lowerDesc.includes('tree service') ||
    lowerDesc.includes('tree trimming') ||
    lowerDesc.includes('tree removal') ||
    lowerDesc.includes('stump grinding') ||
    lowerDesc.includes('mulch') ||
    lowerDesc.includes('soil') ||
    lowerDesc.includes('compost') ||
    lowerDesc.includes('pesticide') ||
    lowerDesc.includes('herbicide')
  ) {
    return 'Services'
  }
  if (
    lowerDesc.includes('salary') ||
    lowerDesc.includes('payroll') ||
    lowerDesc.includes('deposit') ||
    lowerDesc.includes('direct deposit') ||
    lowerDesc.includes('paycheck') ||
    lowerDesc.includes('income') ||
    lowerDesc.includes('gusto') ||
    lowerDesc.includes('gusto pay') ||
    lowerDesc.includes('ach electronic creditgusto pay') ||
    lowerDesc.includes('pay') ||
    lowerDesc.includes('wage')
  ) {
    return 'Salary'
  }
  if (
    lowerDesc.includes('service') ||
    lowerDesc.includes('repair') ||
    lowerDesc.includes('maintenance') ||
    lowerDesc.includes('cleaning') ||
    lowerDesc.includes('laundry') ||
    lowerDesc.includes('dry cleaning') ||
    lowerDesc.includes('tectra') ||
    lowerDesc.includes('tectra inc') ||
    lowerDesc.includes('consulting') ||
    lowerDesc.includes('professional') ||
    lowerDesc.includes('expert')
  ) {
    return 'Services'
  }
  if (
    lowerDesc.includes('technology') ||
    lowerDesc.includes('tech') ||
    lowerDesc.includes('software') ||
    lowerDesc.includes('app') ||
    lowerDesc.includes('digital') ||
    lowerDesc.includes('computer') ||
    lowerDesc.includes('sparkfun') ||
    lowerDesc.includes('electronics') ||
    lowerDesc.includes('gadget') ||
    lowerDesc.includes('device')
  ) {
    return 'Technology'
  }
  if (
    lowerDesc.includes('business') ||
    lowerDesc.includes('office') ||
    lowerDesc.includes('work') ||
    lowerDesc.includes('professional') ||
    lowerDesc.includes('corporate') ||
    lowerDesc.includes('meeting') ||
    lowerDesc.includes('conference') ||
    lowerDesc.includes('expense') ||
    lowerDesc.includes('client')
  ) {
    return 'Business'
  }
  if (
    lowerDesc.includes('rent') ||
    lowerDesc.includes('mortgage') ||
    lowerDesc.includes('home') ||
    lowerDesc.includes('apartment') ||
    lowerDesc.includes('house')
  ) {
    return 'Housing'
  }
  if (
    lowerDesc.includes('tuition') ||
    lowerDesc.includes('school') ||
    lowerDesc.includes('college') ||
    lowerDesc.includes('university') ||
    lowerDesc.includes('course') ||
    lowerDesc.includes('training') ||
    lowerDesc.includes('book') ||
    lowerDesc.includes('textbook') ||
    lowerDesc.includes('library') ||
    lowerDesc.includes('student')
  ) {
    return 'Education'
  }
  if (
    lowerDesc.includes('hotel') ||
    lowerDesc.includes('flight') ||
    lowerDesc.includes('airline') ||
    lowerDesc.includes('vacation') ||
    lowerDesc.includes('trip') ||
    lowerDesc.includes('travel') ||
    lowerDesc.includes('airbnb') ||
    lowerDesc.includes('booking') ||
    lowerDesc.includes('expedia') ||
    lowerDesc.includes('orbitz')
  ) {
    return 'Travel'
  }
  if (
    lowerDesc.includes('insurance') ||
    lowerDesc.includes('geico') ||
    lowerDesc.includes('state farm') ||
    lowerDesc.includes('allstate') ||
    lowerDesc.includes('progressive')
  ) {
    return 'Insurance'
  }
  if (
    lowerDesc.includes('investment') ||
    lowerDesc.includes('stock') ||
    lowerDesc.includes('bond') ||
    lowerDesc.includes('retirement') ||
    lowerDesc.includes('401k') ||
    lowerDesc.includes('ira') ||
    lowerDesc.includes('robinhood') ||
    lowerDesc.includes('fidelity') ||
    lowerDesc.includes('vanguard') ||
    lowerDesc.includes('schwab')
  ) {
    return 'Investment'
  }
  if (
    lowerDesc.includes('freelance') ||
    lowerDesc.includes('contract') ||
    lowerDesc.includes('consulting') ||
    lowerDesc.includes('upwork') ||
    lowerDesc.includes('fiverr') ||
    lowerDesc.includes('gig') ||
    lowerDesc.includes('independent') ||
    lowerDesc.includes('self-employed')
  ) {
    return 'Freelance'
  }
  if (
    lowerDesc.includes('gift') ||
    lowerDesc.includes('present') ||
    lowerDesc.includes('donation') ||
    lowerDesc.includes('charity') ||
    lowerDesc.includes('give') ||
    lowerDesc.includes('contribution')
  ) {
    return 'Gifts'
  }
  if (
    lowerDesc.includes('subscription') ||
    lowerDesc.includes('membership') ||
    lowerDesc.includes('recurring') ||
    lowerDesc.includes('monthly') ||
    lowerDesc.includes('annual') ||
    lowerDesc.includes('hulu') ||
    lowerDesc.includes('disney') ||
    lowerDesc.includes('amazon prime')
  ) {
    return 'Subscriptions'
  }
  if (
    lowerDesc.includes('haircut') ||
    lowerDesc.includes('salon') ||
    lowerDesc.includes('beauty') ||
    lowerDesc.includes('grooming') ||
    lowerDesc.includes('spa') ||
    lowerDesc.includes('massage') ||
    lowerDesc.includes('nail') ||
    lowerDesc.includes('cosmetic') ||
    lowerDesc.includes('personal care')
  ) {
    return 'Personal Care'
  }
  if (
    lowerDesc.includes('gym') ||
    lowerDesc.includes('fitness') ||
    lowerDesc.includes('workout') ||
    lowerDesc.includes('exercise') ||
    lowerDesc.includes('sports') ||
    lowerDesc.includes('athletic') ||
    lowerDesc.includes('planet fitness') ||
    lowerDesc.includes('la fitness') ||
    lowerDesc.includes('24 hour fitness')
  ) {
    return 'Fitness'
  }
  if (
    lowerDesc.includes('pet') ||
    lowerDesc.includes('dog') ||
    lowerDesc.includes('cat') ||
    lowerDesc.includes('veterinary') ||
    lowerDesc.includes('vet') ||
    lowerDesc.includes('animal') ||
    lowerDesc.includes('petco') ||
    lowerDesc.includes('petsmart')
  ) {
    return 'Pets'
  }
  if (
    lowerDesc.includes('charity') ||
    lowerDesc.includes('nonprofit') ||
    lowerDesc.includes('foundation') ||
    lowerDesc.includes('cause') ||
    lowerDesc.includes('help')
  ) {
    return 'Charity'
  }
  if (
    lowerDesc.includes('legal') ||
    lowerDesc.includes('lawyer') ||
    lowerDesc.includes('attorney') ||
    lowerDesc.includes('court') ||
    lowerDesc.includes('law') ||
    lowerDesc.includes('legal fee')
  ) {
    return 'Legal'
  }
  if (
    lowerDesc.includes('tax') ||
    lowerDesc.includes('irs') ||
    lowerDesc.includes('filing') ||
    lowerDesc.includes('tax return') ||
    lowerDesc.includes('tax payment')
  ) {
    return 'Taxes'
  }

  return 'Other'
}
