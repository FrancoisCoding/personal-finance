'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { setDisplayPreferences } from '@/lib/display-preferences'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { useToast } from '@/hooks/use-toast'

export interface IUserPreferences {
  locale: string
  currency: string
  hasManualCurrencyPreference: boolean
}

interface IUpdateUserPreferencesPayload {
  locale?: string
  currency?: string
  useAutoDetectedCurrency?: boolean
}

const userPreferencesQueryKey = ['user-preferences'] as const

const fetchUserPreferences = async (): Promise<IUserPreferences> => {
  const response = await fetch('/api/user/preferences')
  if (!response.ok) {
    throw new Error('Failed to load preferences')
  }
  const preferences = (await response.json()) as IUserPreferences
  setDisplayPreferences({
    locale: preferences.locale,
    currency: preferences.currency,
  })
  return preferences
}

export const useUserPreferences = () => {
  const { data: session } = useSession()
  const { isDemoMode } = useDemoMode()

  return useQuery({
    queryKey: userPreferencesQueryKey,
    queryFn: fetchUserPreferences,
    enabled: Boolean(session?.user?.id) || isDemoMode,
    staleTime: 10 * 60 * 1000,
  })
}

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (payload: IUpdateUserPreferencesPayload) => {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(payload.error || 'Failed to update preferences')
      }

      return response.json() as Promise<IUserPreferences>
    },
    onSuccess: (updatedPreferences) => {
      setDisplayPreferences({
        locale: updatedPreferences.locale,
        currency: updatedPreferences.currency,
      })
      queryClient.setQueryData(userPreferencesQueryKey, updatedPreferences)
      toast({
        title: 'Preferences updated',
        description:
          'Language and currency settings were updated across your workspace.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error ? error.message : 'Failed to update settings.',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userPreferencesQueryKey })
    },
  })
}
