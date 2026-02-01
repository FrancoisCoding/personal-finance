'use client'

import { useState, useCallback, useEffect, memo } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Link } from 'lucide-react'
import { queryKeys, useSyncTransactions } from '@/hooks/use-finance-data'

interface PlaidLinkProps {
  onSuccess: () => void
}

export const PlaidLink = memo(function PlaidLink({ onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shouldOpen, setShouldOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const syncTransactions = useSyncTransactions()

  const onPlaidSuccess = useCallback(
    async (public_token: string) => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/plaid/exchange-public-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_token }),
        })

        if (!response.ok) {
          throw new Error('Failed to connect account')
        }

        const data = await response.json()
        toast({
          title: 'Success!',
          description: `Connected ${data.accounts.length} account(s) successfully. Syncing transactions...`,
        })
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions })

        // Sync transactions after connecting accounts
        await syncTransactions.mutateAsync()

        onSuccess()
      } catch (error) {
        console.error('Error connecting account:', error)
        toast({
          title: 'Connection failed',
          description: 'Failed to connect your account. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, toast, queryClient, syncTransactions]
  )

  const onPlaidExit = useCallback(
    (err: unknown) => {
      if (err) {
        console.error('Plaid Link exit error:', err)
        toast({
          title: 'Connection cancelled',
          description: 'Account connection was cancelled.',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  })

  // Auto-open Plaid Link when token is ready and we should open
  useEffect(() => {
    if (linkToken && ready && shouldOpen) {
      open()
      setShouldOpen(false)
    }
  }, [linkToken, ready, shouldOpen, open])

  const createLinkToken = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create link token')
      }

      const data = await response.json()
      setLinkToken(data.link_token)
    } catch (error) {
      console.error('Error creating link token:', error)
      toast({
        title: 'Setup failed',
        description:
          'Failed to initialize account connection. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = async () => {
    if (!linkToken) {
      setShouldOpen(true)
      await createLinkToken()
    } else if (ready) {
      open()
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Link className="w-4 h-4 mr-2" />
      )}
      Connect Bank Account
    </Button>
  )
})
