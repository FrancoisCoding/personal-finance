'use client'

import { useCallback, useState, memo } from 'react'
import Script from 'next/script'
import { useQueryClient } from '@tanstack/react-query'
import { Link, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { queryKeys, useSyncTransactions } from '@/hooks/use-finance-data'

declare global {
  interface Window {
    TellerConnect?: {
      setup: (options: {
        applicationId: string
        environment: string
        onSuccess: (enrollment: unknown) => void
        onExit?: () => void
        onFailure?: (error: unknown) => void
      }) => { open: () => void }
    }
  }
}

interface TellerLinkProps {
  onSuccess: () => void
}

export const TellerLink = memo(function TellerLink({
  onSuccess,
}: TellerLinkProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptReady, setIsScriptReady] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const syncTransactions = useSyncTransactions()

  const handleEnrollmentSuccess = useCallback(
    async (enrollment: unknown) => {
      try {
        const response = await fetch('/api/teller/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollment }),
        })

        if (!response.ok) {
          throw new Error('Failed to connect account')
        }

        const data = await response.json()

        const hasSyncWarning = data?.syncSkipped || data?.syncError
        const description = data?.syncSkipped
          ? 'Connected successfully. Sync skipped until mTLS credentials are configured.'
          : data?.syncError
            ? 'Connected successfully, but the initial sync failed.'
            : `Connected ${data.accountsSynced || 0} account(s) successfully.`

        toast({
          title: hasSyncWarning ? 'Connected with warnings' : 'Success!',
          description,
        })

        queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions })

        if (!data?.syncSkipped && !data?.syncError) {
          await syncTransactions.mutateAsync()
        }
        onSuccess()
      } catch (error) {
        console.error('Error connecting Teller account:', error)
        toast({
          title: 'Connection failed',
          description: 'Failed to connect your account. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, queryClient, syncTransactions, toast]
  )

  const handleConnect = useCallback(() => {
    const applicationId = process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID
    const environment = process.env.NEXT_PUBLIC_TELLER_ENV || 'sandbox'

    if (!applicationId) {
      toast({
        title: 'Missing configuration',
        description: 'Teller application ID is not configured.',
        variant: 'destructive',
      })
      return
    }

    if (!window.TellerConnect) {
      toast({
        title: 'Teller Connect not ready',
        description: 'Please wait for the connection widget to load.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    window.TellerConnect.setup({
      applicationId,
      environment,
      onSuccess: handleEnrollmentSuccess,
      onExit: () => setIsLoading(false),
      onFailure: (error) => {
        console.error('Teller Connect error:', error)
        setIsLoading(false)
      },
    }).open()
  }, [handleEnrollmentSuccess, toast])

  return (
    <>
      <Script
        src="https://cdn.teller.io/connect/connect.js"
        strategy="afterInteractive"
        onLoad={() => setIsScriptReady(true)}
      />
      <Button onClick={handleConnect} disabled={isLoading || !isScriptReady}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Link className="w-4 h-4 mr-2" />
        )}
        Connect Bank Account
      </Button>
    </>
  )
})
