// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

// Transaction API Types
export interface TransactionApiResponse {
  id: string
  userId: string
  accountId: string
  categoryId?: string
  amount: number
  description: string
  date: string // ISO date string from API
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  isRecurring: boolean
  tags: string[]
  notes?: string
  category?: string | null
  account?: {
    id: string
    name: string
    type: string
  }
}

// Bulk Categorization Types
export interface BulkCategorizeRequest {
  transactionIds: string[]
}

export interface CategorizationResult {
  transactionId: string
  suggestedCategory: string
  confidence: number
  reason: string
}

export interface BulkCategorizeResponse {
  message: string
  results: CategorizationResult[]
}

// AI Categorization Types
export interface AICategorizationResult {
  category: string
  confidence: number
}

// Category API Types
export interface CategoryApiResponse {
  id: string
  userId?: string
  name: string
  color: string
  icon?: string
  isDefault: boolean
  isIncome: boolean
  createdAt: string
  updatedAt: string
}

// Account API Types
export interface AccountApiResponse {
  id: string
  userId: string
  name: string
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'LOAN' | 'OTHER'
  balance: number
  currency: string
  institution?: string
  accountNumber?: string
  creditLimit?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Budget API Types
export interface BudgetApiResponse {
  id: string
  userId: string
  categoryId?: string
  name: string
  amount: number
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  startDate: string
  endDate?: string
  isActive: boolean
  isRecurring: boolean
  createdAt: string
  updatedAt: string
  category?: CategoryApiResponse
}

// Goal API Types
export interface GoalApiResponse {
  id: string
  userId: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  color: string
  icon?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
  milestones: MilestoneApiResponse[]
}

export interface MilestoneApiResponse {
  id: string
  goalId: string
  name: string
  targetAmount: number
  isCompleted: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// Subscription API Types
export interface SubscriptionApiResponse {
  id: string
  userId: string
  name: string
  amount: number
  currency: string
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
  nextBillingDate: string
  categoryId?: string
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
  category?: CategoryApiResponse
}

// Utility type for converting API responses to store types
export type ApiToStore<T extends keyof ApiTypeMap> = ApiTypeMap[T]

interface ApiTypeMap {
  transaction: TransactionApiResponse
  category: CategoryApiResponse
  account: AccountApiResponse
  budget: BudgetApiResponse
  goal: GoalApiResponse
  subscription: SubscriptionApiResponse
  bulkCategorize: BulkCategorizeResponse
} 