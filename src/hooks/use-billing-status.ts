'use client'

import { useQuery } from '@tanstack/react-query'

interface IPlanDefinition {
  plan: 'BASIC' | 'PRO'
  name: string
  monthlyPriceInCents: number
  monthlyPriceLabel: string
  description: string
  featureList: string[]
}

interface ICurrentSubscription {
  id: string
  plan: 'BASIC' | 'PRO'
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface IBillingStatusResponse {
  currentPlan: 'BASIC' | 'PRO' | null
  currentSubscription: ICurrentSubscription | null
  availablePlans: IPlanDefinition[]
}

const fetchBillingStatus = async (): Promise<IBillingStatusResponse> => {
  const response = await fetch('/api/billing/subscription')
  if (!response.ok) {
    throw new Error('Failed to fetch billing status.')
  }
  return response.json()
}

export const useBillingStatus = () => {
  return useQuery({
    queryKey: ['billing-status'],
    queryFn: fetchBillingStatus,
    staleTime: 30_000,
  })
}
