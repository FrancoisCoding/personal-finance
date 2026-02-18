'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useDemoMode } from '@/hooks/use-demo-mode'

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
  isSuperUser?: boolean
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
  const { data: session } = useSession()
  const { isDemoMode } = useDemoMode()

  return useQuery({
    queryKey: ['billing-status'],
    queryFn: fetchBillingStatus,
    enabled: Boolean(session?.user?.id) && !isDemoMode,
    retry: false,
    staleTime: 30_000,
  })
}
