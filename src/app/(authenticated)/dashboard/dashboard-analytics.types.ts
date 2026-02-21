export interface IWorkerCategory {
  id: string
  name: string
}

export interface IWorkerSubscription {
  amount: number
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'WEEKLY' | 'CUSTOM'
  id: string
  isActive: boolean
  name: string
  nextBillingDate: string
}

export interface IWorkerTransaction {
  amount: number
  category?: string | null
  categoryId?: string | null
  categoryRelationName?: string | null
  date: string
  description: string
  id: string
  isRecurring: boolean
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
}

export interface IWorkerAccount {
  id: string
  type: string
  updatedAt?: string | null
}

export interface IDashboardWorkerRequestPayload {
  accounts: IWorkerAccount[]
  categories: IWorkerCategory[]
  liquidCashBalance: number
  subscriptions: IWorkerSubscription[]
  transactions: IWorkerTransaction[]
}

export interface ICashFlowTimelineEntry {
  day: Date
  dayKey: string
  delta: number
  endingBalance: number
  isLowCashDay: boolean
}

export interface ICashFlowEvent {
  amount: number
  date: Date
  id: string
  kind: 'income' | 'expense'
  source: 'subscription' | 'pattern'
  title: string
}

export interface ICashFlowPlanningSnapshot {
  expenses14: number
  expenses30: number
  income14: number
  income30: number
  lowCashDays: number
  lowCashThreshold: number
  net14: number
  net30: number
  timeline: ICashFlowTimelineEntry[]
  upcomingEvents: ICashFlowEvent[]
}

export interface ISpendingWorkerItem {
  amount: number
  category: string
  percentage: number
}

export interface IDataQualitySnapshot {
  possibleDuplicates: number
  staleAccounts: number
  uncategorizedCount: number
}

export interface IDashboardWorkerResultPayload {
  cashFlowPlanningSnapshot: ICashFlowPlanningSnapshot
  dataQualitySnapshot: IDataQualitySnapshot
  expenseTotalsByDay: Record<string, number>
  spendingData: ISpendingWorkerItem[]
}

export interface IDashboardWorkerRequest {
  payload: IDashboardWorkerRequestPayload
  requestId: number
}

export interface IDashboardWorkerResponse {
  payload: IDashboardWorkerResultPayload
  requestId: number
}
